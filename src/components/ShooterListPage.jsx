import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listShooters, deleteShooter } from '../services/api';
import { getFiringModeLabel } from '../constants/shootingParameters';

const ShooterListPage = () => {
  const navigate = useNavigate();
  const [shooters, setShooters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to convert firing mode for display
  const getFiringModeDisplay = (mode) => {
    return getFiringModeLabel(mode) || mode;
  };


  // Fetch all shooters
  const fetchShooters = async () => {
    try {
      setLoading(true);
      const shootersData = await listShooters();
      console.log('Fetched shooters:', shootersData); // Debug log
      setShooters(shootersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShooters();
  }, []);

  // Auto-refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchShooters();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Filter shooters based on search term
  const filteredShooters = shooters.filter(shooter =>
    shooter.shooter_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Detect duplicate names
  const nameCount = {};
  shooters.forEach(shooter => {
    nameCount[shooter.shooter_name] = (nameCount[shooter.shooter_name] || 0) + 1;
  });

  const hasDuplicateNames = Object.values(nameCount).some(count => count > 1);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading shooters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>Error Loading Shooters</h2>
          <p style={{ color: '#64748b', marginBottom: '16px' }}>{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Clean Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
              <button
                onClick={fetchShooters}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: loading ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#059669'; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#10b981'; }}
              >
                <span>🔄</span>
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>👥 All Shooters</h1>
              <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Complete shooter database</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Shooters</div>
            <div style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '20px' }}>{shooters.length}</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
              fontSize: '16px',
              pointerEvents: 'none'
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search shooters by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>
        </div>

        {/* Duplicate Names Warning */}
        {hasDuplicateNames && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <div>
                <h3 style={{ fontWeight: 'bold', color: '#92400e', margin: '0 0 4px 0' }}>Multiple Shooters with Same Names Detected</h3>
                <p style={{ color: '#b45309', fontSize: '14px', margin: '0' }}>
                  Some shooters have identical names. Use the Shooter ID column to distinguish between them.
                  When assigning shooters in the Admin Dashboard, the system will use the most recent shooter with that name.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shooters Table */}
        {filteredShooters.length > 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Shooter Name</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Skill Level</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Sessions</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Last Session</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Session Type</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#374151', fontSize: '14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShooters.map((shooter) => {
                  const isDuplicateName = nameCount[shooter.shooter_name] > 1;
                  return (
                    <tr key={shooter.id} style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: 'white'
                    }}>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#3b82f6' }}>
                        #{shooter.id}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '14px'
                          }}>
                            {shooter.shooter_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1f2937' }}>{shooter.shooter_name}</div>
                            {isDuplicateName && (
                              <div style={{
                                fontSize: '12px',
                                color: '#d97706',
                                backgroundColor: '#fef3c7',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: '500',
                                marginTop: '2px'
                              }}>
                                ⚠️ Duplicate Name
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b', textTransform: 'capitalize' }}>
                        {shooter.skill_level || 'Beginner'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#3b82f6' }}>
                        {shooter.total_sessions || 0}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>
                        {shooter.last_session_date ? new Date(shooter.last_session_date).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#64748b', textTransform: 'capitalize' }}>
                        {shooter.last_session_type || '—'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => navigate(`/shooter-profile/${shooter.id}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer',
                            marginRight: '8px'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                        >View</button>
                        <button
                          onClick={async () => {
                            const yes = confirm(`Delete shooter \"${shooter.shooter_name}\" and all related sessions?`);
                            if (!yes) return;
                            try {
                              await deleteShooter(shooter.id);
                              setShooters(prev => prev.filter(s => s.id !== shooter.id));
                            } catch (err) { alert('Failed to delete shooter: ' + err.message); }
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; }}
                        >Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            {searchTerm ? (
              <>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>No Shooters Found</h2>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '16px' }}>
                  No shooters match your search for "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>No Shooters Yet</h2>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '16px' }}>
                  No shooters have been registered yet. Start a new session to create the first shooter profile.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; }}
                >
                  Start New Session
                </button>
              </>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {shooters.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            marginTop: '32px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>📊 Quick Statistics</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {/* Total Shooters */}
              <div style={{
                padding: '20px',
                textAlign: 'center',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe'
              }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', margin: '0 0 4px 0' }}>{shooters.length}</p>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>Total Shooters</p>
              </div>
              {/* Total Sessions */}
              <div style={{
                padding: '20px',
                textAlign: 'center',
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #dcfce7'
              }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: '0 0 4px 0' }}>
                  {shooters.reduce((sum, shooter) => sum + (shooter.total_sessions || 0), 0)}
                </p>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>Total Sessions</p>
              </div>
              {/* Expert Shooters */}
              <div style={{
                padding: '20px',
                textAlign: 'center',
                borderRadius: '8px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fed7aa'
              }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', margin: '0 0 4px 0' }}>
                  {shooters.filter(shooter => shooter.skill_level === 'expert').length}
                </p>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>Expert Shooters</p>
              </div>
              {/* Active This Week */}
              <div style={{
                padding: '20px',
                textAlign: 'center',
                borderRadius: '8px',
                backgroundColor: '#fdf4ff',
                border: '1px solid #f3e8ff'
              }}>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#a855f7', margin: '0 0 4px 0' }}>
                  {shooters.filter(shooter =>
                    shooter.last_session_date &&
                    new Date(shooter.last_session_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </p>
                <p style={{ fontSize: '14px', color: '#64748b', margin: '0' }}>Active This Week</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShooterListPage;
