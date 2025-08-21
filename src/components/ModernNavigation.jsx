import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const ModernNavigation = ({ onLogout, activeLanes = 0 }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  // Close profile menu on scroll
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleScroll = () => setIsProfileMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isProfileMenuOpen]);

  // Close profile menu on outside click
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isProfileMenuOpen]);

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: '🎯',
      description: 'Main control panel'
    },
    {
      name: 'Simulator',
      path: '/simulator',
      icon: '🎲',
      description: 'Random shot simulator'
    },
    {
      name: 'Help',
      path: '/demo',
      icon: '❓',
      description: 'Interactive tutorial & help'
    }
    ,
    {
      name: 'Multi Target',
      path: '/live-lanes',
      icon: '🟢',
      description: 'View multiple targets'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setIsProfileMenuOpen(false);
  };

  // Always show header, even on /live-lanes route

  return (
    <nav className="modern-nav">
      <div className="nav-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {/* Logo and Brand Section */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Logo image from public folder */}
          <img
            src="/Group-22222270.svg"
            alt="Logo"
            style={{ height: 48, marginRight: 24 }}
          />
        </div>
        {/* Navigation Links - Centered absolutely */}
        <div className="nav-links" style={{ position: 'absolute', left: 0, right: 0, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex' }}>
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                title={item.description}
                style={item.path === '/live-lanes' ? { marginLeft: 16, fontWeight: 700, whiteSpace: 'nowrap' } : {}}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
                {isActive(item.path) && <div className="active-indicator" />}
              </Link>
            ))}
          </div>
        </div>

        {/* Status and User Section */}
        <div className="nav-status">
          {/* System Status */}
          <div className="status-indicator">
            <div className="status-dot online"></div>
            <div className="status-info">
              <span className="status-text">System Online</span>
              <span className="status-detail">
                {activeLanes} {activeLanes === 1 ? 'lane' : 'lanes'} active
              </span>
            </div>
          </div>

          {/* User Profile Menu */}
          <div className="profile-menu" ref={profileMenuRef}>
            <button
              className="profile-trigger"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              aria-expanded={isProfileMenuOpen}
            >
              {/* Remove the profile-avatar span */}
              <div className="profile-info">
                <span className="profile-name">Admin</span>
                <span className="profile-role">System Administrator</span>
              </div>
              <svg 
                className={`profile-chevron ${isProfileMenuOpen ? 'open' : ''}`}
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="currentColor"
              >
                <path d="M4.427 9.573l3.396-3.396a.25.25 0 01.354 0l3.396 3.396a.25.25 0 01-.177.427H4.604a.25.25 0 01-.177-.427z"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-avatar">
                    <span className="avatar-text">AD</span>
                  </div>
                  <div className="dropdown-info">
                    <span className="dropdown-name">Admin User</span>
                    <span className="dropdown-email">admin@almerio-defence.com</span>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-items">
                  <button className="dropdown-item">
                    <span className="item-icon">⚙️</span>
                    <span className="item-text">Settings</span>
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">📊</span>
                    <span className="item-text">Analytics</span>
                  </button>
                  <button className="dropdown-item">
                    <span className="item-icon">❓</span>
                    <span className="item-text">Help & Support</span>
                  </button>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout-item" onClick={handleLogout}>
                  <span className="item-icon">🚪</span>
                  <span className="item-text">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Toggle (for future mobile responsiveness) */}
      <button className="mobile-nav-toggle" aria-label="Toggle navigation">
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </nav>
  );
};

export default ModernNavigation;
