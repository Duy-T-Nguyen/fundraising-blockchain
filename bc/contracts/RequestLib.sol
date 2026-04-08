// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title RequestLib
 * @notice Thư viện lưu trữ cấu trúc dữ liệu cho yêu cầu chi tiêu.
 * @dev Struct chứa mapping nên chỉ có thể lưu trong storage.
 */
library RequestLib {
    struct Request {
        string description;
        uint256 value;
        address payable recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }
}