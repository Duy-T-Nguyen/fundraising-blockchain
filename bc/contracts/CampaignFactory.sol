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

    /// @notice Sổ cái Nhà cung cấp dùng chungo cho tất cả Campaign
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

    /// @notice Các kiểu truy vấn hỗ trợ
    enum QueryType { ALL, BY_MANAGER, BY_CATEGORY }

    /**
     * @notice Truy vấn chiến dịch nâng cao với nhiều tiêu chí lọc và phân trang.
     * @param queryType Kiểu truy vấn (ALL, BY_MANAGER, BY_CATEGORY).
     * @param _manager Địa chỉ manager (nếu dùng BY_MANAGER).
     * @param _category Danh mục (nếu dùng BY_CATEGORY).
     * @param offset Vị trí bắt đầu.
     * @param limit Số lượng tối đa.
     * @return campaigns Mảng địa chỉ các campaign thỏa mãn điều kiện.
     */
    function getCampaigns(
        QueryType queryType,
        address _manager,
        Category _category,
        uint256 offset,
        uint256 limit
    ) external view returns (address[] memory campaigns) {
        address[] storage source;
        
        if (queryType == QueryType.ALL) {
            source = deployedCampaigns;
        } else if (queryType == QueryType.BY_MANAGER) {
            source = campaignsByManager[_manager];
        } else {
            source = categoryToCampaigns[_category];
        }

        uint256 total = source.length;
        if (offset >= total || limit == 0) return new address[](0);

        uint256 size = limit;
        if (offset + limit > total) {
            size = total - offset;
        }

        campaigns = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            campaigns[i] = source[offset + i];
        }
    }

    /**
     * @notice Lấy tổng số chiến dịch của một manager cụ thể.
     */
    function getManagerCount(address _manager) external view returns (uint256) {
        return campaignsByManager[_manager].length;
    }

    /**
     * @notice Lấy tổng số chiến dịch trong một danh mục cụ thể.
     */
    function getCategoryCount(Category _category) external view returns (uint256) {
        return categoryToCampaigns[_category].length;
    }

    /**
     * @notice Lấy tổng số chiến dịch toàn hệ thống.
     */
    function getCampaignsCount() external view returns (uint256) {
        return deployedCampaigns.length;
    }
}
