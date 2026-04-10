// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Campaign.sol";
import "./ValidatorPool.sol";

/**
 * @title CampaignFactory
 * @author Fundraising Blockchain Team
 * @notice Contract trung tâm để khởi tạo và quản lý các chiến dịch gây quỹ.
 * @dev Mỗi lần gọi createCampaign sẽ deploy một Campaign contract mới.
 */
contract CampaignFactory {
    /// @notice Danh sách địa chỉ các chiến dịch đã deploy
    address[] public deployedCampaigns;

    /// @notice Mapping từ manager address đến các campaigns họ đã tạo
    mapping(address => address[]) public campaignsByManager;

    /// @notice Phát ra khi chiến dịch mới được tạo
    event CampaignStarted(
        address indexed campaignAddress,
        address indexed manager,
        uint256 minContribution
    );

    /**
     * @notice Tạo chiến dịch gây quỹ mới.
     * @param minimum Số tiền tối thiểu để được coi là donor (wei).
     */
    function createCampaign(uint256 minimum) external {
        // Khởi tạo pool cho campaign mới, manager là người quản trị pool ban đầu
        ValidatorPool pool = new ValidatorPool(msg.sender);
        Campaign newCampaign = new Campaign(minimum, msg.sender, address(pool));
        address campaignAddr = address(newCampaign);

        deployedCampaigns.push(campaignAddr);
        campaignsByManager[msg.sender].push(campaignAddr);

        emit CampaignStarted(campaignAddr, msg.sender, minimum);
    }

    /**
     * @notice Lấy toàn bộ danh sách các chiến dịch đã deploy.
     * @return Mảng địa chỉ các Campaign contracts.
     */
    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }

    /**
     * @notice Lấy danh sách các chiến dịch của một manager cụ thể.
     * @param _manager Địa chỉ manager cần tra cứu.
     * @return Mảng địa chỉ các Campaign của manager.
     */
    function getCampaignsByManager(address _manager) external view returns (address[] memory) {
        return campaignsByManager[_manager];
    }

    /**
     * @notice Lấy tổng số chiến dịch đã deploy.
     * @return Số lượng chiến dịch.
     */
    function getCampaignsCount() external view returns (uint256) {
        return deployedCampaigns.length;
    }
}
