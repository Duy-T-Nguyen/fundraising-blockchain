# 🌟 Fundraising Blockchain — Monorepo

Dự án gây quỹ phi tập trung (Decentralized Fundraising) với cơ chế minh bạch tuyệt đối, quản lý bằng chứng qua IPFS và quy trình duyệt chi tối ưu.

---

## 🏗️ Cấu trúc Hệ thống (Monorepo)

Dự án được chia thành 3 phần chính để đảm bảo tính module hóa và dễ bảo trì:

1.  **[bc/ (Blockchain)](file:///home/thanhlong/Documents/fundraising-blockchain/bc/README.md)**: Chứa Smart Contracts (Solidity), Hardhat configuration, và bộ test suite cho các hợp đồng thông minh.
2.  **[be/ (Backend)](file:///home/thanhlong/Documents/fundraising-blockchain/be/README.md)**: Xây dựng bằng NestJS, chịu trách nhiệm lưu trữ bằng chứng (hóa đơn, chứng từ) lên IPFS (qua Pinata).
3.  **[fe/ (Frontend)](file:///home/thanhlong/Documents/fundraising-blockchain/fe/README.md)**: Giao diện người dùng (React/Vite), nơi Donors và Managers tương tác với hệ thống.

---

## ⚙️ Quy trình Hoạt động Tổng thể

Hệ thống hoạt động theo luồng khép kín để đảm bảo tiền được sử dụng đúng mục đích:

1.  **Upload Hình ảnh/Bằng chứng**: Manager tải ảnh đại diện chiến dịch hoặc hóa đơn/chứng từ lên **Backend (`be/`)**. Backend đẩy file lên **IPFS** và trả về mã **CID**.
2.  **Tạo Yêu cầu**: Manager gửi giao dịch lên **Blockchain (`bc/`)** kèm theo mã **CID** đó.
3.  **Duyệt chi**: Donors/Validators kiểm tra bằng chứng (qua CID) và thực hiện biểu quyết trên Blockchain.
4.  **Giải ngân**: Nếu đủ phiếu bầu, Smart Contract tự động chuyển tiền cho **Supplier (Nhà cung cấp)**.

---

## 🛠️ Hướng dẫn Cài đặt Nhanh

### 1. Cài đặt các thành phần
Mỗi thư mục có file `README.md` riêng hướng dẫn chi tiết, nhưng đây là các bước cơ bản:

```bash
# Cài đặt Blockchain
cd bc && yarn install

# Cài đặt Backend
cd ../be && yarn install

# Cài đặt Frontend
cd ../fe && yarn install
```

### 2. Cấu hình Biến môi trường
Bạn cần tạo file `.env` trong cả thư mục `bc/` và `be/`. Tham khảo file `.env.example` hoặc tài liệu hướng dẫn trong từng thư mục.

---

## 🚀 Công nghệ sử dụng

- **Blockchain**: Solidity, Hardhat, Ethers.js, OpenZeppelin.
- **Backend**: NestJS, Pinata SDK (IPFS).
- **Frontend**: React, Vite, TypeScript, Tailwind CSS.
- **Storage**: IPFS (Decentralized Storage).

---

## 📖 Tài liệu chi tiết

Vui lòng đọc tài liệu hướng dẫn chuyên sâu cho từng thành phần tại đây:
- [Tài liệu Blockchain (bc/)](file:///home/thanhlong/Documents/fundraising-blockchain/bc/README.md)
- [Tài liệu Backend (be/)](file:///home/thanhlong/Documents/fundraising-blockchain/be/README.md)
- [Tài liệu Frontend (fe/)](file:///home/thanhlong/Documents/fundraising-blockchain/fe/README.md)
- [**Yêu cầu Chức năng Frontend (FE_FUNCTIONAL_REQUIREMENTS.md)**](file:///home/thanhlong/Documents/fundraising-blockchain/FE_FUNCTIONAL_REQUIREMENTS.md)

---

## 🚀 Thông tin Triển khai (Sepolia Testnet)

Hệ thống đã được triển khai chính thức trên mạng thử nghiệm Sepolia:

| Hợp đồng | Địa chỉ (Contract Address) |
|---|---|
| **CampaignFactory** | `0x9FCc4133983903EdADB61D592450079c2185d750` |
| **SupplierRegistry** | `0xA3531Cfaa721604a4cf85D93402f5985fa7e1CC3` |

**Các tính năng mới nhất (Cập nhật WFP Standard v4.0 - 20/04/2026):**
- **Validator Liveness (Timeout-based)**: Cơ chế chống treo Request. Nếu Validator được chọn không phản hồi sau 48 giờ, Manager có quyền kích hoạt `reselectValidators` để chọn đội mới, đảm bảo dòng tiền không bị tắc nghẽn.
- **Real-time Notifications (Socket.io & Redis)**: Hệ thống thông báo tức thời tới mọi vai trò (Admin, Manager, Validator, Supplier, Verifier). Tích hợp **Redis Adapter** giúp Backend có thể mở rộng theo chiều ngang (Horizontal Scaling) mà không mất kết nối WebSocket.
- **Hybrid Notification Strategy**: Kết hợp giữa thông báo thời gian thực (Socket.io) và lưu trữ bền vững (MongoDB), giúp người dùng không bao giờ bỏ lỡ thông tin quan trọng kể cả khi offline.
- **Bytecode Optimization**: Smart Contract được tối ưu hóa dung lượng (<24KB) bằng cách hợp nhất sự kiện và logic validation, giúp tiết kiệm Gas và đảm bảo khả năng triển khai trên Mainnet.
- **WFP 2-Stage Payment Logic**: Tích hợp chuẩn thanh toán của World Food Programme. Việc phê duyệt (Vote) chỉ có ý nghĩa "Duyệt Ngân sách". Tiền chỉ thực sự được giải ngân khi có chữ ký số (ECDSA Signature) nghiệm thu bằng chứng giao hàng từ một bên thứ 3 độc lập (`Verifier`).
- **Weighted Voting**: Bảo vệ hệ thống khỏi tấn công Sybil bằng cách yêu cầu biểu quyết giải ngân dựa trên **trọng số vốn** (>50% tổng quỹ chiến dịch) thay vì số lượng người bình chọn.

---
*Dự án được phát triển và tối ưu bởi Antigravity AI Assistant — Cập nhật lần cuối: 20/04/2026.*
