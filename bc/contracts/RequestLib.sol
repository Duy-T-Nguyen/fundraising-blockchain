// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title RequestLib
 * @notice Thư viện lưu trữ cấu trúc dữ liệu cho yêu cầu chi tiêu.
 * @dev Struct chứa mapping nên chỉ có thể lưu trong storage.
 */
library RequestLib {
    struct Milestone {
        uint256 value; // Số tiền của giai đoạn này
        string metadataCID; // CID chứa mô tả kế hoạch
        string proofCID; // Minh chứng sau khi thực hiện (Supplier nộp)
        bool released; // Đã giải ngân hay chưa
        bool isVerified; // Đã được Verifier duyệt hay chưa
    }

    enum RequestType {
        SINGLE,
        MULTI
    }
    enum Status {
        OPEN,
        COMPLETED,
        CANCELLED
    }
    enum VerificationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    struct Request {
        // --- Full Slots ---
        string metadataCID; // CID chứa Name, Description, v.v.
        string proofCID; // CID chứa minh chứng thực tế (Supplier nộp)
        string rejectionReasonCID; // Lý do từ chối (Verifier nộp)
        uint256 value;
        uint256 totalApprovalWeight;
        uint256 snapshotTotalFunds;
        uint256 snapshotDonorCount;
        uint256 validatorApprovalCount;
        uint256 lastValidatorSelection;
        uint256 currentMilestone;
        uint256 createdAt;
        // --- Packed Slot (Shared 32 bytes) ---
        address payable recipient; // 20 bytes
        RequestType requestType; // 1 byte
        Status status; // 1 byte
        VerificationStatus verifyStatus; // 1 byte
        // 9 bytes left in this slot

        // --- Next Slot ---
        address verifier; // 20 bytes
        // 12 bytes left in this slot

        // --- Arrays (Pointer slots) ---
        address[] selectedValidators;
        Milestone[] milestones;
    }

    // Ghi chú: Các mapping (approvals, votedAmount, validatorApprovals, failedValidators)
    // đã được đưa ra ngoài Campaign contract để giảm kích thước struct.
}
