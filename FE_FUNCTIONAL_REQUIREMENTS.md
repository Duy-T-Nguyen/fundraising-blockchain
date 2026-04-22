# 🖥️ Yêu cầu Chức năng cho Frontend (DApp)

Tài liệu này đặc tả các chức năng chi tiết mà Frontend cần triển khai để tương tác với Hệ thống Blockchain và Backend v5.0.

---

## 1. Yêu cầu Chung
- **Kết nối Ví**: Hỗ trợ MetaMask (Ethers.js v6).
*   **Real-time**: Kết nối tới Socket.io Gateway để nhận thông báo tức thì (Toast notification).
- **Hybrid Data**: Ưu tiên hiển thị dữ liệu từ Backend (API) để có hiệu năng cao, nhưng cho phép người dùng "Verify on Blockchain" để kiểm chứng.

---

## 2. Các vai trò & Chức năng chi tiết

### A. Vai trò: Donor (Người đóng góp)
1. **Khám phá**: Xem danh sách chiến dịch, tìm kiếm theo danh mục (Category).
2. **Đóng góp**: Giao diện nhập số ETH để `donate()`. Hiển thị mức đóng góp tối thiểu.
3. **Giám sát**: Xem danh sách các Request của chiến dịch đã đóng góp.
4. **Biểu quyết**: Nút "Approve" cho các Request chưa hoàn thành. Trọng số vote hiển thị theo số ETH đã donate.

### B. Vai trò: Manager (Người quản lý)
1. **Tạo chiến dịch**: Form nhập Tên, Mô tả, Ảnh (Upload qua Backend -> IPFS).
2. **Quản lý Request**:
    - Tạo Request mới: Chọn Supplier (từ Whitelist), chọn Verifier, nhập số tiền, upload bằng chứng IPFS.
    - Theo dõi tiến độ vote & **Thời gian còn lại**: Hiển thị đếm ngược (7 ngày từ khi tạo) trước khi Request hết hạn.
    - **Hủy Request (Cancel)**: Hiển thị nút "Cancel Request" cho các yêu cầu đang ở trạng thái `OPEN` để thu hồi vốn.
    - **Reselect Validators**: Nếu sau 48h chưa đủ vote, hiển thị nút "Reset Validators" (khi hàm `canReselect` trả về true).
3. **Giải ngân**: Giao diện nhập Signature từ Verifier và gọi `finalizeRequest`. Trạng thái chuyển sang `COMPLETED`.

### C. Vai trò: Admin (Quản trị nền tảng)
1. **Duyệt Chiến dịch**: Dashboard hiển thị các `CampaignRequestSubmitted`. Nút "Approve" để deploy contract thật.
2. **Quản lý Supplier**: Thêm/Xóa Supplier vào `SupplierRegistry`.
3. **Thống kê**: Xem tổng số tiền trên toàn hệ thống, số lượng chiến dịch đang hoạt động.

### D. Vai trò: Validator (Người kiểm định)
1. **Dashboard nhiệm vụ**: Hiển thị danh sách các Request mà mình được chọn ngẫu nhiên để kiểm tra.
2. **Thực thi**: Nút "Approve" (sau khi đã kiểm tra bằng chứng IPFS của Manager).
3. **Thông báo**: Nhận tin nhắn Socket.io ngay khi được hệ thống chọn.

### E. Vai trò: Supplier (Nhà cung cấp)
1. **Theo dõi đơn hàng**: Xem các Request mà mình là `recipient`.
2. **Lịch sử thanh toán**: Xem tổng số tiền đã nhận được từ hệ thống.

### F. Vai trò: Verifier (Bên thứ 3 nghiệm thu)
1. **Xác nhận giao hàng**: Giao diện xem bằng chứng giao hàng (Delivery Proof).
2. **Ký duyệt (Sign Message)**: 
    - Frontend cần dùng Private Key của Verifier để ký một message hash (theo chuẩn `ECDSA`).
    - Kết quả là một chuỗi `signature` để gửi cho Manager.

---

## 3. Tích hợp Real-time & Socket.io

Frontend phải lắng nghe sự kiện `NEW_NOTIFICATION` từ Socket.io:
- **Admin**: "Có chiến dịch mới đang chờ duyệt."
- **Manager**: "Chiến dịch của bạn đã được phê duyệt."
- **Validator**: "Bạn được chọn để kiểm định Request #X."
- **Donor/Supplier**: "Tiền đã được giải ngân cho Request #Y."

---

## 4. Luồng xử lý Bằng chứng (IPFS Upload)

Mọi thao tác upload file (Ảnh chiến dịch, Hóa đơn) phải tuân thủ:
1. Yêu cầu người dùng ký message: `"FundChain IPFS Upload"`.
2. Gửi `file` + `address` + `signature` lên Backend API `POST /evidence/upload`.
3. Nhận về `CID` để dùng cho các giao dịch Blockchain tiếp theo.

---

## 5. Xử lý Trạng thái & UX
- **Loading States**: Hiển thị Spinner khi chờ giao dịch Blockchain (thường mất 15-30s).
- **Error Handling**: Giải mã các `Custom Error` từ Smart Contract (ví dụ: `NotEnoughApprovals`) để hiển thị thông báo dễ hiểu cho người dùng.
- **Responsive**: Giao diện hoạt động tốt trên cả Mobile (MetaMask Browser) và Desktop.

---
*Bản đặc tả v5.0 — Cập nhật lần cuối: 21/04/2026*
