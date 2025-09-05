import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({
        email: formData.email,
        password: formData.password,
      });
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title"><i className="fas fa-heart-pulse"></i> LifelineAI</h1>
        <h2>Welcome Back</h2>
        
        <div className="welcome-text">
          <p>A secure platform to document and understand relationship patterns for your safety and wellbeing.</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <i className="fas fa-envelope input-icon"></i>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <i className="fas fa-lock input-icon"></i>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default Login;