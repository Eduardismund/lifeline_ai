import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { User, MedicalCondition } from '../types/User';
import './Profile.css';

const MEDICAL_CONDITIONS: { value: MedicalCondition; label: string }[] = [
  { value: 'ANXIETY_DISORDER', label: 'Anxiety Disorder' },
  { value: 'DEPRESSION', label: 'Depression' },
  { value: 'PTSD', label: 'PTSD' },
  { value: 'BIPOLAR_DISORDER', label: 'Bipolar Disorder' },
  { value: 'PANIC_DISORDER', label: 'Panic Disorder' },
  { value: 'OCD', label: 'OCD' },
  { value: 'ADHD', label: 'ADHD' },
  { value: 'EATING_DISORDER', label: 'Eating Disorder' },
  { value: 'SUBSTANCE_USE_DISORDER', label: 'Substance Use Disorder' },
  { value: 'BORDERLINE_PERSONALITY_DISORDER', label: 'Borderline Personality Disorder' },
  { value: 'CHRONIC_PAIN', label: 'Chronic Pain' },
  { value: 'FIBROMYALGIA', label: 'Fibromyalgia' },
  { value: 'CHRONIC_FATIGUE_SYNDROME', label: 'Chronic Fatigue Syndrome' },
  { value: 'AUTOIMMUNE_CONDITION', label: 'Autoimmune Condition' },
  { value: 'DISABILITY', label: 'Disability' },
  { value: 'HEARING_IMPAIRMENT', label: 'Hearing Impairment' },
  { value: 'VISION_IMPAIRMENT', label: 'Vision Impairment' },
  { value: 'MOBILITY_IMPAIRMENT', label: 'Mobility Impairment' },
  { value: 'TRAUMATIC_BRAIN_INJURY', label: 'Traumatic Brain Injury' },
  { value: 'LEARNING_DISABILITY', label: 'Learning Disability' },
  { value: 'AUTISM_SPECTRUM_DISORDER', label: 'Autism Spectrum Disorder' },
  { value: 'PREGNANCY', label: 'Pregnancy' },
  { value: 'POSTPARTUM_CONDITIONS', label: 'Postpartum Conditions' },
  { value: 'CHRONIC_ILLNESS', label: 'Chronic Illness' },
  { value: 'OTHER_MENTAL_HEALTH', label: 'Other Mental Health' },
  { value: 'OTHER_PHYSICAL_CONDITION', label: 'Other Physical Condition' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer Not to Say' },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    profileDescription: '',
    medicalConditions: [] as MedicalCondition[]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const localUser = authService.getCurrentUser();
    if (!localUser) {
      navigate('/login');
      return;
    }
    
    // Fetch fresh user data from backend
    const loadUserProfile = async () => {
      try {
        setProfileLoading(true);
        const freshUserData = await authService.fetchUserProfile(localUser.id);
        setUser(freshUserData);
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(freshUserData));
        
        console.log('Profile data loaded from backend:', freshUserData);
        
        // Check if this is first setup (no phone, DOB, or description)
        if (!freshUserData.phoneNumber && !freshUserData.dateOfBirth && !freshUserData.profileDescription) {
          setIsFirstSetup(true);
          setIsEditing(true); // Automatically open edit mode for first setup
        }
        
        // Initialize form data with fresh user data
        console.log('Medical conditions from backend:', freshUserData.medicalConditions);
        setFormData({
          firstName: freshUserData.firstName || '',
          lastName: freshUserData.lastName || '',
          email: freshUserData.email || '',
          phoneNumber: freshUserData.phoneNumber || '',
          dateOfBirth: freshUserData.dateOfBirth || '',
          profileDescription: freshUserData.profileDescription || '',
          medicalConditions: Array.isArray(freshUserData.medicalConditions) ? freshUserData.medicalConditions : []
        });
      } catch (err) {
        console.error('Failed to load user profile:', err);
        // Fall back to local storage data if fetch fails
        setUser(localUser);
        console.log('Fallback - Medical conditions from localStorage:', localUser.medicalConditions);
        setFormData({
          firstName: localUser.firstName || '',
          lastName: localUser.lastName || '',
          email: localUser.email || '',
          phoneNumber: localUser.phoneNumber || '',
          dateOfBirth: localUser.dateOfBirth || '',
          profileDescription: localUser.profileDescription || '',
          medicalConditions: Array.isArray(localUser.medicalConditions) ? localUser.medicalConditions : []
        });
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadUserProfile();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicalConditionToggle = (condition: MedicalCondition) => {
    setFormData(prev => {
      const currentConditions = prev.medicalConditions || [];
      const newConditions = currentConditions.includes(condition)
        ? currentConditions.filter(c => c !== condition)
        : [...currentConditions, condition];
      
      console.log('Toggling condition:', condition);
      console.log('New conditions:', newConditions);
      
      return {
        ...prev,
        medicalConditions: newConditions
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Saving profile with medical conditions:', formData.medicalConditions);
      const updatedUser = await authService.updateProfile(user.id, formData);
      console.log('Updated user from backend:', updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setIsFirstSetup(false);
      
      // If this was first setup, redirect to dashboard after a moment
      if (isFirstSetup) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth || '',
        profileDescription: user.profileDescription || '',
        medicalConditions: user.medicalConditions || []
      });
    }
    setIsEditing(false);
    setError('');
  };

  if (profileLoading) {
    return (
      <div className="profile-page">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#7c9885',
          fontSize: '1.2rem'
        }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
          <h1><i className="fas fa-user-circle"></i> My Profile</h1>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              <i className="fas fa-edit"></i> ✏️ Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                className="save-btn"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="profile-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="(optional)"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Profile Description</label>
              <textarea
                name="profileDescription"
                value={formData.profileDescription}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell us about yourself (optional)"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Medical Information</h2>
            <p className="section-note">
              This information helps us provide more personalized support. All data is kept confidential.
            </p>
            <div className="medical-conditions-grid">
              {MEDICAL_CONDITIONS.map(condition => {
                const isChecked = formData.medicalConditions && formData.medicalConditions.includes(condition.value);
                return (
                  <label key={condition.value} className="condition-checkbox">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleMedicalConditionToggle(condition.value)}
                      disabled={!isEditing}
                    />
                    <span>{condition.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="form-section">
            <h2>Account Information</h2>
            <div className="account-info">
              <div className="info-row">
                <span className="info-label">Member Since:</span>
                <span className="info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Login:</span>
                <span className="info-value">
                  {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;