# OUTLINE CHI TIẾT BÁO CÁO QUẢN TRỊ DỰ ÁN PHẦN MỀM

## Đề tài: Quản lí dự án gây dựng quỹ từ thiện bằng Blockchain

> **Mục đích của tài liệu:** Làm khung triển khai báo cáo hoàn chỉnh dựa trên cấu trúc của tài liệu mẫu `TieuLuanQTDAPM_Nhom-5.pdf`, đồng thời phản ánh đúng mã nguồn hiện có của dự án `fundraising-blockchain`.
>
> **Thông tin đã chốt:** Trường Đại học Giao thông vận tải Thành phố Hồ Chí Minh; môn học Quản trị dự án; giảng viên Lê Hữu Thanh Tùng; Nhóm 2; thời gian lập kế hoạch 3 tháng. Nhóm thực hiện tiểu luận gồm Nguyễn Thành Long (022205011246), Đỗ Nguyễn Phương Thảo (036305010922) và Hoàng Lê Việt Hà (044305005437); phân vai cá nhân bổ sung sau. Sản phẩm kỹ thuật do một đội sáu người ẩn danh xây dựng và có thể trùng với nhóm môn học. Thời gian chi tiết và ngân sách là baseline giả định, không phải số liệu kế toán thực tế.

---

# PHẦN ĐẦU BÁO CÁO

## 1. Trang bìa

- Trường: **Trường Đại học Giao thông vận tải Thành phố Hồ Chí Minh**.
- Khoa/viện: để trống cho đến khi đối chiếu biểu mẫu chính thức của lớp.
- Môn học: **Quản trị dự án**.
- Tên đề tài: **Quản lí dự án gây dựng quỹ từ thiện bằng Blockchain**.
- Giảng viên: **Lê Hữu Thanh Tùng**.
- Nhóm thực hiện: **Nhóm 2**.
- Nguyễn Thành Long -- 022205011246.
- Đỗ Nguyễn Phương Thảo -- 036305010922.
- Hoàng Lê Việt Hà -- 044305005437.
- Thành phố Hồ Chí Minh, tháng 6 năm 2026.

## 2. Trang phụ bìa

- Trình bày lại thông tin đề tài và nhóm theo biểu mẫu của trường.

## 3. Lời cảm ơn

- Cảm ơn giảng viên hướng dẫn.
- Cảm ơn nhà trường, khoa/viện và các bên hỗ trợ.

## 5. Mục lục

- Tự động tạo từ cấu trúc tiêu đề của báo cáo.

## 6. Danh mục từ viết tắt

| Từ viết tắt | Nội dung đầy đủ |
|---|---|
| PMBOK | Project Management Body of Knowledge |
| WBS | Work Breakdown Structure |
| RACI | Responsible, Accountable, Consulted, Informed |
| EVM | Earned Value Management |
| NPV | Net Present Value |
| ROI | Return on Investment |
| UI/UX | User Interface/User Experience |
| DApp | Decentralized Application |
| EVM | Ethereum Virtual Machine; phân biệt với EVM trong Earned Value theo ngữ cảnh |
| ETH | Ether |
| RPC | Remote Procedure Call |
| IPFS | InterPlanetary File System |
| CID | Content Identifier |
| ABI | Application Binary Interface |
| EIP-2771 | Chuẩn meta-transaction dùng trusted forwarder |
| EIP-712 | Chuẩn ký dữ liệu có cấu trúc |
| API | Application Programming Interface |
| WebSocket | Giao thức giao tiếp hai chiều thời gian thực |
| UAT | User Acceptance Testing |
| QA | Quality Assurance |
| CI/CD | Continuous Integration/Continuous Delivery |

## 7. Danh mục bảng

Dự kiến gồm:

- Bảng stakeholder và vai trò.
- Bảng yêu cầu chức năng/phi chức năng.
- Ma trận truy vết yêu cầu.
- WBS và từ điển WBS.
- Bảng so sánh phương án đầu tư.
- Danh sách hoạt động, thời lượng và phụ thuộc.
- Bảng ngân sách và Cost Baseline.
- Bảng tiêu chí chất lượng.
- Ma trận RACI.
- Ma trận truyền thông.
- Risk Register.
- Danh sách mua sắm và tiêu chí nhà cung cấp.
- Change Log và Lessons Learned.

## 8. Danh mục hình ảnh

Dự kiến gồm:

- Kiến trúc tổng thể hệ thống.
- Sơ đồ triển khai trên Sepolia.
- Sơ đồ stakeholder.
- Use Case tổng quát.
- Luồng tạo và duyệt chiến dịch.
- Luồng quyên góp.
- State machine của yêu cầu chi tiêu.
- Luồng giải ngân yêu cầu thường và nhiều giai đoạn.
- Luồng meta-transaction và AI tối ưu gas.
- WBS dạng cây.
- Gantt chart và sơ đồ mạng công việc.
- Risk Breakdown Structure.
- Quy trình kiểm soát thay đổi.

---

# MỞ ĐẦU

## 1. Lý do chọn đề tài

### 1.1. Bối cảnh

- Hoạt động gây quỹ trực tuyến giúp huy động nguồn lực nhanh nhưng phụ thuộc lớn vào niềm tin giữa người quyên góp và đơn vị quản lý.
- Người quyên góp thường khó kiểm tra tiền đã được sử dụng cho mục đích nào, chuyển cho ai và dựa trên chứng từ nào.
- Dữ liệu tập trung có thể bị chỉnh sửa, thất lạc hoặc thiếu khả năng kiểm chứng độc lập.
- Quá trình phê duyệt và giải ngân thủ công dễ phát sinh chậm trễ, sai sót và tranh chấp.

### 1.2. Vấn đề cần giải quyết

- Minh bạch lịch sử tiếp nhận và sử dụng tiền.
- Ngăn người quản lý tự ý rút quỹ.
- Cho người quyên góp tham gia giám sát khoản chi.
- Ràng buộc bên nhận tiền phải là nhà cung cấp đã được quản trị viên chấp thuận.
- Lưu bằng chứng chi tiêu có thể truy xuất bằng IPFS CID.
- Giảm rào cản phí gas và cải thiện trải nghiệm giao dịch blockchain.

### 1.3. Lý do lựa chọn Blockchain

- Giao dịch được ghi nhận công khai và khó sửa đổi.
- Smart contract tự động thực thi điều kiện phê duyệt và giải ngân.
- Tiền quyên góp được giữ trong từng hợp đồng chiến dịch thay vì tài khoản cá nhân.
- Quyền hạn được kiểm soát bằng địa chỉ ví và modifier trong hợp đồng.
- Event on-chain hỗ trợ kiểm toán và đồng bộ trạng thái.

### 1.4. Tính cấp thiết và tính phù hợp

- Kết hợp quản trị dự án phần mềm với bài toán có rủi ro kỹ thuật, tài chính và bảo mật cao.
- Cho phép áp dụng các quy trình PMBOK vào một sản phẩm gồm frontend, backend, blockchain, dữ liệu phi tập trung và dịch vụ AI.

## 2. Đối tượng nghiên cứu

- Quy trình quản lý vòng đời chiến dịch gây quỹ.
- Cơ chế tiếp nhận, khóa, phê duyệt, giải ngân và hoàn tiền.
- Cơ chế quản trị vai trò bằng địa chỉ ví.
- Smart contract trên Ethereum/Sepolia.
- Lưu trữ metadata và bằng chứng bằng IPFS/Pinata.
- Meta-transaction EIP-2771 và chữ ký EIP-712.
- Cơ chế gom giao dịch và lựa chọn thời điểm tối ưu gas.
- Quản lý dự án theo các lĩnh vực kiến thức PMBOK.

## 3. Phạm vi nghiên cứu

### 3.1. Phạm vi chức năng

#### a. Khách truy cập/người dùng ví

- Kết nối MetaMask.
- Duyệt, tìm kiếm và lọc chiến dịch.
- Xem thông tin chiến dịch, số dư, người quyên góp và yêu cầu chi tiêu.
- Xem dữ liệu IPFS và liên kết Etherscan.

#### b. Campaign Manager

- Gửi yêu cầu tạo chiến dịch kèm metadata CID và phí chống spam.
- Theo dõi trạng thái yêu cầu chờ duyệt, được duyệt hoặc bị từ chối.
- Quản lý các chiến dịch đã triển khai.
- Tạo yêu cầu chi tiêu thường hoặc nhiều giai đoạn.
- Chọn Supplier và Verifier phù hợp.
- Hủy yêu cầu hợp lệ và giải phóng ngân sách bị khóa.
- Hoàn tất giải ngân khi đủ điều kiện.
- Nạp/rút quỹ gas của chiến dịch và dừng chiến dịch.

#### c. Donor

- Quyên góp ETH theo mức tối thiểu của chiến dịch.
- Theo dõi lịch sử quyên góp.
- Biểu quyết có trọng số đối với yêu cầu đủ điều kiện.
- Tham gia validator pool cho khoản chi nhỏ khi được chọn.
- Nhận thông báo liên quan đến chiến dịch/yêu cầu.
- Yêu cầu hoàn tiền theo tỷ lệ khi chiến dịch bị dừng.

#### d. Platform Admin

- Duyệt hoặc từ chối yêu cầu tạo chiến dịch.
- Quản lý phí chống spam.
- Quản lý danh sách Supplier.
- Theo dõi thống kê hệ thống, chiến dịch và yêu cầu.
- Quản lý quyền admin và rút phí nền tảng.

#### e. Supplier

- Được admin thêm vào Supplier Registry.
- Cập nhật thông tin hồ sơ cho phép.
- Theo dõi yêu cầu được giao.
- Nộp proof CID cho yêu cầu hoặc milestone.
- Theo dõi khoản thanh toán đã nhận.

#### f. Verifier

- Theo dõi các nhiệm vụ được chỉ định.
- Kiểm tra bằng chứng IPFS.
- Xác minh hoặc từ chối yêu cầu trên blockchain.
- Xác minh bằng chứng cho từng milestone.

#### g. Dịch vụ hỗ trợ

- Upload file và JSON metadata lên IPFS qua Pinata.
- Nhận intent đã ký EIP-712.
- Xếp hàng, gom và gửi meta-transaction qua Forwarder.
- Theo dõi gas và gọi AI sidecar để chọn hành động gửi/chờ.
- Lắng nghe event blockchain.
- Lưu và phát thông báo bằng MongoDB, Redis và Socket.IO.

### 3.2. Phạm vi kỹ thuật

- Frontend: React, TypeScript, Vite, Tailwind CSS, viem, Socket.IO Client.
- Backend: NestJS, ethers, Mongoose, BullMQ, Redis, Socket.IO, Pinata SDK.
- Blockchain: Solidity, Hardhat, OpenZeppelin, EIP-2771, EIP-712.
- AI sidecar: Python service và mô hình quyết định thời điểm xử lý gas.
- Mạng triển khai: Ethereum Sepolia Testnet.
- Lưu trữ: Blockchain, IPFS/Pinata, MongoDB và Redis.

### 3.3. Phạm vi quản trị

- Quản lý tích hợp, phạm vi, lịch biểu, chi phí, chất lượng, nguồn lực, truyền thông, rủi ro và mua sắm.
- Bổ sung quản lý stakeholder trong các chương liên quan dù PDF mẫu không tách thành chương độc lập.

### 3.4. Ngoài phạm vi

- Triển khai Ethereum Mainnet và xử lý tiền pháp định.
- Đăng nhập bằng tên người dùng/mật khẩu và KYC pháp lý hoàn chỉnh.
- NFT, token quản trị hoặc DAO hoàn chỉnh.
- Sàn giao dịch tiền mã hóa.
- AI phát hiện gian lận chứng từ; AI hiện tại chỉ hỗ trợ tối ưu thời điểm/gas xử lý relayer.
- Đảm bảo IPFS là kho lưu trữ bí mật; dữ liệu đưa lên IPFS phải được xem là có thể truy cập công khai.
- Audit bảo mật bởi tổ chức độc lập nếu nhóm chưa thực hiện.

