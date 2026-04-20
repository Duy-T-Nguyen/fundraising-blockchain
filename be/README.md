# 🚀 Fundraising Backend (NestJS)

This is the backend component of the **Fundraising Blockchain** project. Its primary responsibility is managing **IPFS Evidence Storage** using Pinata.

## 🛠 Features

- **Evidence Management**: Securely upload invoices, delivery photos, and receipts to IPFS.
- **Pinata Integration**: Seamlessly communicates with Pinata SDK for data pinning.
- **Blockchain Listener**: Real-time monitoring of `CampaignStarted` events.
- **Auto-Verification**: Automatically triggers Hardhat Etherscan verification for newly deployed campaigns.
- **MongoDB Sync State**: Uses MongoDB to securely cache the `lastProcessedBlock`, ensuring no events are missed even if the server restarts.
- **Signature Verification**: Requires cryptographic signatures (`ethers.verifyMessage`) to validate users uploading evidence to IPFS.

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
CAMPAIGN_FACTORY_ADDRESS=0xf4901bBc7d340584120273F8db235cF5322CA344
MONGODB_URI=mongodb://localhost:27017/fundchain
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
