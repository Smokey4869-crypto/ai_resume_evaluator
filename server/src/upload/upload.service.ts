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
              Bucket: 's3-nestjs-uploader',
              Key: fileName,
              Body: file,
            }),
          );
        
        console.log(response);
    } catch(error) {
        console.log(error)
    }
  }
}