### 3.5. Phạm vi thời gian

- Thời gian baseline: **01/04/2026–30/06/2026**, tương đương 3 tháng và 13 tuần lịch.
- Tổ chức thành 6 sprint, mỗi sprint 2 tuần; tuần cuối dùng cho nghiệm thu, hoàn thiện tài liệu và dự phòng.
- Baseline này phục vụ bài tập quản trị dự án, không được trình bày như lịch sử commit thực tế.

## 4. Phương pháp nghiên cứu

- Nghiên cứu tài liệu PMBOK và quản trị dự án phần mềm.
- Phân tích mã nguồn và tài liệu hiện có của dự án.
- Phân tích stakeholder, use case và yêu cầu.
- Mô hình hóa kiến trúc, quy trình và state machine.
- Phát triển lặp theo Agile/Scrum.
- Kiểm thử smart contract bằng Hardhat/Chai.
- Kiểm thử backend bằng Jest và E2E test.
- Kiểm tra build/lint frontend.
- Thử nghiệm triển khai và tương tác trên Sepolia.
- Đánh giá rủi ro định tính, định lượng và kiểm tra bảo mật.
- So sánh các phương án đầu tư bằng ma trận có trọng số.

## 5. Tổng quan nội dung báo cáo

- **Chương I** giới thiệu bài toán, mục tiêu, sản phẩm, stakeholder và lợi ích mong đợi.
- **Chương II** xây dựng kế hoạch quản lý phạm vi, yêu cầu, WBS, tiêu chuẩn nghiệm thu và kiểm soát thay đổi phạm vi.
- **Chương III** so sánh các phương án kiến trúc/đầu tư và giải thích lựa chọn mô hình blockchain public kết hợp relayer và IPFS.
- **Chương IV** lập kế hoạch lịch biểu từ WBS, xác định phụ thuộc, milestone, critical path và cơ chế kiểm soát tiến độ.
- **Chương V** ước lượng nhân sự, hạ tầng, gas, dự phòng và xây dựng Cost Baseline/EVM.
- **Chương VI** xác định kế hoạch chất lượng, chiến lược kiểm thử và tiêu chí nghiệm thu cho từng thành phần.
- **Chương VII** xây dựng cơ cấu nhóm, RACI, kế hoạch phát triển và quản lý nguồn lực.
- **Chương VIII** xây dựng ma trận truyền thông và quy trình báo cáo, trao đổi, escalation.
- **Chương IX** nhận diện, phân tích, ứng phó và giám sát rủi ro quản trị, kỹ thuật, bảo mật và vận hành.
- **Chương X** lập kế hoạch mua sắm các dịch vụ RPC, IPFS, cơ sở dữ liệu, Redis, hosting và audit.
- **Chương XI** tích hợp các kế hoạch thành một Project Management Plan và kiểm soát thay đổi xuyên suốt dự án.
- **Chương XII** mô tả nghiệm thu, bàn giao, đánh giá dự án, lưu trữ tri thức và kết thúc dự án.

## 6. Ý nghĩa lý luận và thực tiễn

### 6.1. Ý nghĩa lý luận

- Minh họa việc áp dụng PMBOK vào dự án DApp nhiều thành phần.
- Làm rõ mối liên hệ giữa quản trị phạm vi, chất lượng, rủi ro và bảo mật smart contract.
- Cung cấp trường hợp minh họa về quản trị dự án có chi phí vận hành biến động theo gas blockchain.

### 6.2. Ý nghĩa thực tiễn

- Tạo cơ chế công khai dòng tiền gây quỹ.
- Tăng quyền giám sát của người quyên góp.
- Ràng buộc việc giải ngân bằng biểu quyết và bằng chứng.
- Giảm nguy cơ chi vượt quỹ bằng cơ chế khóa ngân sách.
- Hỗ trợ giao dịch gasless/batching để cải thiện trải nghiệm người dùng.

---

# NỘI DUNG

# CHƯƠNG I. GIỚI THIỆU DỰ ÁN

## 1.1. Tổng quan dự án

### 1.1.1. Tên và loại dự án

- Tên sản phẩm sử dụng trong báo cáo: **FundChain – Nền tảng gây dựng quỹ từ thiện minh bạch bằng Blockchain**.
- Loại dự án: ứng dụng web phi tập trung hỗ trợ quản lý chiến dịch gây quỹ.
- Mô hình: monorepo gồm `bc/`, `be/`, `fe/` và `be/ai-sidecar/`.

### 1.1.2. Bài toán nghiệp vụ

- Người gây quỹ tạo đề xuất chiến dịch nhưng không thể tự triển khai trước khi admin duyệt.
- Donor chuyển ETH trực tiếp vào hợp đồng Campaign.
- Manager chỉ có thể tạo đề nghị chi cho Supplier hợp lệ.
- Yêu cầu chi phải đi qua cơ chế validator hoặc donor vote kết hợp verifier tùy loại.
- Bằng chứng được lưu trên IPFS; CID được liên kết với trạng thái on-chain.
- Smart contract chỉ giải ngân khi các điều kiện được thỏa mãn.

### 1.1.3. Giải pháp đề xuất

- Mỗi chiến dịch là một hợp đồng riêng được tạo bằng CampaignFactory/implementation pattern.
- Supplier Registry quản lý danh sách bên nhận tiền được chấp thuận.
- Forwarder xử lý meta-transaction theo EIP-2771.
- Backend cung cấp IPFS, relayer, event listener và notification.
- Frontend cung cấp giao diện theo vai trò dựa trên trạng thái ví.

### 1.1.4. Kiến trúc tổng thể

Mô tả bốn lớp:

1. **Presentation:** React DApp, các dashboard và trang chiến dịch.
2. **Application services:** NestJS evidence API, relayer, notification, listener.
3. **Decision/optimization:** AI sidecar và gas monitoring.
4. **Trust/data:** Sepolia smart contracts, IPFS, MongoDB và Redis.

**Hình cần có:** Sơ đồ kiến trúc với các kết nối và giao thức giữa các lớp.

## 1.2. Mục tiêu của dự án

### 1.2.1. Mục tiêu tổng quát

Xây dựng nền tảng gây quỹ trên blockchain cho phép theo dõi công khai việc tiếp nhận và sử dụng tiền, đồng thời kiểm soát giải ngân bằng smart contract, biểu quyết và bằng chứng.

### 1.2.2. Mục tiêu cụ thể

- Xây dựng quy trình xét duyệt chiến dịch trước khi triển khai.
- Bảo đảm tiền quyên góp được lưu trong smart contract.
- Chặn chi vượt số dư khả dụng bằng `lockedFunds`.
- Chỉ giải ngân cho Supplier có trong registry.
- Cung cấp yêu cầu chi một lần và nhiều giai đoạn.
- Ghi nhận vote, verification, rejection, cancellation và payment on-chain.
- Lưu metadata/bằng chứng trên IPFS để giảm dữ liệu on-chain.
- Hỗ trợ meta-transaction, batching và tối ưu gas.
- Cung cấp dashboard theo từng vai trò.
- Có bộ kiểm thử cho luồng nghiệp vụ và các điều kiện bảo mật chính.

### 1.2.3. Chỉ số thành công

- 100% chức năng bắt buộc đạt tiêu chí UAT.
- Smart contract compile và toàn bộ test bắt buộc vượt qua.
- Frontend/backend build thành công.
- Không còn lỗi Critical/High chưa xử lý trước nghiệm thu.
- Luồng end-to-end từ tạo chiến dịch đến giải ngân chạy được trên môi trường mục tiêu.
- Có thể truy vết transaction trên Sepolia và metadata trên IPFS.
- Smart contract đạt tối thiểu 80% statement coverage cho phần logic cốt lõi; 100% test case Critical/High phải đạt.
- API thông thường phản hồi không quá 2 giây ở môi trường thử nghiệm, không tính thời gian xác nhận blockchain hoặc upload IPFS.
- Trang chính hiển thị nội dung ban đầu không quá 3 giây với kết nối thử nghiệm ổn định.

## 1.3. Mô tả tổng quan sản phẩm

### 1.3.1. Blockchain module

- `CampaignFactory.sol`: tiếp nhận, duyệt/từ chối đề xuất và lập chỉ mục chiến dịch.
- `Campaign.sol`: nhận donation, quản lý request, vote, proof, verification, payment và refund.
- `SupplierRegistry.sol`: quản lý Supplier và thống kê thanh toán.
- `Forwarder.sol`: xác minh và thực thi meta-transaction/batch.
- `RequestLib.sol`: kiểu dữ liệu và trạng thái yêu cầu.
- `Events.sol`, `Errors.sol`, `AccessControl.sol`: event, custom error và kiểm soát truy cập.

### 1.3.2. Backend module

- Evidence API: upload file/JSON và đọc metadata IPFS.
- Relayer API: nhận intent, xác minh chữ ký, xếp hàng và execute batch.
- Gas Monitor: theo dõi base fee và trạng thái mạng.
- AI Service: lấy quyết định SEND/WAIT từ sidecar.
- Blockchain Listener: đồng bộ event và tạo notification.
- Notification API/WebSocket: lưu, đọc và đẩy thông báo.

### 1.3.3. Frontend module

- Home, Campaigns, Campaign Detail và Create Campaign.
- Creator Dashboard và Activity.
- Supplier Dashboard.
- Verifier Dashboard.
- Admin Dashboard.
- Resources, Contact và các trang pháp lý.

### 1.3.4. Hạ tầng dữ liệu

- Sepolia lưu trạng thái tài chính và nghiệp vụ cốt lõi.
- IPFS/Pinata lưu ảnh, metadata và bằng chứng.
- MongoDB lưu notification, relayer statistics, action log, gas history và sync state.
- Redis/BullMQ hỗ trợ queue và pub/sub.

## 1.4. Đối tượng người dùng và stakeholder

| Stakeholder | Nhu cầu/lợi ích | Quyền hạn chính |
|---|---|---|
| Donor | Minh bạch và giám sát khoản chi | Donate, vote, validator, refund |
| Campaign Manager | Tạo và vận hành chiến dịch | Submit campaign, create/cancel/finalize request |
| Platform Admin | Kiểm soát chất lượng nền tảng | Duyệt chiến dịch, Supplier, phí và hệ thống |
| Supplier | Nhận nhiệm vụ và thanh toán minh bạch | Nộp proof, cập nhật hồ sơ |
| Verifier | Xác minh độc lập | Verify/reject request và milestone |
| Nhóm dự án | Phát triển và vận hành | Thiết kế, code, test, deploy |
| Giảng viên/Product Sponsor | Định hướng và nghiệm thu | Phê duyệt phạm vi/kết quả |
| Nhà cung cấp hạ tầng | Duy trì dịch vụ | RPC, IPFS, database, hosting |

**Bổ sung:** Power–Interest Grid và chiến lược tương tác cho từng nhóm.

## 1.5. Phạm vi sơ bộ

### 1.5.1. Trong phạm vi

- Các module và luồng đã nêu tại phần Mở đầu.
- Triển khai thử nghiệm Sepolia.
- Tài liệu kỹ thuật, quản trị và hướng dẫn sử dụng.
- Kiểm thử chức năng, bảo mật logic và tích hợp cốt lõi.

### 1.5.2. Ngoài phạm vi

