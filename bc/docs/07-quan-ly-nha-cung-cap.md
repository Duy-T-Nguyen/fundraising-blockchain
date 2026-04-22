# 📊 Diagram 7: Quản lý Nhà cung cấp (Supplier Registry)

## Mục đích

SupplierRegistry là lớp bảo mật chống rút tiền trái phép — tiền chỉ có thể gửi đến nhà cung cấp đã được Admin xác minh. Diagram giúp hiểu quy trình CRUD, ủy quyền, và các quyền hạn.

## Diagram

```mermaid
flowchart TD
    subgraph ADMIN_OPS["🔑 Admin Operations"]
        A1["addSupplier(addr, name, metadataCID)"]
        A2["removeSupplier(addr)<br/>Thuật toán swap-and-pop O(1)"]
        A3["setFactory(factory)<br/>Chỉ được gọi 1 lần"]
        A4["transferAdmin(newAdmin)"]
    end

    subgraph FACTORY_OPS["📦 Factory Operations"]
        F1["setAuthorizedCampaign(campaign, true)<br/>Khi approveCampaignRequest()"]
    end

    subgraph CAMPAIGN_OPS["📋 Campaign Operations"]
        C1["isSupplier(recipient)<br/>Khi createRequest() validate"]
        C2["recordPayment(supplier, amount)<br/>Khi finalizeRequest()"]
    end

    subgraph SELF_OPS["🏭 Supplier Self-Update"]
        S1["updateSupplierInfo(addr, name, metadata)<br/>Supplier hoặc Admin"]
    end

    subgraph REGISTRY["📒 Storage"]
        ST1["suppliers: address → Supplier"]
        ST2["supplierList: address array"]
        ST3["supplierIndex: address → uint256"]
        ST4["authorizedCampaigns: address → bool"]
    end

    A1 -->|"Thêm whitelist"| ST1
    A1 -->|"Push array"| ST2
    A2 -->|"Swap + pop"| ST2
    A3 -->|"Set 1 lần"| REGISTRY
    F1 -->|"Ủy quyền"| ST4
    C1 -->|"Check exists"| ST1
    C2 -->|"Check authorized + update earnings"| ST4
    S1 -->|"Update info"| ST1
```

## Giải thích chi tiết

### Supplier Struct

```solidity
struct Supplier {
    uint256 totalEarned;   // Tổng thu nhập từ các campaign
    string name;           // Tên NCC
    string metadataCID;    // CID metadata trên IPFS
    bool exists;           // Đã whitelist hay chưa
}
```

### Push Authorization Model

Khi Factory approve campaign mới → gọi `setAuthorizedCampaign(campaign, true)`. Campaign sau đó gọi `recordPayment()` mà không cần callback lại Factory — tiết kiệm gas.

### Swap-and-Pop O(1) Delete

Khi xóa supplier tại vị trí `i`:
1. Swap `supplierList[i]` với phần tử cuối
2. Update `supplierIndex` của phần tử cuối = `i`
3. `supplierList.pop()`
4. Delete `supplierIndex[supplier]` và `suppliers[supplier]`

### Dual Access Control

`updateSupplierInfo()` cho phép cả Admin VÀ Supplier tự cập nhật:
```solidity
if (_msgSender() != admin && _msgSender() != _supplier) revert NotAdmin();
```

### Tham chiếu
| Logic | File | Dòng |
|---|---|---|
| `addSupplier()` | `SupplierRegistry.sol` | 100-118 |
| `removeSupplier()` | `SupplierRegistry.sol` | 140-157 |
| `recordPayment()` | `SupplierRegistry.sol` | 162-175 |
| `setAuthorizedCampaign()` | `SupplierRegistry.sol` | 78-84 |
| `updateSupplierInfo()` | `SupplierRegistry.sol` | 123-135 |
