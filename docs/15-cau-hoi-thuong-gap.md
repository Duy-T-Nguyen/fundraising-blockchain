# 15 Câu hỏi thường gặp và câu trả lời cho dự án Fundraising Blockchain

## 1. Dự án này làm gì?
Dự án Fundraising Blockchain là một nền tảng gây quỹ phi tập trung. Thay vì tin tưởng vào một tổ chức trung gian, tất cả tiền và quy trình được điều khiển bởi Smart Contract trên Ethereum. Cơ chế bao gồm: tạo chiến dịch, đóng góp, tạo yêu cầu chi tiêu, kiểm duyệt bằng chứng và biểu quyết trước khi giải ngân.

## 2. Cấu trúc dự án gồm những phần nào?
Dự án là một monorepo gồm ba phần chính:
- `bc/`: Blockchain, chứa Smart Contracts, Hardhat, tests.
- `be/`: Backend NestJS, xử lý upload file lên IPFS và lưu metadata.
- `fe/`: Frontend React/Vite, giao diện cho người dùng.

## 3. Smart Contract chính của dự án là gì?
Smart Contract chính là `CampaignFactory.sol` và `Campaign.sol`. `CampaignFactory` dùng để tạo chiến dịch mới, còn `Campaign` quản lý một chiến dịch cụ thể, bao gồm nhận đóng góp, tạo request và xử lý biểu quyết.

## 4. IPFS được dùng để làm gì?
IPFS dùng để lưu trữ bằng chứng và metadata của chiến dịch. Backend upload file hoặc JSON lên IPFS và trả về `CID` (hash). Smart Contract chỉ lưu `CID`, giúp giảm chi phí gas và đảm bảo tính bất biến của bằng chứng.

## 5. Quy trình giải ngân tiền như thế nào?
Luồng giải ngân cơ bản:
1. Donor gửi ETH vào chiến dịch.
2. Manager tạo `request` yêu cầu chi tiêu và đính kèm bằng chứng IPFS.
3. Donor/Validator biểu quyết cho request.
4. Khi đủ phiếu và không bị từ chối, smart contract chuyển tiền tới nhà cung cấp.
5. Nếu request bị từ chối hoặc hết hạn, tiền được giải phóng về ngân sách chiến dịch.

## 6. Ai có quyền tạo chiến dịch và ai có quyền tạo yêu cầu?
- Người gọi `createCampaign` trong `CampaignFactory` sẽ tạo chiến dịch mới và trở thành `manager` của chiến dịch đó.
- `manager` của chiến dịch có quyền tạo `request` chi tiêu.

## 7. Ai có quyền vote cho request?
Tất cả donors đã đóng góp cho chiến dịch đều có quyền vote. Quyền vote thường được tính theo tỷ lệ số tiền đã đóng góp, tức người đóng nhiều tiền sẽ có nhiều trọng số hơn.

## 8. Request bị reject thì chuyện gì xảy ra?
Khi request bị từ chối (hard reject), hệ thống tự động giải phóng quỹ đã bị khóa (`lockedFunds`) và trả lại cho ngân sách khả dụng của chiến dịch. Điều này giúp tránh tình trạng tiền bị khóa vô thời hạn.

## 9. Hướng dẫn cài đặt nhanh cho phần Blockchain?
1. Vào thư mục `bc/`.
2. Chạy `yarn install`.
3. Tạo file `.env` nếu cần (thông tin private key, RPC, v.v.).
4. Chạy `npx hardhat compile` để biên dịch.
5. Chạy test với `npx hardhat test`.

## 10. Tại sao dự án dùng Hardhat?
Hardhat là framework chuẩn để phát triển Solidity. Nó hỗ trợ compile, test, deploy, và chạy mạng Ethereum giả lập. Hardhat cũng tích hợp tốt với TypeScript, Ethers.js và plugin kiểm tra bảo mật.

## 11. Làm sao backend tương tác với IPFS?
Backend NestJS dùng API của Pinata hoặc IPFS client để upload file và JSON metadata. Sau khi upload, backend nhận lại `CID` và gửi về frontend hoặc dùng để gọi smart contract.

## 12. Quyền lợi của việc lưu metadata trên IPFS là gì?
- Không tốn gas lưu chữ ký và dữ liệu lớn trực tiếp vào blockchain.
- Dữ liệu được lưu bất biến, ai cũng có thể truy cập bằng `CID`.
- Hỗ trợ nội dung phức tạp như tên, mô tả, ảnh, bằng chứng.

