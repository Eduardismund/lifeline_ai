import React, { useState } from 'react';
import { RelationshipBond } from '../types/RelationshipBond';
import './CreateBondModal.css';

interface Props {
  onClose: () => void;
  onCreate: (bond: Partial<RelationshipBond>) => void;
}

const CreateBondModal: React.FC<Props> = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState<Partial<RelationshipBond>>({
    partnerName: '',
    relationshipType: 'ROMANTIC_PARTNER',
    currentStatus: 'ONGOING',
    backgroundDescription: '',
    relationshipStartDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending bond data:', formData);
    onCreate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><i className="fas fa-seedling"></i> Add New Relationship</h2>
          <button className="close-btn" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Partner Name *</label>
            <input
              type="text"
              name="partnerName"
              value={formData.partnerName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Relationship Type</label>
            <select
              name="relationshipType"
              value={formData.relationshipType}
              onChange={handleChange}
            >
              <option value="ROMANTIC_PARTNER">Romantic Partner</option>
              <option value="EX_PARTNER">Ex-Partner</option>
              <option value="SPOUSE">Spouse</option>
              <option value="EX_SPOUSE">Ex-Spouse</option>
              <option value="FAMILY_MEMBER">Family Member</option>
              <option value="FRIEND">Friend</option>
              <option value="COWORKER">Coworker</option>
              <option value="BOSS">Boss</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Current Status</label>
            <select
              name="currentStatus"
              value={formData.currentStatus}
              onChange={handleChange}
            >
              <option value="ONGOING">Ongoing</option>
              <option value="ENDED">Ended</option>
              <option value="COMPLICATED">Complicated</option>
              <option value="NO_CONTACT">No Contact</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Relationship Start Date</label>
            <input
              type="date"
              name="relationshipStartDate"
              value={formData.relationshipStartDate}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label>Background Description</label>
            <textarea
              name="backgroundDescription"
              value={formData.backgroundDescription}
              onChange={handleChange}
              rows={4}
              placeholder="Provide some context about this relationship..."
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Create Relationship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBondModal;