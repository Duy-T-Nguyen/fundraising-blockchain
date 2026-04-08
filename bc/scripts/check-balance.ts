import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log("No private key found in .env");
        return;
    }
    const wallet = new ethers.Wallet(privateKey);
    console.log("Address derived from private key:", wallet.address);
    
    const balance = await ethers.provider.getBalance(wallet.address);
    console.log("Current balance:", ethers.formatEther(balance), "ETH");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
