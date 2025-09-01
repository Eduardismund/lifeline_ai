import React from 'react';
import { RelationshipBond } from '../types/RelationshipBond';
import './RelationshipBondCard.css';

interface Props {
  bond: RelationshipBond;
  onDelete: (id: number) => void;
  onUploadEvidence: (id: number) => void;
}

const RelationshipBondCard: React.FC<Props> = ({ bond, onDelete, onUploadEvidence }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return '#4caf50';
      case 'ENDED': return '#9e9e9e';
      case 'COMPLICATED': return '#ff9800';
      case 'SEEKING_HELP': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getAnalysisStatusColor = (status?: string) => {
    switch (status) {
      case 'PENDING': return '#9e9e9e';
      case 'IN_PROGRESS': return '#2196f3';
      case 'COMPLETED': return '#4caf50';
      case 'FAILED': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="bond-card">
      <div className="bond-header">
        <h3>{bond.partnerName}</h3>
        <button 
          onClick={() => bond.id && onDelete(bond.id)}
          className="delete-btn"
          title="Delete"
        >
          ×
        </button>
      </div>
      
      <div className="bond-info">
        <div className="info-row">
          <span className="label">Type:</span>
          <span className="value">{bond.relationshipType?.replace(/_/g, ' ')}</span>
        </div>
        
        <div className="info-row">
          <span className="label">Status:</span>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(bond.currentStatus) }}
          >
            {bond.currentStatus?.replace(/_/g, ' ')}
          </span>
        </div>
        
        <div className="info-row">
          <span className="label">Analysis:</span>
          <span 
            className="status-badge"
            style={{ backgroundColor: getAnalysisStatusColor(bond.analysisStatus) }}
          >
            {bond.analysisStatus}
          </span>
        </div>
        
        {bond.relationshipStartDate && (
          <div className="info-row">
            <span className="label">Started:</span>
            <span className="value">
              {new Date(bond.relationshipStartDate).toLocaleDateString()}
            </span>
          </div>
        )}
        
        {bond.backgroundDescription && (
          <div className="description">
            <p>{bond.backgroundDescription}</p>
          </div>
        )}
      </div>
      
      <div className="bond-actions">
        <button 
          onClick={() => bond.id && onUploadEvidence(bond.id)}
          className="action-btn"
        >
          Upload Evidence
        </button>
        {bond.evidenceFiles && bond.evidenceFiles.length > 0 && (
          <span className="file-count">
            {bond.evidenceFiles.length} file(s) uploaded
          </span>
        )}
      </div>
    </div>
  );
};

export default RelationshipBondCard;