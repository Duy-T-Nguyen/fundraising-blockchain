// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Errors.sol";

/**
 * @title SupplierRegistry
 * @author Fundraising Blockchain Team
 * @notice Sổ cái toàn cầu lưu trữ danh sách Nhà cung cấp uy tín.
 * @dev Chỉ Platform Admin (người deploy) mới có quyền thêm/xóa Supplier.
 *      Campaign Manager KHÔNG có quyền thao tác trên contract này.
 *      Lấy cảm hứng từ mô hình KYB (Know Your Business) của WFP Building Blocks.
 */
contract SupplierRegistry {
    /// @notice Địa chỉ Platform Admin (người deploy contract)
    address public admin;

    /// @notice Mapping kiểm tra nhanh: địa chỉ có phải Supplier không
    mapping(address => bool) public suppliers;

    /// @notice Danh sách tất cả địa chỉ Supplier (để truy vấn)
    address[] public supplierList;

    /// @notice Phát ra khi Supplier mới được thêm vào danh sách
    event SupplierAdded(address indexed supplier);

    /// @notice Phát ra khi Supplier bị xóa khỏi danh sách
    event SupplierRemoved(address indexed supplier);

    /// @dev Chỉ cho phép Admin gọi
    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    constructor(address _admin) {
        if (_admin == address(0)) revert InvalidAddress();
        admin = _admin;
    }

    /**
     * @notice Thêm Nhà cung cấp vào danh sách trắng.
     * @param _supplier Địa chỉ ví của Nhà cung cấp.
     */
    function addSupplier(address _supplier) external onlyAdmin {
        if (_supplier == address(0)) revert InvalidAddress();
        if (suppliers[_supplier]) revert AlreadyWhitelisted();
        
        suppliers[_supplier] = true;
        supplierList.push(_supplier);

        emit SupplierAdded(_supplier);
    }

    /**
     * @notice Xóa Nhà cung cấp khỏi danh sách trắng.
     * @param _supplier Địa chỉ ví của Nhà cung cấp cần xóa.
     */
    function removeSupplier(address _supplier) external onlyAdmin {
        if (!suppliers[_supplier]) revert NotWhitelisted();

        suppliers[_supplier] = false;

        // Xóa khỏi mảng supplierList
        for (uint i = 0; i < supplierList.length; i++) {
            if (supplierList[i] == _supplier) {
                supplierList[i] = supplierList[supplierList.length - 1];
                supplierList.pop();
                break;
            }
        }

        emit SupplierRemoved(_supplier);
    }

    /**
     * @notice Kiểm tra một địa chỉ có phải Supplier đã đăng ký không.
     * @param _addr Địa chỉ cần kiểm tra.
     * @return true nếu địa chỉ nằm trong danh sách trắng.
     */
    function isSupplier(address _addr) external view returns (bool) {
        return suppliers[_addr];
    }

    /**
     * @notice Lấy tổng số Supplier đã đăng ký.
     * @return Số lượng Supplier.
     */
    function getSupplierCount() external view returns (uint256) {
        return supplierList.length;
    }

    /**
     * @notice Lấy toàn bộ danh sách Supplier.
     * @return Mảng địa chỉ của tất cả Supplier.
     */
    function getAllSuppliers() external view returns (address[] memory) {
        return supplierList;
    }
}