- Mainnet, fiat, KYC pháp lý, mobile native, NFT và DAO governance đầy đủ.
- Hệ thống kế toán/thuế cho tổ chức từ thiện.
- Cam kết pháp lý về tính xác thực nội dung bằng chứng ngoài chuỗi.

### 1.5.3. Giả định

- Người dùng có ví MetaMask và ETH testnet.
- Sepolia, RPC và Pinata khả dụng.
- Admin, Supplier và Verifier sử dụng đúng khóa ví được cấp.
- CID được pin đủ lâu trong vòng đời dự án.
- Quy mô thử nghiệm giả định: tối đa 100 ví, 30 chiến dịch, 500 lượt quyên góp và 200 yêu cầu chi tiêu.
- Tải đồng thời giả định: 20 người dùng; hệ thống không được tuyên bố đáp ứng quy mô production nếu chưa load test độc lập.

### 1.5.4. Ràng buộc

- Thời gian và nhân lực sinh viên có hạn.
- Gas thay đổi theo mạng.
- Blockchain transaction không thể hoàn tác tùy ý.
- Mỗi thay đổi contract có thể cần deploy lại và đồng bộ ABI/address.
- Phụ thuộc dịch vụ bên thứ ba.

## 1.6. Lợi ích mong đợi

### 1.6.1. Đối với Donor

- Theo dõi công khai donation và khoản chi.
- Có quyền biểu quyết và nhận hoàn tiền theo điều kiện.

### 1.6.2. Đối với Manager

- Quản lý chiến dịch, ngân sách và yêu cầu trên một giao diện.
- Tạo bằng chứng kiểm toán rõ ràng.

### 1.6.3. Đối với Supplier/Verifier

- Quy trình giao việc, nộp/xác minh bằng chứng và thanh toán minh bạch.

### 1.6.4. Đối với nền tảng và cộng đồng

- Giảm phụ thuộc vào niềm tin tập trung.
- Tăng khả năng truy vết và trách nhiệm giải trình.

## 1.7. Sản phẩm bàn giao cấp cao

- Source code monorepo.
- Smart contract, ABI và địa chỉ triển khai.
- Frontend DApp và backend service.
- AI sidecar.
- Tài liệu cài đặt, triển khai, API và nghiệp vụ.
- Test suite và báo cáo kiểm thử.
- Báo cáo quản trị dự án và slide/demo.

## 1.8. Tiêu chí thành công cấp cao

- Đúng phạm vi đã phê duyệt.
- Hoàn thành trong baseline thời gian/chi phí được chấp thuận.
- Đạt tiêu chí chất lượng và UAT.
- Bàn giao đầy đủ, có thể tái triển khai theo tài liệu.

---

# CHƯƠNG II. QUẢN LÝ PHẠM VI

## 2.1. Kế hoạch quản lý phạm vi

### 2.1.1. Mục đích

- Xác định công việc cần và không cần thực hiện.
- Ngăn scope creep.
- Thiết lập cơ sở nghiệm thu và kiểm soát thay đổi.

### 2.1.2. Cách xây dựng kế hoạch

- Phân tích Project Charter và stakeholder.
- Đối chiếu source, test, tài liệu và prototype.
- Tổ chức workshop yêu cầu.
- Xây dựng Scope Statement, WBS và WBS Dictionary.
- Thiết lập Requirements Traceability Matrix.

### 2.1.3. Vai trò quản lý phạm vi

- Sponsor/giảng viên: duyệt phạm vi cấp cao.
- Project Manager: duy trì baseline và điều phối change request.
- Product Owner/BA: quản lý backlog và acceptance criteria.
- Technical Lead: đánh giá tác động kỹ thuật.
- QA: xác nhận khả năng kiểm thử và bằng chứng nghiệm thu.
- Tên thành viên phụ trách từng vai trò sẽ được gán sau; trước thời điểm đó quản lý theo vai trò chức năng, không gán tên giả định.

### 2.1.4. Scope Baseline

Bao gồm:

- Project Scope Statement.
- WBS.
- WBS Dictionary.
- Danh sách yêu cầu và tiêu chí nghiệm thu đã phê duyệt.

## 2.2. Thu thập yêu cầu

### 2.2.1. Mục tiêu

- Xác định nhu cầu theo stakeholder.
- Chuyển nhu cầu thành yêu cầu có thể thiết kế, triển khai và kiểm thử.

### 2.2.2. Phương pháp

- Phỏng vấn sponsor/giảng viên.
- Workshop nhóm và brainstorming.
- Phân tích hệ thống gây quỹ hiện có.
- Phân tích mã nguồn, test case và tài liệu repository.
- Prototype UI và quan sát phản hồi.
- Phân tích quy định của blockchain và dịch vụ bên thứ ba.

### 2.2.3. Yêu cầu chức năng

#### Nhóm FR-CAMPAIGN

- FR-01: Người dùng kết nối ví và gửi đề xuất chiến dịch.
- FR-02: Hệ thống yêu cầu đúng phí chống spam.
- FR-03: Admin duyệt và triển khai Campaign.
- FR-04: Admin từ chối và hệ thống hoàn phần phí theo quy tắc contract.
- FR-05: Hiển thị/lọc/phân trang chiến dịch theo manager, category hoặc toàn bộ.
- FR-06: Manager xem trạng thái đề xuất và chiến dịch của mình.
- FR-07: Manager dừng chiến dịch khi thỏa điều kiện.

#### Nhóm FR-DONATION

- FR-08: Donor quyên góp không thấp hơn mức tối thiểu.
- FR-09: Hệ thống ghi nhận contribution, donor count và global statistics.
- FR-10: Donor xem lịch sử các chiến dịch đã quyên góp.
- FR-11: Manager không được quyên góp/bỏ phiếu cho chiến dịch của mình.
- FR-12: Donor claim refund theo tỷ lệ sau khi chiến dịch bị dừng.

#### Nhóm FR-REQUEST

- FR-13: Manager tạo request thường cho Supplier hợp lệ.
- FR-14: Manager tạo multi-stage request với milestone và giá trị hợp lệ.
- FR-15: Hệ thống khóa ngân sách khi tạo request.
- FR-16: Tổng request đang mở không vượt available funds.
- FR-17: Manager hủy request hợp lệ và giải phóng locked funds.
- FR-18: Áp dụng voting deadline và chặn vote quá hạn.

#### Nhóm FR-APPROVAL/VERIFICATION

- FR-19: Donor đủ điều kiện biểu quyết theo trọng số contribution.
- FR-20: Donor không được bỏ phiếu hai lần.
- FR-21: Request nhỏ dùng nhóm validator được chọn.
- FR-22: Manager có thể reselect validator sau thời gian quy định.
- FR-23: Supplier nộp proof CID.
- FR-24: Verifier xác minh hoặc hard reject.
- FR-25: Hard reject giải phóng locked funds.
- FR-26: Manager chỉ finalize khi đủ vote và verification.
- FR-27: Milestone chỉ được thanh toán sau proof và verification tương ứng.

#### Nhóm FR-SUPPLIER

- FR-28: Admin thêm/xóa Supplier.
- FR-29: Không cho phép Supplier trùng hoặc địa chỉ không hợp lệ.
- FR-30: Supplier cập nhật trường thông tin được phép.
- FR-31: Registry ghi nhận khoản thanh toán từ Campaign hợp lệ.

#### Nhóm FR-IPFS/BACKEND

- FR-32: Upload file lên IPFS và trả CID/URL.
- FR-33: Upload JSON metadata lên IPFS.
- FR-34: Truy xuất metadata bằng CID.
- FR-35: Xác minh quyền/chữ ký upload theo thiết kế backend.

#### Nhóm FR-RELAYER/AI

- FR-36: Nhận intent chứa ForwardRequest và chữ ký.
- FR-37: Xác minh EIP-712 trước khi đưa vào queue.
- FR-38: Gom nhiều intent để execute batch.
- FR-39: Theo dõi gas, queue size và thời gian còn lại.
- FR-40: AI đưa ra quyết định gửi/chờ; có fallback an toàn khi AI lỗi.
- FR-41: Lưu relayer statistics và action history.

#### Nhóm FR-NOTIFICATION

- FR-42: Listener theo dõi Factory/Campaign event.
- FR-43: Lưu notification vào MongoDB.
- FR-44: Đẩy notification qua Socket.IO/Redis.
- FR-45: Người dùng đọc và đánh dấu notification đã xem.

#### Nhóm FR-UI

- FR-46: Cung cấp các trang public và dashboard theo vai trò.
- FR-47: Hiển thị trạng thái transaction và liên kết Etherscan.
- FR-48: Hiển thị metadata/bằng chứng IPFS.
- FR-49: Điều hướng chức năng dựa trên quyền của ví.
- FR-50: Hiển thị trạng thái relayer/AI cho người dùng phù hợp.

### 2.2.4. Yêu cầu phi chức năng

- NFR-01 Bảo mật: kiểm soát quyền ở smart contract, không chỉ ở UI.
- NFR-02 Toàn vẹn: trạng thái tài chính cốt lõi phải nằm on-chain.
- NFR-03 Minh bạch: transaction và CID có thể truy vết.
- NFR-04 Khả dụng: backend có cơ chế reconnect/fallback phù hợp.
- NFR-05 Hiệu năng: API thông thường phản hồi trong 2 giây và trang chính hiển thị nội dung ban đầu trong 3 giây ở môi trường thử nghiệm ổn định.
- NFR-06 Khả năng mở rộng: pagination/indexing và Redis adapter.
- NFR-07 Bảo trì: module hóa, TypeScript/Solidity conventions và tài liệu.
- NFR-08 Tương thích: trình duyệt hiện đại, MetaMask và Sepolia.
- NFR-09 Quan sát: log, gas history, relayer stats và notification.
- NFR-10 Tối ưu gas: struct packing, custom errors, batching và metadata CID.
- NFR-11 Riêng tư: không đưa khóa bí mật hoặc dữ liệu nhạy cảm lên client/IPFS.
- NFR-12 Phục hồi: listener lưu sync state để giảm mất event.

### 2.2.5. Quản lý yêu cầu

- Mỗi yêu cầu có ID, mô tả, nguồn, độ ưu tiên, owner và acceptance criteria.
- Trạng thái: Proposed → Analyzed → Approved → Implemented → Tested → Accepted.
- Mỗi yêu cầu liên kết tới WBS, source module và test case.

### 2.2.6. Thách thức và cách xử lý

- Yêu cầu thay đổi nhanh: quản lý backlog và baseline theo phiên bản.
- Thuật ngữ blockchain khó hiểu: glossary và prototype.
- Contract khó sửa sau deploy: review/test trước migration.
- Khác biệt giữa tài liệu và source: lấy source + test + deployment config làm bằng chứng, sau đó cập nhật tài liệu.

## 2.3. Xác định phạm vi

### 2.3.1. Product Scope Statement

- Mô tả chi tiết các module và luồng từ Chương I.
- Chỉ bao gồm chức năng có acceptance criteria và deliverable rõ ràng.

### 2.3.2. Tiêu chuẩn chấp nhận sản phẩm

- Tạo, duyệt và từ chối đề xuất chiến dịch đúng quyền.
- Donation và thống kê cập nhật chính xác.
- Không tạo request vượt available funds.
- Chỉ Supplier được whitelist mới nhận request.
- Vote/validator/verifier tuân thủ điều kiện contract.
- Payment chỉ xảy ra khi đủ điều kiện.
- Cancellation/rejection/refund cập nhật số dư chính xác.
- IPFS API trả CID và frontend đọc được metadata.
- Meta-transaction hợp lệ chạy qua Forwarder; chữ ký sai bị từ chối.
- Notification được lưu và phát theo event.
- Build/test và UAT đạt ngưỡng Chương VI.

### 2.3.3. Deliverables

