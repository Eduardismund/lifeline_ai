// src/services/event-publisher.js
const { EventBridgeClient, PutEventsCommand } = require('@aws-sdk/client-eventbridge');

const eventBridgeClient = new EventBridgeClient({
    region: process.env.AWS_REGION || 'eu-central-1'
});

/**
 * Publish transcription ready event after successful file upload
 * @param {Object} evidence - Evidence record with id, s3Bucket, s3Key, fileName
 * @returns {Object} Event result
 */
async function publishTranscriptionEvent(evidence){
    console.log('📧 Publishing transcription event...');
    console.log('📄 Evidence object received:', JSON.stringify(evidence, null, 2));

    const event = {
        Source: 'lifeline.ai',
        DetailType: 'Evidence Ready for Transcription',
        Detail: JSON.stringify({
            evidenceId: evidence.id,
            bucketName: evidence.s3Bucket,
            objectKey: evidence.s3Key,
            fileName: evidence.fileName,
            fileType: evidence.fileType,
            timestamp: new Date().toISOString()
        })
    };

    console.log('📤 Event to publish:', JSON.stringify(event, null, 2));

    try {
        const command = new PutEventsCommand({
            Entries: [event]
        });

        const result = await eventBridgeClient.send(command);
        console.log('✅ Event published successfully!', JSON.stringify(result, null, 2));

        // Check if there were any failed entries
        if (result.FailedEntryCount > 0) {
            console.error('❌ Some events failed:', result.Entries);
        }

        return result;

    } catch (error) {
        console.error('❌ Error publishing transcription event:', error);
        throw new Error(`Failed to publish event: ${error.message}`);
    }
};



/**
 * Publish Rekognition ready event for image processing
 * @param {Object} evidence - Evidence record with id, s3Bucket, s3Key, fileName
 * @returns {Object} Event result
 */
async function publishRekognitionEvent(evidence){
    console.log('🖼️ Publishing Rekognition event...');
    console.log('📄 Evidence object received:', JSON.stringify(evidence, null, 2));

    const event = {
        Source: 'lifeline.ai',
        DetailType: 'Evidence Ready for Rekognition',
        Detail: JSON.stringify({
            evidenceId: evidence.id,
            bucketName: evidence.s3Bucket,
            objectKey: evidence.s3Key,
            fileName: evidence.fileName,
            fileType: evidence.fileType,
            timestamp: new Date().toISOString()
        })
    };

    console.log('📤 Event to publish:', JSON.stringify(event, null, 2));

    try {
        const command = new PutEventsCommand({
            Entries: [event]
        });

        const result = await eventBridgeClient.send(command);
        console.log('✅ Rekognition event published successfully!', JSON.stringify(result, null, 2));

        // Check if there were any failed entries
        if (result.FailedEntryCount > 0) {
            console.error('❌ Some events failed:', result.Entries);
        }

        return result;

    } catch (error) {
        console.error('❌ Error publishing Rekognition event:', error);
        throw new Error(`Failed to publish event: ${error.message}`);
    }
};

module.exports = {
    publishTranscriptionEvent,
    publishRekognitionEvent,
};