const AWS = require("aws-sdk");
const sqs = new AWS.SQS();

exports.handler = async (event) => {
  console.log("Event received: ", JSON.stringify(event, null, 2));

  // Extract SQS message records
  const records = event.Records || [];
  for (const record of records) {
    try {
      // Parse the S3 event details from the SQS message body
      const s3Event = JSON.parse(record.body);
      const s3Record = s3Event.Records && s3Event.Records[0];
      
      if (!s3Record) {
        console.error("No S3 record found in SQS message");
        continue;
      }

      const bucketName = s3Record.s3.bucket.name;
      const fileName = s3Record.s3.object.key;

      console.log(`Processing file ${fileName} from bucket ${bucketName}`);

      // Send a message to SQS
      await sqs
        .sendMessage({
          QueueUrl: process.env.SQS_QUEUE_URL,
          MessageBody: `File uploaded: ${fileName} from bucket: ${bucketName}`,
        })
        .promise();
    } catch (error) {
      console.error("Error processing record:", error);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify("Processing complete"),
  };
};
