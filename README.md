## 🌐 Deployment Testnet (Sepolia)
**CampaignFactory Address:** `0xc1c3B6DAe097372e1C60Ed0ae5D148523131Fd90`  
**Link Etherscan:** [https://sepolia.etherscan.io/address/0xc1c3B6DAe097372e1C60Ed0ae5D148523131Fd90#code](https://sepolia.etherscan.io/address/0xc1c3B6DAe097372e1C60Ed0ae5D148523131Fd90#code)

## 🚀 Công nghệ sử dụng
- **Solidity**: Ngôn ngữ lập trình Smart Contract.
- **Hardhat**: Khung phát triển và môi trường thử nghiệm Ethereum.
- **Ethers.js**: Thư viện tương tác với Blockchain.
- **OpenZeppelin**: Các thư viện bảo mật chuẩn (ReentrancyGuard).
- **TypeScript**: Đảm bảo tính nhất quán và giảm lỗi trong code test/scripts.

## 🏗️ Kiến trúc Hệ thống (Factory Pattern)
Dự án được xây dựng theo mô hình **Factory**, giúp quản lý nhiều chiến dịch hiệu quả:
1.  **CampaignFactory.sol**: Contract trung tâm. Nó dùng để "đẻ" ra các contract Campaign mới. Nó lưu trữ danh sách tất cả các chiến dịch đã được tạo.
2.  **Campaign.sol**: Mỗi chiến dịch là một Smart Contract riêng biệt, quản lý tiền quỹ, donors, và các yêu cầu chi tiêu (Requests).

## ✨ Các tính năng chính
- **Khởi tạo Chiến dịch**: Người dùng có thể tạo chiến dịch mới với mức đóng góp tối thiểu.
- **Đóng góp (Donate)**: Bất kỳ ai cũng có thể đóng góp ETH cho chiến dịch.
- **Yêu cầu Chi tiêu (Request)**: Manager tạo yêu cầu giải ngân tiền quỹ cho mục đích cụ thể.
- **Biểu quyết (Vote)**: Những người đã đóng góp (Donors) biểu quyết cho các yêu cầu.
- **Giải ngân (Finalize)**: Nếu > 50% donors đồng ý, Manager có thể thực thi yêu cầu và tiền sẽ được gửi trực tiếp đến người nhận.
- **Quản lý trạng thái**: Manager có thể tạm dừng/đóng chiến dịch khi cần.

---

## 🛠️ Hướng dẫn Cài đặt & Cấu hình

### 1. Cài đặt ban đầu
```bash
# Di chuyển vào thư mục blockchain
cd bc

# Cài đặt các gói phụ thuộc
npm install
```

### 2. Cấu hình biến môi trường (.env)
Tạo file `.env` trong thư mục `bc/` với nội dung sau:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```
> **Lưu ý quan trọng**: Không bao giờ chia sẻ `PRIVATE_KEY` của bạn cho bất kỳ ai hoặc đẩy nó lên GitHub.

---

## 💻 Quy trình Phát triển Blockchain

### 1. Kiểm tra cục bộ (Local Testing)
Trước khi đưa lên mạng thật, chúng ta cần đảm bảo mọi thứ hoạt động đúng trên máy cá nhân.
```bash
# Biên dịch contract
npx hardhat compile

# Chạy toàn bộ 54 test cases
npx hardhat test
```

### 2. Mạng thử nghiệm cục bộ (Local Node)
Bạn có thể chạy một mạng Blockchain giả lập ngay trên máy mình để phát triển nhanh:
```bash
npx hardhat node
```
Lệnh này sẽ cung cấp cho bạn 20 tài khoản có sẵn 10.000 ETH (ảo) để test.

---

## 🌐 Hướng dẫn Deploy lên Testnet (Sepolia)

Đưa dự án lên mạng **Sepolia** (Testnet) giúp bạn chạy ứng dụng như môi trường thực tế mà không tốn tiền thật.

### Bước 1: Chuẩn bị ví & Tiền ảo (Faucet)
1. Cài đặt ví **Metamask**.
2. Lấy `PRIVATE_KEY` từ Metamask và dán vào file `.env`.
3. Nhận Sepolia ETH miễn phí tại: [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) hoặc [Alchemy Faucet](https://sepoliafaucet.com/).

### Bước 2: Deploy
Mở terminal tại thư mục `bc/` và chạy:
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### Bước 3: Xác minh (Verify) mã nguồn trên Etherscan
Để người dùng tin tưởng và tương tác được qua giao diện web, bạn nên verify:
```bash
npx hardhat verify --network sepolia <DIA_CHI_CONTRACT_DA_DEPLOY>
```

---

## 📖 Hướng dẫn sử dụng chi tiết

### Làm sao để tương tác với Contract?
Sau khi deploy và verify thành công, bạn có thể tương tác trực tiếp:
1.  **Truy cập Link Etherscan:** [Click vào đây](https://sepolia.etherscan.io/address/0xc1c3B6DAe097372e1C60Ed0ae5D148523131Fd90#writeContract).
2.  **Kết nối ví Metamask:** Nhấn nút **"Connect to Web3"** (màu đỏ sẽ chuyển sang xanh).
3.  **Thực hiện thao tác:**
    - Tìm hàm `createCampaign`.
    - Nhập mức đóng góp tối thiểu (ví dụ: `10000000000000000` cho 0.01 ETH).
    - Nhấn **Write** và xác nhận trên Metamask. Tuyệt vời! Bạn đã tạo một chiến dịch mới trên Blockchain.
4. **Kiểm tra kết quả:** Vào mục **Read Contract**, gọi hàm `getDeployedCampaigns` để thấy địa chỉ của chiến dịch bạn vừa tạo.

### Một chu kỳ hoạt động mẫu:
1.  **Tạo chiến dịch**: Dùng `CampaignFactory` để tạo một `Campaign` mới.
2.  **Gửi tiền**: Truy cập vào địa chỉ `Campaign` vừa tạo, gửi ETH thông qua hàm `donate`.
3.  **Giải ngân**: 
    - Manager tạo Request chi tiêu (mục `createRequest`).
    - Donors biểu quyết đồng ý (mục `approveRequest`).
    - Khi đủ phiếu, Manager gọi `finalizeRequest` để chuyển tiền cho người thụ hưởng.


---

## ⚠️ Giải quyết một số vấn đề thường gặp
- **Lỗi "Insufficient funds"**: Hãy kiểm tra lại số dư ví Sepolia của bạn. Dù là testnet, bạn vẫn cần ETH ảo để trả phí gas.
- **Lỗi "Nonce too high"**: Thường xảy ra khi bạn dùng Metamask để test trên nhiều mạng khác nhau. Vào Metamask -> Settings -> Advanced -> Clear activity tab data.
- **Gas Fee quá cao**: Hãy đảm bảo bạn đã bật `optimizer` trong `hardhat.config.ts` (Dự án này đã được cấu hình sẵn).

---
*Dự án được phát triển bởi Antigravity AI Assistant.*