1. Bộ yêu cầu và thiết kế.
2. Smart contracts và test suite.
3. Backend NestJS.
4. AI sidecar.
5. Frontend React.
6. Cấu hình Docker/deployment.
7. Triển khai Sepolia và ABI/address.
8. Tài liệu kỹ thuật/người dùng.
9. Báo cáo kiểm thử và nghiệm thu.
10. Báo cáo quản trị dự án.

### 2.3.4. Exclusions, assumptions, constraints

- Trình bày lại có kiểm soát từ mục 1.5, tránh mở rộng ngoài baseline.

## 2.4. Phân rã công việc

### 2.4.1. Mục tiêu WBS

- Phân rã 100% phạm vi thành work package có thể ước lượng, giao việc và nghiệm thu.

### 2.4.2. WBS cấp cao

1.0 Khởi tạo dự án  
2.0 Phân tích yêu cầu  
3.0 Thiết kế giải pháp  
4.0 Phát triển blockchain  
5.0 Phát triển backend và AI  
6.0 Phát triển frontend  
7.0 Tích hợp và dữ liệu  
8.0 Kiểm thử và bảo mật  
9.0 Triển khai và vận hành  
10.0 Tài liệu, nghiệm thu và kết thúc

### 2.4.3. WBS chi tiết

#### 1.0 Khởi tạo

- 1.1 Xây dựng Project Charter.
- 1.2 Xác định stakeholder.
- 1.3 Phân công nhóm.
- 1.4 Thiết lập repository, công cụ và quy ước.

#### 2.0 Phân tích

- 2.1 Thu thập yêu cầu.
- 2.2 Use Case/User Story.
- 2.3 Yêu cầu phi chức năng.
- 2.4 Acceptance criteria.
- 2.5 Requirements Traceability Matrix.

#### 3.0 Thiết kế

- 3.1 Kiến trúc tổng thể.
- 3.2 Thiết kế contract và state machine.
- 3.3 Thiết kế backend API/event/queue.
- 3.4 Thiết kế dữ liệu MongoDB/Redis/IPFS.
- 3.5 Thiết kế UI/UX và dashboard.
- 3.6 Threat modeling.

#### 4.0 Blockchain

- 4.1 CampaignFactory và approval workflow.
- 4.2 Campaign donation/request/voting.
- 4.3 Supplier Registry.
- 4.4 Verification và multi-stage payment.
- 4.5 Cancellation, deadline và refund.
- 4.6 Forwarder/meta-transaction.
- 4.7 Event, error và access control.
- 4.8 Gas/security optimization.
- 4.9 Deploy/verify scripts.

#### 5.0 Backend và AI

- 5.1 Evidence/IPFS module.
- 5.2 Blockchain listener.
- 5.3 Notification và WebSocket.
- 5.4 Relayer intent/queue/batch.
- 5.5 Gas monitor.
- 5.6 AI decision service/sidecar.
- 5.7 MongoDB/Redis integration.
- 5.8 Swagger, validation và logging.

#### 6.0 Frontend

- 6.1 Layout, routing và wallet.
- 6.2 Home/Campaign list/detail.
- 6.3 Create Campaign.
- 6.4 Creator Dashboard.
- 6.5 Donation Activity.
- 6.6 Supplier Dashboard.
- 6.7 Verifier Dashboard.
- 6.8 Admin Dashboard.
- 6.9 Notification/relayer status.
- 6.10 Resources/contact/legal/responsive UI.

#### 7.0 Tích hợp

- 7.1 ABI/address integration.
- 7.2 Frontend–IPFS integration.
- 7.3 Frontend–contract integration.
- 7.4 Frontend–relayer integration.
- 7.5 Listener–notification integration.
- 7.6 End-to-end workflow.

#### 8.0 Kiểm thử

- 8.1 Contract unit/integration test.
- 8.2 Security/hardening test.
- 8.3 Meta-transaction/gas/refund test.
- 8.4 Backend unit/E2E test.
- 8.5 Frontend build/lint/manual test.
- 8.6 UAT và regression.
- 8.7 Defect fixing và test report.

#### 9.0 Triển khai

- 9.1 Cấu hình môi trường.
- 9.2 Deploy/verify contract Sepolia.
- 9.3 Deploy backend, Redis, MongoDB và AI sidecar.
- 9.4 Build/deploy frontend.
- 9.5 Smoke test và monitoring.
- 9.6 Backup/configuration handover.

#### 10.0 Kết thúc

- 10.1 Hoàn thiện tài liệu.
- 10.2 Đào tạo/demo.
- 10.3 Nghiệm thu.
- 10.4 Lessons learned.
- 10.5 Bàn giao và đóng dự án.

### 2.4.4. Từ điển WBS

Mỗi work package phải có:

- WBS ID và tên.
- Mô tả.
- Owner.
- Đầu vào/đầu ra.
- Điều kiện bắt đầu/kết thúc.
- Ước lượng effort/thời lượng/chi phí.
- Phụ thuộc.
- Acceptance criteria.
- Rủi ro chính.

## 2.5. Xác nhận phạm vi

### 2.5.1. Mục đích

- Chính thức chấp nhận deliverable đã hoàn thành.

### 2.5.2. Quy trình

1. Nhóm hoàn thành work package và self-review.
2. QA kiểm tra theo acceptance criteria.
3. Product Owner/PM demo và cung cấp bằng chứng.
4. Sponsor/giảng viên chấp nhận hoặc yêu cầu chỉnh sửa.
5. Cập nhật biên bản nghiệm thu và RTM.

### 2.5.3. Bằng chứng nghiệm thu

- Pull request/commit/tag.
- Test report và log build.
- Transaction hash/Etherscan.
- CID và dữ liệu IPFS.
- Screenshot/video demo.
- Biên bản UAT.

## 2.6. Kiểm soát phạm vi

### 2.6.1. Quy trình Change Request

1. Ghi nhận yêu cầu thay đổi.
2. Phân tích lý do và giá trị.
3. Đánh giá tác động phạm vi, lịch, chi phí, chất lượng, rủi ro.
4. CCB phê duyệt/từ chối/hoãn.
5. Nếu duyệt: cập nhật baseline, backlog, RTM và truyền thông.
6. Triển khai, kiểm thử và đóng thay đổi.

### 2.6.2. Ngưỡng phê duyệt

- Minor: không ảnh hưởng baseline, PM/Product Owner xử lý.
- Major: ảnh hưởng chức năng, contract interface, milestone hoặc ngân sách; cần CCB/sponsor.
- Emergency: lỗi bảo mật Critical; áp dụng quy trình khẩn cấp và review sau xử lý.

### 2.6.3. Công cụ kiểm soát

- Product backlog, issue tracker, Git history, pull request, RTM và Change Log.

---

# CHƯƠNG III. LỰA CHỌN PHƯƠNG ÁN ĐẦU TƯ

## 3.1. Tiêu chí và phương pháp đánh giá

- Chi phí phát triển.
- Chi phí hạ tầng và giao dịch.
- Mức độ minh bạch.
- Toàn vẹn và khả năng kiểm toán.
- Bảo mật và phân quyền.
- Trải nghiệm người dùng.
- Hiệu năng và khả năng mở rộng.
- Độ phức tạp triển khai/bảo trì.
- Phụ thuộc nhà cung cấp.
- Khả năng đáp ứng mục tiêu đề tài.

Sử dụng Weighted Scoring Model với trọng số: minh bạch và kiểm toán 25%; bảo mật 20%; chi phí 15%; trải nghiệm người dùng 15%; khả năng mở rộng 10%; độ phức tạp triển khai/bảo trì 10%; mức phù hợp mục tiêu môn học 5%.

## 3.2. Phương án 1: Ứng dụng Web2 tập trung

### 3.2.1. Mô tả

- React + backend + cơ sở dữ liệu; tiền do tài khoản trung gian quản lý.

### 3.2.2. Ưu điểm

- Dễ phát triển và vận hành.
- Giao dịch nhanh, không có gas on-chain.
- Dễ sửa/xóa dữ liệu và hỗ trợ người dùng.

### 3.2.3. Nhược điểm

- Người dùng phải tin tưởng đơn vị vận hành.
- Dữ liệu và quyền giải ngân tập trung.
- Khả năng kiểm toán độc lập thấp hơn.

### 3.2.4. Chi phí và rủi ro

- Server, database, thanh toán và bảo mật tập trung.
- Single point of failure và rủi ro chỉnh sửa dữ liệu.

## 3.3. Phương án 2: DApp public blockchain, người dùng tự trả gas

### 3.3.1. Mô tả

- Smart contract + React; metadata có thể lưu on-chain hoặc IPFS; mọi giao dịch do ví người dùng gửi trực tiếp.

### 3.3.2. Ưu điểm

- Minh bạch và kiểm toán tốt.
- Giảm quyền kiểm soát tập trung.
- Kiến trúc đơn giản hơn phương án có relayer.

### 3.3.3. Nhược điểm

- Người dùng phải có ETH và hiểu gas.
- Phí biến động, nhiều giao dịch riêng lẻ.
- UX khó tiếp cận người mới.

### 3.3.4. Chi phí và rủi ro

- Chi phí deploy/giao dịch và rủi ro congestion.
- Contract bug khó khắc phục sau deploy.

## 3.4. Phương án 3: Blockchain public kết hợp IPFS, relayer và AI tối ưu gas

### 3.4.1. Mô tả

- Kiến trúc đúng với source: smart contract Sepolia, IPFS metadata, NestJS relayer, EIP-2771 Forwarder, batching, gas monitor, AI sidecar và notification.

### 3.4.2. Ưu điểm

- Giữ tính minh bạch của blockchain.
- Giảm dữ liệu on-chain bằng CID.
- Hỗ trợ gasless/meta-transaction và gom giao dịch.
- Có quan sát trạng thái gas, queue và lịch sử quyết định.
- Cải thiện UX và khả năng thông báo thời gian thực.

### 3.4.3. Nhược điểm

- Kiến trúc phức tạp hơn.
- Relayer phải có ETH và được vận hành an toàn.
- Phụ thuộc RPC, Redis, MongoDB, Pinata và AI service.
- Cần cơ chế fallback nếu AI hoặc queue lỗi.

### 3.4.4. Chi phí và rủi ro

- Thêm chi phí backend/queue/database/AI và vận hành relayer.
- Bù lại có khả năng giảm phí bằng batching và timing.

## 3.5. So sánh và lựa chọn

- Chấm theo thang 1–5, điểm tổng là tổng của `điểm × trọng số`:

| Tiêu chí | Trọng số | Web2 tập trung | DApp tự trả gas | Blockchain + IPFS + relayer/AI |
|---|---:|---:|---:|---:|
| Minh bạch/kiểm toán | 25% | 2 | 5 | 5 |
| Bảo mật | 20% | 3 | 4 | 4 |
| Chi phí | 15% | 4 | 3 | 3 |
| Trải nghiệm người dùng | 15% | 5 | 2 | 4 |
| Khả năng mở rộng | 10% | 4 | 3 | 4 |
| Đơn giản triển khai/bảo trì | 10% | 5 | 3 | 2 |
| Phù hợp mục tiêu môn học | 5% | 2 | 4 | 5 |
| **Điểm tổng** | **100%** | **3,45/5** | **3,60/5** | **3,95/5** |

- Phân tích sensitivity khi tăng trọng số chi phí hoặc trải nghiệm người dùng; phương án 3 vẫn được chọn vì minh bạch và kiểm soát giải ngân là hai mục tiêu cốt lõi.
- Chọn phương án 3 vì đạt điểm cao nhất và đúng với sản phẩm hiện tại.
- Ghi rõ Sepolia là môi trường thử nghiệm; cần đánh giá lại economics trước Mainnet.

## 3.6. Phân tích khả thi

