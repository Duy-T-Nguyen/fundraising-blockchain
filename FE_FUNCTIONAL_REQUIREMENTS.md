# 📑 Đặc tả Yêu cầu Chức năng cho Frontend (FE Specification)

Tài liệu này hướng dẫn chi tiết các chức năng, luồng nghiệp vụ và cách thức tích hợp với Blockchain & Backend cho hệ thống gây quỹ minh bạch.

---

## 🏗 1. Tổng quan Kiến trúc Hệ thống

- **Frontend**: React.js / Next.js, sử dụng `ethers.js` (hoặc `wagmi/viem`) để tương tác với Blockchain.
- **Blockchain (BC)**: Chạy trên mạng Ethereum (Sepolia Testnet), sử dụng Smart Contracts để quản lý quỹ.
- **Backend (BE)**: NestJS API, đóng vai trò trung gian để upload minh chứng (hóa đơn, ảnh) lên **IPFS** thông qua Pinata.
- **Storage**: IPFS (Lưu trữ file phi tập trung).

---

## 👥 2. Các Vai trò và Quyền hạn (User Roles)

### 2.1 Nhà hảo tâm (Donor)
- Khám phá các chiến dịch gây quỹ.
- Quyên góp ETH vào chiến dịch (phải lớn hơn số tiền tối thiểu).
- Biểu quyết (Vote) cho các yêu cầu chi tiêu (Spending Requests).
- Theo dõi lịch sử giải ngân và minh chứng thực tế.

### 2.2 Người quản lý (Manager)
- Tạo chiến dịch gây quỹ mới.
- Tạo các yêu cầu chi tiêu (Single / Multi-stage).
- Rút tiền (khi yêu cầu được duyệt).
- Đóng chiến dịch khi hoàn thành.

### 2.3 Người cung cấp / Nhà cung cấp (Supplier)
- Địa chỉ ví nhận tiền trực tiếp từ hệ thống (Manager không được cầm tiền).
- Phải nằm trong danh sách trắng (Whitelist) của hệ thống.

---

## 🚀 3. Các Module Chức năng Chi tiết

### 3.1 Module Khám phá (Discovery)
- **Danh sách chiến dịch**: Hiển thị tất cả `Campaign` đã được tạo từ `CampaignFactory`.
- **Tìm kiếm/Lọc**: Theo trạng thái (Đang hoạt động/Đã đóng), theo Manager.

### 3.2 Module Chi tiết Chiến dịch (Campaign Detail)
- **Thông tin chung**: Tên quỹ, mô tả (nếu có ở BE), số dư hiện tại, số lượng Donor, số tiền tối thiểu.
- **Quyên góp (Donate)**: Form nhập số ETH muốn đóng góp.
- **Danh sách Yêu cầu chi tiêu**: Hiển thị bảng các yêu cầu:
    - Mô tả, số tiền, người nhận.
    - Trạng thái (Chờ duyệt, Đã hoàn thành, Đã hủy).
    - Tỷ lệ biểu quyết hiện tại.

### 3.3 Module Quản lý Yêu cầu (Manager Dashboard)
- **Tạo yêu cầu đơn (Single Request)**:
    1. Chọn nhà cung cấp.
    2. Nhập số tiền, mô tả.
    3. **QUAN TRỌNG**: Upload ảnh minh chứng (báo giá/hợp đồng) lên BE để lấy CID trước khi gửi transaction.
- **Tạo yêu cầu nhiều giai đoạn (Multi-stage)**: Chia nhỏ việc giải ngân theo các cột mốc (Milestones).

### 3.4 Module Tối ưu hóa Gas (EIP-1559)
- Frontend phải cung cấp UI để người dùng chọn mức ưu tiên giao dịch:
    - **Standard**: Phí gas trung bình.
    - **Fast**: Phí gas cao hơn để ưu tiên (tăng `maxPriorityFeePerGas`).
- Hiển thị ước tính phí gas trước khi xác nhận giao dịch.

---

## 🔗 4. Hướng dẫn Tích hợp Kỹ thuật

