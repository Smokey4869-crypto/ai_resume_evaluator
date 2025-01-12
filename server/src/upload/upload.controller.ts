import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files')) // Ensure "files" matches the key used in FormData
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('metadata') metadata: string, // Extract the metadata field
  ) {
    try {
      // Parse metadata (frontend sends it as a JSON string)
      const parsedMetadata = metadata ? JSON.parse(metadata) : null;

      // Pass files and metadata to the service for processing
      const result = await this.uploadService.upload(files, parsedMetadata);

      // Return the service's response
      return result;
    } catch (error) {
      console.error('Error in controller:', error);
      return {
        code: 500,
        message: 'Failed to upload files',
        error: error.message,
      };
    }
  }
}
