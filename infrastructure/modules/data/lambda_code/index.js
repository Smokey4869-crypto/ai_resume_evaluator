const AWS = require('aws-sdk'); 
const textract = new AWS.Textract();
const { BedrockClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock');

// Initialize the Bedrock client
const bedrock = new BedrockClient({ region: 'us-east-1' });

exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));

        // Parse the SQS message body
        const sqsMessageBody = JSON.parse(event.Records[0].body);

        // Extract bucket and file details from the embedded S3 event
        const s3Event = sqsMessageBody.Records[0];
        const bucketName = s3Event.s3.bucket.name;
        let fileName = s3Event.s3.object.key;

        // Decode S3 Key to handle spaces or special characters
        fileName = decodeURIComponent(fileName.replace(/\+/g, ' '));

        console.log(`Processing file: ${fileName} from S3 bucket: ${bucketName}`);

        // Step 1: Call Textract to extract text
        const textractResponse = await textract
            .detectDocumentText({
                Document: {
                    S3Object: {
                        Bucket: bucketName,
                        Name: fileName,
                    },
                },
            })
            .promise();

        // Extract text lines from Textract response
        const extractedText = textractResponse.Blocks
            .filter((block) => block.BlockType === 'LINE')
            .map((block) => block.Text)
            .join('\n');

        console.log('Extracted Text:', extractedText);

        // Step 2: Send extracted text to AWS Bedrock
        const bedrockResponse = await sendToBedrock(extractedText);
        console.log('Bedrock Response:', bedrockResponse);

        // Step 3: Return processed response to the client
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'File processed successfully',
                extractedText,
                bedrockSummary: bedrockResponse, // Add Bedrock summary to the response
            }),
        };
    } catch (error) {
        console.error('Error processing file:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing file',
                error: error.message,
            }),
        };
    }
};

// Function to send extracted text to AWS Bedrock
async function sendToBedrock(inputText) {
    try {
        console.log('Sending text to AWS Bedrock for processing...');

        // Replace YOUR_MODEL_ID with the actual Bedrock model ID you are using
        const params = {
            modelId: 'YOUR_MODEL_ID', // e.g., "amazon.titan-text-express-v1"
            contentType: 'application/json',
            body: JSON.stringify({
                prompt: `Summarize the following text:\n\n${inputText}`,
                maxTokens: 500,
            }),
        };

        // Create and send the command to Bedrock
        const command = new InvokeModelCommand(params);
        const response = await bedrock.send(command);

        console.log('Raw Bedrock Response:', response);

        // Parse and return the Bedrock response
        const responseBody = JSON.parse(response.body);
        const summary = responseBody.completions[0].data.text; // Adjust based on model output format

        return summary;
    } catch (error) {
        console.error('Error invoking AWS Bedrock:', error.message);
        throw error; // Ensure the error propagates to the main function
    }
}
