# 🚀 Fundraising Backend (NestJS)

This is the backend component of the **Fundraising Blockchain** project. Its primary responsibility is managing **IPFS Evidence Storage** using Pinata.

## 🛠 Features

- **Evidence Management**: Securely upload invoices, delivery photos, and receipts to IPFS.
- **Pinata Integration**: Seamlessly communicates with Pinata SDK for data pinning.
- **Real-time Notifications**: Instant updates via **Socket.io** for all system roles (Admin, Validator, Supplier, etc.).
- **Redis Integration**: Uses **Redis** as a Pub/Sub adapter for Socket.io, enabling horizontal scaling and stable real-time communication across multiple backend instances.
- **Hybrid Notification Strategy**: Combines real-time WebSocket pushes with persistent MongoDB storage, ensuring users never miss a task (even if offline).
- **Blockchain Listener**: Advanced monitoring for Campaign and Factory events with automatic indexing.
- **Signature Verification**: Secure IPFS uploads protected by ECDSA signature verification.
- **Auto-Verification**: Automated Etherscan verification for all dynamically deployed Campaign contracts.

## 🏗 Setup & Installation

### 1. Prerequisites
- **Node.js**: v18+
- **Yarn**: 1.22+
- **Pinata Account**: Required for IPFS storage.

### 2. Configuration (`.env`)
Create a `.env` file in the `be/` directory:

```env
PORT=1609
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key
ACCESS_KEY=your_jwt_token (Optional but recommended)
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/...
CAMPAIGN_FACTORY_ADDRESS=0x9F24fd3F2c387Ed8CEa41621ca001faAfC385952
ADMIN_ADDRESS=0xe9BC90cee5a039B49ded5E3113E0C23D32ef2f06
REDIS_HOST=redis
REDIS_PORT=6379
MONGODB_URI=mongodb://mongodb:27017/fundchain
```

> [!NOTE]
> You can find these keys in your [Pinata Dashboard](https://app.pinata.cloud/keys).

### 3. Install Dependencies
```bash
yarn install
```

### 4. Running the Application
```bash
# Development
yarn run start:dev

# Production
yarn run start:prod
```

### 5. Running with Docker 🐳
For easy deployment and isolation, you can use Docker:

```bash
# Build and start with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f
```

The Docker setup uses a multi-stage build to optimize image size and security:
- **Base image**: Node.js 22 Alpine
- **Security**: Runs as a non-root `nodejs` user
- **Optimization**: Separates build dependencies from production runtime

## 📡 API Endpoints

### Evidence Upload
- **URL**: `POST /evidence/upload`
- **Body**: `multipart/form-data`
- **Fields**: 
  - `file`: Image/PDF
  - `address`: User's wallet address
  - `signature`: Signature of message "FundChain IPFS Upload"
- **Response**:
  ```json
  {
    "cid": "Qm...",
    "url": "https://gateway.pinata.cloud/ipfs/Qm..."
  }
  ```

## 📖 Swagger API Documentation

Once the server is running, you can interactively test the APIs (like uploading evidence) without needing any external tools.

- **URL**: [http://localhost:1609/api](http://localhost:1609/api)

## 🔗 Testnet Interaction Flow

When interacting with the Blockchain (Sepolia Testnet), the Backend serves as the secure bridge for evidence:

1.  **Upload Evidence/Images**: Use the Swagger UI or Frontend to upload an image to `POST /evidence/upload`.
2.  **Get CID**: The API will return an IPFS `cid`.
3.  **Link to Blockchain**: 
    - **Campaign Image**: Pass the `cid` into the `imageHash` parameter when calling `submitCampaignRequest`.
    - **Request Evidence**: Pass the `cid` into the `evidenceHash` parameter of `createRequest`.

## 📂 Project Structure

- `src/evidence/`: Core logic for IPFS uploads.
- `src/app.module.ts`: Root module configuration.
- `test/`: End-to-end test suite.

---
*Created by Antigravity AI Assistant.*
