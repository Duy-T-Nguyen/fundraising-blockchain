// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../Errors.sol";

/**
 * @title AccessControl
 * @notice Quản lý quyền truy cập dựa trên vai trò manager.
 */
contract AccessControl {
    /// @notice Địa chỉ manager (người tạo chiến dịch)
    address public manager;

    /// @dev Chỉ cho phép manager gọi hàm
    modifier onlyManager() {
        if (msg.sender != manager) revert NotManager();
        _;
    }
}
