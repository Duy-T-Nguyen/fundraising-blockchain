# Tài liệu Đặc tả Toán học: Hệ thống Tối ưu Phí Gas bằng Học máy Tăng cường (RL)

Tài liệu này mô tả chi tiết các công thức toán học và vật lý được sử dụng để trích xuất đặc trưng (Feature Engineering) và tính toán phần thưởng (Reward Calculation) từ dữ liệu Blockchain, phục vụ cho mô hình **Discrete CQL (Conservative Q-Learning)** trong dự án EcoFund.

---

## 1. Tổng quan về Vector Trạng thái (State Vector)

Mô hình AI quan sát thị trường thông qua một vector trạng thái $S \in \mathbb{R}^{11}$. Mỗi trạng thái tại thời điểm $t$ được định nghĩa bởi:
$$S_t = [s_1, s_2, s_3, s_4, s_5, s_6, s_7, s_8, s_9, s_{10}, s_{11}]$$

Trong đó, các thành phần được chia thành 3 nhóm: **Nhóm Động học Gas**, **Nhóm Áp lực Mạng**, và **Nhóm Trạng thái Hệ thống**.

---

## 2. Chi tiết các Công thức Toán học Đặc trưng (Features)

### 2.1. Nhóm Động học Gas (Gas Dynamics)
Nhóm này giúp AI nhận diện xu hướng tăng/giảm của phí Gas.

*   **Phí Gas thô ($s_1, s_2, s_3$):** 
    Giá trị Base Fee của 3 block gần nhất (đơn vị: Gwei).
    $$s_1 = BaseFee_t, \quad s_2 = BaseFee_{t-1}, \quad s_3 = BaseFee_{t-2}$$

*   **Động lượng Gas (Gas Momentum - $s_5$):**
    Sử dụng Log-scale để tính toán sự thay đổi tỷ lệ phần trăm giữa hai block. Việc dùng hàm $\ln$ giúp chuẩn hóa dữ liệu và làm nổi bật sự thay đổi theo cấp số nhân.
    $$s_{momentum} = \ln\left(\frac{BaseFee_t}{BaseFee_{t-1}}\right)$$

*   **Gia tốc Gas (Gas Acceleration - $s_6$):**
    Đạo hàm bậc hai của phí Gas, cho biết tốc độ thay đổi của động lượng.
    $$s_{accel} = s_{momentum, t} - s_{momentum, t-1}$$

---

### 2.2. Nhóm Áp lực Mạng (Network Pressure)
Dựa trên cơ chế của EIP-1559 để dự báo sự biến động.

*   **Độ tắc nghẽn (Congestion - $s_4$):**
    Tỷ lệ sai lệch giữa Gas thực tế sử dụng và mục tiêu (Target Gas).
    $$TargetGas = \frac{GasLimit}{2}$$
    $$s_{congestion} = \frac{GasUsed - TargetGas}{TargetGas}$$
    *Giá trị $> 0$ nghĩa là mạng đang quá tải, Base Fee sẽ tăng ở block sau.*

*   **Sự bất ngờ (Surprise - $s_7$):**
    Sử dụng Z-score để đo lường mức độ bất thường của số lượng giao dịch trong block hiện tại so với trung bình trượt 128 block trước đó.
    $$s_{surprise} = \frac{TxCount_t - \mu_{Tx, 128}}{\sigma_{Tx, 128}}$$

---

### 2.3. Nhóm Trạng thái Hệ thống (System State)
Liên quan trực tiếp đến mục tiêu tối ưu của Relayer.

*   **Hàng đợi tích lũy (Backlog EWMA - $s_8$):**
    $$s_{backlog, t} = \max(0, 0.95 \cdot s_{backlog, t-1} + 0.3 \cdot s_{congestion} + 0.2 \cdot s_{surprise})$$

*   **Thời gian còn lại ($s_{10}$):** 
    $$s_{time\_left} = \frac{Deadline - Timestamp_t}{3600}$$ (Đơn vị: Giờ)

