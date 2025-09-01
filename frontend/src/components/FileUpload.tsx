import React, { useState, useRef } from 'react';
import { EvidenceFile } from '../types/RelationshipBond';
import './FileUpload.css';

interface Props {
  onUpload: (evidence: Partial<EvidenceFile>) => void;
}

const FileUpload: React.FC<Props> = ({ onUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [evidenceContext, setEvidenceContext] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (mimeType: string): 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' => {
    if (mimeType.startsWith('image/')) return 'IMAGE';
    if (mimeType.startsWith('audio/')) return 'AUDIO';
    if (mimeType.startsWith('video/')) return 'VIDEO';
    return 'TEXT';
  };

  const getFileDate = (file: File): string => {
    // Use file's last modified date, fallback to current date
    return new Date(file.lastModified || Date.now()).toISOString().split('T')[0];
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setEvidenceContext('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    try {
      // Extract metadata from the file
      const evidence: Partial<EvidenceFile> = {
        fileName: selectedFile.name,
        fileType: getFileType(selectedFile.type),
        mimeType: selectedFile.type,
        evidenceDate: getFileDate(selectedFile),
        evidenceContext: evidenceContext.trim() || undefined,
        // For now, use dummy S3 URLs since we're not actually uploading
        s3Url: `https://dummy-bucket.s3.amazonaws.com/evidence/${Date.now()}_${selectedFile.name}`,
        s3Key: `evidence/${Date.now()}_${selectedFile.name}`,
        processingStatus: 'UPLOADED',
      };

      await onUpload(evidence);
      
      // Reset form
      setSelectedFile(null);
      setEvidenceContext('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setEvidenceContext('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload">
      {!selectedFile ? (
        <div 
          className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drop-zone-content">
            <div className="upload-icon">📁</div>
            <p>Drag and drop a file here, or click to select</p>
            <p className="file-types">Supports: Images, Documents, Audio, Video</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,audio/*,video/*,.txt,.doc,.docx,.pdf"
          />
        </div>
      ) : (
        <div className="file-preview">
          <div className="file-info">
            <h4>Selected File</h4>
            <div className="file-details">
              <div className="detail-row">
                <span className="label">Name:</span>
                <span className="value">{selectedFile.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Type:</span>
                <span className="value">{getFileType(selectedFile.type)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Size:</span>
                <span className="value">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">{getFileDate(selectedFile)}</span>
              </div>
            </div>
          </div>
          
          <div className="context-section">
            <label>Additional Context (Optional)</label>
            <textarea
              value={evidenceContext}
              onChange={(e) => setEvidenceContext(e.target.value)}
              placeholder="Describe what this evidence shows or add any relevant context..."
              rows={3}
            />
          </div>
          
          <div className="upload-actions">
            <button 
              onClick={cancelUpload}
              className="cancel-btn"
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              className="upload-btn"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Evidence'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;