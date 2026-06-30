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
| **Forwarder** | `0x26aCb6E756C2b014C247A86c9614C8bf511AE33B` |
| **CampaignFactory** | `0xd4C004D1214056DaC2f76e4DbA35CEc1028a8028` |
| **SupplierRegistry** | `0xab4E38AC7de5b90Dd21AD1EB5742e51d7f7f91c5` |

**Các tính năng mới nhất (Cập nhật v6.0 - 22/04/2026):**
- **On-chain Verification Lifecycle (100% Decentralized)**: Loại bỏ hoàn toàn chữ ký Off-chain (ECDSA) phụ thuộc vào backend. Supplier trực tiếp nộp bằng chứng (`submitProof`) và Verifier trực tiếp xác thực (`verifyRequest`/`rejectRequest`) bằng ví cá nhân trên chuỗi, đảm bảo tính chống thông đồng (collusion-resistant).
- **Hard Reject & Fund Release**: Cơ chế tự động hoàn trả tiền từ yêu cầu bị từ chối về số dư khả dụng của chiến dịch. Khi Verifier thực hiện "Hard Reject", `lockedFunds` được giải phóng ngay lập tức, tối ưu hóa hiệu quả sử dụng vốn.
- **IPFS JSON Metadata Refactoring**: Loại bỏ lưu trữ on-chain trực tiếp thông qua `bytes32` bị giới hạn ký tự. Toàn bộ thông tin Chiến dịch và Yêu cầu chi tiêu (Tên, Mô tả, Hình ảnh, Bằng chứng) giờ đây được băm thành một JSON đẩy lên IPFS thông qua hệ thống NestJS Backend. Smart Contract chỉ lưu duy nhất mã băm CID dạng string, tối ưu hóa đáng kể phí Gas cho toàn bộ hệ thống!
- **Request Lifecycle (Advanced State Management)**: Chuyển đổi cơ chế quản lý Request từ cờ boolean sang hệ thống **Status Enum** (`OPEN`, `COMPLETED`, `CANCELLED`). Cho phép Manager hủy bỏ các yêu cầu không còn cần thiết để giải phóng nguồn vốn ngay lập tức.
- **Strict Voting Deadline**: Thiết lập thời hạn biểu quyết nghiêm ngặt (7 ngày). Các yêu cầu không đạt đủ phiếu bầu trong thời gian này sẽ tự động hết hạn, đảm bảo tính luân chuyển của dòng vốn và tránh tình trạng treo ngân sách vô thời hạn.
- **Budget Reservation (Locked Funds)**: Cơ chế bảo mật tự động khóa ngân sách ngay khi Request được tạo. Đảm bảo tổng số tiền của các yêu cầu đang chờ không bao giờ vượt quá số dư thực tế, loại bỏ hoàn toàn rủi ro thâm hụt ngân sách.
- **Multi-Stage Payment Support**: Hỗ trợ giải ngân theo từng giai đoạn (Milestones) cho các dự án dài hạn, mỗi giai đoạn đều yêu cầu bằng chứng (Evidence) và xác thực on-chain từ Verifier độc lập.

---
*Dự án được phát triển và tối ưu bởi Nhóm 3 — Cập nhật lần cuối: 23/04/2026.*
