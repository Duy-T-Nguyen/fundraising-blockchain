# KỊCH BẢN THUYẾT TRÌNH ĐỒ ÁN
**Chủ đề: Nền tảng Gây quỹ Phi tập trung với Tối ưu Gas bằng AI**

---

## LỜI MỞ ĐẦU (1-2 phút)
"Kính chào hội đồng bảo vệ và các thầy cô. Em xin trình bày đồ án tốt nghiệp với đề tài: 'Nền tảng Gây quỹ Phi tập trung kết hợp Tối ưu Gas bằng AI'. 
Đề tài này giải quyết hai vấn đề nhức nhối hiện nay: sự thiếu minh bạch trong từ thiện truyền thống và chi phí giao dịch (Gas fee) đắt đỏ, khó đoán trên mạng lưới Ethereum."

---

## PHẦN 1: CƠ SỞ LÝ THUYẾT (3-4 phút)

**Slide 1.1: Blockchain và Smart Contract**
"Để giải quyết bài toán minh bạch, hệ thống sử dụng Blockchain Ethereum. Mọi giao dịch và quy định giải ngân đều được hard-code vào Smart Contract, loại bỏ hoàn toàn bên trung gian và rủi ro gian lận."

**Slide 1.2: Cơ chế Gas trên Ethereum**
"Tuy nhiên, rào cản lớn nhất của Blockchain là Gas fee. Đặc biệt sau EIP-1559, Base Fee biến động liên tục theo từng block, khiến người dùng ngần ngại tham gia vì không biết trước chi phí."

**Slide 1.3: Meta-Transaction và EIP-2771**
"Giải pháp đầu tiên của nhóm là Meta-Transaction (EIP-2771). Người dùng chỉ cần ký xác nhận (ký off-chain, không tốn phí), hệ thống của chúng em sẽ đóng vai trò Relayer để trả phí Gas thay cho họ."

**Slide 1.4: Reinforcement Learning (RL) cho Tối ưu Gas**
"Điểm nhấn công nghệ của đồ án là ứng dụng Reinforcement Learning để hệ thống tự biết *khi nào nên trả Gas*. 
Thay vì gửi giao dịch ngay lúc mạng đang tắc nghẽn, AI Model của chúng em phân tích 11 thông số trạng thái từ 128 block gần nhất để dự đoán và chờ đến thời điểm Gas rẻ nhất mới gửi đi."

**Slide 1.5 & 1.6: IPFS & Proxy Pattern**
"Ngoài ra, để tối ưu chi phí lưu trữ, các file nặng được lưu trên IPFS. Để tiết kiệm chi phí tạo chiến dịch mới, hệ thống áp dụng Proxy Pattern (EIP-1167), giúp giảm đến 97% lượng Gas cần thiết khi deploy."

---

## PHẦN 2: PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG (5-7 phút)

**Slide 2.1: Tổng quan Kiến trúc**
*(Chỉ vào biểu đồ)*
"Hệ thống gồm 3 lớp chính: 
1. Frontend tương tác qua MetaMask.
2. Smart Contracts lưu trữ tiền và logic quản trị trên Sepolia.
3. Backend là trái tim tối ưu hóa, gồm AI Relayer, Gas Monitor và AI Sidecar liên tục theo dõi mạng lưới."

**Slide 2.2 & 2.3: CampaignFactory và Campaign**
"Về Smart Contract, chúng em thiết kế theo mô hình Factory-Child. 
CampaignFactory quản lý chung, còn mỗi chiến dịch là một Campaign Contract độc lập.
Điểm đặc biệt là cơ chế **Governance Voting** (Biểu quyết Quản trị). Người quản lý không thể tự ý rút tiền. Họ phải tạo Request, và chỉ khi >50% số tiền donate biểu quyết đồng ý, tiền mới được giải ngân."

**Slide 2.5: AI Gas Optimization Pipeline**
*(Nhấn mạnh slide này - Đây là core của đồ án)*
"Đây là cách AI tối ưu phí. 
Khi user ký miễn phí, giao dịch vào hàng đợi (Queue). 
Mỗi 15 giây, AI Sidecar đọc 11 thông số mạng lưới. Nếu mạng đang đắt, AI chọn hành động 'WAIT' (Đợi). Nếu dự đoán mạng đã đủ rẻ, AI chọn 'EXECUTE', gom nhiều giao dịch lại (Batching) để gửi qua Forwarder. Cơ chế Batching + Timing này giúp tiết kiệm lượng lớn Gas."

