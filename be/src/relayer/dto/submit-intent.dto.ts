import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class ForwardRequestDto {
  @ApiProperty({ example: '0x123...', description: 'Địa chỉ ví người gửi' })
  from: string;

  @ApiProperty({ example: '0x456...', description: 'Địa chỉ hợp đồng Forwarder' })
  to: string;

  @ApiProperty({ example: '0', description: 'Giá trị ETH gửi kèm (thường là 0 cho meta-tx)' })
  value: string;

  @ApiProperty({ example: '100000', description: 'Lượng Gas giới hạn' })
  gas: string;

  @ApiProperty({ example: '0', description: 'Nonce của người dùng trong Forwarder' })
  nonce: string;

  @ApiProperty({ example: '0x...', description: 'Dữ liệu hàm muốn thực thi (Hex)' })
  data: string;
}

export class SubmitIntentDto {
  @ApiProperty({ type: ForwardRequestDto })
  @IsNotEmpty()
  @IsObject()
  forwardRequest: ForwardRequestDto;

  @ApiProperty({ 
    example: '0x789...', 
    description: 'Chữ ký EIP-712 của người dùng' 
  })
  @IsNotEmpty()
  @IsString()
  signature: string;
}
