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

    struct Supplier {
        string name;
        string metadataHash; // IPFS hash chứa Website, Profile, etc.
        uint256 totalEarned; // Tổng thu nhập tích lũy (Wei)
        bool exists;
    }

    /// @notice Mapping kiểm tra thông tin chi tiết Supplier
    mapping(address => Supplier) public suppliers;

    /// @notice Mapping lưu vị trí của Supplier trong mảng (để xóa O(1))
    mapping(address => uint256) private supplierIndex;

    /// @notice Danh sách tất cả địa chỉ Supplier (để truy vấn)
    address[] public supplierList;

    /// @notice Phát ra khi Supplier mới được thêm vào danh sách
    event SupplierAdded(address indexed supplier, string name);

    /// @notice Phát ra khi Supplier bị xóa khỏi danh sách
    event SupplierRemoved(address indexed supplier);

    /// @dev Chỉ cho phép Admin gọi
    modifier onlyAdmin() {
        if (_msgSender() != admin) revert NotAdmin();
        _;
    }

    constructor(address _admin, address trustedForwarder) ERC2771Context(trustedForwarder) {
        if (_admin == address(0)) revert InvalidAddress();
        admin = _admin;
    }

    /**
     * @notice Thiết lập địa chỉ Factory (chỉ được gọi một lần hoặc bởi Admin)
     */
    function setFactory(address _factory) external onlyAdmin {
        if (_factory == address(0)) revert InvalidAddress();
        factory = _factory;
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
    function addSupplier(address _supplier, string calldata _name, string calldata _metadata) external onlyAdmin {
        if (_supplier == address(0)) revert InvalidAddress();
        if (suppliers[_supplier].exists) revert AlreadyWhitelisted();
        
        supplierIndex[_supplier] = supplierList.length;
        suppliers[_supplier] = Supplier({
            name: _name,
            metadataHash: _metadata,
            totalEarned: 0,
            exists: true
        });
        supplierList.push(_supplier);

        emit SupplierAdded(_supplier, _name);
    }

    /**
     * @notice Cập nhật thông tin cho Supplier.
     */
    function updateSupplierInfo(address _supplier, string calldata _name, string calldata _metadata) external {
        if (_msgSender() != admin && _msgSender() != _supplier) revert NotAdmin();
        if (!suppliers[_supplier].exists) revert NotWhitelisted();

        suppliers[_supplier].name = _name;
        suppliers[_supplier].metadataHash = _metadata;
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
        // Xác thực: người gọi phải là một Campaign hợp lệ được tạo từ Factory
        if (factory == address(0) || !ICampaignFactory(factory).isChildCampaign(msg.sender)) {
            revert NotAuthorized();
        }
        if (!suppliers[_supplier].exists) revert NotWhitelisted();

        suppliers[_supplier].totalEarned += _amount;
        
        emit SupplierEarningsUpdated(_supplier, suppliers[_supplier].totalEarned);
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
    function getSuppliers(uint256 offset, uint256 limit) external view returns (
        address[] memory addresses,
        string[] memory names,
        string[] memory metadatas,
        uint256[] memory earnings
    ) {
        uint256 total = supplierList.length;
        if (offset >= total || limit == 0) return (new address[](0), new string[](0), new string[](0), new uint256[](0));

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
            metadatas[i] = suppliers[addr].metadataHash;
            earnings[i] = suppliers[addr].totalEarned;
        }
    }
}
