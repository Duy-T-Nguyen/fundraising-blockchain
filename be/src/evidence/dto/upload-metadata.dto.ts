import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class UploadMetadataDto {
  @ApiProperty({
    description: 'Dữ liệu JSON metadata',
    example: { name: 'Campaign', description: 'Desc', image: 'ipfs://...' },
  })
  @IsNotEmpty({ message: 'Metadata không được để trống' })
  @IsObject()
  metadata: any;

  @ApiProperty({
    description: 'Địa chỉ ví của người dùng',
    example: '0x1234...',
  })
  @IsNotEmpty({ message: 'Địa chỉ ví không được để trống' })
  @IsString()
  address: string;

  @ApiProperty({
    description: 'Chữ ký số của người dùng với nội dung: "FundChain IPFS Upload"',
    example: '0xabcd...',
  })
  @IsNotEmpty({ message: 'Chữ ký số không được để trống' })
  @IsString()
  signature: string;
}