### 4.1 Cấu hình Kết nối Blockchain (RPC & Providers)

Để kết nối Frontend với mạng Sepolia Testnet, FE cần cấu hình Provider sử dụng **Alchemy**.

- **RPC URL**: `https://eth-sepolia.g.alchemy.com/v2/7myYLkrkfDUCpae2kv8yl` (Lấy từ biến `SEPOLIA_RPC_URL` trong file `bc/.env`).
- **Network**: Sepolia (Chain ID: `11155111`).
- **Alchemy Dashboard**: [dashboard.alchemy.com](https://dashboard.alchemy.com/) - Dùng để giám sát lưu lượng giao dịch và debug lỗi kết nối.
- **Etherscan Verification**: Sử dụng [sepolia.etherscan.io](https://sepolia.etherscan.io/) để kiểm tra lịch sử giao dịch. FE nên tự động tạo link Etherscan sau mỗi giao dịch: `https://sepolia.etherscan.io/tx/${txHash}`.

### 4.2 Tìm kiếm Địa chỉ Contract (Smart Contract Addresses)

Địa chỉ của các hợp đồng đã deploy có thể thay đổi sau mỗi lần chạy script deploy. FE cần kiểm tra:
1. **File Biến môi trường**: Kiểm tra file `.env` hoặc một file json cấu hình (nếu có) do bên BC cung cấp.
2. **Log Deploy**: Theo dõi output của lệnh `npx hardhat run scripts/deploy.ts`.
3. **Địa chỉ hiện tại (Ví dụ)**:
    - **CampaignFactory**: Cần được cấu hình cứng (Constant) hoặc lấy từ biến môi trường của Frontend.

### 4.3 Kết nối Blockchain (Smart Contract)

FE cần sử dụng ABI từ thư mục `bc/artifacts/contracts/`.

#### A. CampaignFactory
- **Địa chỉ**: (Cần lấy từ file deploy hoặc biến môi trường).
- **Hàm chính**:
    - `getDeployedCampaigns()`: Lấy danh sách địa chỉ các Campaign.
    - `createCampaign(uint256 minimum)`: Tạo chiến dịch mới.

#### B. Campaign (Mỗi chiến dịch là một địa chỉ riêng)
- **Hàm chính**:
    - `donate()`: Gửi kèm `value` (msg.value).
    - `getSummary()`: Lấy thông tin tổng quan (balance, minContribution, requestsCount, donorsCount, manager, isActive).
    - `createRequest(string desc, uint256 value, address recipient, string evidenceHash)`: `evidenceHash` chính là CID từ IPFS.
    - `approveRequest(uint256 index)`: Donor biểu quyết cho yêu cầu.
    - `approveAsValidator(uint256 index)`: Validator được chọn biểu quyết cho các yêu cầu nhỏ (Luồng A).
    - `finalizeRequest(uint256 index)`: Manager kết thúc yêu cầu và chuyển tiền cho Supplier (sau khi đủ phiếu bầu từ Donor hoặc Validator).
    - `executeMilestone(uint256 index, bytes signature, string evidenceHash)`: Manager hoặc Verifier thực thi giải ngân theo đợt cho Multi-stage Request (cần chữ ký ECDSA từ Verifier).

### 4.2 Kết nối Backend (API Upload Minh chứng)

Trước khi gọi các hàm liên quan đến bằng chứng (`createRequest`, `executeMilestone`), FE phải gọi API sau:

- **Endpoint**: `POST http://localhost:3000/evidence/upload` (Local dev)
- **Swagger Documentation**: [http://localhost:3000/api](http://localhost:3000/api) - Dùng để test API upload trực tiếp.
- **Pinata Dashboard**: [app.pinata.cloud](https://app.pinata.cloud/keys) - Trình quản lý các tệp tin trên IPFS.
- **Body**: `multipart/form-data` (field name: `file`)
- **Response**:
  ```json
  {
    "cid": "Qm...",
    "url": "https://gateway.pinata.cloud/ipfs/Qm..."
  }
  ```
- **Xử lý**: Lấy `cid` để lưu vào Blockchain, dùng `url` để hiển thị ảnh trên giao diện.

---

## ⚡ 5. Triển khai EIP-1559 cho Frontend

Để giao dịch mượt mà và tối ưu chi phí, FE cần thực hiện:

1. **Lấy dữ liệu phí gas**:
   ```javascript
   const feeData = await provider.getFeeData();
   // feeData.maxFeePerGas
   // feeData.maxPriorityFeePerGas
   ```

2. **Gửi Transaction**:
   Khi gọi hàm write, cấu hình tham số:
   ```javascript
   const tx = await contract.donate({
     value: ethers.parseEther("0.1"),
     maxFeePerGas: feeData.maxFeePerGas,
     maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 1.25 // Thêm 25% ưu tiên nếu muốn nhanh
   });
   ```

3. **Cảnh báo Gas**: Nếu `baseFee` quá cao, thông báo người dùng nên đợi để tiết kiệm chi phí.

---

## 🎨 6. Yêu cầu Giao diện (UI/UX) - "Premium & Modern"

- **Aesthetics**:
    - Sử dụng **Dark Mode** làm mặc định hoặc hỗ trợ chuyển đổi mượt mà.
    - Màu sắc: Sử dụng Palette hiện đại (ví dụ: Midnight Blue, Neon Cyan, hoặc Deep Purple).
    - Hiệu ứng: Glassmorphism cho các Card thông tin.
- **Typography**: Sử dụng font thương hiệu như *Inter* hoặc *Outfit*.
- **Interaction**:
    - Trạng thái loading cho các giao dịch (Skeleton screen).
    - Toast notifications khi giao dịch thành công (kèm link Etherscan).
    - Hiển thị Progress Bar cho tỷ lệ biểu quyết của donor.

---

> [!TIP]
> **Lưu ý đơn vị tiền tệ**: Luôn chuyển đổi hiển thị từ **Wei** sang **Ether** cho người dùng dễ đọc bằng `ethers.formatEther(value)`.

> [!WARNING]
> **Bảo mật**: Chỉ cho phép Manager truy cập vào trang "Tạo yêu cầu". FE cần check `managerAddr` từ hàm `getSummary()` so với địa chỉ ví đang kết nối.

---

## 🔗 7. Tài liệu Tham khảo & Tài nguyên (Resources)

| Tài liệu | Link | Mục đích |
|---|---|---|
| **Ethers.js v6 Docs** | [docs.ethers.org/v6](https://docs.ethers.org/v6/) | Thư viện chính để tương tác với Blockchain |
| **Sepolia Etherscan** | [sepolia.etherscan.io](https://sepolia.etherscan.io/) | Kiểm tra giao dịch và xác minh hợp đồng |
| **OpenZeppelin Docs** | [docs.openzeppelin.com](https://docs.openzeppelin.com/contracts/) | Quy chuẩn Smart Contract (Access Control, ECDSA) |
| **Pinata Cloud** | [pinata.cloud](https://www.pinata.cloud/) | Lưu trữ ảnh minh chứng (IPFS) |
| **Solidity Docs** | [docs.soliditylang.org](https://docs.soliditylang.org/) | Tra cứu logic của các hàm trong Contract |
| **Google Fonts** | [fonts.google.com](https://fonts.google.com/specimen/Inter) | Tải font *Inter* hoặc *Outfit* cho UI |

---

> [!TIP]
> **Bộ kiểm tra (Test Suite)**: FE có thể tham khảo các file test tại [bc/test/Campaign.ts](file:///home/thanhlong/Documents/fundraising-blockchain/bc/test/Campaign.ts) để hiểu cách gọi hàm bằng `ethers.js`.

> [!IMPORTANT]
> **Sepolia Faucet**: Nếu ví không đủ ETH để test, truy cập [sepoliafaucet.com](https://sepoliafaucet.com/) hoặc các vòi (faucet) tương tự để nhận ETH miễn phí.
