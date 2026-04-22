import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';
import { ethers } from 'ethers';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);
  private pinata: any;

  constructor() {
    this.pinata = new pinataSDK(
      process.env.PINATA_API_KEY,
      process.env.PINATA_SECRET_KEY,
    );
  }

  verifySignature(address: string, signature: string): void {
    try {
      const message = 'FundChain IPFS Upload';
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new UnauthorizedException('Chữ ký số không hợp lệ. Vui lòng ký đúng thông điệp "FundChain IPFS Upload".');
      }
    } catch (error) {
      this.logger.error(`Signature verification failed: ${error.message}`);
      throw new UnauthorizedException('Xác thực chữ ký thất bại.');
    }
  }

  async uploadToIPFS(file: Express.Multer.File): Promise<{ cid: string; url: string }> {
    try {
      this.logger.log(`Uploading file ${file.originalname} to IPFS...`);

      // Convert buffer to stream for Pinata
      const stream = Readable.from(file.buffer);
      // Attach filename to stream for Pinata
      (stream as any).path = file.originalname;

      const result = await this.pinata.pinFileToIPFS(stream, {
        pinataMetadata: {
          name: file.originalname,
        },
      });

      const cid = result.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

      this.logger.log(`Success! CID: ${cid}`);

      return { cid, url };
    } catch (error) {
      this.logger.error('Failed to upload to IPFS', error.stack);
      throw error;
    }
  }

  async uploadJSONToIPFS(data: any): Promise<{ cid: string; url: string }> {
    try {
      this.logger.log(`Uploading JSON to IPFS...`);

      const result = await this.pinata.pinJSONToIPFS(data, {
        pinataMetadata: {
          name: `metadata-${Date.now()}.json`,
        },
      });

      const cid = result.IpfsHash;
      const url = `https://gateway.pinata.cloud/ipfs/${cid}`;

      this.logger.log(`JSON Success! CID: ${cid}`);

      return { cid, url };
    } catch (error) {
      this.logger.error('Failed to upload JSON to IPFS', error.stack);
      throw error;
    }
  }

  async getMetadata(cid: string): Promise<any> {
    try {
      this.logger.log(`Fetching metadata for CID: ${cid}`);
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error(`Error fetching metadata for CID ${cid}:`, error.stack);
      // Return empty object to prevent frontend crash
      return {};
    }
  }
}
