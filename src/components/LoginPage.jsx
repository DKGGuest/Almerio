import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate login delay
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        onLogin(true);
        navigate('/dashboard');
      } else {
        setError('Invalid username or password. Use admin/admin123');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="enterprise-login-container">
      {/* Left Panel - Branding */}
      <div className="login-brand-panel">
        <div className="brand-content">
          <div className="company-logo">
            <img src="/Group-22222270.svg" alt="Logo" style={{ height: 60, display: 'block', margin: '0 auto' }} />
          </div>

          <div className="system-info">
            <h2 className="system-title">Shooting Range Management System</h2>
            <p className="system-description">
              Advanced ballistics analysis and performance tracking platform for professional shooting ranges and training facilities.
            </p>
          </div>

          <div className="security-features">
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <span>Enterprise Security</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <span>Real-time Analytics</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <span>Precision Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="login-form-panel">
        <div className="form-container">
          <div className="form-header">
            <h2 className="form-title">System Access</h2>
            <p className="form-subtitle">Please authenticate to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="enterprise-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="error-alert">
                <div className="error-content">
                  <strong>Authentication Failed</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`submit-button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="form-footer">
            <div className="demo-info">
              <p className="demo-label">Demo Access</p>
              <div className="demo-creds">
                <span>admin / admin123</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