## 13. Dự án đã triển khai lên testnet chưa?
Có, `README` ghi rằng các hợp đồng đã triển khai trên Sepolia Testnet. Thông tin địa chỉ contract được lưu trong tài liệu và có thể dùng để kiểm tra trên blockchain.

## 14. Test trong `bc/test/` kiểm tra những tính năng nào?
Các test cover:
- Tạo chiến dịch và đóng góp.
- Tạo request và quản lý trạng thái request.
- Voting/duyệt yêu cầu và giải ngân.
- Trường hợp request bị reject hoặc hết hạn.
- Tối ưu gas và tính năng `lockedFunds`.

## 15. Có điểm nào cần chú ý về bảo mật?
- Smart contract phải kiểm tra quyền hạn rõ ràng (chỉ manager tạo request, chỉ donor vote).
- Phải khóa đủ tiền trước khi tạo request để tránh chi quá vốn.
- Metadata IPFS chỉ là tham chiếu, nên cần validate dữ liệu nội dung nếu dùng bên ngoài.
- Tránh lưu khóa riêng (private key) trong mã nguồn hoặc repo công khai.

## 16. Cơ chế đồng thuận trong dự án này hoạt động ra sao?
Dự án không dùng cơ chế đồng thuận blockchain như Proof-of-Work/Proof-of-Stake để quyết định chi tiêu. Thay vào đó, cơ chế đồng thuận ở tầng ứng dụng là:
- Tất cả donors đã đóng góp là những người có quyền vote.
- Vote được tính theo **trọng số đóng góp** (số ETH đã đóng) chứ không phải số lượng cá nhân.
- Yêu cầu chỉ được giải ngân khi đạt **trên 50% tổng số vốn đã quyên góp** vào thời điểm tạo request.
- Trong một số trường hợp request nhỏ, hệ thống còn chọn ra một nhóm **3 validator ngẫu nhiên** từ donors để phê duyệt nhanh hơn.

### Vì sao chọn cơ chế đồng thuận này?
- **Cân bằng giữa quyền kiểm soát và hiệu quả**: Người đóng góp nhiều tiền có nhiều tiếng nói hơn, phù hợp với rủi ro tài chính thực tế.
- **Giảm thiểu thao túng**: Vì vote dựa trên số ETH đóng góp, attacker cần kiểm soát nhiều vốn để chi phối quyết định.
- **Đơn giản và minh bạch**: Mô hình dùng trọng số đóng góp dễ hiểu và dễ audit hơn so với cơ chế phức tạp.
- **Tăng tính công bằng**: Người quản lý (manager) không được phép vote, đảm bảo quyết định được đưa ra bởi cộng đồng donor chứ không phải người tạo request.
- **Hỗ trợ kiểm duyệt nhanh với request nhỏ**: Chọn validator ngẫu nhiên cho request nhỏ giúp giảm tải vote toàn bộ donor khi giá trị yêu cầu thấp.

## 17. Làm sao hệ thống đảm bảo request đã gửi được xác thực trước khi giải ngân?
Quy trình xác thực bao gồm 2 tầng:
- **Tầng vote của donors**: donor click `approveRequest()` để đồng ý, hệ thống ghi lại số tiền họ đã đóng góp và chỉ tính một lần.
- **Tầng xác nhận bởi `verifier` on-chain**: recipient phải nộp bằng chứng (`submitProof` hoặc `submitMilestoneProof`) và một địa chỉ verifier được chỉ định phải gọi `verifyRequest()` hoặc `verifyMilestone()` để xác nhận.

Nếu verifier từ chối (`rejectRequest()`), request bị huỷ và tiền bị giải phóng ngay trong `lockedFunds`.

## 18. Làm sao việc giải ngân diễn ra với request `single`?
Với request loại `SINGLE`:
1. Manager tạo request bằng `createRequest(metadataCID, value, recipient, verifier)`.
2. Hệ thống khóa `value` vào `lockedFunds`, tránh dùng cho request khác.
3. Donors vote `approveRequest(index)` để tích luỹ `totalApprovalWeight`.
4. Recipient upload bằng chứng bằng `submitProof(index)`.
5. Verifier duyệt bằng `verifyRequest(index)`.
6. Nếu đã đủ điều kiện vote và verify, manager gọi `finalizeRequest(index)`.
7. Smart contract chuyển toàn bộ `value` tới recipient, giảm `lockedFunds` và đánh dấu request hoàn thành.

