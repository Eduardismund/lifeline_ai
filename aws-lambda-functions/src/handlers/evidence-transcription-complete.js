const {createResponse, createErrorResponse} = require("../utils/api-utils");
const {updateEvidenceRecord} = require("../services/evidence-service");
const {TranscribeClient, GetTranscriptionJobCommand} = require('@aws-sdk/client-transcribe');
const {downloadFromS3} = require("../services/s3-service");

const transcribeClient = new TranscribeClient({region: process.env.AWS_REGION || 'eu-central-1'});

/**
 * Lambda function to process completed transcription jobs for evidence
 */
exports.evidenceTranscriptionComplete = async (event) => {
    try {
        if (event.source === 'aws.transcribe' && event['detail-type'] === 'Transcribe Job State Change') {
            const jobName = event.detail.TranscriptionJobName;
            const jobStatus = event.detail.TranscriptionJobStatus;

            // Only process evidence transcription jobs
            if (!jobName.startsWith('evidence-transcription-')) {
                console.log(`Ignoring non-evidence transcription job: ${jobName}`);
                return createResponse(200, 'Non-evidence transcription job ignored');
            }

            if (jobStatus === 'COMPLETED') {
                await processCompletedEvidenceTranscription(jobName);
            } else if (jobStatus === 'FAILED') {
                await processFailedEvidenceTranscription(jobName, event.detail);
            }

            return createResponse(200, {
                message: `Evidence transcription job ${jobStatus} processed successfully`
            });
        } else {
            return createErrorResponse(400, 'Invalid event source - expected Transcribe event');
        }
    } catch (error) {
        console.error('Evidence transcription complete processor error:', error);
        return createErrorResponse(500, `Evidence transcription processing failed: ${error.message}`);
    }
};

/**
 * Process a completed evidence transcription job
 */
async function processCompletedEvidenceTranscription(jobName) {
    try {
        const getJobCommand = new GetTranscriptionJobCommand({
            TranscriptionJobName: jobName
        });

        const transcribeResult = await transcribeClient.send(getJobCommand);
        const transcriptUri = transcribeResult.TranscriptionJob.Transcript.TranscriptFileUri;
        const evidenceId = extractEvidenceIdFromJobName(jobName);

        if (!evidenceId) {
            console.warn(`Could not extract evidence ID from job name: ${jobName}`);
            return;
        }

        const transcriptionData = await downloadTranscriptionResults(transcriptUri);
        const fullTranscript = extractFullTranscript(transcriptionData);
        
        await updateEvidenceRecord(evidenceId, fullTranscript, 'PROCESSED');

        console.log(`✅ Evidence transcription completed for: ${evidenceId}`);
    } catch (error) {
        console.error('Error processing completed evidence transcription:', error);
        throw error;
    }
}

/**
 * Process a failed evidence transcription job
 */
async function processFailedEvidenceTranscription(jobName, details) {
    try {
        const evidenceId = extractEvidenceIdFromJobName(jobName);
        if (!evidenceId) {
            console.warn(`Could not extract evidence ID from job name: ${jobName}`);
            return;
        }

        const failureReason = details.FailureReason || 'Transcription job failed';
        
        await updateEvidenceRecord(evidenceId, `Error: ${failureReason}`, 'FAILED');

        console.error(`❌ Evidence transcription failed for ${evidenceId}: ${failureReason}`);
    } catch (error) {
        console.error('Error processing failed evidence transcription:', error);
        throw error;
    }
}

/**
 * Extract evidence ID from transcription job name
 */
function extractEvidenceIdFromJobName(jobName) {
    const regex = /evidence-transcription-(.+)-\d+$/;
    const match = jobName.match(regex);
    return match ? match[1] : null;
}

/**
 * Download transcription results from S3
 */
async function downloadTranscriptionResults(transcriptUri) {
    try {
        const {bucket, key} = parseS3Uri(transcriptUri);
        const transcriptString = await downloadFromS3(bucket, key);
        return JSON.parse(transcriptString);
    } catch (error) {
        throw new Error(`Failed to download transcription results: ${error.message}`);
    }
}

/**
 * Parse S3 URI to extract bucket and key
 */
function parseS3Uri(transcriptUri) {
    let bucket, key;

    if (transcriptUri.startsWith('https://s3.')) {
        const urlParts = new URL(transcriptUri);
        const pathParts = urlParts.pathname.substring(1).split('/');
        bucket = pathParts[0];
        key = pathParts.slice(1).join('/');
    } else if (transcriptUri.startsWith('https://')) {
        const urlParts = new URL(transcriptUri);
        bucket = urlParts.hostname.split('.')[0];
        key = urlParts.pathname.substring(1);
    } else {
        throw new Error(`Unsupported S3 URI format: ${transcriptUri}`);
    }

    return {bucket, key};
}

/**
 * Extract full transcript text from transcription data
 */
function extractFullTranscript(transcriptionData) {
    if (!transcriptionData.results || !transcriptionData.results.items) {
        return '';
    }

    const pronunciationItems = transcriptionData.results.items.filter(item => item.type === 'pronunciation');
    const transcriptWords = pronunciationItems.map(item => item.alternatives[0].content);
    return transcriptWords.join(' ');
}