- Khả thi kỹ thuật.
- Khả thi kinh tế.
- Khả thi vận hành.
- Khả thi lịch biểu.
- Khả thi pháp lý/đạo đức ở mức đề tài.

---

# CHƯƠNG IV. QUẢN LÝ THỜI GIAN

## 4.1. Tầm quan trọng của quản lý thời gian

- Dự án có nhiều thành phần phụ thuộc tuần tự.
- Thay đổi contract có thể ảnh hưởng backend, ABI và frontend.
- Test/deploy cần đủ thời gian trước nghiệm thu.

## 4.2. Lập kế hoạch quản lý lịch biểu

### 4.2.1. Phương pháp

- Hybrid Agile–PMBOK.
- Kế hoạch cấp cao theo milestone; phát triển theo sprint.
- Estimation bằng expert judgment, analogous estimation và three-point estimation.

### 4.2.2. Đơn vị và lịch làm việc

- Effort: person-hour/person-day.
- Duration: ngày làm việc.
- Một ngày công quy đổi bằng 8 giờ; nhóm sinh viên dự kiến dành trung bình 20 giờ/người/tuần cho dự án.
- Lịch dự án dùng 5 ngày làm việc/tuần để tính duration; thành viên có thể làm ngoài giờ nhưng không dùng làm cơ sở ép ngắn baseline.
- Ngày nghỉ và lịch học/thi được xử lý bằng resource calendar và buffer ở tuần cuối.

### 4.2.3. Ngưỡng kiểm soát

- Cảnh báo vàng khi task chậm trên 1 ngày hoặc sprint hoàn thành dưới 90% kế hoạch.
- Cảnh báo đỏ và bắt buộc phân tích khắc phục khi task trên critical path chậm từ 2 ngày, milestone chậm từ 3 ngày hoặc SPI dưới 0,90.
- Change Request bắt buộc khi điều chỉnh làm thay đổi milestone, ngày kết thúc hoặc Schedule Baseline.

## 4.3. Xác định hoạt động

Chuyển từng WBS work package thành activity có:

- ID.
- Mô tả.
- Người phụ trách.
- Predecessor/successor.
- Duration/effort.
- Deliverable và milestone.

## 4.4. Sắp xếp hoạt động và ước lượng thời gian

### 4.4.1. Quan hệ phụ thuộc chính

- Yêu cầu → kiến trúc → contract/API/UI design.
- Contract interface → ABI → hooks/frontend integration.
- Event design → listener → notification.
- Forwarder → relayer → frontend intent.
- IPFS API → campaign/request metadata UI.
- Unit test → integration test → deploy → UAT.

### 4.4.2. Three-point estimation

- Với task rủi ro cao, dùng O–M–P và PERT: `(O + 4M + P) / 6`.
- Áp dụng cho contract, relayer, tích hợp và deployment.

### 4.4.3. Bảng hoạt động

- Baseline hoạt động cấp giai đoạn:

| ID | Giai đoạn | Thời gian | Tuần | Đầu ra chính |
|---|---|---:|---|---|
| A1 | Khởi tạo, stakeholder và charter | 01/04–05/04 | Tuần 1 | Charter, stakeholder register |
| A2 | Yêu cầu, phạm vi và WBS | 06/04–19/04 | Tuần 2–3 | Scope baseline, RTM, WBS |
| A3 | Thiết kế kiến trúc, contract, API và UI | 20/04–03/05 | Tuần 4–5 | Architecture/design baseline |
| A4 | Phát triển smart contract cốt lõi | 04/05–17/05 | Tuần 6–7 | Factory, Campaign, Registry, tests |
| A5 | Backend, IPFS, relayer, AI và notification | 11/05–24/05 | Tuần 7–8 | API/services tích hợp |
| A6 | Frontend và dashboard theo vai trò | 18/05–31/05 | Tuần 8–9 | Các luồng UI chính |
| A7 | Tích hợp, hardening và regression | 01/06–14/06 | Tuần 10–11 | E2E flow, defect fixes |
| A8 | Deploy Sepolia, UAT và báo cáo kiểm thử | 15/06–21/06 | Tuần 12 | Release candidate, UAT |
| A9 | Tài liệu, bàn giao và dự phòng | 22/06–30/06 | Tuần 13 | Báo cáo, demo, closure |

- A4–A6 được phép chồng lấn có kiểm soát sau khi interface baseline được duyệt.

## 4.5. Ước lượng nguồn lực hoạt động

- Nhân lực theo chuyên môn.
- Thiết bị và tài khoản dịch vụ.
- Môi trường local/testnet.
- Khả năng một thành viên đảm nhiệm nhiều vai trò.

## 4.6. Phát triển lịch biểu

### 4.6.1. Giai đoạn đề xuất

1. Khởi tạo và phân tích.
2. Thiết kế.
3. Phát triển contract nền tảng.
4. Phát triển backend/IPFS/relayer.
5. Phát triển frontend.
6. Tích hợp và hardening.
7. Deploy, UAT và tài liệu.
8. Nghiệm thu/kết thúc.

### 4.6.2. Milestone

- M1: Charter và Scope Baseline được duyệt.
- M2: Kiến trúc và contract design được duyệt.
- M3: Smart contract core vượt unit test.
- M4: Backend/IPFS/relayer hoạt động.
- M5: Các dashboard frontend hoàn thành.
- M6: End-to-end flow hoạt động.
- M7: Deploy Sepolia và UAT.
- M8: Bàn giao báo cáo/sản phẩm.

### 4.6.3. Critical Path

- Xây dựng network diagram.
- Tính ES, EF, LS, LF và total float.
- Phân tích đường găng dự kiến đi qua contract → integration → test → deployment.

### 4.6.4. Gantt Chart và Schedule Baseline

- Thể hiện task, owner, duration, dependency, milestone và baseline.
- Ngày bắt đầu baseline: 01/04/2026; ngày kết thúc: 30/06/2026.
- Mốc M1: 05/04; M2: 19/04; M3: 03/05; M4: 17/05; M5: 31/05; M6: 14/06; M7: 21/06; M8: 30/06/2026.

## 4.7. Kiểm soát lịch biểu

- Daily/weekly update.
- Sprint review và burndown.
- So sánh planned/actual.
- Schedule Performance Index nếu áp dụng EVM.
- Điều chỉnh bằng fast tracking/crashing chỉ sau phân tích rủi ro.

## 4.8. Phân tích rủi ro thời gian

- Chậm do contract bug/redeploy.
- Chậm do tích hợp ABI/address.
- Chậm do dịch vụ testnet/RPC.
- Thành viên bận học/thi.
- Scope change gần thời hạn.
- Dành buffer cho integration, security fix và tài liệu.

## 4.9. Kết luận chương

- Tóm tắt baseline, critical path và cơ chế kiểm soát.

---

# CHƯƠNG V. QUẢN LÝ CHI PHÍ

## 5.1. Tầm quan trọng của quản lý chi phí

- Chi phí không chỉ gồm nhân sự mà còn hạ tầng, gas, lưu trữ và rủi ro kỹ thuật.
- Testnet miễn phí tiền thật nhưng vẫn cần quy đổi/ước lượng để đánh giá khả thi vận hành.

## 5.2. Lập kế hoạch quản lý chi phí

### 5.2.1. Phương pháp

- Bottom-up theo WBS.
- Parametric cho nhân công.
- Vendor quotation cho dịch vụ.
- Three-point estimation cho gas/hạ tầng biến động.

### 5.2.2. Đơn vị và giả định

- VNĐ cho báo cáo ngân sách.
- ETH/Gwei cho blockchain rồi quy đổi theo tỷ giá tại ngày lập kế hoạch.
- Ghi rõ nguồn và ngày lấy tỷ giá.
- Chi phí nhân công quy đổi phục vụ học thuật: **50.000 VNĐ/giờ**, áp dụng đồng nhất để tránh tạo chênh lệch lương giả giữa các thành viên sinh viên.
- Tổng effort baseline: **960 giờ**, phân bổ theo work package; đây là chi phí cơ hội, không phải tiền lương nhóm thực nhận.
- Gas được lập quỹ dự phòng theo VNĐ; khi báo cáo thực tế phải ghi thêm ETH/Gwei và tỷ giá tại ngày giao dịch.

### 5.2.3. Mức chính xác và dự phòng

- Contingency Reserve cho known risks.
- Management Reserve cho unknown risks.
- Nêu rõ phần nào nằm trong Cost Baseline.

## 5.3. Ước lượng chi phí

### 5.3.1. Nhân sự

- PM/BA.
- Blockchain developer.
- Backend/AI developer.
- Frontend developer.
- QA/Tester.
- DevOps/Documentation.
- Tính: effort × đơn giá.

### 5.3.2. Hạ tầng

- RPC provider.
- Pinata/IPFS.
- MongoDB.
- Redis/queue.
- Backend/AI hosting.
- Frontend hosting, domain, SSL.
- Monitoring và backup.

### 5.3.3. Blockchain

- Deploy Forwarder, SupplierRegistry, Campaign implementation và Factory.
- Verify contract.
- Phí vận hành relayer.
- Anti-spam fee là dòng tiền nghiệp vụ, không đồng nhất với chi phí phát triển.

### 5.3.4. Chất lượng và bảo mật

- Test tooling.
- Security review/audit.
- Penetration test nếu có.
- Chi phí sửa lỗi và regression.

### 5.3.5. Đào tạo và quản trị

- Họp, tài liệu, demo, đào tạo và dự phòng thiết bị.

## 5.4. Xác định ngân sách

- Ngân sách giả định được tổng hợp như sau:

| Nhóm chi phí | Cơ sở tính | Thành tiền (VNĐ) |
|---|---|---:|
| Nhân công | 960 giờ × 50.000 | 48.000.000 |
| RPC, Pinata, MongoDB, Redis và hosting | Gói thử nghiệm trong 3 tháng | 3.000.000 |
| Gas deploy, verify và relayer test | Quỹ thử nghiệm biến động | 2.000.000 |
| Domain, SSL, công cụ và lưu trữ | Chi phí dự phòng triển khai/demo | 1.000.000 |
| Kiểm thử, tài liệu và demo | Thiết bị, dữ liệu, in ấn/trình bày | 1.500.000 |
| **Ước lượng cơ sở** |  | **55.500.000** |
| Contingency Reserve | Khoảng 10% ước lượng cơ sở | 5.500.000 |
| **Cost Baseline** |  | **61.000.000** |
| Management Reserve | Khoảng 5% Cost Baseline | 3.000.000 |
| **Project Budget** |  | **64.000.000** |

- Cost Baseline được phân bổ theo tháng để tạo S-curve: tháng 4 là 17.000.000 VNĐ; tháng 5 là 28.000.000 VNĐ; tháng 6 là 16.000.000 VNĐ.
- Management Reserve không nằm trong Cost Baseline và chỉ được PM/sponsor phê duyệt khi xuất hiện unknown risk.
- Phân biệt ngân sách quy đổi với cash flow thực tế: dịch vụ free tier và công sức sinh viên có thể khiến tiền mặt thực chi thấp hơn đáng kể.

## 5.5. Kiểm soát chi phí

### 5.5.1. EVM

- PV, EV, AC.
- CV = EV − AC.
- SV = EV − PV.
- CPI = EV/AC.
- SPI = EV/PV.
- EAC, ETC và VAC.

### 5.5.2. Tần suất và ngưỡng

- Báo cáo theo tuần/sprint/milestone.
- Cảnh báo vàng khi CPI dưới 0,95 hoặc CV âm quá 5% ngân sách kỳ.
- Escalation/Change Request khi CPI dưới 0,90, CV âm quá 10% Cost Baseline hoặc dự báo EAC vượt Project Budget.

