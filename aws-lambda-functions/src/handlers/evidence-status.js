const { createResponse, createErrorResponse, createOptionsResponse } = require('../utils/api-utils.js');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const EVIDENCE_TABLE = process.env.EVIDENCE_TABLE || 'evidence-evidence-files';

/**
 * Lambda function to check evidence processing status
 * GET /evidence/{evidenceId}/status
 */
exports.evidenceStatusHandler = async (event) => {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return createOptionsResponse();
    }

    try {
        // Get evidenceId from path parameters or query string
        const evidenceId = event.pathParameters?.evidenceId || 
                          event.queryStringParameters?.evidenceId;

        if (!evidenceId) {
            return createErrorResponse(400, 'Evidence ID is required');
        }

        // Get evidence record from DynamoDB
        const getCommand = new GetCommand({
            TableName: EVIDENCE_TABLE,
            Key: { id: evidenceId }
        });

        const result = await docClient.send(getCommand);

        if (!result.Item) {
            return createErrorResponse(404, 'Evidence not found');
        }

        const evidence = result.Item;

        // Return status and extracted text if available
        return createResponse(200, {
            evidenceId: evidence.id,
            status: evidence.processingStatus,
            fileName: evidence.fileName,
            fileType: evidence.fileType,
            uploadedAt: evidence.uploadedAt,
            lastUpdated: evidence.lastUpdated,
            extractedText: evidence.extractedText || null,
            s3Url: evidence.s3Url
        });

    } catch (error) {
        console.error('Error checking evidence status:', {
            error: error.message,
            stack: error.stack,
            evidenceId: event.pathParameters?.evidenceId
        });

        return createErrorResponse(500, 'Failed to check evidence status');
    }
};