*   **Giá tham chiếu ($s_{11}$):** Trung bình phí Gas của 128 block gần nhất.
    $$s_{gas\_ref} = \frac{1}{128} \sum_{i=0}^{127} BaseFee_{t-i}$$

---

## 3. Cơ chế Quyết định (Decision Logic)

Hệ thống sử dụng không gian hành động rời rạc gồm **5 hành động**: $\mathcal{A} = \{0, 1, 2, 3, 4\}$. Mỗi hành động tương ứng với một tỷ lệ thực thi hàng đợi ($r_a$) như sau:
*   **Action 0:** $r_0 = 0\%$ (Đợi - Wait)
*   **Action 1:** $r_1 = 25\%$ (Thực thi một phần)
*   **Action 2:** $r_2 = 50\%$ (Thực thi một nửa)
*   **Action 3:** $r_3 = 75\%$ (Thực thi phần lớn)
*   **Action 4:** $r_4 = 100\%$ (Thực thi toàn bộ - Execute All)

Số lượng giao dịch thực tế được Relayer xử lý ($V_{exec}$) được tính bằng công thức:
$$V_{exec} = \min\left( \lfloor r_{a^*} \cdot s_{queue} \rfloor, \text{Capacity}_{max} \right)$$

Tại mỗi bước, AI chọn hành động có giá trị $Q$ cao nhất:
$$a^* = \arg\max_a Q(S_t, a)$$

---

## 4. Hàm Phần thưởng (Reward Function)

Hàm phần thưởng $R$ là tổng hợp của 3 thành phần, giúp AI cân bằng giữa việc tiết kiệm tiền và đảm bảo deadline.
$$R = \frac{R_{eff} - R_{urg} - R_{cat}}{Scale}$$

### 4.1. Phần thưởng Hiệu quả (Efficiency Reward - $R_{eff}$)
Khuyến khích AI gửi giao dịch khi giá rẻ hơn trung bình.
$$R_{eff} = V_{exec} \cdot \frac{s_{gas\_ref} - s_{gas, t}}{10}$$

### 4.2. Hình phạt Cấp bách (Urgency Penalty - $R_{urg}$)
Tăng dần áp lực khi thời gian trôi về 0.
$$Q_{rem} = s_{queue} - V_{exec}$$
$$R_{urg} = \beta \cdot Q_{rem} \cdot \exp\left(\alpha \cdot \left(1 - \frac{s_{time\_left}}{T_{max}}\right)\right)$$
*(Với $\beta=0.01, \alpha=3.0$)*

### 4.3. Hình phạt Deadline (Catastrophe Penalty - $R_{cat}$)
Phạt cực nặng nếu kết thúc phiên mà vẫn còn giao dịch tồn đọng.
$$R_{cat} = \lambda_d \cdot \mathbb{I}_{last\_step} \cdot Q_{rem}$$
*(Với $\lambda_d=100$)*

---

## 5. Động lực học Chuyển trạng thái (Transition Dynamics)

Mô hình học cách chuyển từ trạng thái $S_t$ sang $S_{t+1}$ dựa trên hành động $a_t$:
*   **Next Queue:** $Q_{t+1} = \max(0, Q_t - V_{exec} + Arrivals_{t+1})$
*   **Next Time:** $T_{t+1} = \max(0, T_t - \Delta t)$
*   **Next Gas History:** Cập nhật trượt cửa sổ dữ liệu Base Fee.

---

## 6. Chiến lược Huấn luyện (Hindsight Oracle)

Để AI học được hành động "Chuyên gia", hệ thống sử dụng **Hindsight Oracle**. 
1.  Quét toàn bộ Episode để tìm ra thời điểm phí Gas thấp nhất (Global Minimum).
2.  Gán nhãn hành động $r=100\%$ cho thời điểm đó.
3.  AI sử dụng dữ liệu này để học cách dự báo "đáy" của phí Gas trong tương lai.
