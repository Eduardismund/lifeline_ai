const AWS_API_ENDPOINT = 'https://ipg78tc2ed.execute-api.eu-central-1.amazonaws.com/Prod';
const POLLING_INTERVAL = 3000; // 3 seconds
const MAX_POLLING_ATTEMPTS = 60; // Max 3 minutes

interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
  expiresIn: number;
  evidenceId: string;
}

interface ProcessingStatus {
  evidenceId: string;
  status: 'PROCESSING' | 'PROCESSED' | 'FAILED';
  extractedText?: string;
  fileName: string;
  s3Url: string;
  s3Key: string;
  fileType: string;
}

export class AWSService {
  /**
   * Get presigned URL for S3 upload
   */
  static async getPresignedUrl(fileName: string, fileType: string, fileSize: number): Promise<PresignedUrlResponse> {
    const response = await fetch(`${AWS_API_ENDPOINT}/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileType,
        fileSize
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Presigned URL error response:', errorText);
      throw new Error(`Failed to get presigned URL: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Upload file directly to S3 using presigned URL
   */
  static async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to upload to S3: ${response.statusText}`);
    }
  }

  /**
   * Query processing status by evidence ID
   */
  static async getProcessingStatus(evidenceId: string): Promise<ProcessingStatus> {
    const response = await fetch(`${AWS_API_ENDPOINT}/evidence/${evidenceId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get processing status: ${response.statusText}`);
    }

    return response.json();
  }


  /**
   * Poll for processing completion
   */
  static async pollForCompletion(evidenceId: string): Promise<ProcessingStatus> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        attempts++;

        try {
          const status = await this.getProcessingStatus(evidenceId);

          if (status.status === 'PROCESSED') {
            clearInterval(pollInterval);
            resolve(status);
          } else if (status.status === 'FAILED') {
            clearInterval(pollInterval);
            reject(new Error('Processing failed'));
          } else if (attempts >= MAX_POLLING_ATTEMPTS) {
            clearInterval(pollInterval);
            reject(new Error('Processing timeout'));
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, POLLING_INTERVAL);
    });
  }

  /**
   * Complete workflow: Upload to S3, wait for processing, return results
   */
  static async processEvidence(file: File): Promise<ProcessingStatus> {
    try {
      // Step 1: Get presigned URL (returns evidenceId)
      console.log('Getting presigned URL...');
      console.log('File details:', { name: file.name, type: file.type, size: file.size });
      const presignedData = await this.getPresignedUrl(
        file.name,
        file.type,
        file.size
      );

      // Step 2: Upload to S3
      console.log('Uploading to S3...');
      await this.uploadToS3(presignedData.uploadUrl, file);

      // Step 3: Wait a moment for S3 event to trigger evidence record creation
      console.log('Waiting for S3 event processing...');
      console.log('Presigned Evidence ID:', presignedData.evidenceId);
      console.log('S3 Key:', presignedData.key);
      
      // Extract the actual evidence ID from the S3 key filename
      // S3 key format: evidence/2025-09-02T10-29-18-685Z-f314dd5f-34c9-48ec-a64f-f1a3658ec975.mp3
      // The UUID is the second UUID in the filename (after the timestamp)
      const fileName = presignedData.key.split('/').pop() || '';
      const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
      const uuids = fileNameWithoutExt.match(uuidRegex);
      const actualEvidenceId = uuids ? uuids[uuids.length - 1] : presignedData.evidenceId; // Use last UUID
      
      console.log('Extracted Evidence ID from S3 key:', actualEvidenceId);
      
      // Wait 5 seconds for the evidence-file-processor to create the DynamoDB record
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Step 4: Poll for processing completion using extracted evidenceId
      console.log('Starting polling for processing completion...');
      const result = await this.pollForCompletion(actualEvidenceId);

      console.log('Processing complete:', result);
      
      // Return data in format expected by frontend
      return {
        evidenceId: result.evidenceId,
        status: result.status,
        fileName: result.fileName,
        s3Key: result.s3Key,
        s3Url: result.s3Url,
        fileType: result.fileType,
        extractedText: result.extractedText
      };

    } catch (error) {
      console.error('Error processing evidence:', error);
      throw error;
    }
  }

  /**
   * Process evidence without polling (for simpler testing)
   */
  static async processEvidenceSimple(file: File): Promise<{
    s3Key: string;
    s3Url: string;
    extractedText?: string;
  }> {
    try {
      // Step 1: Get presigned URL
      const presignedData = await this.getPresignedUrl(
        file.name,
        file.type,
        file.size
      );

      // Step 2: Upload to S3
      await this.uploadToS3(presignedData.uploadUrl, file);

      // For now, return basic info without waiting for processing
      // In production, you'd wait for processing to complete
      const bucketName = 'evidence-evidencebucket-ypso6tx2mctt';
      const s3Url = `https://${bucketName}.s3.eu-central-1.amazonaws.com/${presignedData.key}`;

      return {
        s3Key: presignedData.key,
        s3Url: s3Url,
        extractedText: undefined // Will be populated after processing
      };

    } catch (error) {
      console.error('Error processing evidence:', error);
      throw error;
    }
  }
  /**
   * Upload file (blob) to S3 and return shareable URL
   */
  static async uploadFile(blob: Blob, fileName: string, mimeType: string): Promise<string> {
    try {
      // Convert blob to File for upload
      const file = new File([blob], fileName, { type: mimeType });
      
      // Get presigned URL
      const presignedData = await this.getPresignedUrl(fileName, mimeType, blob.size);
      
      // Upload to S3
      await this.uploadToS3(presignedData.uploadUrl, file);
      
      // Return the S3 URL
      const bucketName = 'evidence-evidencebucket-ypso6tx2mctt';
      return `https://${bucketName}.s3.eu-central-1.amazonaws.com/${presignedData.key}`;
      
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw error;
    }
  }

  /**
   * Create a playable URL for media files using presigned download URL
   */
  static async createPlayableUrl(s3Url: string, fileName?: string): Promise<string> {
    try {
      // Extract S3 key from full S3 URL
      // URL format: https://bucket-name.s3.region.amazonaws.com/evidence/filename
      const urlParts = s3Url.split('/');
      const s3Key = urlParts.slice(3).join('/'); // Get everything after domain
      
      const response = await fetch(`${AWS_API_ENDPOINT}/download-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          s3Key: s3Key,
          fileName: fileName
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get download URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.downloadUrl;
    } catch (error) {
      console.error('Error creating playable URL:', error);
      throw error;
    }
  }
}

export default AWSService;