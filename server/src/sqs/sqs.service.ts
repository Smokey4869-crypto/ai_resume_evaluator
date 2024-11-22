import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

@Injectable()
export class SqsService implements OnModuleInit {
  private readonly logger = new Logger(SqsService.name);
  private sqsClient: SQSClient;
  private queueUrl =
    'https://sqs.us-east-1.amazonaws.com/155949800437/TaskQueue';

  constructor() {
    this.sqsClient = new SQSClient({ region: 'us-east-1' });
  }

  async onModuleInit() {
    this.logger.log('Starting SQS Listener...');
    this.pollMessages();
  }

  private async pollMessages() {
    while (true) {
      try {
        const response = await this.sqsClient.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 10, // Poll up to 10 messages at once
            WaitTimeSeconds: 20, // Enable long polling
          }),
        );

        if (response.Messages && response.Messages.length > 0) {
          for (const message of response.Messages) {
            this.logger.log(`Processing message: ${message.Body}`);

            try {
              const body = JSON.parse(message.Body!);

              // Validate the structure before processing
              if (body.Records && body.Records.length > 0) {
                this.handleS3Event(body);
              } else {
                this.logger.warn(
                  'Message does not contain valid S3 event data:',
                  message.Body,
                );
              }

              // Delete the message after processing
              await this.sqsClient.send(
                new DeleteMessageCommand({
                  QueueUrl: this.queueUrl,
                  ReceiptHandle: message.ReceiptHandle!,
                }),
              );
              this.logger.log(`Message deleted: ${message.MessageId}`);
            } catch (messageError) {
              this.logger.error('Error processing message:', messageError);
            }
          }
        } else {
          this.logger.debug('No messages received in this polling cycle.');
        }
      } catch (error) {
        this.logger.error('Error receiving SQS messages:', error);
      }
    }
  }

  private handleS3Event(event: any) {
    const record = event.Records[0];
    const bucketName = record.s3.bucket.name;
    const objectKey = record.s3.object.key;
    this.logger.log(
      `File ${objectKey} was added/modified in bucket ${bucketName}`,
    );

    // TODO: Implement further actions based on your needs
  }
}
