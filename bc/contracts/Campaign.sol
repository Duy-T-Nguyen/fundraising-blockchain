// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./RequestLib.sol";
import "./Events.sol";
import "./Errors.sol";
import "./modifiers/AccessControl.sol";
import "./ValidatorPool.sol";
import "./SupplierRegistry.sol";

/**
 * @title Campaign
 * @author Fundraising Blockchain Team
 * @notice Quản lý chiến dịch gây quỹ phi tập trung với Zero-Trust, Milestones & Supplier Whitelist.
 * @dev Tích hợp mô hình WFP: Tiền chỉ chảy đến Supplier đã được Platform Admin thẩm định.
 *      Manager KHÔNG có quyền thêm Supplier hoặc nhận tiền.
 */
interface ICampaignFactory {
    function recordDonation(uint256 amount) external;
}

contract Campaign is Events, AccessControl, ReentrancyGuard {
    using RequestLib for RequestLib.Request;
    using ECDSA for bytes32;

    uint256 public minimumContribution;
    uint256 public totalDonors;
    uint256 public totalFundsRaised;
    mapping(address => uint256) public contributions;
    RequestLib.Request[] public requests;
    bool public active;
    
    string public campaignName;
    string public description;
    string public imageHash;
    Category public category;
    
    ValidatorPool public validatorPool;
    SupplierRegistry public supplierRegistry;
    address public factory;

    /// @notice Hạn mức cho phép Validator tự duyệt (0.5% tổng quỹ tại thời điểm tạo)
    uint256 public constant VALIDATOR_THRESHOLD_BPS = 50; // 0.5% = 50/10000

    constructor(
        string memory _name,
        string memory _description,
        string memory _imageHash,
        Category _category,
        uint256 _minimum,
        address _manager,
        address _validatorPool,
        address _supplierRegistry
    ) {
        if (_minimum == 0) revert InsufficientFunds();
        if (_manager == address(0) || _validatorPool == address(0) || _supplierRegistry == address(0))
            revert InvalidAddress();
        if (bytes(_name).length == 0) revert EmptyDescription();
        if (bytes(_description).length == 0) revert EmptyDescription();
        if (bytes(_imageHash).length == 0) revert EmptyEvidenceHash();

        campaignName = _name;
        description = _description;
        imageHash = _imageHash;
        category = _category;
        manager = _manager;
        minimumContribution = _minimum;
        validatorPool = ValidatorPool(_validatorPool);
        supplierRegistry = SupplierRegistry(_supplierRegistry);
        factory = msg.sender;
        active = true;
    }

    modifier onlyActive() {
        if (!active) revert CampaignNotActive();
        _;
    }

    // =====================
    // DONATE
    // =====================
    function donate() external payable onlyActive {
        if (msg.value < minimumContribution) revert InsufficientFunds();

        if (contributions[msg.sender] == 0) {
            totalDonors++;
        }
        contributions[msg.sender] += msg.value;
        totalFundsRaised += msg.value;

        // Báo cáo số liệu về Factory
        ICampaignFactory(factory).recordDonation(msg.value);

        emit Donation(msg.sender, msg.value);
    }

    // =====================
    // REQUEST CREATION
    // =====================
    
    /**
     * @notice Tạo request bình thường (SINGLE)
     * @dev Nếu số tiền < 0.5% quỹ, hệ thống tự động chọn 3 validator ngẫu nhiên.
     *      Recipient PHẢI nằm trong SupplierRegistry (Whitelisted Supplier).
     */
    function createRequest(
        string calldata desc,
        uint256 value,
        address payable recipient,
        string calldata evidenceHash
    ) external onlyManager onlyActive {
        if (value == 0) revert InsufficientFunds();
        if (recipient == address(0)) revert InvalidAddress();
        if (recipient == manager) revert ManagerNotAllowedAsRecipient();
        if (!supplierRegistry.isSupplier(recipient)) revert RecipientNotWhitelisted();
        if (bytes(desc).length == 0) revert EmptyDescription();
        if (bytes(evidenceHash).length == 0) revert EmptyEvidenceHash();

        RequestLib.Request storage r = requests.push();
        r.description = desc;
        r.value = value;
        r.recipient = recipient;
        r.complete = false;
        r.totalApprovalWeight = 0;
        r.evidenceHash = evidenceHash;
        r.requestType = RequestLib.RequestType.SINGLE;

        // Kiểm tra ngưỡng Validator (0.5%)
        uint256 threshold = (address(this).balance * VALIDATOR_THRESHOLD_BPS) / 10000;
        if (value <= threshold && address(this).balance > 0) {
            // Chọn ngẫu nhiên 3 Validator từ Pool
            address[] memory selected = validatorPool.getRandomValidators(requests.length + block.timestamp);
            r.selectedValidators = selected;
        }

        emit RequestCreated(requests.length - 1, desc, value, recipient, evidenceHash);
    }

    /**
     * @notice Tạo request theo giai đoạn (MULTI) — Proof of Delivery
     * @dev Dành cho quỹ dự án lớn hoặc chương trình cứu trợ nhiều đợt.
     *      Recipient PHẢI nằm trong SupplierRegistry.
     *      Verifier (Oracle) ký xác nhận mỗi đợt giao hàng.
     */
    function createMultiStageRequest(
        string calldata desc,
        address payable recipient,
        address verifier,
        uint256[] calldata milestoneValues,
        string[] calldata milestoneDescriptions
    ) external onlyManager onlyActive {
        if (recipient == address(0) || verifier == address(0)) revert InvalidAddress();
        if (recipient == manager) revert ManagerNotAllowedAsRecipient();
        if (verifier == manager) revert ManagerNotAllowedAsVerifier();
        if (verifier == recipient) revert RecipientNotAllowedAsVerifier();
        if (!supplierRegistry.isSupplier(recipient)) revert RecipientNotWhitelisted();
        if (milestoneValues.length == 0 || milestoneValues.length != milestoneDescriptions.length) revert InvalidRequestIndex();

        RequestLib.Request storage r = requests.push();
        r.description = desc;
        r.recipient = recipient;
        r.complete = false;
        r.totalApprovalWeight = 0;
        r.requestType = RequestLib.RequestType.MULTI;
        r.verifier = verifier;
        r.currentMilestone = 0;

        uint256 totalBudget = 0;
        for (uint i = 0; i < milestoneValues.length; i++) {
            r.milestones.push(RequestLib.Milestone({
                value: milestoneValues[i],
                description: milestoneDescriptions[i],
                released: false,
                evidenceHash: ""
            }));
            totalBudget += milestoneValues[i];
        }
        r.value = totalBudget;

        emit RequestCreated(requests.length - 1, desc, totalBudget, recipient, "");
    }

    // =====================
    // APPROVAL
    // =====================

    /**
     * @notice Donor biểu quyết cho yêu cầu
     */
    function approveRequest(uint256 index) external onlyActive {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (contributions[msg.sender] == 0) revert NotDonor();
        if (r.approvals[msg.sender]) revert AlreadyVoted();
        if (msg.sender == manager) revert ManagerCannotVote();
        if (r.complete) revert RequestCompleted();

        r.approvals[msg.sender] = true;
        r.totalApprovalWeight += contributions[msg.sender];

        emit Voted(msg.sender, index);
    }

    /**
     * @notice Validator biểu quyết cho yêu cầu nhỏ (Luồng A)
     */
    function approveAsValidator(uint256 index) external onlyActive {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.selectedValidators.length == 0) revert MilestoneNotApproved(); // Không phải luồng validator
        if (r.validatorApprovals[msg.sender]) revert AlreadyVoted();
        
        // Kiểm tra xem msg.sender có nằm trong danh sách 3 người được chọn không
        bool isSelected = false;
        for (uint i = 0; i < r.selectedValidators.length; i++) {
            if (r.selectedValidators[i] == msg.sender) {
                isSelected = true;
                break;
            }
        }
        if (!isSelected) revert NotAuthorizedValidator();

        r.validatorApprovals[msg.sender] = true;
        r.validatorApprovalCount++;

        emit Voted(msg.sender, index);
    }

    // =====================
    // EXECUTION
    // =====================

    /**
     * @notice Manager thực thi request (Tương thích cả Donor Path và Validator Path cho SINGLE)
     * @dev Tiền chuyển thẳng cho Supplier — Manager KHÔNG nhận tiền.
     */
    function finalizeRequest(uint256 index) external onlyManager nonReentrant {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.requestType != RequestLib.RequestType.SINGLE) revert InvalidRequestIndex();
        if (r.complete) revert RequestCompleted();
        if (r.value > address(this).balance) revert InsufficientFunds();

        bool canFinalize = false;

        // Ưu tiên Luồng A: Validator duyệt (2/3)
        if (r.selectedValidators.length > 0) {
            if (r.validatorApprovalCount >= 2) {
                canFinalize = true;
            }
        }
        
        // Luồng B: Donor duyệt (>50% tổng quỹ đã quyên góp)
        if (!canFinalize && r.totalApprovalWeight > totalFundsRaised / 2) {
            canFinalize = true;
        }

        if (!canFinalize) revert NotEnoughApprovals();

        r.complete = true;
        (bool success, ) = r.recipient.call{value: r.value}("");
        if (!success) revert TransferFailed();

        emit FundsReleased(index);
    }

    /**
     * @notice Thực thi từng đợt giao hàng (Milestone / Proof of Delivery)
     * @dev Verifier (Oracle) ký chữ ký số xác nhận hàng đã giao.
     *      Tiền tự động chuyển thẳng cho Supplier đã whitelist.
     */
    function executeMilestone(uint256 index, bytes calldata signature, string calldata evidenceHash) external nonReentrant {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.requestType != RequestLib.RequestType.MULTI) revert InvalidRequestIndex();
        if (r.complete) revert RequestCompleted();
        if (r.totalApprovalWeight <= totalFundsRaised / 2) revert NotEnoughApprovals();

        uint256 current = r.currentMilestone;
        if (current >= r.milestones.length) revert MilestoneAlreadyReleased();
        
        RequestLib.Milestone storage m = r.milestones[current];
        if (m.value > address(this).balance) revert InsufficientFunds();

        bytes32 messageHash = keccak256(abi.encodePacked(address(this), index, current));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        if (signer != r.verifier) revert InvalidSignature();

        m.released = true;
        m.evidenceHash = evidenceHash;
        r.currentMilestone++;

        if (r.currentMilestone == r.milestones.length) {
            r.complete = true;
        }

        (bool success, ) = r.recipient.call{value: m.value}("");
        if (!success) revert TransferFailed();

        emit MilestoneReleased(index, current, m.value, evidenceHash);
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
            string memory imgHash,
            bool isActive
        )
    {
        return (
            address(this).balance,
            minimumContribution,
            requests.length,
            totalDonors,
            manager,
            imageHash,
            active
        );
    }

    function getRequestsCount() external view returns (uint256) {
        return requests.length;
    }
}