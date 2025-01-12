const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const DynamoDB = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid');

const BUCKET_NAME = "file-uploader-bucket-50294247";
const TABLE_NAME = "JDTable";

exports.handler = async (event) => {
  try {
    // Log the incoming event for debugging
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Parse the payload correctly based on the structure
    const { uploadType, metadata, file } = event;

    if (!uploadType || !file) {
      throw new Error('Invalid payload: Missing required fields (uploadType or file).');
    }

    if (uploadType === 'JD') {
      const newJdId = `JD-${uuid.v4()}`;
      const jdKey = `jds/${newJdId}.json`;

      // Store JD metadata in DynamoDB
      await DynamoDB.put({
        TableName: TABLE_NAME,
        Item: {
          jdId: newJdId,
          metadata,
          resumes: [], // Empty list for resumes
          createdAt: new Date().toISOString(),
        },
      }).promise();

      // Upload JD metadata file to S3
      await S3.putObject({
        Bucket: BUCKET_NAME,
        Key: jdKey,
        Body: JSON.stringify(metadata),
        ContentType: 'application/json',
      }).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'JD uploaded successfully', jdId: newJdId }),
      };

    } else if (uploadType === 'Resume') {
      const { jdId } = metadata;

      if (!jdId) {
        throw new Error('Invalid payload: Missing JD ID for Resume upload.');
      }

      const resumeKey = `resumes/${jdId}/${uuid.v4()}.pdf`;

      // Check if JD exists in DynamoDB
      const jdResult = await DynamoDB.get({
        TableName: TABLE_NAME,
        Key: { jdId },
      }).promise();

      if (!jdResult.Item) {
        throw new Error(`JD with ID ${jdId} not found.`);
      }

      // Upload Resume to S3
      const fileBuffer = Buffer.from(file, 'base64');
      await S3.putObject({
        Bucket: BUCKET_NAME,
        Key: resumeKey,
        Body: fileBuffer,
        ContentType: 'application/pdf',
      }).promise();

      // Update DynamoDB resumes field
      await DynamoDB.update({
        TableName: TABLE_NAME,
        Key: { jdId },
        UpdateExpression: 'SET resumes = list_append(if_not_exists(resumes, :emptyList), :resume)',
        ExpressionAttributeValues: {
          ':resume': [resumeKey],
          ':emptyList': [],
        },
      }).promise();

      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Resume uploaded successfully', resumeKey }),
      };
    } else {
      throw new Error("Invalid upload type. Must be 'JD' or 'Resume'.");
    }

  } catch (error) {
    console.error('Error processing upload:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error processing upload', error: error.message }),
    };
  }
};
