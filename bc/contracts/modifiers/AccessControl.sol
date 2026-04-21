// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/Context.sol";
import "../Errors.sol";

/**
 * @title AccessControl
 * @notice Quản lý quyền truy cập dựa trên vai trò manager.
 */
abstract contract AccessControl is Context {
    /// @notice Địa chỉ manager (người tạo chiến dịch)
    address public manager;

    /// @dev Chỉ cho phép manager gọi hàm
    modifier onlyManager() {
        if (_msgSender() != manager) revert NotManager();
        _;
    }
}
