import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { UploadService } from './upload/upload.service';

@Module({
  imports: [UploadModule]
})
export class AppModule {}
