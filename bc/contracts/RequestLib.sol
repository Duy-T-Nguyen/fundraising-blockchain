// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title RequestLib
 * @notice Thư viện lưu trữ cấu trúc dữ liệu cho yêu cầu chi tiêu.
 * @dev Struct chứa mapping nên chỉ có thể lưu trong storage.
 */
library RequestLib {
    struct Milestone {
        uint256 value;          // Số tiền của giai đoạn này
        string description;     // Mô tả công việc
        bool released;          // Đã giải ngân hay chưa
    }

    enum RequestType { SINGLE, MULTI }

    struct Request {
        string description;
        uint256 value;          // Tổng tiền (nếu là SINGLE) hoặc mốc hiện tại (nếu là MULTI)
        address payable recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
        
        // Cấu trúc cho Multi-stage
        RequestType requestType;
        Milestone[] milestones;
        uint256 currentMilestone;
        address verifier;       // Địa chỉ Oracle/Validator xác thực

        // Cấu trúc cho Validator path (Small Request)
        uint256 validatorApprovalCount;
        mapping(address => bool) validatorApprovals;
        address[] selectedValidators;
    }
}