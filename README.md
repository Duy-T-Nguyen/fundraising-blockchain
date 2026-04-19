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

---

## 🚀 Thông tin Triển khai (Sepolia Testnet)

Hệ thống đã được triển khai chính thức trên mạng thử nghiệm Sepolia:

| Hợp đồng | Địa chỉ (Contract Address) |
|---|---|
| **CampaignFactory** | `0x4d272f0C39B18C09536392eAeA254A1e503639C5` |
| **SupplierRegistry** | `0x358390a0a195C029632a2B045eBd28209DcC385c` |

**Các tính năng mới nhất (Cập nhật WFP Standard v3.0 - 20/04/2026):**
- **WFP 2-Stage Payment Logic**: Tích hợp chuẩn thanh toán của World Food Programme. Việc phê duyệt (Vote) chỉ có ý nghĩa "Duyệt Ngân sách". Tiền chỉ thực sự được giải ngân khi có chữ ký số (ECDSA Signature) nghiệm thu bằng chứng giao hàng từ một bên thứ 3 độc lập (`Verifier`).
- **Weighted Voting**: Bảo vệ hệ thống khỏi tấn công Sybil bằng cách yêu cầu biểu quyết giải ngân dựa trên **trọng số vốn** (>50% tổng quỹ chiến dịch) thay vì số lượng người bình chọn.
- **Anti-spam Fee**: Cấu hình phí chống spam (`0.005 ETH`) khi gửi yêu cầu tạo chiến dịch, ngăn chặn lạm dụng và tạo rác trên mạng.
- **MongoDB Internal State**: Backend (NestJS) sử dụng MongoDB làm bộ nhớ đệm an toàn (`SyncState`) giúp server không bị lọt sự kiện Blockchain sau khi khởi động lại, trong khi vẫn đảm bảo 100% dữ liệu gốc bất biến On-chain.

---
*Dự án được phát triển và tối ưu bởi Antigravity AI Assistant — Cập nhật lần cuối: 20/04/2026.*
