import React, { useState, useEffect } from 'react';
import { RelationshipBond, EvidenceFile } from '../types/RelationshipBond';
import { relationshipService } from '../services/relationshipService';
import AWSService from '../services/awsService';
import FileUpload from './FileUpload';
import './BondDetail.css';

interface Props {
  bond: RelationshipBond;
  onDelete: (id: number) => void;
  onUpdate: () => void;
}

const BondDetail: React.FC<Props> = ({ bond, onDelete, onUpdate }) => {
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [error, setError] = useState('');
  const [playableUrls, setPlayableUrls] = useState<{ [fileId: number]: string }>({});

  useEffect(() => {
    if (bond.id) {
      loadEvidenceFiles();
    }
  }, [bond.id]);

  const loadEvidenceFiles = async () => {
    if (!bond.id) return;
    
    try {
      const files = await relationshipService.getEvidenceFiles(bond.id);
      setEvidenceFiles(files);
    } catch (err: any) {
      console.error('Failed to load evidence files', err);
    }
  };

  const handleFileUpload = async (evidence: Partial<EvidenceFile>) => {
    if (!bond.id) return;
    
    try {
      const newFile = await relationshipService.uploadEvidence(bond.id, evidence);
      setEvidenceFiles([...evidenceFiles, newFile]);
      setError('');
    } catch (err: any) {
      setError('Failed to upload evidence');
      console.error(err);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await relationshipService.deleteEvidence(fileId);
        setEvidenceFiles(evidenceFiles.filter(f => f.id !== fileId));
      } catch (err: any) {
        setError('Failed to delete file');
        console.error(err);
      }
    }
  };

  const handleLoadMedia = async (file: EvidenceFile) => {
    if (!file.id || playableUrls[file.id]) return; // Already loaded
    
    try {
      const playableUrl = await AWSService.createPlayableUrl(file.s3Url, file.fileName);
      setPlayableUrls(prev => ({ ...prev, [file.id!]: playableUrl }));
    } catch (err) {
      console.error('Error loading media:', err);
      setError('Failed to load media file');
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ONGOING': return '#4caf50';
      case 'ENDED': return '#9e9e9e';
      case 'COMPLICATED': return '#ff9800';
      case 'NO_CONTACT': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="bond-detail">
      <div className="detail-content">
        {evidenceFiles.length > 3 && (
          <div className="support-message">
            <span className="support-icon"><i className="fas fa-hands-holding-heart"></i></span>
            <div>
              <strong>You're doing great by documenting this.</strong>
              <p>Keeping records is an important step in understanding your situation. Remember, you deserve healthy relationships.</p>
            </div>
          </div>
        )}
        
        <div className="info-section">
          <h3><i className="fas fa-clipboard-list"></i> Relationship Information</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="label">Analysis Status:</span>
              <span className="value">{bond.analysisStatus}</span>
            </div>
            {bond.relationshipStartDate && (
              <div className="info-row">
                <span className="label">Started:</span>
                <span className="value">
                  {new Date(bond.relationshipStartDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {bond.createdAt && (
              <div className="info-row">
                <span className="label">Added:</span>
                <span className="value">
                  {new Date(bond.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          
          {bond.backgroundDescription && (
            <div className="description">
              <h4>Background Description</h4>
              <p>{bond.backgroundDescription}</p>
            </div>
          )}
        </div>

        <div className="evidence-section">
          <h3><i className="fas fa-folder-open"></i> Evidence Files ({evidenceFiles.length})</h3>
          
          <FileUpload onUpload={handleFileUpload} />
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="files-list">
            {evidenceFiles.length === 0 ? (
              <p className="no-files">No evidence files uploaded yet.</p>
            ) : (
              evidenceFiles.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    <div className="file-name">{file.fileName}</div>
                    <div className="file-meta">
                      <span className="file-type">{file.fileType}</span>
                      <span className="file-status">{file.processingStatus}</span>
                      {file.evidenceDate && (
                        <span className="file-date">
                          {new Date(file.evidenceDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {file.evidenceContext && (
                      <div className="file-context">{file.evidenceContext}</div>
                    )}
                    {(file.fileType === 'AUDIO' || file.fileType === 'VIDEO' || file.fileType === 'IMAGE') && (
                      <div className="media-section">
                        {!playableUrls[file.id!] ? (
                          <button
                            onClick={() => handleLoadMedia(file)}
                            className="play-btn"
                          >
                            {file.fileType === 'AUDIO' ? (
                              <><i className="fas fa-music"></i> Load Audio</>
                            ) : file.fileType === 'VIDEO' ? (
                              <><i className="fas fa-video"></i> Load Video</>
                            ) : (
                              <><i className="fas fa-image"></i> Load Image</>
                            )}
                          </button>
                        ) : (
                          <div className="media-player">
                            {file.fileType === 'AUDIO' && (
                              <audio controls style={{ width: '100%', maxWidth: '400px' }}>
                                <source src={playableUrls[file.id!]} type={file.mimeType} />
                                Your browser does not support the audio element.
                              </audio>
                            )}
                            {file.fileType === 'VIDEO' && (
                              <video controls style={{ width: '100%', maxWidth: '600px' }}>
                                <source src={playableUrls[file.id!]} type={file.mimeType} />
                                Your browser does not support the video element.
                              </video>
                            )}
                            {file.fileType === 'IMAGE' && (
                              <img 
                                src={playableUrls[file.id!]} 
                                alt={file.fileName} 
                                style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }} 
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => file.id && handleDeleteFile(file.id)}
                    className="delete-file-btn"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BondDetail;