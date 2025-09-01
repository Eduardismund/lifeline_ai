import React, { useState, useEffect } from 'react';
import { RelationshipBond, EvidenceFile } from '../types/RelationshipBond';
import { relationshipService } from '../services/relationshipService';
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
      <div className="detail-header">
        <div className="bond-title">
          <h1>{bond.partnerName}</h1>
          <div className="bond-meta">
            <span className="relationship-type">
              {bond.relationshipType?.replace(/_/g, ' ')}
            </span>
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(bond.currentStatus) }}
            >
              {bond.currentStatus}
            </span>
          </div>
        </div>
        <button 
          onClick={() => bond.id && onDelete(bond.id)}
          className="delete-btn"
        >
          Delete Relationship
        </button>
      </div>

      <div className="detail-content">
        <div className="info-section">
          <h3>Relationship Information</h3>
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
          <h3>Evidence Files ({evidenceFiles.length})</h3>
          
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