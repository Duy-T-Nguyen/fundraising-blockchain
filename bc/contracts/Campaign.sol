// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "./RequestLib.sol";
import "./Events.sol";
import "./Errors.sol";
import "./modifiers/AccessControl.sol";
import "./SupplierRegistry.sol";

/**
 * @title Campaign
 * @author Fundraising Blockchain Team
 * @notice Quản lý chiến dịch gây quỹ phi tập trung với Zero-Trust, Milestones & Supplier Whitelist.
 * @dev Tích hợp mô hình WFP: Tiền chỉ chảy đến Supplier đã được Platform Admin thẩm định.
 *      Manager KHÔNG có quyền thêm Supplier hoặc nhận tiền.
 */

contract Campaign is Events, AccessControl, ReentrancyGuard, ERC2771Context {
    using RequestLib for RequestLib.Request;
    using ECDSA for bytes32;

    uint256 public immutable minimumContribution;
    uint256 public totalDonors;
    uint256 public totalFundsRaised;
    mapping(address => uint256) public contributions;
    mapping(address => uint256) public donorId; // Gắn ID cho mỗi donor theo thứ tự tham gia
    mapping(uint256 => address) public donorAtId; // NEW: Map ID ngược lại địa chỉ ví để bốc thăm
    
    RequestLib.Request[] public requests;
    bool public active;

    string public campaignName;
    string public description;
    string public imageHash;
    Category public immutable category;

    SupplierRegistry public immutable supplierRegistry;
    address public immutable factory;
    
    /// @notice Số dư tiền xăng Manager nạp để trả hộ cho user
    uint256 public gasBalance;

    /// @notice Phát ra khi Manager nạp thêm tiền xăng
    event GasRefilled(address indexed manager, uint256 amount);
    /// @notice Phát ra khi Admin rút tiền xăng để nạp cho Bot Relayer
    event GasWithdrawn(address indexed admin, uint256 amount);

    /// @notice Hạn mức cho phép Validator tự duyệt (0.5% tổng quỹ)
    uint256 public constant VALIDATOR_THRESHOLD_BPS = 50; // 0.5% = 50/10000
    uint256 public constant RESELECTION_TIMEOUT = 2 days;

    constructor(
        string memory _name,
        string memory _description,
        string memory _imageHash,
        Category _category,
        uint256 _minimum,
        address _manager,
        address _supplierRegistry,
        address trustedForwarder
    ) ERC2771Context(trustedForwarder) {
        if (_minimum == 0) revert InsufficientFunds();
        if (
            _manager == address(0) ||
            _supplierRegistry == address(0)
        ) revert InvalidAddress();
        if (bytes(_name).length == 0) revert EmptyName();
        if (bytes(_description).length == 0) revert EmptyDescription();
        if (bytes(_imageHash).length == 0) revert EmptyEvidenceHash();

        campaignName = _name;
        description = _description;
        imageHash = _imageHash;
        category = _category;
        manager = _manager;
        minimumContribution = _minimum;
        supplierRegistry = SupplierRegistry(_supplierRegistry);
        factory = _msgSender();
        active = true;
    }

    /**
     * @notice Nạp ETH để tài trợ phí Gas cho các giao dịch Meta-transaction (Eco Mode).
     * @dev Chỉ Manager mới nên nạp, nhưng cho phép bất kỳ ai tài trợ cho chiến dịch.
     */
    function depositGas() external payable {
        if (msg.value == 0) revert InsufficientFunds();
        gasBalance += msg.value;
        emit GasRefilled(_msgSender(), msg.value);
    }

    /**
     * @notice Rút tiền xăng về để nạp cho ví Relayer (Chỉ Admin Factory/Registry gọi).
     */
    function withdrawGasFunds() external {
        // Trong demo, ta giả định Platform Admin có quyền rút tiền này để nạp cho Bot
        // Ở đây ta check đơn giản: chỉ địa chỉ tạo ra Campaign (Factory) hoặc Admin của Factory mới được rút
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

    /**
     * @dev Override _msgSender() to use ERC2771Context implementation.
     */
    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    /**
     * @dev Override _msgData() to use ERC2771Context implementation.
     */
    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    /**
     * @dev Override _contextSuffixLength() to use ERC2771Context implementation.
     */
    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }

    // =====================
    // DONATE
    // =====================
    function donate() external payable onlyActive {
        if (_msgSender() == manager) revert ManagerCannotDonate(); // FIX B: Ban manager donation
        if (msg.value < minimumContribution) revert InsufficientFunds();

        if (contributions[_msgSender()] == 0) {
            totalDonors++;
            donorId[_msgSender()] = totalDonors;
            donorAtId[totalDonors] = _msgSender();
        }
        contributions[_msgSender()] += msg.value;
        totalFundsRaised += msg.value;

        // Báo cáo số liệu về Factory
        ICampaignFactory(factory).recordDonation(_msgSender(), msg.value);

        emit Donation(_msgSender(), msg.value);
    }
    // =====================
    // REQUEST CREATION
    // =====================

    /**
     * @notice Tạo request bình thường (SINGLE)
     * @dev Nếu số tiền <= 0.5% TỔNG QUỸ, hệ thống tự động chọn 3 validator ngẫu nhiên.
     */
    function createRequest(
        string calldata desc,
        uint256 value,
        address payable recipient,
        address verifier,
        string calldata evidenceHash
    ) external onlyManager onlyActive {
        _validateRequest(value, recipient, verifier, desc);
        if (bytes(evidenceHash).length == 0) revert EmptyEvidenceHash();
        
        RequestLib.Request storage r = requests.push();
        r.description = desc;
        r.value = value;
        r.recipient = recipient;
        r.complete = false;
        r.totalApprovalWeight = 0;
        r.evidenceHash = evidenceHash;
        r.requestType = RequestLib.RequestType.SINGLE;
        r.verifier = verifier;
        
        // Snapshot bảo mật (FIX C)
        r.snapshotTotalFunds = totalFundsRaised;
        r.snapshotDonorCount = totalDonors;

        uint256 threshold = (r.snapshotTotalFunds * VALIDATOR_THRESHOLD_BPS) / 10000;
        uint256 requestIndex = requests.length - 1;

        if (value <= threshold && r.snapshotTotalFunds > 0 && r.snapshotDonorCount >= 3) {
            // Chọn ngẫu nhiên 3 Validator từ chính Donors của campaign
            r.selectedValidators = _getRandomValidators(
                requests.length + block.timestamp,
                r.snapshotDonorCount,
                new address[](0),
                requestIndex
            );
            r.lastValidatorSelection = block.timestamp;
        }

        emit RequestCreated(
            requestIndex,
            desc,
            value,
            recipient,
            verifier,
            evidenceHash,
            r.selectedValidators,
            r.lastValidatorSelection
        );
    }

    /**
     * @notice Tạo request theo giai đoạn (MULTI) — Proof of Delivery
     */
    function createMultiStageRequest(
        string calldata desc,
        address payable recipient,
        address verifier,
        uint256[] calldata milestoneValues,
        string[] calldata milestoneDescriptions,
        string calldata initialEvidenceHash // Added initial evidence for transparency
    ) external onlyManager onlyActive {
        if (bytes(initialEvidenceHash).length == 0) revert EmptyEvidenceHash(); // FIX D: Transparency
        if (
            milestoneValues.length == 0 ||
            milestoneValues.length != milestoneDescriptions.length
        ) revert InvalidRequestIndex();

        uint256 totalBudget = 0;
        for (uint i = 0; i < milestoneValues.length; i++) {
            totalBudget += milestoneValues[i];
        }

        _validateRequest(totalBudget, recipient, verifier, desc);
        
        RequestLib.Request storage r = requests.push();
        r.description = desc;
        r.recipient = recipient;
        r.complete = false;
        r.totalApprovalWeight = 0;
        r.requestType = RequestLib.RequestType.MULTI;
        r.verifier = verifier;
        r.currentMilestone = 0;
        r.evidenceHash = initialEvidenceHash;

        // Snapshot bảo mật
        r.snapshotTotalFunds = totalFundsRaised;
        r.snapshotDonorCount = totalDonors;

        for (uint i = 0; i < milestoneValues.length; i++) {
            r.milestones.push(
                RequestLib.Milestone({
                    value: milestoneValues[i],
                    description: milestoneDescriptions[i],
                    released: false,
                    evidenceHash: ""
                })
            );
        }
        r.value = totalBudget;

        uint256 requestIndex = requests.length - 1;

        emit RequestCreated(
            requestIndex,
            desc,
            totalBudget,
            recipient,
            verifier,
            initialEvidenceHash,
            r.selectedValidators,
            r.lastValidatorSelection
        );
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

        if (contributions[_msgSender()] == 0) revert NotDonor();
        if (_msgSender() == manager) revert ManagerCannotVote();
        if (r.complete) revert RequestCompleted();
        
        // FIX C: Eligibility Check (Only donors joined BEFORE request)
        if (donorId[_msgSender()] == 0 || donorId[_msgSender()] > r.snapshotDonorCount) 
            revert JoinedAfterRequest();

        uint256 currentContribution = contributions[_msgSender()];
        uint256 alreadyVoted = r.votedAmount[_msgSender()];
        
        if (currentContribution <= alreadyVoted) revert AlreadyVoted();

        // FIX C: Delta Voting (Support top-up donations)
        uint256 delta = currentContribution - alreadyVoted;
        r.votedAmount[_msgSender()] = currentContribution;
        r.approvals[_msgSender()] = true;
        r.totalApprovalWeight += delta;

        emit Voted(_msgSender(), index);
    }

    /**
     * @notice Validator biểu quyết cho yêu cầu nhỏ (Luồng A)
     */
    function approveAsValidator(uint256 index) external onlyActive {
        if (_msgSender() == manager) revert ManagerCannotVote(); // FIX B: Security Hardening
        
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.selectedValidators.length == 0) revert MilestoneNotApproved(); // Không phải luồng validator
        if (r.validatorApprovals[_msgSender()]) revert AlreadyVoted();

        // Kiểm tra xem msg.sender có nằm trong danh sách 3 người được chọn không
        bool isSelected = false;
        for (uint i = 0; i < r.selectedValidators.length; i++) {
            if (r.selectedValidators[i] == _msgSender()) {
                isSelected = true;
                break;
            }
        }
        if (!isSelected) revert NotAuthorizedValidator();

        r.validatorApprovals[_msgSender()] = true;
        r.validatorApprovalCount++;

        emit Voted(_msgSender(), index);
    }

    // =====================
    // EXECUTION
    // =====================

    /**
     * @notice Manager thực thi thanh toán sau khi đã giao hàng (Proof of Delivery)
     */
    function finalizeRequest(
        uint256 index,
        bytes calldata signature,
        string calldata finalEvidenceHash
    ) external onlyManager nonReentrant {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.requestType != RequestLib.RequestType.SINGLE)
            revert InvalidRequestIndex();
        if (r.complete) revert RequestCompleted();
        if (r.value > address(this).balance) revert InsufficientFunds();

        // 1. Kiểm tra điều kiện bỏ phiếu (Approval Check)
        bool canFinalize = false;
        if (r.selectedValidators.length > 0) {
            if (r.validatorApprovalCount >= 2) canFinalize = true;
        }
        // FIX C: Use snapshot total funds for threshold consistency
        if (!canFinalize && r.totalApprovalWeight > r.snapshotTotalFunds / 2) {
            canFinalize = true;
        }
        if (!canFinalize) revert NotEnoughApprovals();

        // 2. Kiểm tra bằng chứng giao hàng (Proof of Delivery Check)
        bytes32 messageHash = keccak256(
            abi.encodePacked(address(this), index, "FINAL")
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        if (signer != r.verifier) revert InvalidSignature();

        // 3. Thực thi thanh toán
        r.complete = true;
        r.evidenceHash = finalEvidenceHash;

        (bool success, ) = r.recipient.call{value: r.value}("");
        if (!success) revert TransferFailed();

        supplierRegistry.recordPayment(r.recipient, r.value);
        emit FundsReleased(index, r.recipient);
    }

    /**
     * @notice Thực thi từng đợt giao hàng (Milestone / Proof of Delivery)
     */
    function executeMilestone(
        uint256 index,
        bytes calldata signature,
        string calldata evidenceHash
    ) external onlyManager nonReentrant {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.requestType != RequestLib.RequestType.MULTI)
            revert InvalidRequestIndex();
        if (r.complete) revert RequestCompleted();
        
        // FIX C: Snapshot threshold
        if (r.totalApprovalWeight <= r.snapshotTotalFunds / 2)
            revert NotEnoughApprovals();

        uint256 current = r.currentMilestone;
        if (current >= r.milestones.length) revert MilestoneAlreadyReleased();

        RequestLib.Milestone storage m = r.milestones[current];
        if (m.value > address(this).balance) revert InsufficientFunds();

        bytes32 messageHash = keccak256(
            abi.encodePacked(address(this), index, current)
        );
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );

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

        supplierRegistry.recordPayment(r.recipient, m.value);

        emit MilestoneReleased(index, current, m.value, r.recipient, evidenceHash);
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

    function getSelectedValidators(uint256 index) external view returns (address[] memory) {
        if (index >= requests.length) revert InvalidRequestIndex();
        return requests[index].selectedValidators;
    }

    function _validateRequest(uint256 value, address recipient, address verifier, string calldata desc) private view {
        if (value == 0) revert InsufficientFunds();
        if (recipient == address(0) || verifier == address(0)) revert InvalidAddress();
        if (recipient == manager) revert ManagerNotAllowedAsRecipient();
        if (verifier == manager) revert ManagerNotAllowedAsVerifier();
        if (verifier == recipient) revert RecipientNotAllowedAsVerifier();
        if (!supplierRegistry.isSupplier(recipient)) revert RecipientNotWhitelisted();
        if (bytes(desc).length == 0) revert EmptyDescription();
    }

    /**
     * @notice Chọn lại danh sách Validator nếu đội cũ không phản hồi sau 48h.
     */
    function reselectValidators(uint256 index) external onlyManager {
        if (index >= requests.length) revert InvalidRequestIndex();
        RequestLib.Request storage r = requests[index];

        if (r.complete) revert RequestCompleted();
        if (r.selectedValidators.length == 0) revert MilestoneNotApproved();
        if (block.timestamp < r.lastValidatorSelection + RESELECTION_TIMEOUT) revert ActionTooSoon();

        // Đánh dấu đội cũ là "failed" để không chọn lại
        for (uint i = 0; i < r.selectedValidators.length; i++) {
            r.failedValidators[r.selectedValidators[i]] = true;
        }

        // Reset vote cũ
        r.resetApprovals();

        // Chọn đội mới (loại trừ những người đã fail)
        r.selectedValidators = _getRandomValidators(
            index + block.timestamp,
            r.snapshotDonorCount,
            r.selectedValidators,
            index
        );
        r.lastValidatorSelection = block.timestamp;

        emit RequestCreated(
            index,
            r.description,
            r.value,
            r.recipient,
            r.verifier,
            r.evidenceHash,
            r.selectedValidators,
            r.lastValidatorSelection
        );
    }

    /**
     * @dev Hỗ trợ bốc thăm ngẫu nhiên 3 validator từ danh sách donors.
     */
    function _getRandomValidators(
        uint256 seed,
        uint256 maxId,
        address[] memory previousValidators,
        uint256 requestIndex
    ) internal view returns (address[] memory) {
        // Nếu số lượng donor khả dụng ít hơn 3 (trừ đi những người đã bị loại), có thể gặp vấn đề.
        // Tuy nhiên ở đây ta giả định maxId là snapshotDonorCount.
        
        address[] memory result = new address[](3);
        uint256[] memory indices = new uint256[](3);
        
        for (uint i = 0; i < 3; i++) {
            uint256 idx = (uint256(keccak256(abi.encodePacked(
                block.prevrandao,
                block.timestamp,
                seed,
                i
            ))) % maxId) + 1;

            // Kiểm tra trùng lặp và loại trừ người cũ
            address candidate = donorAtId[idx];
            uint256 attempts = 0;
            while (
                _contains(indices, i, idx) || 
                _isBlacklistedForRequest(candidate, requestIndex) ||
                candidate == manager ||
                candidate == address(0)
            ) {
                idx = (idx % maxId) + 1;
                candidate = donorAtId[idx];
                attempts++;
                if (attempts > maxId) break; // Tránh loop vô tận nếu không đủ người
            }
            
            indices[i] = idx;
            result[i] = candidate;
        }
        
        return result;
    }

    function _contains(uint256[] memory arr, uint256 len, uint256 val) internal pure returns (bool) {
        for (uint i = 0; i < len; i++) {
            if (arr[i] == val) return true;
        }
        return false;
    }

    function _isBlacklistedForRequest(address validator, uint256 requestIndex) internal view returns (bool) {
        return requests[requestIndex].failedValidators[validator];
    }

    // =====================
    // REFUND
    // =====================

    /**
     * @notice Cho phép Donor rút lại tiền theo tỷ lệ khi chiến dịch đã bị dừng.
     * @dev Tính toán pro-rata: (contributions / totalFundsRaised) * address(this).balance
     *      Đảm bảo công bằng nếu một phần tiền đã được chi tiêu hợp lệ.
     */
    function claimRefund() external nonReentrant {
        if (active) revert CampaignStillActive();
        uint256 contributed = contributions[_msgSender()];
        if (contributed == 0) revert NoContributionFound();

        // Tính số tiền hoàn lại theo tỷ lệ pro-rata
        uint256 currentBalance = address(this).balance;
        uint256 refundAmount = (contributed * currentBalance) / totalFundsRaised;

        // Cập nhật state trước khi chuyển tiền (CEI pattern)
        contributions[_msgSender()] = 0;

        if (refundAmount > 0) {
            (bool success, ) = payable(_msgSender()).call{value: refundAmount}("");
            if (!success) revert TransferFailed();
        }

        emit RefundClaimed(_msgSender(), refundAmount);
    }
}
