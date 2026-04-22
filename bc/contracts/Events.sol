// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Events
 * @notice Định nghĩa các sự kiện cho hệ thống Campaign.
 */
contract Events {
    enum Category {
        Education,
        Medical,
        Disaster,
        Environment,
        Others
    }

    /// @notice Phát ra khi Manager nạp thêm tiền xăng
    event GasRefilled(address indexed manager, uint256 amount);
    /// @notice Phát ra khi Admin rút tiền xăng để nạp cho Bot Relayer
    event GasWithdrawn(address indexed admin, uint256 amount);

    /// @notice Phát ra khi có người đóng góp
    event Donation(address indexed donor, uint256 amount);

    /// @notice Phát ra khi manager tạo yêu cầu chi tiêu mới
    event RequestCreated(
        uint256 indexed id,
        string metadataCID,
        uint256 value,
        address indexed recipient,
        address verifier,
        address[] selectedValidators,
        uint256 lastValidatorSelection
    );

    /// @notice Phát ra khi donor biểu quyết cho yêu cầu
    event Voted(address indexed voter, uint256 indexed requestId);

    /// @notice Phát ra khi yêu cầu chi tiêu được thực thi
    event FundsReleased(uint256 indexed requestId, address indexed recipient);

    /// @notice Phát ra khi một milestone được giải ngân
    event MilestoneReleased(
        uint256 indexed requestId,
        uint256 milestoneIndex,
        uint256 amount,
        address indexed recipient,
        string metadataCID
    );

    /// @notice Phát ra khi thu nhập của Supplier được cập nhật
    event SupplierEarningsUpdated(
        address indexed supplier,
        uint256 totalEarned
    );

    /// @notice Phát ra khi chiến dịch bị tạm dừng
    event CampaignDeactivated();
    event RefundClaimed(address indexed donor, uint256 amount);

    /// @notice Phát ra khi chiến dịch mới được tạo (Dùng cho Factory)
    event CampaignStarted(
        address indexed campaignAddress,
        address indexed manager,
        string metadataCID,
        Category indexed category,
        uint256 minContribution
    );

    /// @notice Phát ra khi có yêu cầu tạo chiến dịch mới được gửi
    event CampaignRequestSubmitted(
        uint256 indexed requestId,
        address indexed manager,
        string metadataCID,
        Category category,
        uint256 minContribution
    );

    /// @notice Phát ra khi một yêu cầu tạo chiến dịch được duyệt
    event CampaignRequestApproved(
        uint256 indexed requestId,
        address indexed campaignAddress
    );

    /// @notice Phát ra khi một yêu cầu tạo chiến dịch bị từ chối
    event CampaignRequestRejected(uint256 indexed requestId);

    /// @notice Phát ra khi Admin thay đổi phí tạo chiến dịch
    event AntiSpamFeeUpdated(uint256 oldFee, uint256 newFee);

    /// @notice Phát ra khi quyền quản trị Admin được chuyển giao
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    /// @notice Báo cho Verifier biết họ được giao nhiệm vụ kiểm tra
    event AssignedAsVerifier(
        address indexed verifier,
        uint256 indexed requestId
    );

    /// @notice Báo cho Supplier biết họ có đơn hàng cần giao
    event AssignedAsSupplier(
        address indexed supplier,
        uint256 indexed requestId
    );

    /// @notice Phát ra khi Supplier mới được thêm vào danh sách
    event SupplierAdded(
        address indexed supplier,
        bytes32 name,
        bytes32 metadataHash
    );
    /// @notice Phát ra khi Supplier bị xóa khỏi danh sách
    event SupplierRemoved(address indexed supplier);
    /// @notice Phát ra khi thông tin Supplier được cập nhật
    event SupplierInfoUpdated(
        address indexed supplier,
        bytes32 name,
        bytes32 metadataHash
    );
    /// @notice Phát ra khi một Campaign được ủy quyền/hủy ủy quyền tương tác với Registry
    event AuthorizedCampaignUpdated(address indexed campaign, bool status);
    /// @notice Phát ra khi một yêu cầu chi tiêu bị hủy
    event RequestCancelled(uint256 indexed requestId);
}
