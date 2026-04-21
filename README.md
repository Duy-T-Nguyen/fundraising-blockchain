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
| **Forwarder** | `0x554484d7542785dFE3637F57BBc14A4FC7ae11F2` |
| **CampaignFactory** | `0x2c1ABdB0D8076e868A0342B926357E9EbB8F4bE1` |
| **SupplierRegistry** | `0x73D372ba8716c41c9076811C9D4BD692fc6DAfEE` |

**Các tính năng mới nhất (Cập nhật v5.0 - 21/04/2026):**
- **Request Lifecycle (Advanced State Management)**: Chuyển đổi cơ chế quản lý Request từ cờ boolean sang hệ thống **Status Enum** (`OPEN`, `COMPLETED`, `CANCELLED`). Cho phép Manager hủy bỏ các yêu cầu không còn cần thiết để giải phóng nguồn vốn ngay lập tức.
- **Strict Voting Deadline**: Thiết lập thời hạn biểu quyết nghiêm ngặt (7 ngày). Các yêu cầu không đạt đủ phiếu bầu trong thời gian này sẽ tự động hết hạn, đảm bảo tính luân chuyển của dòng vốn và tránh tình trạng treo ngân sách vô thời hạn.
- **Gas-Optimized Storage Pattern**: Tái cấu trúc bộ nhớ lưu trữ (Storage) bằng cách tách các mapping biểu quyết ra khỏi struct `Request` và sử dụng cơ chế **Struct Packing**. Giảm thiểu chi phí Gas cho các thao tác tạo và duyệt yêu cầu chi tiêu.
- **Budget Reservation (Locked Funds)**: Cơ chế bảo mật tự động khóa ngân sách ngay khi Request được tạo. Đảm bảo tổng số tiền của các yêu cầu đang chờ không bao giờ vượt quá số dư thực tế, loại bỏ hoàn toàn rủi ro thâm hụt ngân sách.
- **Weighted Voting & Decentralized Selection**: Phiếu bầu được tính trọng số theo số tiền đóng góp. Tự động chọn ngẫu nhiên 3 Donors làm Validators cho các khoản chi nhỏ, kết hợp với cơ chế Blacklist để đảm bảo tính minh bạch tối đa.
- **Multi-Stage Payment Support**: Hỗ trợ giải ngân theo từng giai đoạn (Milestones) cho các dự án dài hạn, mỗi giai đoạn đều yêu cầu bằng chứng (Evidence) và chữ ký nghiệm thu từ Verifier độc lập.

---
*Dự án được phát triển và tối ưu bởi Antigravity AI Assistant — Cập nhật lần cuối: 21/04/2026.*