### 5.5.3. Kiểm soát gas và cloud

- Theo dõi base fee và relayer savings.
- Budget alert cho RPC/cloud/database.
- Giới hạn log/storage và tối ưu batch.

## 5.6. Kế hoạch quản lý chi phí của dự án

### 5.6.1. Tiêu chí kiểm soát

- Mọi chi phí có owner, nguồn dữ liệu và phê duyệt.
- Không thay đổi baseline nếu chưa qua change control.

### 5.6.2. Rủi ro chi phí

- Gas tăng.
- Hết free tier.
- Redeploy contract.
- Scope creep và rework.
- Audit ngoài kế hoạch.

### 5.6.3. Giá trị mang lại

- Giá trị minh bạch, kiểm toán và giảm chi sai mục đích.
- Tiết kiệm tương đối nhờ CID, batching và gas timing.

## 5.7. Kết luận chương

- Tóm tắt ngân sách, dự phòng và cách đo hiệu quả chi phí.

---

# CHƯƠNG VI. QUẢN LÝ CHẤT LƯỢNG

## 6.1. Tầm quan trọng của quản lý chất lượng

- Lỗi smart contract có thể gây mất hoặc khóa tiền.
- Dữ liệu sai giữa on-chain/off-chain làm giảm tính minh bạch.
- UX không rõ trạng thái transaction dễ dẫn đến thao tác sai.

## 6.2. Cơ sở xác định chất lượng

- Yêu cầu và acceptance criteria.
- Solidity/OpenZeppelin practices.
- TypeScript/NestJS/React conventions.
- Security checklist.
- Kết quả test, build, lint và UAT.

## 6.3. Quy trình quản lý chất lượng

### 6.3.1. Plan Quality

- Xác định metric, chuẩn, checklist và test strategy.

### 6.3.2. Manage Quality

- Review thiết kế/code/test.
- Root cause analysis.
- Process audit và cải tiến Definition of Done.

### 6.3.3. Control Quality

- Chạy test/build/lint.
- Kiểm tra defect và bằng chứng nghiệm thu.

## 6.4. Kế hoạch quản lý chất lượng

### 6.4.1. Metric sản phẩm

- Test pass rate.
- Smart contract đạt tối thiểu 80% statement coverage cho logic cốt lõi; báo cáo thêm branch/function coverage thay vì chỉ nêu một tỷ lệ tổng.
- Trước nghiệm thu không còn lỗi Critical/High; lỗi Medium phải có owner và kế hoạch xử lý; lỗi Low được ghi vào known issues.
- API thông thường phản hồi trong 2 giây và trang chính hiển thị nội dung ban đầu trong 3 giây ở môi trường thử nghiệm ổn định.
- Gas per operation và deploy gas.
- Event/notification consistency.
- UAT acceptance rate.

### 6.4.2. Metric quy trình

- Tỷ lệ task hoàn thành Definition of Done.
- Review turnaround time.
- Defect leakage và reopen rate.
- Build success rate.

### 6.4.3. Definition of Done

- Code hoàn thành, review và không chứa secret.
- Test liên quan được thêm/cập nhật và pass.
- Build/lint đạt yêu cầu.
- Tài liệu/ABI/address cập nhật.
- Acceptance criteria được xác nhận.

## 6.5. Đảm bảo chất lượng

- Pull request review.
- Static analysis/lint.
- Threat modeling và access-control review.
- Kiểm tra dependency/version.
- Review migration/deployment script.
- Traceability audit giữa yêu cầu–code–test.

## 6.6. Kiểm soát chất lượng

### 6.6.1. Smart contract test

- Campaign approval workflow.
- Donation và history.
- Request creation và budget reservation.
- Weighted voting và snapshot eligibility.
- Validator path cho request nhỏ.
- Supplier whitelist và earnings.
- Proof/verification/hard reject.
- Multi-stage payment.
- Cancellation/deadline/refund.
- Meta-transaction và batch.
- Access control, reentrancy và invalid input.
- Gas/optimization test.

### 6.6.2. Backend test

- Evidence API.
- DTO validation và error response.
- Signature verification.
- Queue/batch/idempotency.
- Listener replay/sync state.
- Notification persistence/WebSocket.
- AI timeout và fallback.

### 6.6.3. Frontend test

- Routing và wallet state.
- Form validation.
- Role-based dashboard.
- Transaction pending/success/error.
- Metadata fallback.
- Responsive/accessibility/manual browser test.

### 6.6.4. Integration/UAT

- Scenario 1: submit → admin approve → campaign deploy.
- Scenario 2: donate → create request → vote → proof → verify → finalize.
- Scenario 3: request nhỏ → validator approval → payment.
- Scenario 4: multi-stage proof/verify/pay.
- Scenario 5: cancel/hard reject/expire → release locked funds.
- Scenario 6: deactivate → donor refund.
- Scenario 7: signed intent → relayer batch → on-chain result.

### 6.6.5. Defect lifecycle

- New → Triaged → Assigned → Fixed → Retest → Closed/Reopened.
- SLA nội bộ: Critical xử lý/đưa ra biện pháp cô lập trong 4 giờ; High trong 1 ngày; Medium trong 3 ngày; Low được xếp vào backlog kỳ kế tiếp.

## 6.7. Chi phí chất lượng

- Prevention: thiết kế, đào tạo, review.
- Appraisal: test, audit, UAT.
- Internal failure: debug/rework trước release.
- External failure: incident/redeploy/support sau release.

## 6.8. Kết luận chương

- Tóm tắt quality gate trước deploy/nghiệm thu.

---

# CHƯƠNG VII. QUẢN LÝ NGUỒN NHÂN LỰC

## 7.1. Tầm quan trọng của nguồn nhân lực

- Dự án cần kiến thức đa lĩnh vực và phối hợp chặt giữa các module.
- Key-person risk cao nếu chỉ một người hiểu contract hoặc deployment.

## 7.2. Quy trình quản lý nguồn lực

- Plan Resource Management.
- Estimate Activity Resources.
- Acquire Resources.
- Develop Team.
- Manage Team.
- Control Resources.

## 7.3. Kế hoạch quản lý nguồn nhân lực

### 7.3.1. Cơ cấu tổ chức

- Sponsor/giảng viên.
- Project Manager/Product Owner.
- BA/Documentation.
- Blockchain developer.
- Backend/AI developer.
- Frontend developer.
- QA/DevOps.
- Tên thành viên và việc gán vai trò thực tế được để trống theo yêu cầu; không dùng tên giả trong báo cáo.

### 7.3.2. Mô tả vai trò

Với từng vai trò, nêu:

- Trách nhiệm.
- Quyền quyết định.
- Kỹ năng cần thiết.
- Deliverable phụ trách.
- Backup person.

### 7.3.3. Ma trận RACI

Lập RACI cho:

- Requirement/architecture.
- Smart contract.
- Backend/IPFS/relayer/AI.
- Frontend/dashboard.
- Test/security.
- Deploy/configuration.
- Báo cáo/demo/nghiệm thu.

### 7.3.4. Resource calendar

- Lịch khả dụng từng thành viên.
- Thời gian học/thi và cam kết theo tuần.
- Baseline chung dùng 20 giờ/người/tuần; resource calendar cá nhân sẽ được cập nhật sau khi có danh sách và phân vai thành viên.

## 7.4. Thiết lập đội ngũ

- Chọn vai trò dựa trên kỹ năng và sở thích.
- Cân bằng workload.
- Thiết lập onboarding, branch convention, môi trường và quyền truy cập.

## 7.5. Phát triển đội ngũ

- Chia sẻ kiến thức blockchain và EIP.
- Pair programming/review chéo.
- Demo nội bộ từng sprint.
- Rotation/backup cho nhiệm vụ quan trọng.
- Tài liệu hóa để giảm bus factor.

## 7.6. Quản lý đội ngũ và xung đột

### 7.6.1. Theo dõi hiệu suất

- Hoàn thành task đúng hạn/chất lượng.
- Chất lượng review và hỗ trợ nhóm.
- Không dùng số commit làm chỉ số duy nhất.

### 7.6.2. Xử lý xung đột

- Ưu tiên collaborate/problem solve.
- Quy trình: ghi nhận → làm rõ dữ kiện → thống nhất phương án → theo dõi.
- Escalate PM/sponsor khi ảnh hưởng baseline.

### 7.6.3. Ghi nhận và động viên

- Ghi nhận đóng góp theo milestone.
- Phản hồi cụ thể và kịp thời.

## 7.7. Kết luận chương

- Tóm tắt cơ cấu, RACI và biện pháp giảm key-person risk.

---

# CHƯƠNG VIII. QUẢN LÝ TRUYỀN THÔNG

## 8.1. Tầm quan trọng

- Đồng bộ thay đổi contract/ABI/address giữa nhiều nhóm.
- Phân biệt thông tin kỹ thuật, tiến độ và quyết định quản trị.
- Giảm hiểu nhầm về trạng thái on-chain và off-chain.

## 8.2. Quy trình quản lý truyền thông

### 8.2.1. Lập kế hoạch truyền thông

Xác định:

- Ai cần thông tin.
- Nội dung và mức chi tiết.
- Tần suất.
- Kênh.
- Chủ sở hữu.
- Cơ chế phản hồi/escalation.

### 8.2.2. Ma trận truyền thông

| Hoạt động | Nội dung | Người gửi | Người nhận | Tần suất | Kênh | Đầu ra |
|---|---|---|---|---|---|---|
| Daily sync | Tiến độ/blocker | Thành viên | Nhóm | Hằng ngày | Chat/meeting | Action list |
| Weekly status | Scope/schedule/risk | PM | Sponsor/nhóm | Hằng tuần | Report | Status report |
| Sprint planning | Backlog/capacity | PO/PM | Dev/QA | Mỗi sprint | Meeting/board | Sprint backlog |
| Sprint review | Demo/feedback | Nhóm | Stakeholder | Mỗi sprint | Demo | Accepted/rework |
| Technical review | API/ABI/design | Tech lead | Dev/QA | Khi thay đổi | PR/doc | Decision record |
| Incident | Lỗi Critical | Người phát hiện | PM/tech/sponsor | Ngay lập tức | Alert/call | Incident record |
| Change request | Tác động baseline | PM | CCB | Khi phát sinh | Form/meeting | Quyết định |

Baseline công cụ: GitHub Issues/Projects cho task và source; Zalo hoặc Messenger cho trao đổi nhanh; Google Meet cho họp; Google Drive cho biên bản/tài liệu; diagrams.net cho sơ đồ. Lịch: daily asynchronous update, họp nhóm hai lần/tuần, báo cáo trạng thái mỗi tuần và review cuối mỗi sprint.

### 8.2.3. Quản lý truyền thông

- Single source of truth cho requirement, task, code và decision.
- Meeting có agenda, timebox, minutes, owner và deadline.
- Quyết định kỹ thuật quan trọng lưu bằng ADR/biên bản.
- Không chia sẻ private key/API secret qua chat/repository.

### 8.2.4. Báo cáo trạng thái

- RAG status cho scope/schedule/cost/quality/risk.
- Công việc đã hoàn thành.
- Kế hoạch kỳ tiếp theo.
- Blocker và quyết định cần hỗ trợ.
- Thay đổi đã duyệt.

### 8.2.5. Giám sát truyền thông

- Theo dõi phản hồi, action item quá hạn và hiểu sai yêu cầu.
- Retrospective để cải thiện kênh/tần suất.
- Audit việc cập nhật tài liệu sau thay đổi code.

## 8.3. Truyền thông với người dùng hệ thống

- UI notification cho pending/success/error transaction.
- WebSocket notification cho nhiệm vụ mới.
- Etherscan link và CID để người dùng tự kiểm chứng.
- Thông báo rõ transaction blockchain có thể chậm/không hoàn tác.

