const AWS = require("aws-sdk");
const textract = new AWS.Textract();
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

// Initialize the Bedrock client
const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });

exports.handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Parse the SQS message body
    const sqsMessageBody = JSON.parse(event.Records[0].body);

    // Extract bucket and file details from the embedded S3 event
    const s3Event = sqsMessageBody.Records[0];
    const bucketName = s3Event.s3.bucket.name;
    let fileName = s3Event.s3.object.key;

    // Decode S3 Key to handle spaces or special characters
    fileName = decodeURIComponent(fileName.replace(/\+/g, " "));

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
    const extractedText = textractResponse.Blocks.filter(
      (block) => block.BlockType === "LINE"
    )
      .map((block) => block.Text)
      .join("\n");

    console.log("Extracted Text:", extractedText);

    // Sanitize extracted text before sending to Bedrock
    const sanitizedText = sanitizeText(extractedText);
    console.log("Sanitized Text:", sanitizedText);

    // Step 2: Send sanitized text to AWS Bedrock
    const bedrockResponse = await sendToBedrock(sanitizedText);
    console.log("Bedrock Response:", bedrockResponse);

    // Step 3: Return processed response to the client
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File processed successfully",
        extractedText,
        bedrockSummary: bedrockResponse,
      }),
    };
  } catch (error) {
    console.error("Error processing file:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error processing file",
        error: error.message,
      }),
    };
  }
};

// Function to send extracted text to AWS Bedrock
async function sendToBedrock(inputText) {
  try {
    console.log("Sending text to AWS Bedrock for processing...");

    // Prepare the payload following Titan's schema
    const payload = {
      inputText: `User: ${sanitizeText(inputText)}\nBot:`, // Wrap the inputText per Titan's conversational format
      textGenerationConfig: {
        maxTokenCount: 512
      },
    };

    // Construct Bedrock request parameters
    const params = {
      modelId: "amazon.titan-text-lite-v1", // Model ID for Titan Text Lite
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    };

    console.log('params', params);

    // Send the request to AWS Bedrock
    const command = new InvokeModelCommand(params);
    const response = await bedrockClient.send(command);

    console.log("Raw Bedrock Response:", response);

    // Parse the response body
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    console.log("Parsed Bedrock Response:", responseBody);

    // Extract generated text
    const generatedText =
      responseBody.results?.[0]?.outputText || "No generated text available";

    return generatedText;
  } catch (error) {
    console.error("Error invoking AWS Bedrock:", error.message);
    throw error; // Ensure the error propagates
  }
}

function sanitizeText(text) {
    return text
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII characters
      .replace(/\s+/g, " ")         // Collapse all whitespace (including newlines) into a single space
      .trim();                      // Remove leading/trailing whitespace
  }
  