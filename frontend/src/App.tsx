import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RelationshipDetail from './pages/RelationshipDetail';
import { authService } from './services/authService';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Small delay to ensure localStorage is ready
    const checkAuth = () => {
      setIsAuth(authService.isAuthenticated());
      setIsLoading(false);
    };
    
    // Give it a brief moment for state to settle
    setTimeout(checkAuth, 50);
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

function App() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Initialize auth check
    setTimeout(() => setAuthChecked(true), 100);
  }, []);

  if (!authChecked) {
    return <div className="loading">Initializing...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/relationship/:id"
            element={
              <PrivateRoute>
                <RelationshipDetail />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;