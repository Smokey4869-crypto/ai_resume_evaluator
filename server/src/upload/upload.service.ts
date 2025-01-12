import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class UploadService {
  private readonly lambda: AWS.Lambda;

  constructor(private readonly configService: ConfigService) {
    AWS.config.update({ region: this.configService.getOrThrow('AWS_REGION') });
    this.lambda = new AWS.Lambda();
  }

  async upload(
    files: Express.Multer.File[],
    metadata: { uploadType: string; title?: string; description?: string }
  ) {
    
    try {
      if (!metadata || !metadata.uploadType) {
        throw new Error('Missing or invalid uploadType in metadata');
      }

      // Example: Call Lambda function for processing the file(s) and metadata
      const results = await Promise.all(
        files.map(async (file) => {
          const payload = {
            uploadType: metadata.uploadType,
            metadata: {
              title: metadata.title,
              description: metadata.description,
            },
            file: file.buffer.toString('base64'), // Send file as base64
          };

          const params = {
            FunctionName: this.configService.getOrThrow(
              'AWS_LAMBDA_FUNCTION_NAME',
            ),
            Payload: JSON.stringify(payload),
          };

          // Invoke the Lambda function

          console.log('params', params);

          const response = await this.lambda.invoke(params).promise();
          const result = JSON.parse(response.Payload as string);

          console.log('invoke lambda', result);

          if (response.FunctionError) {
            throw new Error(
              result.errorMessage || 'Error returned from Lambda function',
            );
          }

          return result;
        }),
      );

      // Return aggregated results
      return {
        code: 200,
        message: 'Files processed successfully',
        results,
      };
    } catch (error) {
      console.error('Error in service:', error);
      throw new Error(`Upload service failed: ${error.message}`);
    }
  }
}
