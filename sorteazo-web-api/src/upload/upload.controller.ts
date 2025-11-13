import { Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { multerConfig } from './multer.config';

@UseGuards(AuthGuard('jwt'))
@Controller('upload')
export class UploadController {
  @Post('image')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return {
        success: false,
        message: 'No se subió ningún archivo',
      };
    }

    return {
      success: true,
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      url: `${process.env.API_URL || 'http://localhost:3000'}/uploads/${file.filename}`,
    };
  }
}
