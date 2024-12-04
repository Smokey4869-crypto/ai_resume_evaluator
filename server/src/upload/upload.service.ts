import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });
  constructor(private readonly configService: ConfigService) {}

  async upload(fileName: string, file: Buffer) {
    try {
      const response = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: 'file-uploader-bucket-50294247',
          Key: fileName,
          Body: file,
        }),
      );

      console.log("success")
      return {
        code: 200,
        message: 'File uploaded successfully',
      }
    } catch (error) {
      console.log(error);
      return {
        code: 500, 
        message: 'Error uploading file'
      }
    }
  }
}
