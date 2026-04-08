// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./RequestLib.sol";
import "./Events.sol";
import "./Errors.sol";
import "./modifiers/AccessControl.sol";

/**
 * @title Campaign
 * @author Fundraising Blockchain Team
 * @notice Quản lý một chiến dịch gây quỹ phi tập trung.
 * @dev Sử dụng ReentrancyGuard để bảo vệ chống tấn công re-entrancy.
 *      Cơ chế biểu quyết yêu cầu hơn 50% donors đồng ý để giải ngân.
 */
contract Campaign is Events, AccessControl, ReentrancyGuard {
    using RequestLib for RequestLib.Request;

    /// @notice Số tiền tối thiểu (wei) để trở thành donor
    uint256 public minimumContribution;

    /// @notice Tổng số donors duy nhất
    uint256 public totalDonors;

    /// @notice Mapping lưu trữ số tiền đã đóng góp của mỗi donor
    mapping(address => uint256) public contributions;

    /// @notice Danh sách các yêu cầu chi tiêu
    RequestLib.Request[] public requests;

    /// @notice Trạng thái chiến dịch (true = đang hoạt động)
    bool public active;

    // =====================
    // CONSTRUCTOR
    // =====================

    /**
     * @notice Khởi tạo chiến dịch mới.
     * @param _minimum Số tiền tối thiểu để được coi là donor (wei).
     * @param _manager Địa chỉ của người quản lý chiến dịch.
     */
    constructor(uint256 _minimum, address _manager) {
        if (_minimum == 0) revert InsufficientFunds();
        if (_manager == address(0)) revert InvalidAddress();
        manager = _manager;
        minimumContribution = _minimum;
        active = true;
    }

    // =====================
    // MODIFIERS
    // =====================

    /// @dev Chỉ cho phép khi chiến dịch đang hoạt động
    modifier onlyActive() {
        if (!active) revert CampaignNotActive();
        _;
    }

    // =====================
    // DONATE
    // =====================

    /**
     * @notice Đóng góp tiền vào chiến dịch.
     * @dev Yêu cầu số tiền >= minimumContribution.
     *      Tự động tăng totalDonors nếu là người đóng góp mới.
     */
    function donate() external payable onlyActive {
        if (msg.value < minimumContribution) revert InsufficientFunds();

        if (contributions[msg.sender] == 0) {
            totalDonors++;
        }

        contributions[msg.sender] += msg.value;

        emit Donation(msg.sender, msg.value);
    }

    // =====================
    // CREATE REQUEST
    // =====================

    /**
     * @notice Manager tạo một yêu cầu chi tiêu tiền quỹ.
     * @param desc Mô tả mục đích chi tiêu.
     * @param value Số tiền yêu cầu (wei).
     * @param recipient Địa chỉ nhận tiền.
     */
    function createRequest(
        string calldata desc,
        uint256 value,
        address payable recipient
    ) external onlyManager onlyActive {
        if (value == 0) revert InsufficientFunds();
        if (recipient == address(0)) revert InvalidAddress();
        if (bytes(desc).length == 0) revert EmptyDescription();

        RequestLib.Request storage r = requests.push();

        r.description = desc;
        r.value = value;
        r.recipient = recipient;
        r.complete = false;
        r.approvalCount = 0;

        emit RequestCreated(requests.length - 1, desc, value, recipient);
    }

    // =====================
    // VOTE
    // =====================

    /**
     * @notice Donor tham gia biểu quyết cho một yêu cầu.
     * @param index Chỉ số của yêu cầu cần biểu quyết.
     * @dev Manager không được phép vote. Mỗi donor chỉ vote 1 lần.
     */
    function approveRequest(uint256 index) external onlyActive {
        if (index >= requests.length) revert InvalidRequestIndex();

        RequestLib.Request storage r = requests[index];

        if (contributions[msg.sender] == 0) revert NotDonor();
        if (r.approvals[msg.sender]) revert AlreadyVoted();
        if (msg.sender == manager) revert ManagerCannotVote();
        if (r.complete) revert RequestCompleted();

        r.approvals[msg.sender] = true;
        r.approvalCount++;

        emit Voted(msg.sender, index);
    }

    // =====================
    // FINALIZE
    // =====================

    /**
     * @notice Manager thực thi việc chi tiêu khi có đủ số phiếu bầu (> 50%).
     * @param index Chỉ số của yêu cầu cần thực thi.
     * @dev Sử dụng `.call` thay vì `.transfer` để tránh giới hạn 2300 gas.
     */
    function finalizeRequest(uint256 index) external onlyManager nonReentrant {
        if (index >= requests.length) revert InvalidRequestIndex();

        RequestLib.Request storage r = requests[index];

        if (r.complete) revert RequestCompleted();
        if (r.value > address(this).balance) revert InsufficientFunds();

        // Cần hơn 50% số lượng donor đồng ý
        if (r.approvalCount <= totalDonors / 2)
            revert NotEnoughApprovals();

        r.complete = true;

        (bool success, ) = r.recipient.call{value: r.value}("");
        if (!success) revert TransferFailed();

        emit FundsReleased(index);
    }

    // =====================
    // ADMIN
    // =====================

    /**
     * @notice Manager tạm dừng chiến dịch.
     */
    function deactivateCampaign() external onlyManager {
        if (!active) revert CampaignNotActive();
        active = false;
        emit CampaignDeactivated();
    }

    // =====================
    // VIEW FUNCTIONS
    // =====================

    /**
     * @notice Lấy thông tin tổng quan của chiến dịch.
     * @return balance Số dư hiện tại (wei).
     * @return minContribution Số tiền đóng góp tối thiểu (wei).
     * @return numRequests Số lượng yêu cầu chi tiêu.
     * @return donors Số lượng donors.
     * @return managerAddr Địa chỉ manager.
     * @return isActive Trạng thái hoạt động.
     */
    function getSummary()
        external
        view
        returns (
            uint256 balance,
            uint256 minContribution,
            uint256 numRequests,
            uint256 donors,
            address managerAddr,
            bool isActive
        )
    {
        return (
            address(this).balance,
            minimumContribution,
            requests.length,
            totalDonors,
            manager,
            active
        );
    }

    /**
     * @notice Lấy số lượng yêu cầu chi tiêu.
     * @return Tổng số yêu cầu.
     */
    function getRequestsCount() external view returns (uint256) {
        return requests.length;
    }
}