## 8.4. Kết luận chương

- Tóm tắt kênh, owner và escalation path.

---

# CHƯƠNG IX. QUẢN LÝ RỦI RO

## 9.1. Tổng quan

### 9.1.1. Tầm quan trọng

- Rủi ro blockchain có thể tác động trực tiếp đến tài sản và uy tín.
- Hệ thống phụ thuộc nhiều dịch vụ và trạng thái phân tán.

### 9.1.2. Định nghĩa

- Rủi ro là sự kiện/điều kiện không chắc chắn có tác động tích cực hoặc tiêu cực đến mục tiêu dự án.

### 9.1.3. Quy trình

1. Lập kế hoạch.
2. Nhận diện.
3. Phân tích định tính.
4. Phân tích định lượng khi phù hợp.
5. Lập phản hồi.
6. Triển khai phản hồi.
7. Giám sát.

## 9.2. Kế hoạch quản lý rủi ro

- Vai trò: PM duy trì Risk Register; Risk Owner triển khai phản hồi; nhóm cùng nhận diện.
- Thang xác suất 1–5, tác động 1–5.
- Score = Probability × Impact.
- Phân loại Low/Medium/High/Critical.
- Review hằng tuần/sprint và trước deployment.
- Dành contingency reserve cho rủi ro trọng yếu.

## 9.3. Nhận diện rủi ro

### 9.3.1. Phương pháp

- Brainstorming.
- Checklist bảo mật.
- Phân tích assumption/constraint.
- Review kiến trúc, source và test.
- SWOT và lessons learned.

### 9.3.2. Risk Breakdown Structure

1. Quản trị/phạm vi.
2. Lịch biểu/nguồn lực.
3. Chi phí.
4. Blockchain/smart contract.
5. Backend/dữ liệu/hạ tầng.
6. Frontend/UX.
7. Bảo mật/pháp lý.
8. Nhà cung cấp/vận hành.

### 9.3.3. Risk Register tối thiểu

| ID | Rủi ro | Nguyên nhân/tác động | Phản hồi chính |
|---|---|---|---|
| R01 | Scope creep | Thêm chức năng sát hạn, chậm tiến độ | Baseline và CCB |
| R02 | Thiếu nhân lực/key person | Một người nắm module quan trọng | Review chéo, backup, tài liệu |
| R03 | Contract vulnerability | Sai access/reentrancy/logic tiền | Test, review, OpenZeppelin, audit |
| R04 | Deploy sai contract/address | Cấu hình hoặc mạng sai | Checklist, verify, smoke test |
| R05 | ABI không đồng bộ | Contract đổi nhưng frontend dùng ABI cũ | Versioning và integration gate |
| R06 | Private key/API key lộ | Secret bị commit/log | Env, secret scanning, rotate key |
| R07 | Vote/validator bị thao túng | Thông đồng hoặc logic eligibility sai | Snapshot, restriction, test, monitoring |
| R08 | Chi vượt quỹ/khóa vốn | Sai lockedFunds/lifecycle | Invariant test, cancellation/deadline |
| R09 | Supplier/Verifier xung đột lợi ích | Tự xác minh/nhận tiền | Address constraints và review |
| R10 | Proof giả | IPFS bảo đảm toàn vẹn, không bảo đảm sự thật | Verifier, hard reject, quy trình ngoài chuỗi |
| R11 | IPFS content unavailable | CID không được pin/gateway lỗi | Pinning redundancy/gateway fallback |
| R12 | RPC/Sepolia gián đoạn | Nhà cung cấp/mạng lỗi | Retry, alternate RPC, status notice |
| R13 | Gas tăng | Congestion hoặc timing sai | Batch, AI timing, budget cap |
| R14 | Relayer hết ETH | Không theo dõi số dư | Alert, threshold và top-up procedure |
| R15 | Chữ ký replay/invalid | Nonce/domain/chain sai | EIP-712 verify, nonce, chain checks |
| R16 | AI sidecar lỗi | Timeout/model/service down | Deterministic fallback và circuit breaker |
| R17 | Queue/Redis lỗi | Intent mất hoặc trùng | Persistence, idempotency, retry/DLQ |
| R18 | MongoDB lỗi | Mất notification/stats | Backup/retry; on-chain vẫn là nguồn chính |
| R19 | Listener mất event | Disconnect hoặc start block sai | Sync state, replay và reconciliation |
| R20 | Frontend hiển thị sai trạng thái | Cache/race/failed transaction | Re-fetch receipt/on-chain truth |
| R21 | Refund/payment lỗi | Calculation hoặc reentrancy | Checks-effects-interactions, ReentrancyGuard, test |
| R22 | Dữ liệu nhạy cảm lên IPFS | Người dùng upload nhầm | Warning, validation, policy |
| R23 | Dependency vulnerability | Package lỗi/thư viện cũ | Lockfile, audit và controlled update |
| R24 | Test không đủ | Chỉ happy path | RTM, negative/invariant/E2E test |
| R25 | Không đạt hạn báo cáo | Tài liệu làm muộn | Viết song song, milestone và buffer |

Mở rộng bảng với owner, probability, impact, score, trigger, contingency và status.

## 9.4. Phân tích rủi ro

### 9.4.1. Định tính

- Probability–Impact Matrix.
- Ưu tiên các rủi ro tiền, quyền truy cập, secret, deploy và lịch biểu.

### 9.4.2. Định lượng

- EMV = Probability × Monetary Impact cho redeploy, cloud và audit.
- Three-point/Monte Carlo cho lịch nếu đủ dữ liệu.
- Sensitivity/tornado chart cho gas, nhân sự và rework.

## 9.5. Hoạch định phản hồi

- Avoid: bỏ chức năng rủi ro không cần thiết.
- Mitigate: test, review, redundancy, monitoring.
- Transfer: dịch vụ SLA/audit/bảo hiểm nếu phù hợp.
- Accept: ghi rõ reserve và contingency plan.
- Exploit/enhance cho cơ hội như free tier, batching và reusable components.

## 9.6. Giám sát và kiểm soát

- Review Risk Register định kỳ.
- Theo dõi trigger và residual risk.
- Chuyển rủi ro xảy ra thành issue/incident.
- Audit effectiveness của response.
- Cập nhật lessons learned.

## 9.7. Kết luận chương

- Nêu Top 5 risks, owner và hành động ưu tiên.

---

# CHƯƠNG X. QUẢN LÝ MUA SẮM

## 10.1. Tầm quan trọng

- Dự án phụ thuộc hạ tầng ngoài nhóm.
- Free tier phù hợp prototype nhưng không bảo đảm production SLA.

## 10.2. Lập kế hoạch mua sắm

### 10.2.1. Make-or-buy analysis

- Tự phát triển: business logic, contract, frontend/backend integration.
- Sử dụng dịch vụ: RPC, Pinata, MongoDB, Redis/hosting, domain/SSL.
- Thuê ngoài tùy ngân sách: audit bảo mật và penetration testing.

### 10.2.2. Procurement Statement of Work

Với từng dịch vụ nêu:

- Mục đích.
- Dung lượng/tải.
- SLA.
- Security/compliance.
- Backup/export.
- Support.
- Giá và giới hạn.
- Exit plan.

### 10.2.3. Loại hợp đồng

- Subscription theo tháng/năm.
- Pay-as-you-go.
- Fixed price cho audit/phạm vi xác định.

## 10.3. Tiến hành mua sắm

- Lập shortlist nhà cung cấp.
- Yêu cầu báo giá/tài liệu.
- Chấm điểm kỹ thuật và thương mại.
- Kiểm thử proof of concept.
- Phê duyệt và đăng ký tài khoản.
- Lưu hợp đồng, owner và ngày gia hạn.

## 10.4. Kiểm soát mua sắm

- Theo dõi usage, cost, quota và SLA.
- Theo dõi incident và support ticket.
- Kiểm tra bảo mật key/quyền truy cập.
- Đánh giá vendor lock-in và khả năng export.
- Change control khi nâng gói/đổi nhà cung cấp.

## 10.5. Kết thúc mua sắm

- Xác nhận nghĩa vụ hoàn thành.
- Export/backup dữ liệu.
- Thu hồi key và quyền truy cập.
- Thanh toán/đóng tài khoản.
- Đánh giá hiệu suất nhà cung cấp.

## 10.6. Kế hoạch mua sắm của dự án

### 10.6.1. Danh sách hạng mục

| Hạng mục | Nhu cầu | Phương án hiện tại | Dữ liệu cần xác nhận |
|---|---|---|---|
| RPC | Kết nối Sepolia/event | Provider qua RPC URL | Quota/giá/SLA |
| IPFS | Pin file và JSON | Pinata | Dung lượng/retention |
| MongoDB | Notification/stats/log | MongoDB | Storage/backup |
| Redis/BullMQ | Queue và pub/sub | Redis | Memory/HA |
| Hosting backend | NestJS/AI | Docker-compatible | CPU/RAM/uptime |
| Hosting frontend | Static Vite app | Nhà cung cấp phù hợp | Bandwidth/domain |
| Audit | Smart contract security | Chưa xác nhận | Phạm vi/báo giá |

### 10.6.2. Tiêu chí lựa chọn

- Chi phí tổng sở hữu.
- Uptime/SLA.
- Security.
- Khả năng mở rộng.
- Tài liệu và hỗ trợ.
- Data portability.
- Vendor reputation.
- Tương thích công nghệ.

### 10.6.3. Quy trình thay đổi

- Vendor change request → impact analysis → PoC → approval → migration → rollback window.

### 10.6.4. Rủi ro mua sắm

- Hết free tier, tăng giá, outage, vendor lock-in, data loss, thay API và lộ credential.

### 10.6.5. Về EOQ

- EOQ không phù hợp trực tiếp vì dự án không quản lý tồn kho vật lý.
- Nếu môn học bắt buộc, giải thích không áp dụng và thay bằng capacity/subscription planning; không sao chép EOQ từ PDF mẫu.

## 10.7. Kết luận chương

- Tóm tắt chiến lược make-or-buy và kiểm soát nhà cung cấp.

---

# CHƯƠNG XI. QUẢN LÝ TÍCH HỢP

## 11.1. Tổng quan

- Hợp nhất các kế hoạch và quyết định để dự án vận hành như một chỉnh thể.
- Đặc biệt quan trọng với dependency contract–ABI–backend–frontend–deployment.

## 11.2. Quy trình quản lý tích hợp

- Develop Project Charter.
- Develop Project Management Plan.
- Direct and Manage Project Work.
- Manage Project Knowledge.
- Monitor and Control Project Work.
- Perform Integrated Change Control.
- Close Project or Phase.

## 11.3. Triển khai quản lý tích hợp

### 11.3.1. Phát triển điều lệ dự án

Project Charter gồm:

- Business need.
- Mục tiêu SMART.
- Phạm vi cấp cao.
- Milestone/budget cấp cao.
- Rủi ro/giả định/ràng buộc.
- Stakeholder chính.
- Quyền hạn PM.
- Tiêu chí phê duyệt.

### 11.3.2. Phát triển Project Management Plan

Tích hợp:

- Scope Baseline.
- Schedule Baseline.
- Cost Baseline.
- Quality, resource, communication, risk và procurement plan.
- Change/configuration management plan.
- Development life cycle và governance.

### 11.3.3. Định hướng và quản trị công việc

- Sprint planning/execution.
- Work authorization.
- Issue/decision/action log.
- Quản lý deliverable và work performance data.

### 11.3.4. Quản lý tri thức

- README, technical docs và ADR.
- Code review/pairing/demo.
- Lessons Learned Register cập nhật xuyên suốt.
- Runbook deploy và incident.

