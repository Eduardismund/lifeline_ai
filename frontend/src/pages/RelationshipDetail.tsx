import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { relationshipService } from '../services/relationshipService';
import { RelationshipBond, EvidenceFile } from '../types/RelationshipBond';
import FileUpload from '../components/FileUpload';
import './RelationshipDetail.css';

const RelationshipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bond, setBond] = useState<RelationshipBond | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadBondDetails();
      loadEvidenceFiles();
    }
  }, [id]);

  const loadBondDetails = async () => {
    if (!id) return;
    
    try {
      const data = await relationshipService.getBondById(parseInt(id));
      setBond(data);
    } catch (err: any) {
      setError('Failed to load relationship details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEvidenceFiles = async () => {
    if (!id) return;
    
    try {
      const files = await relationshipService.getEvidenceFiles(parseInt(id));
      setEvidenceFiles(files);
    } catch (err: any) {
      console.error('Failed to load evidence files', err);
    }
  };

  const handleFileUpload = async (evidence: Partial<EvidenceFile>) => {
    if (!id) return;
    
    try {
      const newFile = await relationshipService.uploadEvidence(parseInt(id), evidence);
      setEvidenceFiles([...evidenceFiles, newFile]);
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!bond) {
    return <div className="error">Relationship not found</div>;
  }

  return (
    <div className="relationship-detail">
      <header className="detail-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h1>{bond.partnerName}</h1>
      </header>

      <div className="detail-content">
        <div className="bond-info-section">
          <h2>Relationship Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Type:</label>
              <span>{bond.relationshipType?.replace(/_/g, ' ')}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span>{bond.currentStatus?.replace(/_/g, ' ')}</span>
            </div>
            <div className="info-item">
              <label>Analysis Status:</label>
              <span>{bond.analysisStatus}</span>
            </div>
            {bond.relationshipStartDate && (
              <div className="info-item">
                <label>Started:</label>
                <span>{new Date(bond.relationshipStartDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {bond.backgroundDescription && (
            <div className="description-section">
              <h3>Background</h3>
              <p>{bond.backgroundDescription}</p>
            </div>
          )}
        </div>

        <div className="evidence-section">
          <h2>Evidence Files</h2>
          
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

export default RelationshipDetail;