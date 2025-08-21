import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import TargetSimulatorDemo from './components/TargetSimulatorDemo';
import Simulator from './components/Simulator';
import MultiLaneLiveView from './components/MultiLaneLiveView';

import ModernNavigation from './components/ModernNavigation';

function App() {
  // ...existing code...
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    return savedAuth === 'true';
  });

  // Lane state lifted to App
  const [lanes, setLanes] = useState({
    lane1: {
      enabled: true,
      shooter: '',
      hits: [],
      bullseye: null,
      template: null,
      parameters: null,
      uploadedImage: null,
      message: '🎯 Target Online'
    }
  });

  useEffect(() => {
    console.log('[App] lanes state changed:', lanes);
  }, [lanes]);

  // Lane update helpers
  const addLane = () => {
    const nextLaneNumber = Object.keys(lanes).length + 1;
    const laneId = `lane${nextLaneNumber}`;
    setLanes(prev => {
      const newLanes = {
        ...prev,
        [laneId]: {
          enabled: true,
          shooter: '',
          hits: [],
          bullseye: null,
          template: null,
          parameters: null,
          uploadedImage: null,
          message: '🎯 Target Online'
        }
      };
      console.log('[App] addLane:', newLanes);
      return newLanes;
    });
  };
  const removeLane = (laneId) => {
    setLanes(prev => {
      const newLanes = { ...prev };
      delete newLanes[laneId];
      console.log('[App] removeLane:', newLanes);
      return newLanes;
    });
  };
  const updateLane = (laneId, updates) => {
    setLanes(prev => {
      const newLane = {
        ...prev[laneId],
        ...updates
      };
      const newLanes = {
        ...prev,
        [laneId]: newLane
      };
      console.log('[App] updateLane:', laneId, updates, newLanes);
      return newLanes;
    });
  };

  // ...existing code...
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated.toString());
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      const loginTime = localStorage.getItem('loginTime');
      if (loginTime) {
        const currentTime = new Date().getTime();
        const sessionDuration = currentTime - parseInt(loginTime);
        const maxSessionTime = 24 * 60 * 60 * 1000;
        if (sessionDuration > maxSessionTime) {
          handleLogout();
        }
      }
    }
  }, [isAuthenticated]);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    if (status) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('loginTime', new Date().getTime().toString());
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('loginTime');
  };

  return (
    <Router>
      {/* Hide navbar on login route */}
      {window.location.pathname !== '/login' && (
        <ModernNavigation activeLanes={Object.keys(lanes).length} onLogout={handleLogout} />
      )}
      <div className="min-h-screen bg-shooter-dark">
        <Routes>
          <Route
            path="/login"
            element={<LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminDashboard
                  onLogout={handleLogout}
                  lanes={lanes}
                  addLane={addLane}
                  removeLane={removeLane}
                  updateLane={updateLane}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-lanes"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MultiLaneLiveView
                  lanes={Object.entries(lanes).map(([id, lane]) => ({ id, ...lane }))}
                  updateLane={updateLane}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulator"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Simulator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/demo"
            element={<TargetSimulatorDemo />}
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
