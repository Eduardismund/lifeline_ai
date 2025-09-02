const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'eu-central-1'
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.EVIDENCE_TABLE || 'evidence-files';

/**
 * Create evidence record in DynamoDB when file is uploaded
 * @param {string} bucketName - S3 bucket name
 * @param {string} objectKey - S3 object key
 * @param {string} fileType - Type of file (AUDIO, VIDEO, IMAGE, TEXT)
 * @returns {Object} Evidence record
 */
async function createEvidenceRecord(bucketName, objectKey, fileType) {
    // Extract evidence ID from S3 key filename
    const fileName = objectKey.split('/').pop();
    const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
    const uuids = fileNameWithoutExt.match(uuidRegex);
    const evidenceId = uuids ? uuids[uuids.length - 1] : uuidv4(); // Use UUID from filename or generate new
    const timestamp = new Date().toISOString();

    const evidenceRecord = {
        id: evidenceId,
        fileName: fileName,
        s3Bucket: bucketName,
        s3Key: objectKey,
        s3Url: `https://${bucketName}.s3.amazonaws.com/${objectKey}`,
        fileType: fileType,
        processingStatus: 'PROCESSING',
        uploadedAt: timestamp,
        lastUpdated: timestamp
    };

    const params = {
        TableName: TABLE_NAME,
        Item: evidenceRecord
    };

    try {
        await docClient.send(new PutCommand(params));
        console.log('✅ Evidence record created:', evidenceRecord);
        return evidenceRecord;
    } catch (error) {
        console.error('❌ Error creating evidence record:', error);
        throw new Error(`Failed to create evidence record: ${error.message}`);
    }
}

/**
 * Update evidence record with extracted text and status
 * @param {string} evidenceId - Evidence record ID
 * @param {string} extractedText - Text extracted from file
 * @param {string} status - Processing status (PROCESSED or FAILED)
 * @returns {Object} Update result
 */
async function updateEvidenceRecord(evidenceId, extractedText, status) {
    const timestamp = new Date().toISOString();

    const params = {
        TableName: TABLE_NAME,
        Key: { id: evidenceId },
        UpdateExpression: 'SET extractedText = :text, processingStatus = :status, lastUpdated = :timestamp',
        ExpressionAttributeValues: {
            ':text': extractedText || '',
            ':status': status,
            ':timestamp': timestamp
        },
        ReturnValues: 'ALL_NEW'
    };

    try {
        const result = await docClient.send(new UpdateCommand(params));
        console.log('✅ Evidence record updated:', result.Attributes);
        return result.Attributes;
    } catch (error) {
        console.error('❌ Error updating evidence record:', error);
        throw new Error(`Failed to update evidence record: ${error.message}`);
    }
}

/**
 * Update evidence processing status
 * @param {string} evidenceId - Evidence record ID
 * @param {string} status - Processing status
 * @returns {Object} Update result
 */
async function updateEvidenceStatus(evidenceId, status) {
    const timestamp = new Date().toISOString();

    const params = {
        TableName: TABLE_NAME,
        Key: { id: evidenceId },
        UpdateExpression: 'SET processingStatus = :status, lastUpdated = :timestamp',
        ExpressionAttributeValues: {
            ':status': status,
            ':timestamp': timestamp
        },
        ReturnValues: 'ALL_NEW'
    };

    try {
        const result = await docClient.send(new UpdateCommand(params));
        console.log('✅ Evidence status updated:', result.Attributes);
        return result.Attributes;
    } catch (error) {
        console.error('❌ Error updating evidence status:', error);
        throw new Error(`Failed to update evidence status: ${error.message}`);
    }
}

module.exports = {
    createEvidenceRecord,
    updateEvidenceRecord,
    updateEvidenceStatus
};