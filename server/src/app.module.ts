import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { UploadService } from './upload/upload.service';
import { ConfigModule } from '@nestjs/config';
import { SqsModule } from './sqs/sqs.module';

@Module({
  imports: [
    UploadModule, 
    ConfigModule.forRoot({ isGlobal: true }), 
    // SqsModule
  ],
})
export class AppModule {}
