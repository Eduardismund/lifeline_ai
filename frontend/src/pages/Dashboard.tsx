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
    setSelectedBond(bond);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>LifelineAI Dashboard</h1>
        <div className="header-actions">
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
              <h2>Welcome to LifelineAI</h2>
              <p>Select a relationship from the left panel to view details and upload evidence files.</p>
              <p>This platform helps you track and analyze relationship patterns to identify potential toxic behaviors.</p>
              <div className="features">
                <h3>Features:</h3>
                <ul>
                  <li>Track multiple relationships</li>
                  <li>Upload evidence files (text, images, audio, video)</li>
                  <li>AI-powered toxicity analysis</li>
                  <li>Risk level assessment</li>
                  <li>Pattern detection</li>
                </ul>
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