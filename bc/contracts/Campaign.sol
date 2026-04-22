// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./RequestLib.sol";
import "./Events.sol";
import "./Errors.sol";
import "./modifiers/AccessControl.sol";
import "./SupplierRegistry.sol";

/**
 * @title Campaign
 * @notice Quản lý chiến dịch gây quỹ phi tập trung.
 */
contract Campaign is Events, AccessControl, ReentrancyGuard, Initializable {
    using RequestLib for RequestLib.Request;
    using ECDSA for bytes32;

    uint256 public minimumContribution;
    uint256 public totalDonors;
    uint256 public totalFundsRaised;
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public donorId;
    mapping(uint256 => address) public donorAtId;

    RequestLib.Request[] public requests;
    bool public active;
    uint256 public lockedFunds;

    string public metadataCID;
    Category public category;

    SupplierRegistry public supplierRegistry;
    address public factory;
    uint256 public gasBalance;

    // --- Global Mappings (Tách ra khỏi struct để tối ưu gas) ---
    mapping(uint256 => mapping(address => uint256)) public requestVotedAmount;
    mapping(uint256 => mapping(address => bool))
        public requestValidatorApprovals;
    mapping(uint256 => mapping(address => bool)) public requestFailedValidators;

    uint256 public constant VALIDATOR_THRESHOLD_BPS = 50;
    uint256 public constant RESELECTION_TIMEOUT = 2 days;
    uint256 public constant VOTING_PERIOD = 7 days;

    // Meta-transaction support (Manual implementation for Proxy)
    address private _trustedForwarder;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _metadataCID,
        Category _category,
        uint256 _minimum,
        address _manager,
        address _supplierRegistry,
        address _forwarder,
        address _factory
    ) public initializer {
        if (_minimum == 0) revert InsufficientFunds();
        if (_manager == address(0) || _supplierRegistry == address(0))
            revert InvalidAddress();
        if (bytes(_metadataCID).length == 0) revert EmptyName();

        metadataCID = _metadataCID;
        category = _category;
        manager = _manager;
        minimumContribution = _minimum;
        supplierRegistry = SupplierRegistry(_supplierRegistry);
        _trustedForwarder = _forwarder;
        factory = _factory;
        active = true;
    }

    // =====================
    // GAS TANK
    // =====================
    function depositGas() external payable {
        if (msg.value == 0) revert InsufficientFunds();
        gasBalance += msg.value;
        emit GasRefilled(_msgSender(), msg.value);
    }

    function withdrawGasFunds() external {
        if (_msgSender() != factory) revert NotAdmin();
        uint256 amount = gasBalance;
        gasBalance = 0;
        (bool success, ) = _msgSender().call{value: amount}("");
        if (!success) revert TransferFailed();
        emit GasWithdrawn(_msgSender(), amount);
    }

    modifier onlyActive() {
        if (!active) revert CampaignNotActive();
        _;
    }

    // =====================
    // ERC-2771 CONTEXT
    // =====================
    function isTrustedForwarder(address forwarder) public view returns (bool) {
        return forwarder == _trustedForwarder;
    }

    function _msgSender() internal view override returns (address sender) {
        if (isTrustedForwarder(msg.sender) && msg.data.length >= 20) {
            assembly {
                sender := shr(96, calldataload(sub(calldatasize(), 20)))
            }
        } else {
            return super._msgSender();
        }
    }

    function _msgData() internal view override returns (bytes calldata) {
        if (isTrustedForwarder(msg.sender) && msg.data.length >= 20) {
            return msg.data[:msg.data.length - 20];
        } else {
            return super._msgData();
        }
    }

    // =====================
    // CORE LOGIC
    // =====================
    function donate() external payable onlyActive {
        address sender = _msgSender();
        if (sender == manager) revert ManagerCannotDonate();
        if (msg.value < minimumContribution) revert InsufficientFunds();

        if (contributions[sender] == 0) {
            unchecked {
                totalDonors++;
            }
            donorId[sender] = totalDonors;
            donorAtId[totalDonors] = sender;
        }
        contributions[sender] += msg.value;
        totalFundsRaised += msg.value;

        ICampaignFactory(factory).recordDonation(sender, msg.value);
        emit Donation(sender, msg.value);
    }

    function createRequest(
        string calldata metadataCID_,
        uint256 value,
        address payable recipient,
        address verifier
    ) external onlyManager onlyActive {
        _validateRequest(value, recipient, verifier, metadataCID_);
        if (value > address(this).balance - lockedFunds)
            revert InsufficientAvailableFunds();

        uint256 requestIndex = requests.length;
        RequestLib.Request storage r = requests.push();
        r.metadataCID = metadataCID_;
        r.value = value;
        r.recipient = recipient;
        r.status = RequestLib.Status.OPEN;
        r.totalApprovalWeight = 0;
        r.requestType = RequestLib.RequestType.SINGLE;
        r.verifier = verifier;
        r.createdAt = block.timestamp;

        lockedFunds += value;
        r.snapshotTotalFunds = totalFundsRaised;
        r.snapshotDonorCount = totalDonors;

        uint256 threshold = (r.snapshotTotalFunds * VALIDATOR_THRESHOLD_BPS) /
            10000;

        if (
            value <= threshold &&
            r.snapshotTotalFunds > 0 &&
            r.snapshotDonorCount >= 3
        ) {
            r.selectedValidators = _getRandomValidators(
                requestIndex + block.timestamp,
                r.snapshotDonorCount,
                requestIndex
            );
            r.lastValidatorSelection = block.timestamp;
        }

        emit RequestCreated(
            requestIndex,
            metadataCID_,
            value,
            recipient,
            verifier,
            r.selectedValidators,
            r.lastValidatorSelection
        );
    }

    function createMultiStageRequest(
        string calldata metadataCID_,
        address payable recipient,
        address verifier,
        uint256[] calldata milestoneValues,
        string[] calldata milestoneMetadataCIDs
    ) external onlyManager onlyActive {
        uint256 totalBudget;
        for (uint i = 0; i < milestoneValues.length; i++) {
            totalBudget += milestoneValues[i];
        }

        _validateRequest(totalBudget, recipient, verifier, metadataCID_);
        if (totalBudget > address(this).balance - lockedFunds)
            revert InsufficientAvailableFunds();

        uint256 requestIndex = requests.length;
        RequestLib.Request storage r = requests.push();
        r.metadataCID = metadataCID_;
        r.recipient = recipient;
        r.totalApprovalWeight = 0;
        r.requestType = RequestLib.RequestType.MULTI;
        r.verifier = verifier;
        r.currentMilestone = 0;
        r.value = totalBudget;
        r.createdAt = block.timestamp;
        lockedFunds += totalBudget;

        r.snapshotTotalFunds = totalFundsRaised;
        r.snapshotDonorCount = totalDonors;

        for (uint i = 0; i < milestoneValues.length; i++) {
            r.milestones.push(
                RequestLib.Milestone({
                    value: milestoneValues[i],
                    metadataCID: milestoneMetadataCIDs[i],
                    released: false
                })
            );
        }

        emit RequestCreated(
            requestIndex,
            metadataCID_,
            totalBudget,
            recipient,
            verifier,
            r.selectedValidators,
            r.lastValidatorSelection
        );
    }

    function approveRequest(uint256 index) external onlyActive {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];
        address sender = _msgSender();

        if (contributions[sender] == 0) revert NotDonor();
        if (sender == manager) revert ManagerCannotVote();
        if (r.status != RequestLib.Status.OPEN)
            revert RequestAlreadyProcessed();
        if (block.timestamp > r.createdAt + VOTING_PERIOD)
            revert RequestExpired();

        if (donorId[sender] == 0 || donorId[sender] > r.snapshotDonorCount)
            revert JoinedAfterRequest();

        uint256 currentContribution = contributions[sender];
        uint256 alreadyVoted = requestVotedAmount[index][sender];

        if (currentContribution <= alreadyVoted) revert AlreadyVoted();

        uint256 delta = currentContribution - alreadyVoted;
        requestVotedAmount[index][sender] = currentContribution;
        r.totalApprovalWeight += delta;

        emit Voted(sender, index);
    }

    function approveAsValidator(uint256 index) external onlyActive {
        address sender = _msgSender();
        if (sender == manager) revert ManagerCannotVote();
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.selectedValidators.length == 0) revert MilestoneNotApproved();
        if (requestValidatorApprovals[index][sender]) revert AlreadyVoted();

        bool isSelected;
        for (uint i = 0; i < r.selectedValidators.length; i++) {
            if (r.selectedValidators[i] == sender) {
                isSelected = true;
                break;
            }
        }
        if (!isSelected) revert NotAuthorizedValidator();

        requestValidatorApprovals[index][sender] = true;
        unchecked {
            r.validatorApprovalCount++;
        }

        emit Voted(sender, index);
    }

    function finalizeRequest(
        uint256 index,
        bytes calldata signature,
        string calldata finalMetadataCID
    ) external onlyManager nonReentrant {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.requestType != RequestLib.RequestType.SINGLE)
            revert InvalidRequestIndex();
        if (r.status != RequestLib.Status.OPEN)
            revert RequestAlreadyProcessed();

        bool canFinalize;
        if (r.selectedValidators.length > 0) {
            if (r.validatorApprovalCount >= 2) canFinalize = true;
        }
        if (!canFinalize && r.totalApprovalWeight > r.snapshotTotalFunds / 2) {
            canFinalize = true;
        }
        if (!canFinalize) revert NotEnoughApprovals();

        bytes32 messageHash = keccak256(
            abi.encodePacked(block.chainid, address(this), index, "FINAL")
        );
        address signer = MessageHashUtils
            .toEthSignedMessageHash(messageHash)
            .recover(signature);
        if (signer != r.verifier) revert InvalidSignature();

        r.status = RequestLib.Status.COMPLETED;
        r.metadataCID = finalMetadataCID;
        lockedFunds -= r.value;

        (bool success, ) = r.recipient.call{value: r.value}("");
        if (!success) revert TransferFailed();

        supplierRegistry.recordPayment(r.recipient, r.value);
        emit FundsReleased(index, r.recipient);
    }

    function executeMilestone(
        uint256 index,
        bytes calldata signature,
        string calldata metadataCID_
    ) external onlyManager nonReentrant {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.requestType != RequestLib.RequestType.MULTI)
            revert InvalidRequestIndex();
        if (r.status != RequestLib.Status.OPEN)
            revert RequestAlreadyProcessed();
        if (r.totalApprovalWeight <= r.snapshotTotalFunds / 2)
            revert NotEnoughApprovals();

        uint256 current = r.currentMilestone;
        RequestLib.Milestone storage m = r.milestones[current];

        bytes32 messageHash = keccak256(
            abi.encodePacked(block.chainid, address(this), index, current)
        );
        address signer = MessageHashUtils
            .toEthSignedMessageHash(messageHash)
            .recover(signature);
        if (signer != r.verifier) revert InvalidSignature();

        m.released = true;
        m.metadataCID = metadataCID_;
        unchecked {
            r.currentMilestone++;
        }
        lockedFunds -= m.value;

        if (r.currentMilestone == r.milestones.length) {
            r.status = RequestLib.Status.COMPLETED;
        }

        (bool success, ) = r.recipient.call{value: m.value}("");
        if (!success) revert TransferFailed();

        supplierRegistry.recordPayment(r.recipient, m.value);
        emit MilestoneReleased(
            index,
            current,
            m.value,
            r.recipient,
            metadataCID_
        );
    }

    function deactivateCampaign() external onlyManager {
        if (!active) revert CampaignNotActive();
        active = false;
        emit CampaignDeactivated();
    }

    // =====================
    // VIEW FUNCTIONS
    // =====================
    function getSummary()
        external
        view
        returns (
            uint256 balance,
            uint256 minContribution,
            uint256 numRequests,
            uint256 donors,
            address managerAddr,
            string memory metaCID,
            bool isActive
        )
    {
        return (
            address(this).balance,
            minimumContribution,
            requests.length,
            totalDonors,
            manager,
            metadataCID,
            active
        );
    }

    function getRequestsCount() external view returns (uint256) {
        return requests.length;
    }

    function getSelectedValidators(
        uint256 index
    ) external view returns (address[] memory) {
        if (index >= requests.length) revert InvalidRequestIndex();
        return requests[index].selectedValidators;
    }

    function _validateRequest(
        uint256 value,
        address recipient,
        address verifier,
        string calldata metaCID
    ) private view {
        if (value == 0) revert InsufficientFunds();
        if (recipient == address(0) || verifier == address(0))
            revert InvalidAddress();
        if (recipient == manager) revert ManagerNotAllowedAsRecipient();
        if (verifier == manager) revert ManagerNotAllowedAsVerifier();
        if (verifier == recipient) revert RecipientNotAllowedAsVerifier();
        if (!supplierRegistry.isSupplier(recipient))
            revert RecipientNotWhitelisted();
        if (bytes(metaCID).length == 0) revert EmptyDescription();
    }

    function availableFunds() external view returns (uint256) {
        return address(this).balance - lockedFunds;
    }

    function reselectValidators(uint256 index) external onlyManager {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.status != RequestLib.Status.OPEN)
            revert RequestAlreadyProcessed();
        if (r.selectedValidators.length == 0) revert MilestoneNotApproved();
        if (block.timestamp < r.lastValidatorSelection + RESELECTION_TIMEOUT)
            revert ActionTooSoon();

        for (uint i = 0; i < r.selectedValidators.length; i++) {
            requestFailedValidators[index][r.selectedValidators[i]] = true;
            requestValidatorApprovals[index][r.selectedValidators[i]] = false;
        }
        r.validatorApprovalCount = 0;

        r.selectedValidators = _getRandomValidators(
            index + block.timestamp,
            r.snapshotDonorCount,
            index
        );
        r.lastValidatorSelection = block.timestamp;

        emit RequestCreated(
            index,
            r.metadataCID,
            r.value,
            r.recipient,
            r.verifier,
            r.selectedValidators,
            r.lastValidatorSelection
        );
    }

    // =====================
    // INTERNAL HELPERS
    // =====================
    function _getRandomValidators(
        uint256 seed,
        uint256 maxId,
        uint256 requestIndex
    ) internal view returns (address[] memory) {
        address[] memory result = new address[](3);
        uint256 baseIdx = (uint256(
            keccak256(abi.encodePacked(block.prevrandao, block.timestamp, seed))
        ) % maxId) + 1;

        result[0] = _getValidValidator(
            baseIdx,
            maxId,
            requestIndex,
            address(0),
            address(0)
        );
        result[1] = _getValidValidator(
            (baseIdx % maxId) + 1,
            maxId,
            requestIndex,
            result[0],
            address(0)
        );
        result[2] = _getValidValidator(
            ((baseIdx + 1) % maxId) + 1,
            maxId,
            requestIndex,
            result[0],
            result[1]
        );

        return result;
    }

    function _getValidValidator(
        uint256 startIdx,
        uint256 maxId,
        uint256 requestIndex,
        address other1,
        address other2
    ) private view returns (address) {
        uint256 currentIdx = startIdx;
        for (uint256 i = 0; i < 5; i++) {
            address candidate = donorAtId[currentIdx];
            if (
                candidate != address(0) &&
                candidate != manager &&
                candidate != other1 &&
                candidate != other2 &&
                !requestFailedValidators[requestIndex][candidate]
            ) {
                return candidate;
            }
            currentIdx = (currentIdx % maxId) + 1;
        }
        return donorAtId[currentIdx];
    }

    function cancelRequest(uint256 index) external onlyManager onlyActive {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.status != RequestLib.Status.OPEN)
            revert RequestAlreadyProcessed();

        // Chỉ được hủy nếu chưa có bất kỳ khoản tiền nào được giải ngân
        if (r.currentMilestone > 0) revert RequestAlreadyReleased();

        r.status = RequestLib.Status.CANCELLED;
        lockedFunds -= r.value;

        emit RequestCancelled(index);
    }

    function claimRefund() external nonReentrant {
        if (active) revert CampaignStillActive();
        uint256 contributed = contributions[_msgSender()];
        if (contributed == 0) revert NoContributionFound();

        uint256 refundAmount = (contributed * address(this).balance) /
            totalFundsRaised;
        contributions[_msgSender()] = 0;

        if (refundAmount > 0) {
            (bool success, ) = payable(_msgSender()).call{value: refundAmount}(
                ""
            );
            if (!success) revert TransferFailed();
        }
        emit RefundClaimed(_msgSender(), refundAmount);
    }
}
