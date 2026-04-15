// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Campaign.sol";
import "./ValidatorPool.sol";
import "./SupplierRegistry.sol";

/**
 * @title CampaignFactory
 * @author Fundraising Blockchain Team
 * @notice Contract trung tâm để khởi tạo và quản lý các chiến dịch gây quỹ.
 * @dev Mỗi lần gọi createCampaign sẽ deploy một Campaign contract mới.
 *      SupplierRegistry được inject từ bên ngoài (deploy 1 lần, dùng chung).
 */
contract CampaignFactory is Events {
    /// @notice Danh sách địa chỉ các chiến dịch đã deploy
    address[] public deployedCampaigns;

    /// @notice Mapping từ manager address đến các campaigns họ đã tạo
    mapping(address => address[]) public campaignsByManager;

    /// @notice Danh sách chiến dịch phân loại theo danh mục (On-chain Index)
    mapping(Category => address[]) public categoryToCampaigns;

    /// @notice Sổ cái Nhà cung cấp dùng chung cho tất cả Campaign
    SupplierRegistry public supplierRegistry;



    /**
     * @notice Khởi tạo Factory với SupplierRegistry đã deploy sẵn.
     * @param _supplierRegistry Địa chỉ của SupplierRegistry contract.
     */
    constructor(address _supplierRegistry) {
        supplierRegistry = SupplierRegistry(_supplierRegistry);
    }

    /**
     * @notice Tạo chiến dịch gây quỹ mới.
     * @param name Tên chiến dịch.
     * @param category Danh mục chiến dịch.
     * @param minimum Số tiền tối thiểu để được coi là donor (wei).
     */
    function createCampaign(string calldata name, Category category, uint256 minimum) external {
        // Khởi tạo pool cho campaign mới, manager là người quản trị pool ban đầu
        ValidatorPool pool = new ValidatorPool(msg.sender);
        Campaign newCampaign = new Campaign(
            name,
            category,
            minimum,
            msg.sender,
            address(pool),
            address(supplierRegistry)
        );
        address campaignAddr = address(newCampaign);

        deployedCampaigns.push(campaignAddr);
        campaignsByManager[msg.sender].push(campaignAddr);
        categoryToCampaigns[category].push(campaignAddr);

        emit CampaignStarted(campaignAddr, msg.sender, name, category, minimum);
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

    /**
     * @notice Lấy danh sách chiến dịch theo danh mục (hỗ trợ phân trang).
     * @param category Danh mục cần lọc.
     * @param offset Vị trí bắt đầu lấy.
     * @param limit Số lượng tối đa phần tử trả về.
     * @return campaigns Mảng địa chỉ các campaign được tìm thấy.
     */
    function getCampaignsByCategory(Category category, uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory campaigns) 
    {
        address[] storage allInCategory = categoryToCampaigns[category];
        uint256 total = allInCategory.length;

        if (offset >= total) return new address[](0);

        uint256 size = limit;
        if (offset + limit > total) {
            size = total - offset;
        }

        campaigns = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            campaigns[i] = allInCategory[offset + i];
        }
    }

    /**
     * @notice Lấy tổng số chiến dịch trong một danh mục cụ thể.
     */
    function getCategoryCount(Category category) external view returns (uint256) {
        return categoryToCampaigns[category].length;
    }
}
