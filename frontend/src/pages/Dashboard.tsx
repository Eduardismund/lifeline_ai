import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { relationshipService } from '../services/relationshipService';
import { RelationshipBond } from '../types/RelationshipBond';
import CreateBondModal from '../components/CreateBondModal';
import BondDetail from '../components/BondDetail';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [bonds, setBonds] = useState<RelationshipBond[]>([]);
  const [selectedBond, setSelectedBond] = useState<RelationshipBond | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBonds();
  }, [user, navigate]);

  const loadBonds = async () => {
    if (!user) return;
    
    try {
      const data = await relationshipService.getAllBonds(user.id);
      setBonds(data);
    } catch (err: any) {
      setError('Failed to load relationships');
      console.error(err);
    }
  };

  const handleCreateBond = async (bondData: Partial<RelationshipBond>) => {
    if (!user) return;
    
    try {
      const newBond = await relationshipService.createBond(user.id, bondData);
      setBonds([...bonds, newBond]);
      setShowCreateModal(false);
      setError('');
    } catch (err: any) {
      console.error('Create bond error:', err);
      setError(`Failed to create relationship: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteBond = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this relationship?')) {
      try {
        await relationshipService.deleteBond(id);
        setBonds(bonds.filter(bond => bond.id !== id));
        if (selectedBond?.id === id) {
          setSelectedBond(null);
        }
      } catch (err: any) {
        setError('Failed to delete relationship');
        console.error(err);
      }
    }
  };

  const handleSelectBond = (bond: RelationshipBond) => {
    // If clicking the same bond, deselect it
    if (selectedBond?.id === bond.id) {
      setSelectedBond(null);
    } else {
      setSelectedBond(bond);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1><i className="fas fa-heart-pulse"></i> LifelineAI Dashboard</h1>
          {selectedBond && (
            <div className="selected-bond-info">
              <span className="separator">|</span>
              <h2>{selectedBond.partnerName}</h2>
              <span className="relationship-type">
                {selectedBond.relationshipType?.replace(/_/g, ' ')}
              </span>
              <span 
                className="status-badge"
                style={{ 
                  backgroundColor: selectedBond.currentStatus === 'ONGOING' ? '#4caf50' :
                                 selectedBond.currentStatus === 'ENDED' ? '#9e9e9e' :
                                 selectedBond.currentStatus === 'COMPLICATED' ? '#ff9800' :
                                 '#f44336'
                }}
              >
                {selectedBond.currentStatus}
              </span>
            </div>
          )}
        </div>
        <div className="header-actions">
          {selectedBond && selectedBond.analysisStatus === 'ANALYZED' && (
            <div className="risk-indicator">
              <span className="risk-label">Risk Level:</span>
              <div className="risk-level-bar">
                <div className="risk-level-fill" style={{ width: '65%', background: '#ff9800' }}></div>
              </div>
              <span className="risk-value">Medium</span>
            </div>
          )}
          {selectedBond && (
            <button 
              onClick={() => handleDeleteBond(selectedBond.id!)}
              className="end-tracking-btn"
            >
              End Tracking
            </button>
          )}
          <span className="user-name">Welcome, {user?.firstName}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="left-panel">
          <div className="panel-header">
            <h2>Relationships</h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="create-bond-btn"
            >
              + Add New
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="bonds-list">
            {bonds.length === 0 ? (
              <div className="empty-state">
                <p>No relationships added yet.</p>
                <p>Click "Add New" to get started.</p>
              </div>
            ) : (
              bonds.map(bond => (
                <div 
                  key={bond.id} 
                  className={`bond-item ${selectedBond?.id === bond.id ? 'selected' : ''}`}
                  onClick={() => handleSelectBond(bond)}
                >
                  <div className="bond-name">{bond.partnerName}</div>
                  <div className="bond-type">{bond.relationshipType?.replace(/_/g, ' ')}</div>
                  <div className="bond-status">{bond.currentStatus}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="right-panel">
          {selectedBond ? (
            <BondDetail 
              bond={selectedBond} 
              onDelete={handleDeleteBond}
              onUpdate={() => loadBonds()}
            />
          ) : (
            <div className="welcome-panel">
              <div className="welcome-icon"><i className="fas fa-shield-heart"></i></div>
              <h2>Your Safe Space</h2>
              <p className="welcome-subtitle">You deserve healthy, respectful relationships.</p>
              <p>LifelineAI helps you understand relationship dynamics by documenting interactions and identifying concerning patterns. Your privacy and safety are our priority.</p>
              
              <div className="features">
                <h3>How We Support You:</h3>
                <ul>
                  <li>Confidential relationship tracking</li>
                  <li>Secure evidence documentation</li>
                  <li>Pattern recognition to identify concerns</li>
                  <li>Risk assessment for your awareness</li>
                  <li>Objective analysis without judgment</li>
                </ul>
              </div>
              
              <div className="support-note">
                <p><strong>Remember:</strong> Documenting is the first step toward understanding. You're not alone in this journey.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateBondModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBond}
        />
      )}
    </div>
  );
};

export default Dashboard;