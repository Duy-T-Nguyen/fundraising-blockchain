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

## 📂 Project Structure

- `src/evidence/`: Core logic for IPFS uploads.
- `src/app.module.ts`: Root module configuration.
- `test/`: End-to-end test suite.

---
*Created by Antigravity AI Assistant.*
