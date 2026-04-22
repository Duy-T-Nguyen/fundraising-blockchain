# 🌐 Fundraising Frontend (React + Vite + TS)

Giao diện người dùng của nền tảng **Fundraising Blockchain**, nơi các nhà hảo tâm và người quản lý chiến dịch tương tác trực tiếp với hệ thống.

## 🛠 Tính năng chính

- **Duyệt chiến dịch**: Hiển thị danh sách các chiến dịch từ thiện kèm theo hình ảnh và mô tả chi tiết từ Blockchain & IPFS.
- **Quyên góp (Donate)**: Tích hợp ví MetaMask để quyên góp ETH trực tiếp cho chiến dịch.
- **Quản lý chiến dịch (Manager Dashboard)**: 
  - Gửi yêu cầu tạo chiến dịch mới (kèm upload ảnh lên IPFS).
  - Tạo yêu cầu chi tiêu (Requests) kèm bằng chứng hóa đơn.
- **Biểu quyết (Voting)**: Hệ thống bỏ phiếu cho Donors để duyệt các yêu cầu chi tiêu.

## 🏗 Setup & Cài đặt

### 1. Yêu cầu hệ thống
- **Node.js**: v18+
- **MetaMask Extension**: Đã cài đặt trên trình duyệt và chuyển sang mạng **Sepolia Testnet**.

### 2. Cài đặt thư viện
```bash
yarn install
```

### 3. Chạy ứng dụng
```bash
yarn dev
```

## 🔗 Liên kết với Hệ thống

Frontend tương tác với 2 thành phần khác:
- **Backend (be/)**: Gọi API `POST /evidence/upload` để lấy mã CID cho hình ảnh/hóa đơn.
- **Blockchain (bc/)**: Sử dụng thư viện `ethers.js` để gọi các hàm của Smart Contract đã deploy tại:
  - Factory: `0x2c1ABdB0D8076e868A0342B926357E9EbB8F4bE1`
  - Registry: `0x73D372ba8716c41c9076811C9D4BD692fc6DAfEE`

## 📂 Cấu trúc thư mục

- `src/contracts/`: Chứa các file ABI của Smart Contracts.
- `src/components/`: Các thành phần giao diện (Card, Modal, Button).
- `src/hooks/`: Xử lý logic tương tác với MetaMask và Blockchain.
- `src/pages/`: Các trang chức năng (Home, Create Campaign, Campaign Detail).

---
*Cập nhật lần cuối: 21/04/2026 bởi Antigravity AI Assistant.*
