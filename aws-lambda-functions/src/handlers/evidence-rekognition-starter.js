const {createResponse, createErrorResponse} = require("../utils/api-utils");
const {updateEvidenceStatus, updateEvidenceRecord} = require("../services/evidence-service");
const {RekognitionClient, DetectTextCommand, DetectLabelsCommand} = require('@aws-sdk/client-rekognition');

const rekognitionClient = new RekognitionClient({region: process.env.AWS_REGION || 'eu-central-1'});

/**
 * Lambda function to process images using AWS Rekognition
 */
exports.evidenceRekognitionStarter = async (event) => {
    try {
        if (event.source === 'lifeline.ai' && event['detail-type'] === 'Evidence Ready for Rekognition') {
            const eventDetail = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail;
            const { evidenceId, bucketName, objectKey, fileName } = eventDetail;

            await updateEvidenceStatus(evidenceId, 'PROCESSING');

            const analysisResult = await analyzeImageWithRekognition(bucketName, objectKey);

            await updateEvidenceRecord(evidenceId, analysisResult.extractedText, 'PROCESSED');

            return createResponse(200, {
                message: `Rekognition analysis completed for evidence: ${evidenceId}`,
                extractedText: analysisResult.extractedText,
                labels: analysisResult.labels
            });

        } else {
            return createErrorResponse(400, 'Invalid event source - expected evidence Rekognition event');
        }
    } catch (error) {
        console.error('Evidence Rekognition processor error:', error);
        
        // Try to update evidence status to failed if we have the evidence ID
        try {
            const eventDetail = typeof event.detail === 'string' ? JSON.parse(event.detail) : event.detail;
            if (eventDetail.evidenceId) {
                await updateEvidenceRecord(eventDetail.evidenceId, `Error: ${error.message}`, 'FAILED');
            }
        } catch (updateError) {
            console.error('Failed to update evidence status to failed:', updateError);
        }
        
        return createErrorResponse(500, `Evidence Rekognition processing failed: ${error.message}`);
    }
};

/**
 * Analyze image using AWS Rekognition
 */
async function analyzeImageWithRekognition(bucketName, objectKey) {
    const s3Object = {
        S3Object: {
            Bucket: bucketName,
            Name: objectKey
        }
    };

    // Detect text in image
    let extractedText = '';
    try {
        const detectTextCommand = new DetectTextCommand({
            Image: s3Object
        });
        const textResult = await rekognitionClient.send(detectTextCommand);
        
        if (textResult.TextDetections && textResult.TextDetections.length > 0) {
            extractedText = textResult.TextDetections
                .filter(detection => detection.Type === 'LINE')
                .map(detection => detection.DetectedText)
                .join(' ');
        }
    } catch (textError) {
        console.warn('Text detection failed:', textError.message);
        extractedText = 'No text detected in image';
    }

    // Detect labels/objects in image
    let labels = [];
    try {
        const detectLabelsCommand = new DetectLabelsCommand({
            Image: s3Object,
            MaxLabels: 10,
            MinConfidence: 70
        });
        const labelsResult = await rekognitionClient.send(detectLabelsCommand);
        
        if (labelsResult.Labels && labelsResult.Labels.length > 0) {
            labels = labelsResult.Labels.map(label => ({
                name: label.Name,
                confidence: label.Confidence
            }));
        }
    } catch (labelsError) {
        console.warn('Label detection failed:', labelsError.message);
    }

    console.log(`🖼️ Rekognition analysis completed for ${objectKey}`);
    console.log(`📝 Extracted text: ${extractedText}`);
    console.log(`🏷️ Detected labels: ${JSON.stringify(labels)}`);

    return {
        extractedText,
        labels
    };
}