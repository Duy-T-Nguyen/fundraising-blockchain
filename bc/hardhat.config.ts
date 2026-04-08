import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// Validate: a valid private key is exactly 64 hex chars (32 bytes), with optional 0x prefix
const rawKey = PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY.slice(2) : PRIVATE_KEY;
const isValidPrivateKey = rawKey.length === 64 && /^[0-9a-fA-F]+$/.test(rawKey);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    ...(isValidPrivateKey
      ? {
          sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [`0x${rawKey}`],
          },
        }
      : {}),
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
  },
};

export default config;