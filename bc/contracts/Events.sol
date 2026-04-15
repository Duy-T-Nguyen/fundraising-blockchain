// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Events
 * @notice Định nghĩa các sự kiện cho hệ thống Campaign.
 */
contract Events {
    enum Category { Education, Medical, Disaster, Environment, Others }

    /// @notice Phát ra khi có người đóng góp
    event Donation(address indexed donor, uint256 amount);

    /// @notice Phát ra khi manager tạo yêu cầu chi tiêu mới
    event RequestCreated(uint256 indexed id, string description, uint256 value, address recipient, string evidenceHash);
    
    /// @notice Phát ra khi donor biểu quyết cho yêu cầu
    event Voted(address indexed voter, uint256 indexed requestId);

    /// @notice Phát ra khi yêu cầu chi tiêu được thực thi
    event FundsReleased(uint256 indexed requestId);

    /// @notice Phát ra khi một milestone được giải ngân
    event MilestoneReleased(uint256 indexed requestId, uint256 milestoneIndex, uint256 amount, string evidenceHash);

    /// @notice Phát ra khi validator pool được cập nhật
    event ValidatorPoolUpdated(address indexed poolAddress);

    /// @notice Phát ra khi chiến dịch bị tạm dừng
    event CampaignDeactivated();

    /// @notice Phát ra khi chiến dịch mới được tạo (Dùng cho Factory)
    event CampaignStarted(
        address indexed campaignAddress,
        address indexed manager,
        string campaignName,
        Category indexed category,
        uint256 minContribution
    );
}