import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { EvidenceService } from './evidence.service';
import { UploadEvidenceDto } from './dto/upload-evidence.dto';

@ApiTags('Evidence')
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) { }

  @Post('upload')
  @ApiOperation({ summary: 'Tải ảnh minh chứng lên IPFS' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Dữ liệu upload minh chứng',
    type: UploadEvidenceDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadEvidenceDto: UploadEvidenceDto,
  ) {
    if (!uploadEvidenceDto.address || !uploadEvidenceDto.signature) {
      throw new UnauthorizedException('Thiếu chữ ký số hoặc địa chỉ ví');
    }

    // Yêu cầu Service xác thực
    this.evidenceService.verifySignature(uploadEvidenceDto.address, uploadEvidenceDto.signature);

    return this.evidenceService.uploadToIPFS(file);
  }
}
