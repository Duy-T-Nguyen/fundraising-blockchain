# Kiến trúc Tối ưu hóa Gas bằng Reinforcement Learning (RL) & Meta-Transactions

Tài liệu này đặc tả ý tưởng và các bước triển khai cho tính năng **Gas Optimization sử dụng Reinforcement Learning (AI)** kết hợp với chuẩn **EIP-2771 (Meta-Transactions)**. Đây là tính năng cốt lõi dành cho Đồ án tốt nghiệp, giả định hệ thống triển khai trực tiếp trên Ethereum Mainnet theo chuẩn của World Food Programme (WFP).

---

## 1. Đặt vấn đề (Problem Statement)
* **Ngữ cảnh**: Triển khai DApp từ thiện trên Ethereum Mainnet để đạt chuẩn bảo mật tuyệt đối.
* **Nỗi đau (Pain point)**: Phí Gas trên Mainnet cực kỳ đắt đỏ ($10 - $50/tx). Việc bắt các nhà hảo tâm (Donor) hay người kiểm duyệt (Validator) tự trả phí Gas sẽ tạo rào cản lớn, làm giảm tỷ lệ chuyển đổi.
* **Giải pháp truyền thống**: Tổ chức (Platform) làm Relayer trả tiền Gas thay cho user. Tuy nhiên, nếu trả ngay lập tức vào lúc mạng lưới đang nghẽn, tổ chức sẽ cạn kiệt quỹ vận hành (OpEx) rất nhanh.

## 2. Giải pháp Đề xuất: "Bộ não RL Relayer"
Thay vì Relayer gửi giao dịch một cách mù quáng, chúng ta tích hợp một **Mô hình Reinforcement Learning (RL)** để đóng vai trò làm "Người gác cổng".

### Cơ chế Dual-Mode (Trải nghiệm Người dùng)
Hệ thống cung cấp 2 lựa chọn cho người dùng:
1. **Eco Mode (Tài trợ Gas)**: 
   - User chỉ cần Ký số (Sign Message) hoàn toàn miễn phí.
   - Giao dịch rơi vào hàng đợi (Queue).
   - RL Agent canh thời điểm Gas rẻ để gom (Batch) và gửi lên mạng. 
   - *Đổi lại: User phải chờ một khoảng thời gian ngắn. (tối đa vài giờ)*
2. **Express Mode (Tự túc)**: 
   - Chế độ khẩn cấp, bỏ qua AI. User tự dùng ETH trong ví cá nhân trả Gas để giao dịch được thực thi ngay lập tức thông qua các hàm trực tiếp (`donate()`, `vote()`).

## 3. Mô hình Kinh tế & Tính bền vững (Gas Sustainability)

Để hệ thống có kinh phí duy trì việc "trả gas hộ", chúng ta áp dụng cơ chế 3 lớp:
1. **Initial Fee (Phí khởi tạo)**: Khi Manager tạo Campaign, họ đóng một khoản `antiSpamFee` (ví dụ 0.005 ETH). Số tiền này được tập trung vào "Quỹ Xăng chung" của Platform.
2. **Campaign Gas Tank (Bình xăng riêng)**: Manager có thể gọi hàm `depositGas()` để nạp thêm ETH vào hợp đồng Campaign. Con AI sẽ theo dõi số dư này để ưu tiên phục vụ cho riêng chiến dịch đó.
3. **AI Estimation (Ước lượng & Dự báo)**: 
   - AI tính toán `Burn_Rate = (Gas_Price * Avg_Gas_Used) / Day`.
   - Dự báo: `Days_Left = gasBalance / Burn_Rate`.
   - Hệ thống tự động gửi cảnh báo (Alert) cho Manager khi "Bình xăng" sắp cạn (< 3 ngày dự kiến).

---

## 4. Đặc tả Mô hình Reinforcement Learning

Thuật toán RL (DQN hoặc PPO) sẽ giải quyết bài toán cân bằng giữa **Chi phí (Cost)** và **Thời gian chờ (Latency)**.

* **State (Trạng thái môi trường)**:
  - `current_base_fee`: Mức phí Gas hiện hành trên mạng Ethereum.
  - `gas_trend`: Xu hướng giá Gas (Đang tăng hay giảm trong 10 block gần nhất).
  - `queue_size`: Số lượng giao dịch đang nằm trong Hàng đợi.
  - `max_wait_time`: Thời gian chờ của giao dịch cũ nhất trong Hàng đợi.
  - `gas_pool_status`: Số dư ETH còn lại trong ví Relayer.
* **Action (Hành động của AI)**:
  - `WAIT`: Tiếp tục chờ, chưa gửi giao dịch.
  - `EXECUTE_BATCH`: Đóng gói toàn bộ hàng đợi thành 1 giao dịch qua `Forwarder.executeBatch()` và đẩy lên mạng.
* **Reward (Hàm phần thưởng)**:
  - $R = (\text{Gas\_Saved}) - (\alpha \times \text{Total\_Delay\_Penalty}) - (\beta \times \text{Out\_of\_Gas\_Risk})$
  - AI được thưởng nếu tiết kiệm được nhiều tiền Gas.
  - AI bị phạt nếu để người dùng chờ quá lâu hoặc làm cạn kiệt ví Relayer quá nhanh.

---

## 5. Các bước Triển khai (Implementation Roadmap)

### Bước 1: Nâng cấp Smart Contracts (Lớp Thực thi) - [ĐÃ HOÀN THÀNH]
1. Kế thừa `ERC2771Context.sol` vào các hợp đồng.
2. Triển khai `Forwarder.sol` (Hỗ trợ EIP-712 và `executeBatch`).
3. Thêm các hàm `depositGas()` và `withdrawFees()` để quản lý nguồn lực.

### Bước 2: Backend (Lớp Hàng đợi - NestJS)
1. Viết API `POST /relay/intent` để nhận chữ ký EIP-712 từ người dùng.
2. Lưu giao dịch hợp lệ vào hàng đợi Redis (Redis Queue).

### Bước 3: AI Microservice (Lớp Trí tuệ - Python)
1. Viết cronjob lấy dữ liệu giá Gas từ Mempool.
2. Huấn luyện mô hình RL trên dữ liệu giá Gas lịch sử.
3. Khi AI quyết định `EXECUTE_BATCH`, script gọi `Forwarder.executeBatch()`.

### Bước 4: Frontend (Lớp Tương tác - React)
1. Tích hợp nút chuyển đổi "Eco Mode" vs "Express Mode".
2. Xử lý UI hiển thị: "Đang chờ mạng lưới tối ưu phí Gas (Dự kiến 10 phút)".

---

## 6. Giá trị Học thuật & Tính ứng dụng (Dành cho Defend Đồ án)
Việc đưa RL vào quá trình gửi giao dịch Blockchain giải quyết được bài toán hóc búa nhất của Web3: **Mass Adoption (Tiếp cận đại chúng)**.
* Ẩn đi sự phức tạp của Gas fees đối với người dùng phổ thông.
* Tối ưu hóa **15% - 30% Chi phí vận hành (OpEx)**.
* Biến nền tảng thành một kiến trúc lai (Hybrid) hoàn hảo: An toàn như Web3, mượt như Web2.
