import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadEvidenceDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Hình ảnh minh chứng (JPG, PNG, < 5MB)',
  })
  file: any;

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