**Slide 2.8: Sơ đồ Luồng Biểu quyết**
"Về UX, hệ thống rất linh hoạt. Người dùng có 2 lựa chọn:
1. **Direct Approve**: Tự trả Gas qua MetaMask, giao dịch xử lý ngay.
2. **AI Approve**: Chấp nhận chờ đợi AI gom đơn, bù lại hoàn toàn miễn phí."

**Slide 2.9: Sơ đồ Luồng Chi tiêu (Multi-stage)**
"Để chống rủi ro Supplier 'ôm tiền bỏ trốn', hệ thống thiết kế giải ngân theo từng giai đoạn (Milestone). Supplier phải nộp minh chứng (Proof), Verifier xác nhận thì tiền mới được chuyển đi."

---

## PHẦN 3: THỬ NGHIỆM VÀ ĐÁNH GIÁ (3-4 phút)

**Slide 3.1 & 3.2: Kịch bản Thử nghiệm**
"Hệ thống đã được deploy và chạy thử nghiệm đầy đủ luồng end-to-end trên testnet Sepolia, từ khâu tạo chiến dịch, donate, đến giải ngân thành công."

**Slide 3.3: Đánh giá AI Gas Optimization**
*(Giải thích kết quả)*
"Kết quả thử nghiệm rất khả quan. Bằng cách gom 2-5 giao dịch/mẻ, hệ thống tiết kiệm được khoản cứng 21,000 Gas cho mỗi giao dịch ghép thêm. Cộng với độ nhạy của AI trong việc né đỉnh Gas, chi phí được tối ưu đáng kể trong khi người dùng chỉ mất vài phút chờ đợi."

**Slide 3.4: Bảo mật**
"Hệ thống vượt qua các bài test bảo mật khắt khe: chặn re-entrancy, chống chữ ký giả, và đảm bảo chặt chẽ quyền hạn (Manager không được tự donate hay tự vote)."

**Slide 3.5 & 3.6: Ưu điểm & Hạn chế**
"Ưu điểm lớn nhất là Minh bạch tuyệt đối và UX thân thiện.
Tuy nhiên, hệ thống vẫn còn hạn chế như AI mới học offline (chưa update real-time) và độ trễ giao dịch không phù hợp cho các tình huống cần tiền khẩn cấp."

---

## PHẦN 4: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN (1-2 phút)

**Slide 4.1 & 4.2: Kết luận & Hướng phát triển**
"Tóm lại, đồ án đã chứng minh tính khả thi của việc kết hợp AI (Reinforcement Learning) vào Blockchain để giải quyết bài toán chi phí, đồng thời giữ nguyên bản chất phi tập trung.
Trong tương lai, hệ thống có thể mở rộng lên Layer 2 (như Arbitrum) để rẻ hơn nữa, hoặc áp dụng Zero-Knowledge Proof để bảo vệ danh tính người quyên góp."

"Em xin kết thúc phần trình bày. Cảm ơn hội đồng đã lắng nghe và rất mong nhận được những góp ý từ các thầy cô!"

---
## 💡 TIPS KHI TRÌNH BÀY:
1. **Kiểm soát thời gian**: Toàn bộ kịch bản này mất khoảng 12-15 phút. Hãy căn chỉnh tốc độ nói.
2. **Body language**: Khi đến các biểu đồ kiến trúc (Slide 2.1, 2.5), hãy dùng tay/laser pointer chỉ vào các khối để hội đồng dễ theo dõi.
3. **Nhấn mạnh từ khóa**: Nói rõ và nhấn mạnh vào các cụm từ: *Meta-Transaction*, *Reinforcement Learning*, *Proxy Pattern*, *Batching & Timing*. Đây là những kỹ thuật ăn điểm của đồ án.
4. **Chuẩn bị Demo (Nếu có)**: Nếu hội đồng yêu cầu, hãy chuẩn bị sẵn 2 cửa sổ duyệt web để demo chức năng AI Approve (1 bên bấm, 1 bên log backend AI chạy).
