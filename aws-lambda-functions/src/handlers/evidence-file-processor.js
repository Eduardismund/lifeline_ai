const {createErrorResponse, createResponse} = require("../utils/api-utils");
const {createEvidenceRecord} = require("../services/evidence-service");
const {publishTranscriptionEvent, publishRekognitionEvent} = require("../services/event-publisher");

/**
 * Lambda function to process S3 upload events for evidence files
 * Routes to appropriate AWS service based on file type:
 * - Audio/Video -> AWS Transcribe
 * - Images -> AWS Rekognition
 */
exports.evidenceFileProcessor = async (event) => {
    try {
        if (event.source === 'aws.s3' && event['detail-type'] === 'Object Created') {
            const bucketName = event.detail.bucket.name;
            const objectKey = decodeURIComponent(event.detail.object.key);

            // Ignore system files
            if (objectKey.includes('.temp') ||
                objectKey.includes('.write_access_check') ||
                objectKey.includes('$folder$') ||
                objectKey.endsWith('/')) {
                return createResponse(200, 'System file ignored');
            }

            // Determine file type based on extension
            const fileExtension = objectKey.split('.').pop().toLowerCase();
            const fileType = getFileType(fileExtension);

            if (!fileType) {
                return createErrorResponse(400, `Unsupported file type: ${fileExtension}`);
            }

            const evidenceRecord = await createEvidenceRecord(bucketName, objectKey, fileType);

            if (fileType === 'AUDIO' || fileType === 'VIDEO') {
                await publishTranscriptionEvent(evidenceRecord);
                console.log(`📝 Published transcription event for ${fileType} file: ${objectKey}`);
            } else if (fileType === 'IMAGE') {
                await publishRekognitionEvent(evidenceRecord);
                console.log(`🖼️ Published Rekognition event for image: ${objectKey}`);
            } else if (fileType === 'TEXT') {
                console.log(`📄 Text file uploaded, no additional processing needed: ${objectKey}`);
            }

        } else {
            return createErrorResponse(400, 'Invalid event source - expected S3 upload event');
        }

        return createResponse(200, 'Evidence file processed successfully');

    } catch (error) {
        console.error('❌ Error processing evidence file:', error);
        throw error;
    }
};

/**
 * Determine file type based on file extension
 * @param {string} extension - File extension
 * @returns {string|null} File type (AUDIO, VIDEO, IMAGE, TEXT) or null if unsupported
 */
function getFileType(extension) {
    const audioExtensions = ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac', 'wma'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
    const textExtensions = ['txt', 'doc', 'docx', 'pdf', 'rtf', 'odt'];

    if (audioExtensions.includes(extension)) return 'AUDIO';
    if (videoExtensions.includes(extension)) return 'VIDEO';
    if (imageExtensions.includes(extension)) return 'IMAGE';
    if (textExtensions.includes(extension)) return 'TEXT';
    
    return null;
}