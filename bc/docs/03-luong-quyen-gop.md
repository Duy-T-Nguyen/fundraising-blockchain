# 📊 Diagram 3: Luồng quyên góp (Donation Flow)

## Mục đích

Hiểu cơ chế tracking donor, gán voting weight, và cách Factory duy trì thống kê toàn cục.

## Diagram

```mermaid
sequenceDiagram
    autonumber
    participant D as 💰 Donor
    participant C as 📋 Campaign
    participant F as 📦 CampaignFactory

    D->>C: donate() + gửi ETH
    
    Note over C: Kiểm tra:<br/>✓ campaign active<br/>✓ sender ≠ manager<br/>✓ msg.value ≥ minimumContribution

    alt Donor lần đầu
        C->>C: totalDonors++
        C->>C: donorId[sender] = totalDonors
        C->>C: donorAtId[totalDonors] = sender
    end

    C->>C: contributions[sender] += msg.value
    C->>C: totalFundsRaised += msg.value
    C->>F: recordDonation(sender, msg.value)
    
    Note over F: isChildCampaign[msg.sender] check

    alt Lần đầu donate campaign này
        F->>F: userDonatedCampaigns[donor].push(campaign)
        F->>F: hasDonatedTo[donor][campaign] = true
    end
    
    F->>F: totalGlobalDonated += amount
    C-->>D: emit Donation(sender, msg.value)
```

## Giải thích chi tiết

### Kiểm tra đầu vào
1. **`onlyActive`**: Campaign phải đang active
2. **`sender != manager`**: Manager không được donate cho chính chiến dịch mình — tránh tự tạo voting weight
3. **`msg.value >= minimumContribution`**: Tránh spam donation nhỏ

### Hệ thống Donor ID
Mỗi donor được gán ID duy nhất tăng dần. Mapping ngược `donorAtId` cho phép truy cập donor theo index — dùng trong thuật toán chọn Validator ngẫu nhiên `_getRandomValidators()`.

### Voting Weight
Trọng số biểu quyết = tổng ETH đã đóng góp. Hệ thống dùng **delta voting** — donor donate thêm sau khi đã vote thì phần chênh lệch được cộng thêm.

### Thống kê toàn cục
Campaign callback `recordDonation()` lên Factory: tracking `userDonatedCampaigns` (cho Dashboard) và `totalGlobalDonated`.

### Tham chiếu
| Logic | File | Dòng |
|---|---|---|
| `donate()` | `Campaign.sol` | 134-151 |
| `recordDonation()` | `CampaignFactory.sol` | 323-333 |
