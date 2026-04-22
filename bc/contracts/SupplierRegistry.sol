// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Errors.sol";
import "./Events.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

interface ICampaignFactory {
    function isChildCampaign(address) external view returns (bool);

    function recordDonation(address donor, uint256 amount) external;
}

/**
 * @title SupplierRegistry
 * @author Fundraising Blockchain Team
 * @notice Sổ cái toàn cầu lưu trữ danh sách Nhà cung cấp uy tín.
 */
contract SupplierRegistry is Events, ERC2771Context {
    /// @notice Địa chỉ Platform Admin
    address public admin;

    /// @notice Địa chỉ CampaignFactory để xác thực Campaign hợp lệ
    address public factory;

    /// @notice Mapping kiểm tra xem một campaign có được quyền thanh toán không
    mapping(address => bool) public authorizedCampaigns;

    struct Supplier {
        uint256 totalEarned;
        string name;
        string metadataCID;
        bool exists;
    }

    /// @notice Mapping kiểm tra thông tin chi tiết Supplier
    mapping(address => Supplier) public suppliers;

    /// @notice Mapping lưu vị trí của Supplier trong mảng (để xóa O(1))
    mapping(address => uint256) private supplierIndex;

    /// @notice Danh sách tất cả địa chỉ Supplier (để truy vấn)
    address[] public supplierList;

    /// @dev Chỉ cho phép Admin gọi
    modifier onlyAdmin() {
        if (_msgSender() != admin) revert NotAdmin();
        _;
    }

    /// @dev Chỉ cho phép Factory gọi
    modifier onlyFactory() {
        if (msg.sender != factory) revert NotAuthorized();
        _;
    }

    constructor(
        address _admin,
        address trustedForwarder
    ) ERC2771Context(trustedForwarder) {
        if (_admin == address(0)) revert InvalidAddress();
        admin = _admin;
    }

    /**
     * @notice Thiết lập địa chỉ Factory (chỉ được gọi một lần bởi Admin)
     */
    function setFactory(address _factory) external onlyAdmin {
        if (_factory == address(0)) revert InvalidAddress();
        if (factory != address(0)) revert ActionForbidden(); // Chỉ set 1 lần
        factory = _factory;
    }

    /**
     * @notice Ủy quyền hoặc hủy ủy quyền cho một Campaign được phép tương tác với Registry.
     * @dev Chỉ được gọi bởi Factory khi tạo campaign mới.
     */
    function setAuthorizedCampaign(
        address _campaign,
        bool _status
    ) external onlyFactory {
        authorizedCampaigns[_campaign] = _status;
        emit AuthorizedCampaignUpdated(_campaign, _status);
    }

    /**
     * @notice Chuyển giao quyền Quản trị hệ thống cho một địa chỉ khác.
     * @param _newAdmin Địa chỉ của Admin mới.
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        if (_newAdmin == address(0)) revert InvalidAddress();
        address oldAdmin = admin;
        admin = _newAdmin;
        emit AdminTransferred(oldAdmin, _newAdmin);
    }

    /**
     * @notice Thêm Nhà cung cấp vào danh sách trắng.
     */
    function addSupplier(
        address _supplier,
        string calldata _name,
        string calldata _metadata
    ) external onlyAdmin {
        if (_supplier == address(0)) revert InvalidAddress();
        if (suppliers[_supplier].exists) revert AlreadyWhitelisted();

        supplierIndex[_supplier] = supplierList.length;
        suppliers[_supplier] = Supplier({
            name: _name,
            metadataCID: _metadata,
            totalEarned: 0,
            exists: true
        });
        supplierList.push(_supplier);

        emit SupplierAdded(_supplier, _name, _metadata);
    }

    /**
     * @notice Cập nhật thông tin cho Supplier.
     */
    function updateSupplierInfo(
        address _supplier,
        string calldata _name,
        string calldata _metadata
    ) external {
        if (_msgSender() != admin && _msgSender() != _supplier) revert NotAdmin();
        if (!suppliers[_supplier].exists) revert NotWhitelisted();

        suppliers[_supplier].name = _name;
        suppliers[_supplier].metadataCID = _metadata;

        emit SupplierInfoUpdated(_supplier, _name, _metadata);
    }

    /**
     * @notice Xóa Nhà cung cấp khỏi danh sách trắng.
     */
    function removeSupplier(address _supplier) external onlyAdmin {
        if (!suppliers[_supplier].exists) revert NotWhitelisted();

        uint256 indexToRemove = supplierIndex[_supplier];
        uint256 lastIndex = supplierList.length - 1;

        if (indexToRemove != lastIndex) {
            address lastSupplier = supplierList[lastIndex];
            supplierList[indexToRemove] = lastSupplier;
            supplierIndex[lastSupplier] = indexToRemove;
        }

        supplierList.pop();
        delete supplierIndex[_supplier];
        delete suppliers[_supplier];

        emit SupplierRemoved(_supplier);
    }

    /**
     * @notice Ghi nhận thanh toán cho Supplier (gọi từ Campaign hợp lệ).
     */
    function recordPayment(address _supplier, uint256 _amount) external {
        // Kiểm tra ủy quyền tại chỗ (Local mapping) - Tiết kiệm gas so với gọi Factory
        if (!authorizedCampaigns[msg.sender]) {
            revert NotAuthorized();
        }
        if (!suppliers[_supplier].exists) revert NotWhitelisted();

        suppliers[_supplier].totalEarned += _amount;

        emit SupplierEarningsUpdated(
            _supplier,
            suppliers[_supplier].totalEarned
        );
    }

    function isSupplier(address _addr) external view returns (bool) {
        return suppliers[_addr].exists;
    }

    function getSupplierCount() external view returns (uint256) {
        return supplierList.length;
    }

    /**
     * @notice Lấy danh sách Supplier có phân trang kèm theo metadata.
     */
    function getSuppliers(uint256 offset, uint256 limit)
        external
        view
        returns (
            address[] memory addresses,
            string[] memory names,
            string[] memory metadatas,
            uint256[] memory earnings
        )
    {
        uint256 total = supplierList.length;
        if (offset >= total || limit == 0)
            return (
                new address[](0),
                new string[](0),
                new string[](0),
                new uint256[](0)
            );

        uint256 size = limit;
        if (offset + limit > total) size = total - offset;

        addresses = new address[](size);
        names = new string[](size);
        metadatas = new string[](size);
        earnings = new uint256[](size);

        for (uint256 i = 0; i < size; i++) {
            address addr = supplierList[offset + i];
            addresses[i] = addr;
            names[i] = suppliers[addr].name;
            metadatas[i] = suppliers[addr].metadataCID;
            earnings[i] = suppliers[addr].totalEarned;
        }
    }
}