### Vì sao chọn cơ chế giải ngân này cho `single`?
- **Đơn giản và nhanh gọn**: Request đơn lẻ chỉ cần một lần duyệt và một lần chuyển tiền.
- **Giảm chi phí giao dịch**: Chỉ cần gọi `finalizeRequest()` một lần sau khi đã đủ vote và verify.
- **Đảm bảo tính minh bạch**: Mọi bước (khởi tạo, vote, nộp bằng chứng, verify, giải ngân) đều được lưu trên blockchain.
- **Khóa sẵn quỹ**: `lockedFunds` bảo đảm số tiền này không bị dùng cho request khác, tránh thâm hụt.

## 19. Request `multi` / `milestone` khác `single` như thế nào?
Request loại `MULTI` là request nhiều giai đoạn (milestone):
- Manager khai báo nhiều `milestoneValues[]` và `milestoneMetadataCIDs[]` khi gọi `createMultiStageRequest()`.
- Tổng `value` của tất cả milestone bị khóa vào `lockedFunds` ngay từ đầu.
- Sau khi donor vote đủ, mỗi milestone vẫn phải:
  + recipient nộp chứng từ từng milestone bằng `submitMilestoneProof(index)`,
  + verifier gọi `verifyMilestone(index)` để duyệt milestone đó.
- Manager gọi `executeMilestone(index)` để giải ngân từng milestone một.
- Mỗi milestone thành công sẽ giảm `lockedFunds` tương ứng và tiến `currentMilestone` lên.
- Khi tất cả milestone hoàn tất, request được chuyển sang trạng thái `COMPLETED`.

### Vì sao chọn cơ chế `multi/milestone`?
- **Phù hợp với dự án dài hạn**: Dự án lớn thường phải giải ngân theo từng giai đoạn, không nên chuyển toàn bộ tiền một lần.
- **Giảm rủi ro**: Nếu milestone đầu tiên không đạt yêu cầu, chỉ phần tiền đó bị giữ lại, các giai đoạn sau bị dừng.
- **Giám sát liên tục**: Verifier và donors có thể kiểm tra tiến độ từng milestone trước khi chuyển tiếp.
- **An toàn cho donor**: Loại request này giới hạn tổng số tiền đã bị khóa, đồng thời giải ngân từng phần khi có bằng chứng xác thực.

## 20. Khi nào request bị huỷ hoặc request hết hạn?
- Request bị huỷ nếu verifier gọi `rejectRequest(index)` với lý do, hoặc manager dùng `cancelRequest(index)` khi request chưa giải ngân giai đoạn nào.
- Nếu `block.timestamp` vượt qua `createdAt + VOTING_PERIOD`, người ủng hộ không thể vote nữa và request vẫn không thể hoàn tất nếu chưa đủ phiếu. Nếu không đủ vote, request không thể gọi `finalizeRequest()` hoặc `executeMilestone()`.
- Khi request bị huỷ, `lockedFunds` được giảm tương ứng và số tiền đó trở lại quỹ khả dụng của chiến dịch.

## 21. Dự án có dùng mã hóa dữ liệu không?
- Dữ liệu trên blockchain tự thân đã được bảo mật bằng cơ chế chữ ký số và địa chỉ ví, nhưng nội dung metadata/IPFS không được mã hóa mặc định.
- Dữ liệu nhạy cảm như private key không bao giờ lưu trong hợp đồng hoặc repository.
- Backend có thể mã hóa dữ liệu trước khi upload lên IPFS nếu cần, nhưng hiện tại dự án chủ yếu dùng IPFS để lưu bằng chứng và metadata công khai.

## 22. Cơ chế bảo mật chính trong hợp đồng là gì?
- **Quyền truy cập**: `onlyManager`, `onlyActive`, `onlyManager nonReentrant` bảo vệ các hàm quan trọng.
- **Kiểm tra địa chỉ**: request chỉ chấp nhận recipient/verifier hợp lệ, không cho manager làm recipient hoặc verifier.
- **Giới hạn quỹ**: `lockedFunds` đảm bảo không dùng tiền cho request khác và tránh over-withdraw.
- **Xác thực step-by-step**: proof phải được submit, verifier phải duyệt, và donors phải vote đủ mới giải ngân.
- **Kháng double-vote**: gán `requestVotedAmount[index][sender]` và `requestValidatorApprovals[index][sender]` để chống vote nhiều lần.

