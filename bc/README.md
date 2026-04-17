# 📚 Tài Liệu Hướng Dẫn Chi Tiết — Fundraising Blockchain

> **Dành cho người mới học Blockchain, Solidity, và Hardhat.**
>
> Tài liệu này giải thích **từng file**, **cấu trúc dự án**, **cách hoạt động**, **cách cài đặt**, **cách deploy**, và **cách tương tác** với Smart Contract trên mạng Ethereum.

---

## 📖 Mục Lục

1. [Tổng Quan Dự Án](#-tổng-quan-dự-án)
2. [Kiến Thức Nền Tảng Cho Người Mới](#-kiến-thức-nền-tảng-cho-người-mới)
3. [Cấu Trúc Thư Mục](#-cấu-trúc-thư-mục)
4. [Chi Tiết Từng File](#-chi-tiết-từng-file)
   - [File Cấu Hình](#1-file-cấu-hình)
   - [Smart Contracts](#2-smart-contracts-thư-mục-contracts)
   - [Scripts](#3-scripts-thư-mục-scripts)
   - [Tests](#4-tests-thư-mục-test)
5. [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
6. [Hướng Dẫn Cài Đặt](#-hướng-dẫn-cài-đặt-từ-đầu)
7. [Hướng Dẫn Compile & Test](#-hướng-dẫn-compile--test)
8. [Hướng Dẫn Deploy](#-hướng-dẫn-deploy)
9. [Hướng Dẫn Tương Tác Với Contract](#-hướng-dẫn-tương-tác-với-contract)
10. [Giải Thích Luồng Hoạt Động & Cơ Chế Rút Tiền](#-giải-thích-luồng-hoạt-động--cơ-chế-rút-tiền)
11. [Humanitarian Accountability Protocol (DAO x WFP)](#-humanitarian-accountability-protocol-dao-x-wfp)
12. [Các Lỗi Thường Gặp & Cách Khắc Phục](#-các-lỗi-thường-gặp--cách-khắc-phục)
13. [Thuật Ngữ Blockchain](#-thuật-ngữ-blockchain-glossary)

---

## 🎯 Tổng Quan Dự Án

### Dự án này là gì?

**Fundraising Blockchain** là một nền tảng gây quỹ phi tập trung (decentralized) chạy trên mạng Ethereum. Thay vì tin tưởng một tổ chức trung gian giữ tiền, tiền quỹ được quản lý bởi **Smart Contract** — một chương trình chạy tự động trên blockchain, không ai có thể thay đổi sau khi deploy.

### Vấn đề mà dự án giải quyết

Trong gây quỹ truyền thống, người quyên góp phải **tin tưởng** rằng người quản lý sẽ sử dụng tiền đúng mục đích. Dự án này giải quyết bằng cách:

| Vấn đề truyền thống | Giải pháp Blockchain |
|---|---|
| Người quản lý có thể lạm dụng tiền quỹ | Tiền bị khóa trong Smart Contract, không ai rút được tùy tiện |
| Không minh bạch chi tiêu | Mọi giao dịch được ghi lại vĩnh vễn trên blockchain |
| Chứng từ có thể bị làm giả / thất lạc | **Bằng chứng (hóa đơn, ảnh) được lưu trên IPFS** (bất biến) |
| Phải tin tưởng bên trung gian | Code tự động thực thi, không cần tin tưởng ai |
| Donors không có quyền quyết định | Donors phải **biểu quyết** (vote) trước khi tiền được giải ngân |

### Công nghệ sử dụng

| Công nghệ | Vai trò | Giải thích đơn giản |
|---|---|---|
| **Solidity** | Ngôn ngữ viết Smart Contract | Giống JavaScript nhưng chạy trên Blockchain |
| **Hardhat** | Framework phát triển | Bộ công cụ để compile, test, deploy Smart Contract |
| **NestJS** | Backend API (be/) | Xử lý upload file và tương tác với IPFS |
| **IPFS / Pinata** | Lưu trữ bằng chứng | Hệ thống lưu trữ file phi tập trung (không thể sửa/xóa) |
| **Ethers.js** | Thư viện JavaScript | Giúp JavaScript giao tiếp với Blockchain |
| **OpenZeppelin** | Thư viện bảo mật | Các module an toàn đã được kiểm tra kỹ |
| **TypeScript** | Ngôn ngữ lập trình | JavaScript có thêm kiểu dữ liệu, giảm lỗi |
| **Chai** | Thư viện test | Framework viết unit test |
| **dotenv** | Quản lý biến môi trường | Đọc thông tin nhạy cảm từ file `.env` |

---

## 🧠 Kiến Thức Nền Tảng Cho Người Mới

### Blockchain là gì?

Hãy tưởng tượng blockchain là một **cuốn sổ kế toán công khai** mà:
- **Ai cũng có thể đọc** (minh bạch)
- **Không ai có thể xóa hay sửa** dữ liệu đã ghi (bất biến)
- **Không có ai kiểm soát** — nó chạy trên hàng ngàn máy tính trên thế giới (phi tập trung)

### Smart Contract là gì?

Smart Contract là một **chương trình máy tính** được lưu trữ và chạy trên blockchain. Một khi đã deploy (triển khai) lên blockchain:
- **Không ai có thể thay đổi code** — kể cả người tạo ra nó
- **Tự động thực thi** khi đáp ứng điều kiện
- **Lưu trữ dữ liệu** (trạng thái) trực tiếp trên blockchain

### Ethereum là gì?

Ethereum là một nền tảng blockchain cho phép chạy Smart Contract. Đơn vị tiền tệ của nó là **ETH** (Ether).

### Gas là gì?

Mỗi thao tác trên Ethereum đều tốn **gas** (phí giao dịch). Gas được trả bằng ETH. Ví dụ:
- Gửi ETH cho ai đó: tốn ~21.000 gas
- Deploy một Smart Contract: tốn hàng triệu gas
- Gọi hàm contract: tốn vài chục ngàn gas

### Testnet vs Mainnet

| | Testnet (Sepolia) | Mainnet |
|---|---|---|
| ETH | Miễn phí (lấy từ faucet) | Tiền thật |
| Mục đích | Phát triển & thử nghiệm | Sản phẩm chính thức |
| Rủi ro | Không có | Mất tiền nếu bug |

### Hardhat là gì?

Hardhat là một **framework phát triển Ethereum** giúp bạn:
- **Biên dịch** (compile) Solidity thành bytecode
- **Test** Smart Contract trên máy local
- **Deploy** Smart Contract lên blockchain
- **Debug** khi có lỗi
- Chạy một **blockchain giả lập** (Hardhat Network) trên máy

### Wei là gì?

**Wei** là đơn vị nhỏ nhất của ETH, giống như xu (cent) là đơn vị nhỏ nhất của đồng đô la.

```
1 ETH = 1.000.000.000.000.000.000 Wei (10^18 Wei)
1 ETH = 1.000.000.000 Gwei (10^9 Gwei)
```

Trong Smart Contract, mọi giá trị tiền đều tính bằng **Wei**.

---

## 🗂 Cấu Trúc Thư Mục

```
fundraising-blockchain/             ← Thư mục gốc dự án (Monorepo)
├── bc/                             ← ⭐ CHUYÊN VỀ BLOCKCHAIN (Mã nguồn này)
│   ├── contracts/                  ← Smart Contracts (Solidity)
│   ├── test/                       ← Unit tests cho Smart Contracts
│   ├── scripts/                    ← Scripts deploy & interact
│   └── hardhat.config.ts           ← Cấu hình dự án Blockchain
│
├── be/                             ← ⭐ CHUYÊN VỀ BACKEND (NestJS)
│   ├── src/                        ← Xử lý Logic Backend & IPFS Evidence
│   └── .env                        ← Cấu hình API Key Pinata
│
├── fe/                             ← ⭐ CHUYÊN VỀ FRONTEND (React/Vite)
│   └── src/                        ← Giao diện người dùng
│
└── README.md                       ← Tài liệu tổng quan toàn bộ hệ thống
```

> **Ghi chú**: Các thư mục `artifacts/`, `cache/`, `typechain-types/`, `node_modules/` được tự động sinh ra. Bạn **không cần** (và không nên) chỉnh sửa chúng.

---

## 📄 Chi Tiết Từng File

### 1. File Cấu Hình

---

#### 📌 `package.json` — Quản lý thư viện

**Vai trò**: Khai báo tên dự án, phiên bản, và tất cả thư viện (dependencies) cần thiết.

```json
{
  "name": "fundraising-blockchain",
  "version": "1.0.0",
  "description": "A decentralized fundraising platform built on Ethereum",
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",  // Bộ công cụ Hardhat (ethers, chai, typechain...)
    "@types/chai": "^4.3.0",                        // TypeScript types cho Chai
    "@types/mocha": "^10.0.0",                      // TypeScript types cho Mocha
    "@types/node": "^20.0.0",                       // TypeScript types cho Node.js
    "hardhat": "^2.22.0",                            // Framework Hardhat
    "ts-node": "^10.9.0",                            // Chạy TypeScript trực tiếp
    "typescript": "^5.0.0"                           // Trình biên dịch TypeScript
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.1.0",             // Thư viện bảo mật OpenZeppelin
    "dotenv": "^16.4.0"                              // Đọc biến môi trường từ .env
  }
}
```

**Giải thích**:
- `devDependencies`: Thư viện chỉ cần khi **phát triển** (test, compile) — không cần khi chạy trên blockchain
- `dependencies`: Thư viện cần khi **biên dịch** Smart Contract
- `@nomicfoundation/hardhat-toolbox`: Gói "tất cả trong một" bao gồm ethers.js, chai, mocha, typechain, solidity-coverage, gas-reporter...

---

#### 📌 `hardhat.config.ts` — Cấu hình Hardhat (⭐ Quan trọng)

**Vai trò**: File CẤU HÌNH TRUNG TÂM của Hardhat. Mọi lệnh `npx hardhat ...` đều đọc file này.

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Đọc biến môi trường từ file .env
dotenv.config();

// Lấy giá trị từ .env, nếu không có thì dùng chuỗi rỗng
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// Kiểm tra Private Key có hợp lệ không (phải đúng 64 ký tự hex)
const rawKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY.slice(2) : PRIVATE_KEY;
const isValidPrivateKey = rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",       // Phiên bản Solidity sử dụng
    settings: {
      optimizer: {
        enabled: true,        // Bật tối ưu hóa bytecode
        runs: 200,            // Số lần chạy dự kiến (cân bằng giữa size và gas)
      },
    },
  },

  networks: {
    // Chỉ thêm network Sepolia nếu Private Key hợp lệ
    ...(isValidPrivateKey
      ? {
          sepolia: {
            url: SEPOLIA_RPC_URL,          // URL kết nối tới node Sepolia
            accounts: [`0x${rawKey}`],     // Tài khoản dùng để deploy/giao dịch
          },
        }
      : {}),
    // Hardhat Network (mạng giả lập) luôn có sẵn — không cần khai báo
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",  // API key để verify contract
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",   // Bật/tắt báo cáo gas khi test
  },
};

export default config;
```

**Giải thích chi tiết**:

| Thuộc tính | Ý nghĩa |
|---|---|
| `solidity.version` | Phiên bản compiler Solidity. Phải khớp với `pragma` trong contract |
| `solidity.settings.optimizer` | Tối ưu bytecode để giảm chi phí gas khi deploy và gọi hàm |
| `networks.sepolia.url` | URL của RPC Provider (Alchemy/Infura) — cổng kết nối tới mạng Sepolia |
| `networks.sepolia.accounts` | Private key của ví dùng để ký giao dịch |
| `etherscan.apiKey` | Dùng để verify (xác minh mã nguồn) trên Etherscan |
| `gasReporter` | Khi bật, sau mỗi lần test sẽ hiện bảng chi phí gas của từng hàm |

---

#### 📌 `.env` — Biến môi trường (⚠️ BÍ MẬT)

**Vai trò**: Lưu trữ thông tin nhạy cảm. File này **KHÔNG ĐƯỢC** đẩy lên GitHub.

```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your_private_key_64_hex_characters_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

| Biến | Ý nghĩa | Lấy ở đâu? |
|---|---|---|
| `SEPOLIA_RPC_URL` | URL kết nối tới mạng Sepolia | Đăng ký miễn phí tại [Alchemy](https://alchemy.com) hoặc [Infura](https://infura.io) |
| `PRIVATE_KEY` | Khóa bí mật của ví Ethereum | Xuất từ MetaMask: Account → Account Details → Export Private Key |
| `ETHERSCAN_API_KEY` | API key của Etherscan | Đăng ký tại [etherscan.io/apis](https://etherscan.io/apis) |

> ⚠️ **CẢNH BÁO**: PRIVATE_KEY giống như **mật khẩu ngân hàng** của bạn. Ai có nó sẽ kiểm soát hoàn toàn ví của bạn. KHÔNG BAO GIỜ chia sẻ, commit lên Git, hay gửi cho ai.

---

#### 📌 `tsconfig.json` — Cấu hình TypeScript

```json
{
  "compilerOptions": {
    "target": "es2020",                    // Biên dịch sang ES2020 (hỗ trợ BigInt)
    "module": "commonjs",                  // Dùng hệ thống module CommonJS
    "esModuleInterop": true,               // Cho phép import thư viện CommonJS dễ dàng
    "forceConsistentCasingInFileNames": true, // Bắt buộc viết đúng hoa/thường tên file
    "strict": true,                        // Bật chế độ kiểm tra kiểu nghiêm ngặt
    "skipLibCheck": true,                  // Bỏ qua kiểm tra kiểu trong node_modules
    "resolveJsonModule": true,             // Cho phép import file .json
    "rootDir": "."                         // Thư mục gốc của source code
  }
}
```

---

#### 📌 `.gitignore` — File Git bỏ qua

```gitignore
node_modules      # Thư viện đã cài — quá lớn, không cần commit
.env              # File bí mật — KHÔNG BAO GIỜ commit

# Hardhat files (tự sinh khi compile)
/cache
/artifacts

# TypeChain files (tự sinh)
/typechain
/typechain-types

# Coverage (báo cáo test coverage)
/coverage
/coverage.json

# Hardhat Ignition
ignition/deployments/chain-31337
```

---

### 2. Smart Contracts (Thư mục `contracts/`)

Đây là phần **QUAN TRỌNG NHẤT** — code chạy trực tiếp trên blockchain Ethereum.

---

#### 📌 `contracts/Errors.sol` — Định nghĩa lỗi

**Vai trò**: Khai báo tất cả các lỗi tùy chỉnh (Custom Errors) được sử dụng trong hệ thống.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// =====================
// Lỗi Quyền Truy Cập
// =====================
error NotManager();         // Không phải manager (người quản lý)
error NotDonor();           // Không phải donor (người đã đóng góp)
error ManagerCannotVote();  // Manager không được phép bỏ phiếu

// =====================
// Lỗi Trạng Thái
// =====================
error AlreadyVoted();       // Đã bỏ phiếu rồi (mỗi người chỉ được vote 1 lần)
error RequestCompleted();   // Yêu cầu đã hoàn thành (đã giải ngân)
error NotEnoughApprovals(); // Chưa đủ số phiếu đồng ý (cần >50%)
error CampaignNotActive();  // Chiến dịch đã bị tạm dừng

// =====================
// Lỗi Xác Thực Dữ Liệu
// =====================
error InsufficientFunds();  // Số tiền không đủ
error InvalidAddress();     // Địa chỉ không hợp lệ (ví dụ: 0x000...000)
error InvalidRequestIndex();// Chỉ số yêu cầu không tồn tại
error EmptyDescription();   // Mô tả trống
error TransferFailed();     // Chuyển tiền thất bại
```

**Tại sao dùng Custom Errors thay vì `require()`?**
- **Tiết kiệm gas**: Custom Errors chỉ dùng 4 bytes selector, trong khi `require("message")` lưu toàn bộ chuỗi ký tự
- **Dễ đọc**: Tên lỗi tự mô tả ý nghĩa
- **Tiêu chuẩn Solidity 0.8+**: Đây là best practice từ Solidity 0.8.4+

---

#### 📌 `contracts/Events.sol` — Định nghĩa sự kiện

**Vai trò**: Khai báo tất cả Events (sự kiện) mà Smart Contract phát ra. Events là "nhật ký" được ghi lại trên blockchain — rất rẻ (gas thấp) và giúp frontend theo dõi thay đổi.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Events {
    /// Phát ra khi có người đóng góp tiền
    event Donation(address indexed donor, uint256 amount);

    /// Phát ra khi manager tạo yêu cầu chi tiêu mới
    event RequestCreated(
        uint256 indexed id,
        string description,
        uint256 value,
        address recipient
    );

    /// Phát ra khi donor biểu quyết cho yêu cầu
    event Voted(address indexed voter, uint256 indexed requestId);

    /// Phát ra khi một milestone được giải ngân
    event MilestoneReleased(uint256 indexed requestId, uint256 milestoneIndex, uint256 amount, string evidenceHash);

    /// Phát ra khi validator pool được cập nhật
    event ValidatorPoolUpdated(address indexed poolAddress);

    /// Phát ra khi chiến dịch bị tạm dừng
    event CampaignDeactivated();

    /// Phát ra khi chiến dịch mới được tạo (Dùng cho Factory)
    event CampaignStarted(
        address indexed campaignAddress,
        address indexed manager,
        string campaignName,
        Category indexed category,
        uint256 minContribution
    );
}
```

**Giải thích `indexed`**:
- Từ khóa `indexed` cho phép **lọc** (filter) event theo giá trị đó
- Ví dụ: Bạn có thể lọc tất cả event `Donation` của một `donor` cụ thể
- Mỗi event tối đa 3 tham số `indexed`

**Events dùng để làm gì?**
- **Frontend**: Lắng nghe sự kiện real-time khi có donation, vote mới...
- **Lịch sử**: Truy vấn lịch sử giao dịch (ai đã donate bao nhiêu, khi nào...)
- **Debug**: Theo dõi luồng hoạt động của contract

---

#### 📌 `contracts/RequestLib.sol` — Thư viện cấu trúc dữ liệu

**Vai trò**: Định nghĩa cấu trúc dữ liệu `Request` (yêu cầu chi tiêu) dưới dạng `library`.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library RequestLib {
    struct Request {
        string description;              // Mô tả mục đích chi tiêu ("Mua máy tính", "Thuê server"...)
        uint256 value;                   // Số tiền yêu cầu (wei)
        address payable recipient;       // Địa chỉ nhận tiền
        bool complete;                   // Đã giải ngân chưa? (true = đã xong)
        uint256 approvalCount;           // Số phiếu đồng ý hiện tại
        mapping(address => bool) approvals; // Ai đã vote? (tránh vote 2 lần)
    }
}
```

**Giải thích**:

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `description` | `string` | Mô tả chi tiêu dùng tiền quỹ để làm gì |
| `value` | `uint256` | Số tiền yêu cầu giải ngân (đơn vị Wei) |
| `recipient` | `address payable` | Địa chỉ ví nhận tiền. `payable` = có thể nhận ETH |
| `complete` | `bool` | `false` = đang chờ, `true` = đã giải ngân |
| `approvalCount` | `uint256` | Đếm số phiếu bầu đồng ý |
| `approvals` | `mapping` | Bản đồ: `địa chỉ → đã vote chưa` (tránh double-vote) |

**Tại sao dùng `library`?**
- `library` trong Solidity là một **module code tái sử dụng**
- Tách riêng cấu trúc dữ liệu giúp code sạch, dễ bảo trì
- Struct chứa `mapping` **chỉ có thể lưu trong storage** (không thể truyền qua hàm hay return)

---

#### 📌 `contracts/modifiers/AccessControl.sol` — Kiểm soát quyền truy cập

**Vai trò**: Định nghĩa biến `manager` và modifier `onlyManager` — chỉ cho phép người quản lý chiến dịch gọi một số hàm nhất định.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../Errors.sol";

contract AccessControl {
    /// Địa chỉ manager (người tạo chiến dịch)
    address public manager;

    /// Modifier: Chỉ cho phép manager gọi hàm
    modifier onlyManager() {
        if (msg.sender != manager) revert NotManager();
        _;
    }
}
```

**Modifier là gì?**

Modifier giống như một **bộ lọc** đặt trước hàm. Khi bạn viết:

```solidity
function createRequest(...) external onlyManager { ... }
```

Nó nghĩa là: "Trước khi chạy `createRequest`, hãy kiểm tra `onlyManager` trước. Nếu không phải manager → revert (hủy giao dịch). Nếu đúng → tiếp tục chạy hàm."

Ký hiệu `_;` trong modifier đánh dấu vị trí mà code của hàm gốc sẽ được chèn vào.

---

#### 📌 `contracts/CampaignFactory.sol` — Factory Contract (⭐ Contract chính để deploy)

**Vai trò**: Contract trung tâm — "nhà máy" tạo ra các chiến dịch. Đây là contract bạn deploy **DUY NHẤT** lên blockchain. Mỗi khi ai đó muốn tạo chiến dịch mới, họ gọi hàm `createCampaign()` và Factory sẽ deploy một Campaign contract mới.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Campaign.sol";

contract CampaignFactory {
    /// Danh sách địa chỉ TẤT CẢ các chiến dịch đã tạo
    address[] public deployedCampaigns;

    /// Mapping: manager address → danh sách campaigns họ đã tạo
    mapping(address => address[]) public campaignsByManager;

    /// Event: Phát ra khi chiến dịch mới được tạo
    event CampaignStarted(
        address indexed campaignAddress,
        address indexed manager,
        string campaignName,
        Category indexed category,
        uint256 minContribution
    );

    /// Sổ cái Nhà cung cấp dùng chung
    SupplierRegistry public supplierRegistry;

    constructor(address _supplierRegistry) {
        supplierRegistry = SupplierRegistry(_supplierRegistry);
    }

    /// Tạo chiến dịch gây quỹ mới
    function createCampaign(string calldata name, Category category, uint256 minimum) external {
        // Khởi tạo pool cho campaign mới
        ValidatorPool pool = new ValidatorPool(msg.sender);
        Campaign newCampaign = new Campaign(
            name,
            category,
            minimum,
            msg.sender,
            address(pool),
            address(supplierRegistry)
        );
        address campaignAddr = address(newCampaign);

        // Lưu địa chỉ contract mới vào danh sách
        deployedCampaigns.push(campaignAddr);
        campaignsByManager[msg.sender].push(campaignAddr);
        categoryToCampaigns[category].push(campaignAddr);

        // Phát sự kiện
        emit CampaignStarted(campaignAddr, msg.sender, name, category, minimum);
    }

    /// Lấy toàn bộ danh sách campaigns
    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }

    /// Lấy danh sách campaigns của 1 manager cụ thể
    function getCampaignsByManager(address _manager) external view returns (address[] memory) {
        return campaignsByManager[_manager];
    }

    /// Đếm tổng số campaigns
    function getCampaignsCount() external view returns (uint256) {
        return deployedCampaigns.length;
    }
}
```

**Factory Pattern là gì?**

Thay vì mỗi người phải tự deploy contract (rất phức tạp), Factory Pattern cho phép:
1. Deploy **1 Factory** duy nhất lên blockchain
2. Bất kỳ ai cũng có thể gọi `createCampaign()` để tạo campaign mới
3. Factory tự động deploy Campaign contract mới và lưu lại địa chỉ

```
[Người dùng] → gọi createCampaign() → [CampaignFactory] → deploy → [Campaign mới]
                                                         → deploy → [Campaign mới]
                                                         → deploy → [Campaign mới]
```

**Bảng tóm tắt các hàm**:

| Hàm | Loại | Ai gọi? | Mục đích |
|---|---|---|---|
| `createCampaign(name, category, min)` | Write | Bất kỳ ai | Tạo chiến dịch mới với phân loại |
| `getDeployedCampaigns()` | Read | Bất kỳ ai | Xem tất cả campaigns |
| `getCampaignsByManager(addr)` | Read | Bất kỳ ai | Xem campaigns của 1 manager |
| `getCampaignsCount()` | Read | Bất kỳ ai | Đếm tổng số campaigns |

---

#### 📌 `contracts/Campaign.sol` — Campaign Contract (⭐ Logic chính)

**Vai trò**: Contract quản lý **1 chiến dịch gây quỹ**. Chứa toàn bộ logic: nhận tiền, tạo yêu cầu chi tiêu, biểu quyết, giải ngân.

**Kế thừa (Inheritance)**:
```
Campaign → Events (sự kiện) + AccessControl (quyền) + ReentrancyGuard (bảo mật)
```

**Biến trạng thái (State Variables)**:
```solidity
uint256 public minimumContribution;              // Số tiền tối thiểu để được coi là donor
uint256 public totalDonors;                      // Tổng số donors duy nhất
mapping(address => uint256) public contributions; // Mapping: donor → số tiền đã đóng góp
RequestLib.Request[] public requests;            // Mảng tất cả yêu cầu chi tiêu
bool public active;                              // Chiến dịch có đang hoạt động không?

string public campaignName;                      // Tên chiến dịch
Category public category;                        // Danh mục
ValidatorPool public validatorPool;              // Pool của Validators
SupplierRegistry public supplierRegistry;        // Registry của Suppliers
```

**Constructor**:
```solidity
constructor(
    string memory _name,
    Category _category,
    uint256 _minimum,
    address _manager,
    address _validatorPool,
    address _supplierRegistry
) {
    if (_minimum == 0) revert InsufficientFunds();
    if (_manager == address(0) || _validatorPool == address(0) || _supplierRegistry == address(0))
        revert InvalidAddress();
    
    campaignName = _name;
    category = _category;
    manager = _manager;
    minimumContribution = _minimum;
    validatorPool = ValidatorPool(_validatorPool);
    supplierRegistry = SupplierRegistry(_supplierRegistry);
    active = true;
}
```

**Bảng tóm tắt TẤT CẢ các hàm**:

| Hàm | Loại | Ai gọi? | Mô tả | Gas |
|---|---|---|---|---|
| `donate()` | Write (payable) | Bất kỳ ai | Đóng góp ETH vào chiến dịch | ~45.000 |
| `createRequest(...)` | Write | Chỉ Manager | Tạo yêu cầu chi tiêu + **Evidence Hash** | ~90.000 |
| `approveRequest(index)` | Write | Chỉ Donor | Bỏ phiếu đồng ý cho request | ~50.000 |
| `finalizeRequest(index)` | Write | Chỉ Manager | Giải ngân khi đủ phiếu | ~60.000 |
| `executeMilestone(...)` | Write | Manager/Verifier | Giải ngân theo giai đoạn + **Evidence** | ~120.000 |
| `deactivateCampaign()` | Write | Chỉ Manager | Tạm dừng chiến dịch | ~30.000 |
| `getSummary()` | Read (miễn phí) | Bất kỳ ai | Xem thông tin tổng quan | 0 |
| `getRequestsCount()` | Read (miễn phí) | Bất kỳ ai | Đếm số requests | 0 |

**Chi tiết từng hàm**:

##### `donate()` — Đóng góp tiền

```solidity
function donate() external payable onlyActive {
    // 1. Kiểm tra: số tiền gửi phải >= mức tối thiểu
    if (msg.value < minimumContribution) revert InsufficientFunds();

    // 2. Nếu là donor mới (chưa đóng góp lần nào) → tăng đếm
    if (contributions[msg.sender] == 0) {
        totalDonors++;
    }

    // 3. Cộng dồn số tiền đóng góp
    contributions[msg.sender] += msg.value;

    // 4. Phát event
    emit Donation(msg.sender, msg.value);
}
```

- `external`: Chỉ gọi được từ bên ngoài (không gọi nội bộ)
- `payable`: Hàm này có thể **nhận ETH** (msg.value > 0)
- `onlyActive`: Modifier kiểm tra chiến dịch còn hoạt động
- `msg.sender`: Địa chỉ ví của người gọi hàm
- `msg.value`: Số ETH (wei) gửi kèm giao dịch

##### `createRequest()` — Tạo yêu cầu chi tiêu

```solidity
function createRequest(
    string calldata desc,       // Mô tả
    uint256 value,              // Số tiền
    address payable recipient,  // Người nhận
    string calldata evidenceHash // CID từ IPFS (hóa đơn, chứng từ)
) external onlyManager onlyActive {
    if (value == 0) revert InsufficientFunds();
    if (recipient == address(0)) revert InvalidAddress();
    if (bytes(desc).length == 0) revert EmptyDescription();
    if (bytes(evidenceHash).length == 0) revert EmptyDescription();

    // Tạo Request mới và thêm vào mảng
    RequestLib.Request storage r = requests.push();
    r.description = desc;
    r.value = value;
    r.recipient = recipient;
    r.complete = false;
    r.approvalCount = 0;

    emit RequestCreated(requests.length - 1, desc, value, recipient);
}
```

- `calldata`: Kiểu lưu trữ tạm thời cho tham số — tiết kiệm gas hơn `memory`
- `onlyManager`: Chỉ manager được tạo request
- `requests.push()`: Thêm phần tử mới vào cuối mảng và trả về reference đến nó

##### `approveRequest()` — Biểu quyết

```solidity
function approveRequest(uint256 index) external onlyActive {
    if (index >= requests.length) revert InvalidRequestIndex();

    RequestLib.Request storage r = requests[index];

    if (contributions[msg.sender] == 0) revert NotDonor();     // Phải là donor
    if (r.approvals[msg.sender]) revert AlreadyVoted();        // Chưa vote lần nào
    if (msg.sender == manager) revert ManagerCannotVote();     // Manager không được vote
    if (r.complete) revert RequestCompleted();                 // Request chưa hoàn thành

    r.approvals[msg.sender] = true;  // Đánh dấu đã vote
    r.approvalCount++;               // Tăng đếm phiếu
    emit Voted(msg.sender, index);
}
```

**Tại sao Manager không được vote?** Vì Manager là người tạo request, nếu họ tự vote thì mất ý nghĩa kiểm soát. Quyền biểu quyết chỉ dành cho donors.

##### `finalizeRequest()` — Giải ngân

```solidity
function finalizeRequest(uint256 index) external onlyManager nonReentrant {
    if (index >= requests.length) revert InvalidRequestIndex();

    RequestLib.Request storage r = requests[index];

    if (r.complete) revert RequestCompleted();
    if (r.value > address(this).balance) revert InsufficientFunds();

    // Cần NHIỀU HƠN 50% donors đồng ý
    if (r.approvalCount <= totalDonors / 2) revert NotEnoughApprovals();

    r.complete = true;  // Đánh dấu hoàn thành TRƯỚC khi chuyển tiền (pattern bảo mật)

    // Chuyển tiền bằng .call (an toàn hơn .transfer)
    (bool success, ) = r.recipient.call{value: r.value}("");
    if (!success) revert TransferFailed();

    emit FundsReleased(index);
}
```

**Các điểm bảo mật quan trọng**:

1. **`nonReentrant`** (từ OpenZeppelin): Chống **tấn công Re-entrancy** — khi người nhận tiền cố gắng gọi lại hàm `finalizeRequest` trong cùng giao dịch để rút tiền nhiều lần.

2. **Checks-Effects-Interactions Pattern**: 
   - ✅ **Checks** (kiểm tra): Kiểm tra điều kiện trước
   - ✅ **Effects** (thay đổi trạng thái): `r.complete = true` TRƯỚC khi chuyển tiền
   - ✅ **Interactions** (tương tác bên ngoài): `.call{value}()` SAU CÙNG

3. **Dùng `.call` thay vì `.transfer`**: `.transfer` giới hạn 2300 gas, có thể thất bại với một số contract nhận tiền. `.call` linh hoạt hơn.

##### `deactivateCampaign()` — Tạm dừng chiến dịch

```solidity
function deactivateCampaign() external onlyManager {
    if (!active) revert CampaignNotActive();
    active = false;
    emit CampaignDeactivated();
}
```

> **Lưu ý**: Sau khi deactivate, không thể donate, tạo request, hay vote. Nhưng **Manager vẫn có thể finalize** các request đã được vote đủ phiếu — để không bị "kẹt" tiền.

##### `getSummary()` — Xem thông tin tổng quan

```solidity
function getSummary() external view returns (
    uint256 balance,          // Số dư ETH trong contract
    uint256 minContribution,  // Mức đóng góp tối thiểu
    uint256 numRequests,      // Số lượng requests
    uint256 donors,           // Số lượng donors
    address managerAddr,      // Địa chỉ manager
    bool isActive             // Đang hoạt động?
) {
    return (
        address(this).balance,
        minimumContribution,
        requests.length,
        totalDonors,
        manager,
        active
    );
}
```

- `view`: Hàm chỉ đọc dữ liệu, không thay đổi state → **MIỄN PHÍ** gas khi gọi từ bên ngoài
- `address(this).balance`: Số ETH (wei) hiện có trong contract

---

### 3. Scripts (Thư mục `scripts/`)

Scripts là các file TypeScript/JavaScript chạy bằng Hardhat để tương tác với blockchain.

---

#### 📌 `scripts/deploy.ts` — Script deploy chính (⭐)

**Vai trò**: Deploy contract `CampaignFactory` lên blockchain.

```typescript
import { ethers } from "hardhat";

async function main() {
  // 1. Lấy tài khoản deployer (từ private key trong .env)
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 2. Lấy contract factory (bản thiết kế của CampaignFactory)
  const CampaignFactory = await ethers.getContractFactory("CampaignFactory");

  // 3. Deploy — gửi giao dịch tạo contract lên blockchain
  const factory = await CampaignFactory.deploy();

  // 4. Đợi giao dịch được xác nhận (mined)
  await factory.waitForDeployment();

  // 5. In địa chỉ contract đã deploy
  console.log("CampaignFactory deployed to:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

**Cách chạy**:
```bash
# Deploy lên mạng local (Hardhat Network)
npx hardhat run scripts/deploy.ts

# Deploy lên Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia
```

---

#### 📌 `scripts/deploy.js` — Script deploy cũ (tham khảo)

```javascript
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Campaign = await ethers.getContractFactory("Campaign");
  const campaign = await Campaign.deploy(
    ethers.parseEther("0.01") // minimum donation = 0.01 ETH
  );

  await campaign.waitForDeployment();
  console.log("Contract deployed to:", campaign.target);
}

main();
```

> **Lưu ý**: Đây là script deploy **cũ**, deploy contract `Campaign` trực tiếp thay vì qua Factory. Trong dự án hiện tại, bạn nên dùng `deploy.ts`.

---

#### 📌 `scripts/check-balance.ts` — Kiểm tra số dư ví

**Vai trò**: Kiểm tra số ETH còn lại trong ví (hữu ích trước khi deploy).

```typescript
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log("No private key found in .env");
        return;
    }

    // Tạo ví từ private key
    const wallet = new ethers.Wallet(privateKey);
    console.log("Address derived from private key:", wallet.address);

    // Truy vấn số dư từ blockchain
    const balance = await ethers.provider.getBalance(wallet.address);
    console.log("Current balance:", ethers.formatEther(balance), "ETH");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

**Cách chạy**:
```bash
# Kiểm tra trên Sepolia
npx hardhat run scripts/check-balance.ts --network sepolia
```

---

#### 📌 `scripts/interact.js` — Script tương tác mẫu

**Vai trò**: Ví dụ cách gọi hàm `donate()` từ script.

```javascript
async function main() {
  // Kết nối đến contract Campaign đã deploy
  const contract = await ethers.getContractAt(
    "Campaign",
    "0xYourAddress"      // ← Thay bằng địa chỉ contract thật
  );

  // Gọi hàm donate, gửi kèm 0.01 ETH
  await contract.donate({ value: ethers.parseEther("0.01") });
  console.log("Donated!");
}

main();
```

> **Lưu ý**: Thay `"0xYourAddress"` bằng địa chỉ Campaign contract thật sau khi deploy.

---

### 4. Tests (Thư mục `test/`)

---

#### 📌 `test/Campaign_WithdrawalOptimization.test.ts` — Test cơ chế tối ưu (⭐ Mới)

**Vai trò**: Kiểm tra các luồng rút tiền phức tạp mới được bổ sung:
- **Path A**: Validator duyệt lệnh nhỏ lẻ (Small Requests).
- **Path B**: Giải ngân đa tầng (Multi-stage) qua chữ ký Oracle (ECDSA).
- **Security**: Chống lạm quyền, xác thực Verifier, phòng chống Re-entrancy.

#### 📌 `test/Campaign.ts` — Bộ test cơ bản (54 test cases)
| Nhóm test | Số test | Kiểm tra gì? |
|---|---|---|
| **CampaignFactory** | 6 | Tạo campaign, theo dõi theo manager, emit event |
| **Deployment** | 4 | Khởi tạo đúng manager, minimum, active state |
| **Donations** | 8 | Đóng góp, tích lũy, từ chối dưới minimum, emit event |
| **Create Request** | 6 | Tạo request, kiểm tra quyền, validation |
| **Voting** | 7 | Bỏ phiếu, double-vote, non-donor, manager vote |
| **Finalize Request** | 8 | Giải ngân, đủ/thiếu phiếu, quỹ không đủ |
| **Campaign State** | 7 | Deactivate, từ chối thao tác sau deactivate |
| **End-to-End** | 2 | Test toàn bộ luồng từ đầu đến cuối |
| **View Functions** | 2 | getSummary, getRequestsCount |

**Cấu trúc 1 test case mẫu**:

```typescript
it("should accept a donation at minimum", async () => {
  // Arrange (Chuẩn bị): donor1 chuẩn bị đóng góp
  // Act (Hành động): Gọi hàm donate
  await campaign.connect(donor1).donate({ value: MIN_CONTRIBUTION });

  // Assert (Kiểm tra): Xác nhận contribution đã được ghi nhận
  const contribution = await campaign.contributions(donor1.address);
  expect(contribution).to.equal(MIN_CONTRIBUTION);
});
```

**Cách chạy test**:
```bash
# Chạy tất cả test
npx hardhat test

# Chạy với báo cáo chi phí gas
REPORT_GAS=true npx hardhat test

# Chạy chỉ 1 test cụ thể (dùng grep)
npx hardhat test --grep "should accept a donation"
```

**Giải thích setup (beforeEach)**:
```typescript
beforeEach(async () => {
  // 1. Lấy 6 tài khoản test (Hardhat cung cấp sẵn 20 tài khoản)
  [owner, donor1, donor2, donor3, recipient, nonDonor] =
    await ethers.getSigners();

  // 2. Deploy CampaignFactory
  const CampaignFactory = await ethers.getContractFactory("CampaignFactory");
  factory = await CampaignFactory.deploy();

  // 3. Tạo 1 Campaign qua Factory
  await factory.createCampaign("Test Campaign", 0, MIN_CONTRIBUTION);
  const addresses = await factory.getDeployedCampaigns();

  // 4. Kết nối đến Campaign contract vừa tạo
  const Campaign = await ethers.getContractFactory("Campaign");
  campaign = await Campaign.attach(addresses[0]);
});
```

`beforeEach` chạy **TRƯỚC MỖI** test case, đảm bảo mỗi test bắt đầu với trạng thái sạch (clean state).

---

### 5. File khác

#### 📌 `ignition/modules/Lock.ts` — Module mẫu Hardhat Ignition

File này là **mẫu mặc định** khi tạo dự án Hardhat mới. **Không liên quan** đến dự án Fundraising. Hardhat Ignition là một cách deploy khác (declarative deployment), nhưng dự án này sử dụng scripts truyền thống.

---

## 🏛 Kiến Trúc Hệ Thống

### Sơ đồ tổng quan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ETHEREUM BLOCKCHAIN (Sepolia)                      │
│                                                                             │
│  ┌─────────────────────┐          ┌──────────────────────────────────────┐  │
│  │  CampaignFactory    │          │           Campaign Contract         │  │
│  │  ─────────────────  │          │  ─────────────────────────────────── │  │
│  │  createCampaign()   │───────►  │  evidenceHash (CID) ◄──┐             │  │
│  │  getDeployed()      │          │  finalizeRequest()     │             │  │
│  └─────────────────────┘          └────────────────────────┼─────────────┘  │
│                                                            │                │
└────────────────────────────────────────────────────────────┼────────────────┘
                                                             │
                                                             │ (CID Hash)
                                                             │
┌──────────────────────────────────────┐      ┌──────────────┴────────────────┐
│            NESTJS BACKEND            │      │         IPFS / PINATA         │
│  ──────────────────────────────────  │      │  ───────────────────────────  │
│  - Upload Evidence API               │──────►  - Store Invoices/Photos      │
│  - Pinata integration                │      │  - Decentralized & Immutable  │
└──────────────────────────────────────┘      └───────────────────────────────┘
```

### Mối quan hệ giữa các file (Inheritance & Import)

```
Errors.sol ─────────────────────────┐
                                    ▼
Events.sol ──────────────┐   AccessControl.sol ──┐  ValidatorPool.sol
                         │          │            │        │
                         ▼          ▼            ▼        ▼
RequestLib.sol ────────► Campaign.sol ◄──── CampaignFactory.sol
                         ▲          ▲
                         │          │
                  ReentrancyGuard  SupplierRegistry.sol
```

### Vai trò người dùng (Roles)

| Vai trò | Quyền | Hạn chế |
|---|---|---|
| **Platform Admin** | Thẩm định & Whitelist Supplier | Không tham gia quản lý quỹ |
| **Campaign Manager** | Tạo chiến dịch, Request, Finalize | Không được tự vote |
| **Validator** | Duyệt các lệnh chi tiền nhỏ (<0.5%) | Phải được chọn ngẫu nhiên |
| **Donor** | Quyên góp, Biểu quyết lệnh chi lớn | Không thể tạo request |
| **Người ngoài** | Xem thông tin công khai | Không có quyền thao tác |

---

## 🔍 Tính năng Nâng cao: On-chain Indexing & Filtering

Dự án hiện hỗ trợ việc phân loại và tìm kiếm chiến dịch trực tiếp trên Blockchain (không cần database riêng), giúp tối ưu hóa tốc độ và tính phi tập trung.

### 1. Phân loại Chiến dịch (Category)
Hệ thống sử dụng các danh mục cố định để người dùng dễ dàng tìm kiếm:
- **0 - Education** (Giáo dục)
- **1 - Medical** (Y tế)
- **2 - Disaster** (Cứu trợ thiên tai)
- **3 - Environment** (Môi trường)
- **4 - Others** (Khác)

### 2. Cách tạo Chiến dịch có phân loại
Hàm `createCampaign` hiện yêu cầu 3 tham số thay vì 1 như trước:
```solidity
function createCampaign(string calldata name, Category category, uint256 minimum) external;
```
**Hướng dẫn tương tác:**
- `name`: Nhập tên chiến dịch (ví dụ: "Cứu trợ lũ lụt Miền Trung").
- `category`: Nhập số tương ứng (0-4).
- `minimum`: Số tiền tối thiểu (Wei).

### 3. Truy vấn nâng cao (Unified Indexing) — Hướng dẫn cho Frontend
Hệ thống hiện cung cấp một hàm duy nhất để xử lý tất cả các loại truy vấn (Lấy tất cả, Lấy theo Manager, Lấy theo Danh mục) hỗ trợ phân trang:

```javascript
/**
 * @param queryType: 0 (ALL), 1 (BY_MANAGER), 2 (BY_CATEGORY)
 * @param manager: Địa chỉ ví (truyền ZeroAddress nếu không dùng)
 * @param category: ID danh mục (truyền 0 nếu không dùng)
 * @param offset: Vị trí bắt đầu
 * @param limit: Số lượng mục mỗi trang
 */
function getCampaigns(QueryType queryType, address manager, Category category, uint256 offset, uint256 limit) returns (address[] campaigns);
```

**Ví dụ lấy 10 mục đầu tiên của danh mục Y tế (Category 1):**
`factory.getCampaigns(2, "0x000...", 1, 0, 10);`

---

---

## 🛠 Hướng Dẫn Cài Đặt Từ Đầu

### Yêu cầu phần mềm

| Phần mềm | Phiên bản tối thiểu | Kiểm tra bằng lệnh |
|---|---|---|
| Node.js | 18+ | `node --version` |
| npm hoặc yarn | npm 9+ / yarn 1.22+ | `npm --version` / `yarn --version` |
| Git | 2.0+ | `git --version` |
| MetaMask | Mới nhất | Cài extension trên Chrome/Firefox |

### Bước 1: Clone dự án

```bash
git clone <url-repository>
cd fundraising-blockchain/bc
```

### Bước 2: Cài đặt dependencies

```bash
# Dùng npm
npm install

# Hoặc dùng yarn (dự án này dùng yarn)
yarn install
```

Lệnh này sẽ đọc `package.json` và tải toàn bộ thư viện cần thiết vào thư mục `node_modules/`.

### Bước 3: Tạo file `.env`

```bash
cp .env.example .env
# Hoặc tạo thủ công
```

Điền thông tin:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=your_64_hex_character_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Cách lấy từng giá trị**:

1. **SEPOLIA_RPC_URL**:
   - Truy cập [alchemy.com](https://alchemy.com) → Đăng ký → Create App → Chọn Sepolia → Copy API URL

2. **PRIVATE_KEY**:
   - MetaMask → Account → 3 chấm → Account Details → Export Private Key → Nhập mật khẩu → Copy

3. **ETHERSCAN_API_KEY**:
   - Truy cập [etherscan.io/apis](https://etherscan.io/apis) → Đăng ký → Create API Key → Copy

### Bước 4: Lấy ETH test (Sepolia Faucet)

Bạn cần ETH ảo trên Sepolia để trả phí gas:

| Faucet | Link |
|---|---|
| Google Cloud Faucet | [cloud.google.com/web3/faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) |
| Alchemy Faucet | [sepoliafaucet.com](https://sepoliafaucet.com/) |

### Bước 5: Kiểm tra mọi thứ hoạt động

```bash
# Biên dịch contracts
npx hardhat compile

# Chạy test
npx hardhat test

# Kiểm tra số dư ví trên Sepolia
npx hardhat run scripts/check-balance.ts --network sepolia
```

---

## ⚙️ Hướng Dẫn Compile & Test

### Compile (Biên dịch)

```bash
npx hardhat compile
```

**Quá trình compile**:
```
Solidity Source (.sol) → Compiler (solc 0.8.28) → ABI + Bytecode
                                                     │
                                          Lưu vào artifacts/
```

- **ABI** (Application Binary Interface): "Bản hướng dẫn" cho JavaScript biết cách gọi contract
- **Bytecode**: Mã máy chạy trên Ethereum Virtual Machine (EVM)

Sau compile, thư mục `artifacts/` sẽ chứa:
```
artifacts/contracts/Campaign.sol/Campaign.json  ← ABI + Bytecode
artifacts/contracts/CampaignFactory.sol/CampaignFactory.json
...
```

### Test

```bash
# Chạy toàn bộ 54 test cases
npx hardhat test

# Chạy với chi tiết gas
REPORT_GAS=true npx hardhat test

# Chạy test cụ thể
npx hardhat test --grep "Donations"
npx hardhat test --grep "should accept a donation"
```

**Kết quả mong đợi**:
```
  Campaign & Factory
    CampaignFactory
      ✓ should deploy factory and create a campaign
      ✓ should track campaigns by manager
      ✓ should allow multiple campaigns from same manager
      ...
    Donations
      ✓ should accept a donation at minimum
      ✓ should revert if donation is below minimum
      ...

  54 passing (3s)
```

### Chạy Local Node (Blockchain giả lập)

```bash
npx hardhat node
```

Lệnh này khởi tạo một blockchain giả lập trên máy bạn:
- 20 tài khoản test sẵn, mỗi tài khoản có 10.000 ETH (ảo)
- Giao dịch được xác nhận ngay lập tức (không cần đợi)
- Reset lại mỗi khi tắt

**Deploy lên local node** (mở terminal khác):
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

---

## 🌐 Hướng Dẫn Deploy

### Deploy lên Sepolia Testnet

#### Kiểm tra trước khi deploy

```bash
# 1. Đảm bảo compile thành công
npx hardhat compile

# 2. Đảm bảo tất cả test pass
npx hardhat test

# 3. Kiểm tra số dư ví (cần ít nhất ~0.01 ETH cho gas)
npx hardhat run scripts/check-balance.ts --network sepolia
```

#### Thực hiện deploy

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

**Output mong đợi**:
```
Deploying contracts with the account: 0xYourAddress...
CampaignFactory deployed to: 0xNewContractAddress
```

> **Lưu giữ kỹ** địa chỉ contract sau khi deploy!

#### Verify trên Etherscan

Verify giúp **công khai mã nguồn** trên Etherscan, cho phép mọi người đọc code và tương tác qua giao diện web. Vì kiến trúc mới có 2 contract (Registry và Factory), và cả hai đều nhận tham số khởi tạo (constructor arguments), bạn cần verify lần lượt và phải truyền đúng tham số đã dùng khi deploy.

**Cú pháp chung:**
```bash
# 1. Verify SupplierRegistry (Tham số là địa chỉ Admin)
npx hardhat verify --network sepolia <ĐỊA_CHỈ_REGISTRY> "<ĐỊA_CHỈ_ADMIN>"

# 2. Verify CampaignFactory (Tham số là địa chỉ Registry)
npx hardhat verify --network sepolia <ĐỊA_CHỈ_FACTORY> "<ĐỊA_CHỈ_REGISTRY>"
```

**Lệnh thực tế (với lần deploy gần nhất của bạn)**:
```bash
# Verify SupplierRegistry
npx hardhat verify --network sepolia 0x34569f934dC3a22Fb5e3bd8D688FA4244bF9066f "0xe9BC90cee5a039B49ded5E3113E0C23D32ef2f06"

# Verify CampaignFactory
npx hardhat verify --network sepolia 0xC178A1E8054b2aC73E43d10a6EBa573C12FA24ce "0x34569f934dC3a22Fb5e3bd8D688FA4244bF9066f"
```

**Sau khi verify thành công**, bạn có thể xem mã nguồn tại:
```
https://sepolia.etherscan.io/address/<ĐỊA_CHỈ>#code
```

### Thông tin deploy hiện tại

| Thông tin | Giá trị |
|---|---|
| Mạng | Sepolia Testnet |
| Platform Admin | `0xe9BC90cee5a039B49ded5E3113E0C23D32ef2f06` |
| SupplierRegistry Address | `0x34569f934dC3a22Fb5e3bd8D688FA4244bF9066f` |
| CampaignFactory Address | `0xC178A1E8054b2aC73E43d10a6EBa573C12FA24ce` |
| Etherscan | [Xem Factory](https://sepolia.etherscan.io/address/0xC178A1E8054b2aC73E43d10a6EBa573C12FA24ce#code) |

#### 💡 Giải thích các địa chỉ 

Để hệ thống hoạt động an toàn theo mô hình WFP, chúng ta cần 3 thành phần này phối hợp với nhau:

1.  **Platform Admin (Ví cá nhân của bạn)**:
    - Đây là địa chỉ ví MetaMask bạn dùng để deploy.
    - **Vai trò**: "Người gác cổng". Chỉ có ví này mới có quyền thêm hoặc xóa các Nhà cung cấp (Suppliers) vào danh sách tin cậy.
2.  **SupplierRegistry (Smart Contract - Cuốn sổ cái)**:
    - Đây là một hợp đồng thông minh lưu trữ danh sách các Nhà cung cấp đã được xác minh.
    - **Vai trò**: "Danh sách trắng (Whitelist)". Nó đảm bảo rằng tiền từ thiện không thể gửi cho bất kỳ địa chỉ lạ nào mà chưa được Admin phê duyệt từ trước.
3.  **CampaignFactory (Smart Contract - Xưởng tạo quỹ)**:
    - Đây là hợp đồng dùng để tạo ra các chiến dịch gây quỹ mới.
    - **Vai trò**: "Người thực thi". Mọi chiến dịch được tạo ra từ đây đều tự động liên kết với `SupplierRegistry` để áp dụng quy tắc: *Chỉ giải ngân cho người có tên trong danh sách trắng*.

---

## 🎮 Hướng Dẫn Tương Tác Với Contract (Mô hình WFP)

Hệ thống của chúng ta hoạt động theo nguyên tắc các bộ phận giám sát lẫn nhau. Dưới đây là quy trình 5 bước để vận hành hệ thống này trực tiếp trên Etherscan.

### Bước 0: Thẩm định & Thêm Nhà cung cấp (Chỉ Admin)
Trước khi một chiến dịch có thể chi tiền, bạn (Admin) phải đưa nhà cung cấp vào danh sách trắng.

1.  Truy cập **SupplierRegistry**: [https://sepolia.etherscan.io/address/0x34569f934dC3a22Fb5e3bd8D688FA4244bF9066f#writeContract](https://sepolia.etherscan.io/address/0x34569f934dC3a22Fb5e3bd8D688FA4244bF9066f#writeContract)
2.  Kết nối ví MetaMask (Connect to Web3).
3.  Tìm hàm **`addSupplier`**: Nhập địa chỉ ví của Nhà cung cấp (ví dụ: ví của một cửa hàng thực phẩm).
4.  Nhấn **"Write"** để xác nhận.

### Bước 1: Tạo Chiến dịch (Campaign Manager)
1.  Truy cập **CampaignFactory**: [https://sepolia.etherscan.io/address/0xC178A1E8054b2aC73E43d10a6EBa573C12FA24ce#writeContract](https://sepolia.etherscan.io/address/0xC178A1E8054b2aC73E43d10a6EBa573C12FA24ce#writeContract)
2.  Dùng hàm **`createCampaign`**: 
    - `name`: Tên chiến dịch (ví dụ: "Cứu trợ lũ lụt").
    - `category`: ID danh mục (0-4). Xem mục [Tính năng Nâng cao](# tính-năng-nâng-cao-on-chain-indexing--filtering) để biết chi tiết.
    - `minimum`: Số tiền tối thiểu (ví dụ `10000000000000000` cho 0.01 ETH).
3.  Sau khi giao dịch thành công, sang tab **"Read Contract"**, gọi hàm **`getDeployedCampaigns`** để lấy địa chỉ Campaign vừa tạo.

### Bước 2: Quyên góp (Donors)
1.  Tìm kiếm địa chỉ Campaign vừa lấy được trên Etherscan.
2.  Vào tab **"Write Contract"**, tìm hàm **`donate`**.
3.  Ở mục `payableAmount`, nhập số ETH muốn gửi (ví dụ `0.05`).
4.  Nhấn **"Write"**.

### Bước 3: Đặt hàng / Tạo yêu cầu chi (Campaign Manager)
1.  Tại trang Campaign, tìm hàm **`createRequest`**.
2.  **Ô `evidenceHash`**: Bạn cần upload hóa đơn lên Backend (`be/`) trước để lấy mã CID (ví dụ: `Qm...`).
3.  **Lưu ý quan trọng**: Ô `recipient` bạn **BUỘC PHẢI** điền địa chỉ ví Nhà cung cấp đã được thêm ở Bước 0. Nếu điền địa chỉ khác, giao dịch sẽ bị Revert (Lỗi `RecipientNotWhitelisted`).

### Bước 4: Kiểm duyệt & Giải ngân (WFP Flow)

| Thao tác | Ai thực hiện | Hàm tương ứng | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Duyệt lệnh nhỏ** | Validators | `approveAsValidator` | Dành cho lệnh < 0.5% quỹ |
| **Duyệt lệnh lớn** | Donors | `approveRequest` | Cần > 50% tổng số donors đồng ý |
| **Xác thực giao hàng** | Oracle | `executeMilestone` | Dành cho lệnh Multi-stage (Cần chữ ký số) |
| **Nhận tiền** | Supplier | `finalizeRequest` | Tiền tự động chuyển thẳng cho ví Nhà cung cấp |

---

### Cách 2: Qua Script (Dành cho Developer)

Dưới đây là mã nguồn mẫu để bạn tương tác tự động bằng Ethers.js:

```javascript
async function main() {
  const REGISTRY_ADDR = "0x34569f934dC3a22Fb5e3bd8D688FA4244bF9066f";
  const FACTORY_ADDR = "0xC178A1E8054b2aC73E43d10a6EBa573C12FA24ce";

  // 1. Thêm Supplier
  const registry = await ethers.getContractAt("SupplierRegistry", REGISTRY_ADDR);
  const addTx = await registry.addSupplier("0xĐịa_Chỉ_Cửa_Hàng...");
  await addTx.wait();

  // 2. Tạo Campaign
  const factory = await ethers.getContractAt("CampaignFactory", FACTORY_ADDR);
  const createTx = await factory.createCampaign(
    "Chiến dịch Y tế mẫu", // name
    1,                    // category (Medical)
    ethers.parseEther("0.01") // min donation
  );
  await createTx.wait();

  // 3. Lấy Campaign mới nhất
  const campaigns = await factory.getDeployedCampaigns();
  const campaign = await ethers.getContractAt("Campaign", campaigns[campaigns.length - 1]);

  console.log("Hệ thống đã sẵn sàng tại:", await campaign.getAddress());
}

main().catch(console.error);
```

**Chạy script**:
```bash
npx hardhat run scripts/interact.js --network sepolia
```

### Cách 3: Dùng Hardhat Console (Interactive)

```bash
npx hardhat console --network sepolia
```

```javascript
// Trong console:
const factory = await ethers.getContractAt("CampaignFactory", "0xC178A1E8054b2aC73E43d10a6EBa573C12FA24ce");
const campaigns = await factory.getDeployedCampaigns();
console.log(campaigns);
```

---

## 🔄 Giải Thích Luồng Hoạt Động & Cơ Chế Rút Tiền

Hệ thống đã được nâng cấp lên mô hình **Zero-Trust** với cơ chế **Hybrid Approval** và **Danh sách Trắng Nhà cung cấp (Supplier Whitelist)** để tối ưu hóa trải nghiệm người dùng và tính bảo mật.

### 1. Phân luồng rút tiền (Hybrid Approval)

Dựa trên số tiền yêu cầu (ngưỡng 0.5% tổng quỹ), hệ thống tự động chọn luồng xử lý:

| Đặc điểm | Luồng A (Tiền nhỏ lẻ) | Luồng B (Dự án/Số tiền lớn) |
|---|---|---|
| **Điều kiện** | < 0.5% số dư quỹ | > 0.5% số dư quỹ |
| **Người duyệt** | 3 Validator ngẫu nhiên | Toàn bộ Donors |
| **Cơ chế duyệt** | Chọn ngẫu nhiên để chống thông đồng | Biểu quyết đa số (>50%) |
| **Giải ngân** | Duyệt xong nhận tiền ngay | Duyệt 1 lần budget, giải ngân từng đợt |
| **Xác thực** | Validator xác nhận chứng từ | Oracle/Verifier ký chữ ký số (ECDSA) |

### 3. Lưu trữ bằng chứng (IPFS & Backend)
Để đảm bảo tính minh bạch tuyệt đối, các bằng chứng chi tiêu (invoice) không được lưu trên server truyền thống mà được đẩy lên **IPFS** (Hệ thống lưu trữ ngang hàng).

- **Mã CID (Content Identifier)**: Mỗi file khi upload lên IPFS sẽ có một mã băm duy nhất (ví dụ: `QmX...`). Nếu file bị sửa đổi, mã này sẽ thay đổi hoàn toàn.
- **Tính bất biến**: Khi đã lưu mã CID này vào Smart Contract, không ai có thể thay đổi bằng chứng đã gửi.
- **NestJS Backend**: Đóng vai trò là cổng trung gian để nhận file từ người dùng, thực hiện upload lên Pinata (một dịch vụ quản lý IPFS) và trả về mã CID cho Frontend để thực hiện giao dịch Blockchain.

---

## ⚡ Humanitarian Accountability Protocol (DAO x WFP)

Hệ thống giải ngân được lấy cảm hứng từ cấu trúc phân phối viện trợ của **Chương trình Lương thực Thế giới (WFP Building Blocks)**:

### Nguyên Tắc Phân Quyền Giám Sát
Để đảm bảo tiền không bị thất thoát, hệ thống chia vai trò rõ ràng:
1. **Platform Admin (Quản trị viên Hệ thống)**: Phê duyệt và đưa các Nhà cung cấp (Suppliers - ví dụ: siêu thị, công ty vật liệu) vào Sổ cái `SupplierRegistry`. Admins là bên thứ ba độc lập.
2. **Campaign Manager (Người quản lý quỹ)**: Tạo Request để giải ngân. **Bắt buộc** phải chọn Người nhận (`recipient`) từ danh sách Nhà cung cấp đã được duyệt. Không được phép mạo nhận ví để trục lợi.
3. **Donors / Validators (Người đóng góp / Kiểm duyệt viên)**: Biểu quyết cấp vốn cho các đơn đặt hàng từ Manager.
4. **Oracle / Verifier (Xác thực viên)**: Xác nhận Nhà cung cấp đã giao hàng/thực hiện xong dịch vụ để hợp đồng tự động gọi hàm thanh toán số tiền cho Nhà cung cấp. Manager không bao giờ cầm tiền mặt.

### Luồng A: Phê duyệt nhanh qua Validator Pool (Dành cho Chi Phí Nhỏ)
Dành cho các chi phí vận hành nhỏ lẻ liên tục. Tránh làm phiền Donor (Voter Fatigue).

1. **Tạo Request**: Manager tạo request bình thường nhưng thanh toán phải nhắm tới một Supplier đã duyệt. Hệ thống tự kích hoạt Path A nếu `< 0.5%`.
2. **Chọn Validator**: Smart Contract tự động chọn **3 địa chỉ Validator ngẫu nhiên** từ Pool.
3. **Biểu quyết**: 2 trên 3 Validator được chọn nhấn `approveAsValidator`.
4. **Giải ngân**: Manager gọi `finalizeRequest`, tiền chuyển thẳng cho Nhà cung cấp (Không thông qua Manager).

### Luồng B: Phê duyệt đa tầng (Proof of Delivery / Milestones)
Dành cho các khoản chi lớn hoặc lộ trình dự án dài hơi. Giải ngân theo tiến độ giao hàng/tiến độ công trình.

1. **Tạo Lộ trình**: Manager tạo `MultiStageRequest` với danh sách các cột mốc (Milestones).
2. **Duyệt Tổng**: Donors biểu quyết **TẤT CẢ** các giai đoạn một lần duy nhất (>50% đồng ý).
3. **Thực hiện Giai đoạn (Proof of Delivery)**: Sau khi hoàn thành 1 mốc (ví dụ: Supplier giao đủ vật liệu xây dựng), Verifier ký một thông điệp (Signature) xác nhận mốc đó đã xong.
4. **Giải ngân Tự động**: Manager gọi `executeMilestone` kèm chữ ký số. Smart Contract tự xác thực chữ ký (ECDSA) và chuyển thẳng số tiền mốc đó cho Supplier.

---

## 🏛 Kiến Trúc Hệ Thống (Cập nhật)

```text
  ┌──────────────┐
  │  BƯỚC 0      │     Platform Admin thẩm định & thêm Supplier vào Registry
  │  KYB SUPPLIER│     (SupplierRegistry.addSupplier)
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  BƯỚC 1      │     Manager gọi CampaignFactory.createCampaign()
  │  TẠO CHIẾN   │     → Factory deploy Campaign mới
  │  DỊCH        │     → Liên kết tự động với SupplierRegistry
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  BƯỚC 2      │     Donors gọi Campaign.donate() + gửi ETH
  │  GÂY QUỸ    │     → ETH được khóa trong contract
  │  (DONATE)    │     → totalDonors tăng lên
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  BƯỚC 3      │     Manager gọi Campaign.createRequest()
  │  TẠO ĐƠN HÀNG│     → Khai báo: mô tả, số tiền, Supplier (Từ danh sách trắng)
  │  (REQUEST)   │     → Thất bại nếu Supplier chưa được duyệt!
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  BƯỚC 4      │     Donors / Validators biểu quyết
  │  BIỂU QUYẾT │     → Validator duyệt nếu lệnh nhỏ / Donors duyệt > 50% nếu lớn
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  BƯỚC 5      │     Oracle ký xác nhận (Proof of Delivery)
  │  GIẢI NGÂN   │     → Gửi thẳng ETH cho Supplier bằng Smart Contract
  │  TỰ ĐỘNG     │     (Manager KHÔNG BAO GIỜ chạm vào tiền quỹ)
  └──────────────┘
```

### Ví dụ cụ thể

Giả sử có 3 donors: Alice, Bob, Charlie. Manager là David. Platform Admin là Eve. Cửa hàng là Shop.

| Bước | Ai thực hiện | Hành động | Kết quả |
|---|---|---|---|
| 0 | Eve | `SupplierRegistry.addSupplier(Shop)` | Đưa Shop vào Danh sách Trắng |
| 1 | David | `createCampaign(0.01 ETH)` | Campaign mới được tạo, minimum = 0.01 ETH |
| 2 | Alice | `donate()` + 5 ETH | totalDonors = 1, balance = 5 ETH |
| 3 | Bob | `donate()` + 3 ETH | totalDonors = 2, balance = 8 ETH |
| 4 | Charlie | `donate()` + 2 ETH | totalDonors = 3, balance = 10 ETH |
| 5 | David | `createRequest("Mua server", 4 ETH, Shop)` | Request #0 được khởi tạo (*không lỗi vì Shop đã duyệt*) |
| 6 | Alice | `approveRequest(0)` | approvalCount = 1/3 |
| 7 | Bob | `approveRequest(0)` | approvalCount = 2/3 (>50% ✅) |
| 8 | David | `finalizeRequest(0)` | 4 ETH chuyển cho Shop, balance = 6 ETH |

---

## ❗ Các Lỗi Thường Gặp & Cách Khắc Phục

### Khi compile

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `Error: Cannot find module '@openzeppelin/...'` | Chưa cài dependencies | `npm install` |
| `ParserError: Source file requires different compiler version` | Version mismatch | Kiểm tra `pragma` trong `.sol` khớp với `hardhat.config.ts` |

### Khi test

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `Error: missing revert data` | Contract revert nhưng không có custom error | Kiểm tra logic contract |
| Test timeout | Test chạy quá lâu | Tăng timeout trong `hardhat.config.ts` |

### Khi deploy

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `Error: insufficient funds` | Ví không đủ ETH để trả gas | Lấy thêm ETH từ faucet |
| `Error: could not detect network` | RPC URL sai hoặc không hoạt động | Kiểm tra `SEPOLIA_RPC_URL` trong `.env` |
| `Error: invalid private key` | Private key sai format | Phải đúng 64 ký tự hex, không có `0x` ở đầu |
| `Nonce too high` | MetaMask cache nonce cũ | MetaMask → Settings → Advanced → Clear activity tab data |

### Khi tương tác

| Lỗi | Nguyên nhân | Cách fix |
|---|---|---|
| `NotManager()` | Bạn không phải manager | Dùng đúng ví của manager |
| `NotDonor()` | Bạn chưa donate | Donate trước khi vote |
| `InsufficientFunds()` | Số tiền gửi < minimum | Gửi đủ hoặc hơn minimum |
| `AlreadyVoted()` | Đã vote rồi | Mỗi donor chỉ vote 1 lần |
| `NotEnoughApprovals()` | Chưa đủ >50% phiếu | Cần thêm donors vote |
| `CampaignNotActive()` | Campaign đã bị deactivate | Không thể donate/vote nữa |

---

## 📝 Thuật Ngữ Blockchain (Glossary)

| Thuật ngữ | Tiếng Việt | Giải thích |
|---|---|---|
| **Smart Contract** | Hợp đồng thông minh | Chương trình chạy tự động trên blockchain |
| **IPFS / CID** | — | Hệ thống lưu trữ file phi tập trung / Mã định danh nội dung |
| **Deploy** | Triển khai | Đưa contract lên blockchain để mọi người sử dụng |
| **Transaction (tx)** | Giao dịch | Một thao tác thay đổi dữ liệu trên blockchain |
| **Gas** | Phí gas | Chi phí tính toán trên Ethereum, trả bằng ETH |
| **Wei** | — | Đơn vị nhỏ nhất của ETH (1 ETH = 10^18 Wei) |
| **ABI** | — | Application Binary Interface — "bản hướng dẫn" giao tiếp với contract |
| **Bytecode** | Mã byte | Mã máy của contract, chạy trên EVM |
| **EVM** | — | Ethereum Virtual Machine — "máy ảo" chạy Smart Contract |
| **msg.sender** | — | Địa chỉ ví của người gọi hàm hiện tại |
| **msg.value** | — | Số ETH (wei) gửi kèm giao dịch |
| **modifier** | Bộ điều chỉnh | Code kiểm tra điều kiện trước khi chạy hàm |
| **payable** | — | Cho phép hàm/địa chỉ nhận ETH |
| **view** | — | Hàm chỉ đọc, không thay đổi state, miễn phí gas |
| **emit** | Phát ra | Ghi log sự kiện lên blockchain |
| **revert** | Hoàn tác | Hủy giao dịch, hoàn trả mọi thay đổi + gas còn lại |
| **mapping** | Bản đồ | Cấu trúc dữ liệu key-value (giống dictionary/hashmap) |
| **Re-entrancy** | Tấn công gọi lại | Kẻ tấn công gọi lại contract trước khi giao dịch hoàn tất |
| **Faucet** | Vòi nước | Trang web phát ETH miễn phí trên testnet |
| **RPC** | — | Remote Procedure Call — giao thức giao tiếp với node blockchain |
| **Testnet** | Mạng thử nghiệm | Bản sao blockchain để test miễn phí |
| **Mainnet** | Mạng chính | Blockchain thật, tiền thật |
| **Factory Pattern** | Mẫu nhà máy | Pattern mà 1 contract tạo ra nhiều contracts con |
| **Verify** | Xác minh | Công khai mã nguồn contract trên Etherscan |

---

## 🔗 Tài Liệu Tham Khảo

| Tài liệu | Link |
|---|---|
| Solidity Documentation | [docs.soliditylang.org](https://docs.soliditylang.org/) |
| Hardhat Documentation | [hardhat.org/docs](https://hardhat.org/docs) |
| OpenZeppelin Contracts | [docs.openzeppelin.com/contracts](https://docs.openzeppelin.com/contracts/) |
| Ethers.js v6 | [docs.ethers.org/v6](https://docs.ethers.org/v6/) |
| Ethereum.org | [ethereum.org/developers](https://ethereum.org/vi/developers/) |
| Sepolia Etherscan | [sepolia.etherscan.io](https://sepolia.etherscan.io/) |

---

## 📋 Tóm Tắt Lệnh Thường Dùng

```bash
# ===== CÀI ĐẶT =====
npm install                                    # Cài thư viện

# ===== PHÁT TRIỂN =====
npx hardhat compile                            # Biên dịch contracts
npx hardhat test                               # Chạy test
REPORT_GAS=true npx hardhat test               # Test + báo cáo gas
npx hardhat test --grep "Donations"            # Test 1 nhóm cụ thể
npx hardhat node                               # Chạy blockchain local

# ===== DEPLOY =====
npx hardhat run scripts/deploy.ts              # Deploy local
npx hardhat run scripts/deploy.ts --network sepolia  # Deploy Sepolia
npx hardhat verify --network sepolia 0x34569f934dC3a22Fb5e3bd8D688FA4244bF9066f "0xe9BC90cee5a039B49ded5E3113E0C23D32ef2f06"  # Verify Registry
npx hardhat verify --network sepolia 0xC178A1E8054b2aC73E43d10a6EBa573C12FA24ce "0x34569f934dC3a22Fb5e3bd8D688FA4244bF9066f" # Verify Factory

# ===== TIỆN ÍCH =====
npx hardhat run scripts/check-balance.ts --network sepolia  # Check số dư ví
npx hardhat console --network sepolia          # Console tương tác
npx hardhat clean                              # Xóa cache + artifacts
```

---

> 📌 **Tài liệu này được tạo bởi Antigravity AI Assistant — Cập nhật lần cuối: 15/04/2026**