### 11.3.5. Theo dõi và kiểm soát

- Dashboard scope/schedule/cost/quality/risk.
- So sánh baseline và actual.
- Forecast milestone/budget.
- Báo cáo status và corrective/preventive action.

### 11.3.6. Kiểm soát thay đổi tích hợp

CCB đánh giá đồng thời:

- Giá trị nghiệp vụ.
- Tác động contract storage/interface.
- Backend/API/database migration.
- ABI/frontend.
- Test/regression.
- Deploy/address/documentation.
- Lịch/chi phí/rủi ro.

### 11.3.7. Configuration Management

- Version source và release tag.
- Lock dependencies.
- Quản lý ABI theo contract version.
- Quản lý Sepolia chain ID và contract address.
- Quản lý `.env.example`, không commit secret.
- Kiểm soát Docker image/configuration.
- Lưu deployment record và verification link.

### 11.3.8. Tích hợp kỹ thuật hệ thống

Mô tả luồng:

1. Frontend ký/gửi transaction hoặc intent.
2. Backend xử lý IPFS/relayer khi cần.
3. Forwarder/Factory/Campaign/SupplierRegistry cập nhật trạng thái on-chain.
4. Listener nhận event.
5. MongoDB lưu notification; Redis/Socket.IO phát tới frontend.
6. Frontend re-fetch dữ liệu on-chain/IPFS và hiển thị trạng thái cuối.

**Hình cần có:** sequence diagram cho direct transaction và gasless transaction.

## 11.4. Đánh giá tài chính bằng NPV

- Initial investment giả định bằng Project Budget: 64.000.000 VNĐ.
- Lợi ích quy đổi giả định từ tiết kiệm kiểm tra, đối soát và quản lý chứng từ: 30.000.000 VNĐ/năm trong 3 năm.
- Discount rate giả định: 12%/năm; không tính terminal value.
- NPV = −64.000.000 + 30.000.000/1,12 + 30.000.000/1,12² + 30.000.000/1,12³ ≈ **8.055.000 VNĐ**.
- NPV dương cho thấy phương án có thể hợp lý trong kịch bản giả định, nhưng không phải dự báo thương mại vì sản phẩm chưa có dữ liệu vận hành thực.
- Phân tích sensitivity với lợi ích 20–40 triệu VNĐ/năm và discount rate 10–15%.

## 11.5. Công cụ hỗ trợ

- Git/GitHub.
- Hardhat, Chai và Solidity coverage.
- React/Vite/TypeScript/ESLint.
- NestJS/Jest/Swagger.
- Docker/Docker Compose.
- MongoDB/Redis/Pinata/RPC/Etherscan.
- GitHub Issues/Projects, Zalo hoặc Messenger, Google Meet, Google Drive và diagrams.net.

## 11.6. Thách thức và bài học kinh nghiệm

- Đồng bộ tài liệu với source.
- Quản lý breaking change ở contract.
- Phân biệt source of truth on-chain và cache off-chain.
- Thiết kế fallback cho dịch vụ ngoài.
- Viết test trước khi tối ưu/refactor.
- Không đánh đổi an toàn tài chính để giảm gas.

## 11.7. Kết luận chương

- Tóm tắt cơ chế phối hợp kế hoạch, thay đổi và configuration.

---

# CHƯƠNG XII. KẾT THÚC DỰ ÁN

## 12.1. Mục tiêu giai đoạn kết thúc

- Xác nhận phạm vi đã hoàn thành.
- Bàn giao sản phẩm và tri thức.
- Đóng hợp đồng/tài khoản cần thiết.
- Đánh giá hiệu quả và lưu lessons learned.

## 12.2. Các hoạt động chính

### 12.2.1. Đánh giá nghiệm thu

- Đối chiếu RTM và Scope Baseline.
- Kiểm tra test/build/deployment.
- Thực hiện UAT theo kịch bản Chương VI.
- Lập danh sách known issues và deferred items.
- Đại diện Nhóm 2 và giảng viên/người được giao nghiệm thu ký hoặc xác nhận biên bản theo quy định môn học.

### 12.2.2. Chuyển giao sản phẩm

Bàn giao:

- Repository/source/tag cuối.
- Smart contract source, ABI, network và address.
- Deployment scripts/configuration template.
- Backend, AI sidecar và Docker configuration.
- Frontend build/configuration.
- Database schema/index và backup/runbook.
- API/Swagger và tài liệu người dùng.
- Test report, security checklist và known limitations.

### 12.2.3. Cập nhật tài sản tổ chức

- Template, checklist, test case, architecture diagram.
- Lessons Learned Register.
- Risk/issue/change/decision log.
- Reusable code và hướng dẫn.

### 12.2.4. Đánh giá hiệu quả dự án

- Scope: planned vs delivered.
- Schedule: baseline vs actual, SPI.
- Cost: budget vs actual, CPI.
- Quality: test/defect/UAT.
- Stakeholder satisfaction.
- Technical outcomes và hạn chế.

### 12.2.5. Rút kinh nghiệm và giải tán nhóm

- Retrospective: Start/Stop/Continue.
- Ghi nhận đóng góp.
- Chuyển quyền sở hữu tài khoản/tài sản.
- Thu hồi quyền/secret không còn cần thiết.

## 12.3. Vai trò của Project Manager

- Điều phối final acceptance.
- Xác nhận closure checklist.
- Đảm bảo không còn nghĩa vụ chưa có owner.
- Phát hành final report và lưu hồ sơ.

## 12.4. Kết quả đầu ra

- Accepted deliverables.
- Final Project Report.
- Handover Record.
- Procurement Closure.
- Lessons Learned và archived documents.
- Release/deployment record.

## 12.5. Bài học kinh nghiệm dự kiến

- Thiết kế quyền và invariant trước khi viết UI.
- Contract change phải kéo theo ABI, integration test và tài liệu.
- IPFS bảo vệ tính toàn vẹn nội dung, không tự xác minh tính trung thực.
- On-chain là nguồn dữ liệu tài chính chính; off-chain tăng UX và khả năng truy vấn.
- Cần buffer lớn cho integration và test bảo mật.
- Quản lý secret/deployment address phải là quy trình chính thức.

## 12.6. Hạn chế và hướng phát triển

- Audit độc lập và formal verification.
- Multi-chain/L2 để giảm phí.
- Account abstraction nâng cao.
- Oracle/chứng thực ngoài chuỗi đáng tin cậy.
- Decentralized identity/KYC khi có yêu cầu pháp lý.
- IPFS redundancy/Filecoin.
- Monitoring, analytics và disaster recovery production-grade.
- Governance/community dispute mechanism.

## 12.7. Kết luận chương

- Khẳng định trạng thái kết thúc, kết quả bàn giao và phần việc tương lai.

---

# KẾT LUẬN

- Tóm tắt bài toán và giải pháp.
- Tóm tắt việc áp dụng các lĩnh vực quản trị dự án.
- Đánh giá mức độ đạt mục tiêu.
- Nêu đóng góp nổi bật: minh bạch on-chain, kiểm soát giải ngân, IPFS evidence, Supplier/Verifier, relayer/AI gas optimization.
- Nêu giới hạn và hướng phát triển, không tuyên bố vượt quá bằng chứng kiểm thử.

---

# TÀI LIỆU THAM KHẢO

Nhóm nguồn cần sử dụng:

- PMBOK Guide và giáo trình quản trị dự án phần mềm.
- Ethereum, Solidity và EIP chính thức.
- OpenZeppelin Contracts.
- Hardhat documentation.
- React, Vite, NestJS, MongoDB, Redis, Socket.IO.
- IPFS và Pinata.
- Các nghiên cứu về blockchain trong từ thiện/gây quỹ.
- Mọi nguồn web ghi tác giả/tổ chức, tiêu đề, URL và ngày truy cập.

Không dùng PDF mẫu như nguồn nội dung chuyên môn; chỉ dùng để tham khảo cấu trúc trình bày.

---

# PHỤ LỤC

## Phụ lục A. Project Charter

- Bản điều lệ đã hoàn chỉnh và phê duyệt.

## Phụ lục B. Stakeholder Register

- Stakeholder, vai trò, power, interest, expectation và engagement strategy.

## Phụ lục C. Requirements Traceability Matrix

- Requirement ID → stakeholder → priority → WBS → source module → test → trạng thái nghiệm thu.

## Phụ lục D. Use Case/User Story

- Use Case tổng quát và đặc tả các luồng chính.

## Phụ lục E. WBS và WBS Dictionary

- WBS dạng cây và bảng work package.

## Phụ lục F. Schedule

- Activity list, network diagram, PERT, critical path và Gantt chart.

## Phụ lục G. Cost Baseline

- Ước lượng, budget, reserve, S-curve và EVM report.

## Phụ lục H. Quality/Test Report

- Test plan, test result, coverage, defect summary và UAT.

## Phụ lục I. Organization/RACI

- Organization chart, responsibility matrix và resource calendar.

## Phụ lục J. Communication Matrix

- Kênh, tần suất, template báo cáo và escalation path.

## Phụ lục K. Risk Register

- Risk score, owner, response, residual risk và trạng thái.

## Phụ lục L. Procurement Plan

- Make-or-buy, vendor scoring, SLA và closure checklist.

## Phụ lục M. Change/Issue/Decision Log

- Toàn bộ thay đổi, vấn đề và quyết định quan trọng.

## Phụ lục N. Kiến trúc và triển khai

- Architecture diagram.
- Smart contract diagram/state machine.
- API/event/sequence diagram.
- Sepolia addresses và Etherscan links.
- Mẫu `.env` không chứa secret.

## Phụ lục O. Hướng dẫn demo

- Chuẩn bị ví/test ETH.
- Luồng admin, manager, donor, supplier và verifier.
- Các transaction hash/CID mẫu.
- Kịch bản dự phòng khi Sepolia hoặc dịch vụ ngoài lỗi.

---

# CHECKLIST VÀ TRẠNG THÁI TRƯỚC KHI CHUYỂN OUTLINE THÀNH BÁO CÁO

- [x] Chốt tên đề tài, Nhóm 2, giảng viên, trường và môn học.
- [ ] Bổ sung khoa/viện theo biểu mẫu chính thức.
- [x] Bổ sung tên và mã số sinh viên của ba thành viên thực hiện tiểu luận.
- [ ] Bổ sung phân vai thật của ba thành viên trong nhóm môn học.
- [x] Chốt Schedule Baseline 01/04–30/06/2026 và 6 sprint.
- [x] Chốt ngân sách giả định 64.000.000 VNĐ, đơn giá và dự phòng.
- [x] Phân loại chức năng hiện có và phần ngoài phạm vi theo source.
- [ ] Khi viết báo cáo: chạy lại toàn bộ test/build/lint và lưu kết quả thực tế.
- [x] Đối chiếu địa chỉ contract, ABI và Sepolia theo repository hiện tại.
- [x] Đối chiếu UI với smart contract và backend ở cấp outline.
- [x] Hoàn thiện khung RTM, WBS, RACI, Risk Register và các phụ lục cần lập.
- [ ] Khi viết báo cáo: dựng Gantt, network diagram, RACI và các bảng hoàn chỉnh từ khung.
- [ ] Khi viết báo cáo: bổ sung hình/bảng đúng số thứ tự và dẫn chiếu.
- [ ] Khi viết báo cáo: trích dẫn nguồn kỹ thuật và học thuật đúng chuẩn.
- [x] Loại bỏ chỉ dẫn sao chép chung chung và số liệu không có nhãn giả định.
- [x] Không tuyên bố có KYC, AI fraud detection, Mainnet hoặc audit độc lập.
- [ ] Sau khi hoàn thiện nội dung: rà soát chính tả, thuật ngữ Việt–Anh và định dạng.