## 23. Làm sao tránh rủi ro nội dung IPFS bị thay đổi?
- IPFS lưu theo CID hash, một khi file được upload thì CID đó không thay đổi.
- Smart contract chỉ lưu CID, nên khi lấy metadata người dùng có thể check lại CID để xác thực.
- Nếu backend hoặc frontend hiển thị dữ liệu từ CID, cần xác thực CID và không tin tưởng dữ liệu bên ngoài nếu không qua kiểm duyệt.

## 24. Có điểm yếu an ninh nào cần lưu ý?
- Nếu verifier bị xâm nhập, attacker có thể duyệt hoặc từ chối request không đúng.
- Nếu manager có quyền tạo request mà không có kiểm soát nội bộ tốt, họ có thể lạm dụng create nhiều request.
- IPFS metadata công khai nên không dùng để lưu thông tin nhạy cảm.
- Cần kiểm tra kỹ hợp đồng `SupplierRegistry.sol` vì recipient phải là supplier whitelist.

## 25. EIP là gì và dự án có liên quan tới EIP nào không?
- **EIP** (Ethereum Improvement Proposal) là đề xuất tiêu chuẩn cho Ethereum, gồm EIP, ERC, và RFP.
- Dự án không trực tiếp triển khai token ERC mà chủ yếu dùng chuẩn EIP để giao tiếp với ví, RPC và định dạng dữ liệu JSON-RPC.
- Nếu dùng `Forwarder.sol`, dự án có thể liên quan đến **EIP-712** cho chữ ký dữ liệu cấu trúc (typed structured data), giúp ký giao dịch off-chain an toàn.

## 26. ERC là gì và có ERC nào được dùng trong dự án?
- **ERC** là Ethereum Request for Comments, phần mở rộng của EIP cho các tiêu chuẩn token và interface.
- Dự án này không triển khai token ERC-20 hay ERC-721, nhưng có thể tương tác với các contract ERC khác nếu cần.
- `SupplierRegistry.sol` và `Forwarder.sol` thường tuân theo các chuẩn interface và logic tương tự ERC, ví dụ `IERC20` nếu muốn mở rộng thành token payment.

## 27. ECDSA là gì và dùng ở đâu?
- **ECDSA** (Elliptic Curve Digital Signature Algorithm) là thuật toán chữ ký số chuẩn trên Ethereum.
- Mỗi giao dịch Ethereum được ký bằng ECDSA để chứng minh sở hữu private key của địa chỉ.
- Trong dự án, ECDSA có thể được dùng trong `Forwarder.sol` để xác minh chữ ký trước khi thực hiện giao dịch thay mặt người dùng (gasless transaction).

## 28. `Forwarder.sol` liên quan gì tới ECDSA và gasless transaction?
- `Forwarder.sol` chứa logic `verify()` và `execute()` cho `ForwardRequest` có chữ ký từ người dùng.
- Khi user ký request off-chain bằng ECDSA, forwarder xác minh chữ ký và nonce, sau đó thực hiện giao dịch bằng ETH được gửi đến contract.
- Đây là cơ chế **meta-transaction**, cho phép người dùng tương tác mà không trực tiếp trả gas.

## 29. Làm sao đảm bảo dữ liệu chữ ký không bị replay?
- `Forwarder.sol` dùng `nonce` cho mỗi địa chỉ, nên mỗi chữ ký chỉ dùng được một lần.
- Mã hash của request được tạo theo mẫu EIP-712 để ngăn replay trên các network hoặc hợp đồng khác.
- Kết hợp với địa chỉ `from`, `to`, `value`, `gas`, và `data`, chữ ký chỉ hợp lệ cho một giao dịch cụ thể.

---

## Ghi chú thêm
File này được tạo để chuẩn bị trả lời phỏng vấn hoặc giải thích nhanh về dự án. Nếu cần, bạn có thể mở rộng bằng cách bổ sung:
- các câu hỏi về `Forwarder.sol`, `SupplierRegistry.sol`, `RequestLib.sol`,
- chi tiết triển khai backend IPFS,
- cách interaction qua frontend hoặc script deploy.
