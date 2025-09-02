const {createResponse, createErrorResponse} = require("../utils/api-utils");
const {updateEvidenceStatus} = require("../services/evidence-service");
const {TranscribeClient, StartTranscriptionJobCommand} = require('@aws-sdk/client-transcribe');

const transcribeClient = new TranscribeClient({region: process.env.AWS_REGION || 'eu-central-1'});

/**
 * Lambda function to start transcription jobs for evidence audio/video files
 */
exports.evidenceTranscriptionStarter = async (event) => {
    try {
        if (event.source === 'lifeline.ai' && event['detail-type'] === 'Evidence Ready for Transcription') {
            const eventDetail = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail;
            const { evidenceId, bucketName, objectKey, fileName, fileType } = eventDetail;
            
            const evidenceData = {
                evidenceId: evidenceId,
                s3Bucket: bucketName,
                s3Key: objectKey,
                fileName: fileName,
                fileType: fileType
            };

            const jobResult = await startEvidenceTranscriptionJob(evidenceData);

            await updateEvidenceStatus(evidenceId, 'TRANSCRIBING');

            return createResponse(200, {
                message: `Transcription started for evidence: ${evidenceId}`,
                jobName: jobResult.jobName
            });

        } else {
            return createErrorResponse(400, 'Invalid event source - expected evidence transcription event');
        }
    } catch (error) {
        console.error('Evidence transcription starter error:', error);
        return createErrorResponse(500, `Evidence transcription failed: ${error.message}`);
    }
};

/**
 * Start transcription job for evidence file
 */
async function startEvidenceTranscriptionJob(evidenceData) {
    const { evidenceId, s3Bucket, s3Key, fileName } = evidenceData;
    const timestamp = Date.now();
    const jobName = `evidence-transcription-${evidenceId}-${timestamp}`;

    const command = new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: 'en-US',
        MediaFormat: getMediaFormat(fileName),
        Media: {
            MediaFileUri: `s3://${s3Bucket}/${s3Key}`
        },
        OutputBucketName: s3Bucket,
        OutputKey: `transcriptions/evidence/${evidenceId}/`,
        Settings: {
            ShowSpeakerLabels: true,
            MaxSpeakerLabels: 10
        }
    });

    const result = await transcribeClient.send(command);
    console.log('Evidence transcription job started:', jobName);

    return {
        jobName,
        jobStatus: result.TranscriptionJob.TranscriptionJobStatus
    };
}

/**
 * Get media format from file extension
 */
function getMediaFormat(fileName) {
    const extension = fileName.toLowerCase().split('.').pop();

    const formats = {
        'mp3': 'mp3',
        'mp4': 'mp4',
        'm4a': 'mp4',
        'wav': 'wav',
        'flac': 'flac',
        'avi': 'mp4',
        'mov': 'mp4',
        'wmv': 'mp4',
        'mkv': 'mp4',
        'webm': 'webm'
    };

    return formats[extension] || 'mp3';
}