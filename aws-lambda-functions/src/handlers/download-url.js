const { createResponse, createErrorResponse, createOptionsResponse } = require('../utils/api-utils.js');
const { S3Client, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-central-1'
});

const EVIDENCE_BUCKET = process.env.EVIDENCE_BUCKET || process.env.AUDIO_BUCKET;
const DOWNLOAD_URL_EXPIRY = 3600; // 1 hour

exports.downloadUrlHandler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return createOptionsResponse();
    }

    try {
        const requestData = parseRequestBody(event.body);
        const { s3Key, fileName } = requestData;

        if (!s3Key) {
            return createErrorResponse(400, 's3Key is required');
        }

        if (!EVIDENCE_BUCKET) {
            throw new Error('EVIDENCE_BUCKET environment variable not configured');
        }

        // Verify file exists before generating presigned URL
        await verifyFileExists(EVIDENCE_BUCKET, s3Key);

        // Generate presigned URL for download
        const downloadUrl = await generateDownloadUrl(EVIDENCE_BUCKET, s3Key, fileName);

        return createResponse(200, {
            downloadUrl,
            s3Key,
            fileName,
            expiresIn: DOWNLOAD_URL_EXPIRY
        });

    } catch (error) {
        console.error('Error generating download URL:', {
            error: error.message,
            stack: error.stack,
            requestId: event.requestContext?.requestId
        });

        if (error.name === 'NotFound' || error.message.includes('does not exist')) {
            return createErrorResponse(404, 'File not found');
        }

        return createErrorResponse(500, 'Failed to generate download URL');
    }
};

/**
 * Generate presigned URL for downloading file from S3
 */
async function generateDownloadUrl(bucketName, s3Key, fileName) {
    const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
        ...(fileName && {
            ResponseContentDisposition: `attachment; filename="${fileName}"`
        })
    });

    const downloadUrl = await getSignedUrl(s3Client, getObjectCommand, {
        expiresIn: DOWNLOAD_URL_EXPIRY
    });

    return downloadUrl;
}

/**
 * Verify that file exists in S3
 */
async function verifyFileExists(bucketName, s3Key) {
    try {
        const headCommand = new HeadObjectCommand({
            Bucket: bucketName,
            Key: s3Key
        });

        await s3Client.send(headCommand);
        return true;
    } catch (error) {
        if (error.name === 'NotFound') {
            throw new Error(`File does not exist: ${s3Key}`);
        }
        throw error;
    }
}

/**
 * Parse request body with error handling
 */
function parseRequestBody(body) {
    if (!body) {
        return {};
    }

    try {
        return JSON.parse(body);
    } catch (parseError) {
        throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }
}