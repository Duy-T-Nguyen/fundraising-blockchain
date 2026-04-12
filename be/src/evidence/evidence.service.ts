import { Injectable, Logger } from '@nestjs/common';
import pinataSDK from '@pinata/sdk';
import { Readable } from 'stream';

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
}
