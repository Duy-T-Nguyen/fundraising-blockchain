# 🚀 Fundraising Backend (NestJS)

This is the backend component of the **Fundraising Blockchain** project. Its primary responsibility is managing **IPFS Evidence Storage** using Pinata.

## 🛠 Features

- **Evidence Management**: Securely upload invoices, delivery photos, and receipts to IPFS.
- **Pinata Integration**: Seamlessly communicates with Pinata SDK for data pinning.
- **Validation**: Ensures only authorized files are pinned to the IPFS network.

## 🏗 Setup & Installation

### 1. Prerequisites
- **Node.js**: v18+
- **Yarn**: 1.22+
- **Pinata Account**: Required for IPFS storage.

### 2. Configuration (`.env`)
Create a `.env` file in the `be/` directory:

```env
PORT=3000
PINATA_API_KEY=your_api_key
PINATA_SECRET_KEY=your_secret_key
ACCESS_KEY=your_jwt_token (Optional but recommended)
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

## 📡 API Endpoints

### Evidence Upload
- **URL**: `POST /evidence/upload`
- **Body**: `multipart/form-data`
- **Field**: `file` (Image/PDF)
- **Response**:
  ```json
  {
    "cid": "Qm...",
    "url": "https://gateway.pinata.cloud/ipfs/Qm..."
  }
  ```

## 📖 Swagger API Documentation

Once the server is running, you can interactively test the APIs (like uploading evidence) without needing any external tools.

- **URL**: [http://localhost:3000/api](http://localhost:3000/api)

## 🔗 Testnet Interaction Flow

When interacting with the Blockchain (Sepolia Testnet), the Backend serves as the secure bridge for evidence:

1.  **Upload Evidence**: Use the Swagger UI or Frontend to upload an image to `POST /evidence/upload`.
2.  **Get CID**: The API will return an IPFS `cid`.
3.  **Link to Blockchain**: Pass this `cid` into the `evidenceHash` parameter of the `createRequest` OR use it when initializing a Campaign via `createCampaign(name, category, min)` on the Smart Contract.

## 📂 Project Structure

- `src/evidence/`: Core logic for IPFS uploads.
- `src/app.module.ts`: Root module configuration.
- `test/`: End-to-end test suite.

---
*Created by Antigravity AI Assistant.*
