const {S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand} = require('@aws-sdk/client-s3');
const {getSignedUrl} = require('@aws-sdk/s3-request-presigner');
const {randomUUID} = require("crypto");

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-central-1'
});

const AUDIO_BUCKET = process.env.AUDIO_BUCKET;
const EVIDENCE_BUCKET = process.env.EVIDENCE_BUCKET || process.env.AUDIO_BUCKET;
const PRESIGNED_URL_EXPIRY = 900; // 15 minutes

exports.generatePresignedUrl = async ({fileName, fileType, evidenceId, fileSize}) => {
    if (!EVIDENCE_BUCKET) {
        throw new Error('EVIDENCE_BUCKET environment variable not configured');
    }

    // Generate evidenceId if not provided
    const generatedEvidenceId = evidenceId || randomUUID();
    
    const uniqueFileName = generateUniqueFileName(fileName, generatedEvidenceId)
    const putObjectCommand = new PutObjectCommand({
        Bucket: EVIDENCE_BUCKET,
        Key: uniqueFileName,
        ContentType: fileType || 'application/octet-stream',
        ...(fileSize && {ContentLength: fileSize})
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
        expiresIn: PRESIGNED_URL_EXPIRY
    })

    return {
        uploadUrl,
        key: uniqueFileName,
        evidenceId: generatedEvidenceId,
        expiresIn: PRESIGNED_URL_EXPIRY
    };
}

exports.downloadFromS3 = async (bucket, key) =>{
    try{
        const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: key
        });

        const transcriptObject = await s3Client.send(getObjectCommand);

        const chunks = [];
        for await (const chunk of transcriptObject.Body) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks).toString('utf-8');

    } catch(error){
        throw new Error(`Failed to download from S3: ${error.message}`);
    }
}

exports.getFileMetadata = async (bucketName, objectKey) => {
    try {
        const command = new HeadObjectCommand({
            Bucket: bucketName,
            Key: objectKey
        });

        const result = await s3Client.send(command);

        return {
            contentLength: result.ContentLength,
            contentType: result.ContentType,
            lastModified: result.LastModified,
            etag: result.ETag,
            metadata: result.Metadata || {}
        }
    } catch (error) {
        if (error.name === 'NotFound') {
            throw new Error(`File not found: ${objectKey} in bucket ${bucketName}`);
        }
        throw new Error(`Failed to get the file metadata: ${error.message}`)
    }
}

function generateUniqueFileName(originalFileName, evidenceId = null){
    const fileExtension = originalFileName.split('.').pop();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uuid = randomUUID();

    return `evidence/${timestamp}-${uuid}.${fileExtension}`;
}