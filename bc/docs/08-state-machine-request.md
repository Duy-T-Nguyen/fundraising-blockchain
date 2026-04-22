# 📊 Diagram 8: State Machine của Request

## Mục đích

Request có nhiều trạng thái và chuyển đổi phức tạp, đặc biệt Multi-Stage request với milestones. Diagram state machine giúp dev và auditor xác minh không có trạng thái "treo" hay lỗ hổng bảo mật.

## Diagram

```mermaid
stateDiagram-v2
    [*] --> OPEN: createRequest() hoặc<br/>createMultiStageRequest()

    state OPEN {
        [*] --> Voting
        Voting: Đang chờ biểu quyết<br/>Thời hạn: 7 ngày
        Voting --> ValidatorCheck: Nếu có selectedValidators
        Voting --> WeightedOnly: Nếu không có Validators
        
        ValidatorCheck: Validator Audit<br/>Cần ≥ 2/3 approve
        WeightedOnly: Chỉ Weighted Voting<br/>Cần > 50% tổng vốn
    end

    state SINGLE_FINALIZE {
        SF1: Kiểm tra vote đủ
        SF2: Xác thực ECDSA Verifier
        SF3: Transfer ETH → Supplier
        SF4: recordPayment()
        SF1 --> SF2 --> SF3 --> SF4
    }

    state MULTI_MILESTONE {
        MS0: Milestone 0
        MS1: Milestone 1
        MSN: Milestone N
        MS0 --> MS1: executeMilestone() + signature
        MS1 --> MSN: executeMilestone() + signature
    }

    OPEN --> SINGLE_FINALIZE: finalizeRequest()<br/>(Single Request)
    OPEN --> MULTI_MILESTONE: executeMilestone()<br/>(Multi-Stage)
    OPEN --> CANCELLED: cancelRequest()<br/>currentMilestone == 0

    SINGLE_FINALIZE --> COMPLETED
    MULTI_MILESTONE --> COMPLETED: Tất cả milestones released

    COMPLETED --> [*]
    CANCELLED --> [*]

    note right of OPEN
        lockedFunds đã bị khóa
        Voting period: 7 ngày
        Validator reselection: 2 ngày
    end note

    note right of CANCELLED
        lockedFunds giải phóng
        Chỉ hủy khi chưa giải ngân
        milestone nào
    end note

    note right of COMPLETED
        Tiền đã chuyển Supplier
        SupplierRegistry đã ghi nhận
        Không thể thay đổi
    end note
```

## Giải thích chi tiết

### 3 trạng thái cuối cùng

| Trạng thái | Ý nghĩa | Trigger |
|---|---|---|
| `OPEN` | Đang chờ vote + xác nhận | `createRequest()` / `createMultiStageRequest()` |
| `COMPLETED` | Đã giải ngân xong | `finalizeRequest()` / milestone cuối |
| `CANCELLED` | Đã hủy, tiền unlock | `cancelRequest()` |

### 2 loại Request

**Single Request:**
- Giải ngân 1 lần toàn bộ `value`
- Điều kiện: (Validator ≥ 2 HOẶC Vote > 50%) VÀ Verifier signature
- Hàm: `finalizeRequest(index, signature, finalMetadataCID)`

**Multi-Stage Request:**
- Giải ngân theo từng milestone
- Mỗi milestone cần Verifier ký riêng: `keccak256(chainid, contract, index, milestoneIndex)`
- Khi milestone cuối released → status = COMPLETED
- Hàm: `executeMilestone(index, signature, metadataCID)`

### Edge Cases quan trọng

1. **Request hết hạn**: Sau 7 ngày → `approveRequest()` revert `RequestExpired`, nhưng request vẫn ở `OPEN`
2. **Cancel guard**: Không thể cancel nếu `currentMilestone > 0` → revert `RequestAlreadyReleased`
3. **Validator reselection**: Chỉ khi status = OPEN, có selectedValidators, và sau 2 ngày timeout
4. **Expired request**: Vẫn ở OPEN nhưng không thể vote thêm — Manager có thể cancel để unlock funds

### Request Struct

```solidity
struct Request {
    string metadataCID;              // CID metadata trên IPFS
    uint256 value;                   // Tổng giá trị (wei)
    uint256 totalApprovalWeight;     // Tổng weight đã vote
    uint256 snapshotTotalFunds;      // Tổng quỹ tại thời điểm tạo
    uint256 snapshotDonorCount;      // Tổng donor tại thời điểm tạo
    uint256 validatorApprovalCount;  // Số validator đã approve
    uint256 lastValidatorSelection;  // Timestamp chọn validator cuối
    uint256 currentMilestone;        // Milestone hiện tại (multi-stage)
    uint256 createdAt;               // Timestamp tạo request
    address payable recipient;       // Supplier nhận tiền
    RequestType requestType;         // SINGLE hoặc MULTI
    Status status;                   // OPEN, COMPLETED, CANCELLED
    address verifier;                // Bên xác nhận
    address[] selectedValidators;    // 3 validators ngẫu nhiên
    Milestone[] milestones;          // Danh sách milestones
}
```

### Tham chiếu
| Logic | File | Dòng |
|---|---|---|
| Request struct | `RequestLib.sol` | 26-50 |
| Status enum | `RequestLib.sol` | 20-24 |
| Voting period check | `Campaign.sol` | 266-267 |
| Cancel guard | `Campaign.sol` | 570 |
| createMultiStageRequest() | `Campaign.sol` | 205-255 |
