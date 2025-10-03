import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getShooterHistory, getSessionDetails, getShooterById, getShooter } from '../services/api';
import { getPerformanceRemark, shouldShowRemarks, getRemarkBadgeStyle } from '../utils/performanceRemarks';
import { getFiringModeLabel } from '../constants/shootingParameters';

const ShooterProfilePage = () => {
  const { shooterName, shooterId } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shooterData, setShooterData] = useState(null);

  // Helper function to convert firing mode for display
  const getFiringModeDisplay = (mode) => {
    return getFiringModeLabel(mode) || mode;
  };

  // Load shooter sessions
  useEffect(() => {
    const loadShooterData = async () => {
      try {
        setLoading(true);
        let sessionsData;

        console.log('Loading shooter data for:', { shooterId, shooterName }); // Debug log

        if (shooterId) {
          // Load by shooter ID - use the combined endpoint that returns both shooter and sessions
          console.log('Fetching shooter details for ID:', shooterId); // Debug log
          const shooterDetails = await getShooter(shooterId);
          console.log('Shooter details response:', shooterDetails); // Debug log

          // Set shooter data
          if (shooterDetails.shooter) {
            console.log('Setting shooter data:', shooterDetails.shooter); // Debug log
            setShooterData(shooterDetails.shooter);
            console.log('Shooter data set, name should be:', shooterDetails.shooter.shooter_name); // Debug log
          } else {
            console.log('No shooter data in response:', shooterDetails); // Debug log
          }

          // Set sessions data
          sessionsData = shooterDetails.sessions || [];
        } else if (shooterName) {
          // Load by shooter name (legacy route)
          console.log('Fetching shooter history for name:', shooterName); // Debug log
          sessionsData = await getShooterHistory(shooterName);
        } else {
          throw new Error('No shooter identifier provided');
        }

        console.log('Sessions data:', sessionsData); // Debug log
        setSessions(sessionsData);

        if (sessionsData.length > 0) {
          // Select the most recent session by default
          const mostRecentSession = sessionsData[0];
          console.log('🎯 Auto-selecting most recent session:', {
            id: mostRecentSession.id,
            name: mostRecentSession.session_name,
            accuracy: mostRecentSession.accuracy_percentage,
            mpi: mostRecentSession.mpi_distance,
            shots: mostRecentSession.shots_analyzed
          });
          setSelectedSession(mostRecentSession);
        }
      } catch (err) {
        console.error('Error loading shooter data:', err); // Debug log
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (shooterName || shooterId) {
      loadShooterData();
    }
  }, [shooterName, shooterId]);

  // Load session details when a session is selected
  useEffect(() => {
    const loadSessionDetails = async () => {
      if (selectedSession) {
        try {
          const sessionDetails = await getSessionDetails(selectedSession.id);
          // Don't overwrite shooter data with session details
          console.log('Session details loaded:', sessionDetails);
        } catch (err) {
          console.error('Error loading session details:', err);
        }
      }
    };

    loadSessionDetails();
  }, [selectedSession]);

  // Fetch detailed session data when a session is selected
  useEffect(() => {
    if (!selectedSession) {
      setSelectedSessionDetails(null);
      return;
    }

    const fetchSessionDetails = async () => {
      try {
        const { getSessionDetails } = await import('../services/api');
        const details = await getSessionDetails(selectedSession.id);
        setSelectedSessionDetails(details);
      } catch (error) {
        console.error('Failed to fetch session details:', error);
        setSelectedSessionDetails(null);
      }
    };

    fetchSessionDetails();
  }, [selectedSession]);

  // Calculate performance analytics from selected session
  const analytics = useMemo(() => {
    console.log('🔍 Analytics calculation:', {
      selectedSession: selectedSession?.id,
      selectedSessionDetails: selectedSessionDetails?.session?.id,
      hasAnalytics: !!selectedSessionDetails?.analytics
    });

    if (!selectedSession) {
      console.log('❌ No selected session');
      return {
        mpi: 0,
        accuracy: 0,
        maxDistance: 0,
        groupSize: 0,
        shotsAnalyzed: 0,
        trueMPI: { x: 0, y: 0 },
        referencePoint: 'center'
      };
    }

    // Always use session list data for basic metrics, session details for advanced metrics
    const sessionData = selectedSession;
    const analyticsData = selectedSessionDetails?.analytics;

    console.log('📊 Session data for analytics:', {
      sessionId: sessionData.id,
      accuracy: sessionData.accuracy_percentage,
      mpi: sessionData.mpi_distance,
      shots: sessionData.shots_analyzed,
      groupSize: analyticsData?.group_size,
      hasSessionDetails: !!selectedSessionDetails
    });

    const result = {
      mpi: Number(sessionData.mpi_distance || 0).toFixed(1),
      accuracy: Number(sessionData.accuracy_percentage || 0).toFixed(1),
      maxDistance: analyticsData?.max_distance ? Number(analyticsData.max_distance).toFixed(1) : 'N/A',
      groupSize: analyticsData?.group_size ? Number(analyticsData.group_size).toFixed(1) : 'N/A',
      shotsAnalyzed: Number(sessionData.shots_analyzed || 0),
      trueMPI: { x: 'N/A', y: 'N/A' }, // Not available in session list
      referencePoint: 'center'
    };

    console.log('✅ Analytics result:', result);
    return result;
  }, [selectedSession, selectedSessionDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shooter profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/shooters')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            <button
              onClick={() => navigate('/shooters')}
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
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              ← Back to Dashboard
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                🎯
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>
                  {(() => {
                    const displayName = loading ? 'Loading...' : (shooterData?.shooter_name || shooterName || `Shooter #${shooterId}`);
                    console.log('Rendering shooter name:', displayName, 'shooterData:', shooterData, 'loading:', loading);
                    return displayName;
                  })()}
                </h1>
                <p style={{ color: '#64748b', margin: '0', fontSize: '14px' }}>
                  Shooting Profile {(shooterData?.id || shooterId) && `• Shooter ID #${shooterData?.id || shooterId}`}
                </p>
              </div>
            </div>
          </div>

          {selectedSession?.shooter_id && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Shooter ID</div>
              <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>#{selectedSession.shooter_id}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>


        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
              {sessions.length}
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Total Sessions</div>
          </div> */}

          {/* <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              {analytics.accuracy}%
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Current Accuracy</div>
          </div> */}

          {/* <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              {analytics.shotsAnalyzed}
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Shots Fired</div>
          </div> */}

          {/* <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
              {analytics.mpi}mm
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>MPI Distance</div>
          </div> */}
        </div>

        {/* Session Selection */}
        {sessions.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              📅 All Sessions ({sessions.length} total)
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  style={{
                    padding: '20px',
                    borderRadius: '8px',
                    border: selectedSession?.id === session.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    backgroundColor: selectedSession?.id === session.id ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedSession(session)}
                  onMouseOver={(e) => {
                    if (selectedSession?.id !== session.id) {
                      e.currentTarget.style.borderColor = '#93c5fd';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedSession?.id !== session.id) {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 'bold', color: '#3b82f6', fontSize: '16px' }}>
                      Session #{sessions.length - index}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {selectedSession?.id === session.id && (
                        <span style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          fontSize: '10px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontWeight: 'bold'
                        }}>
                          VIEWING
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/session/${session.id}`);
                        }}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          fontSize: '10px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          border: 'none',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    📅 {new Date(session.started_at).toLocaleDateString()} at{' '}
                    ⏰ {new Date(session.started_at).toLocaleTimeString()}
                  </div>
                  <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '600' }}>🎯 {getFiringModeDisplay(session.firing_mode)}</span> •
                    <span style={{ fontWeight: 'bold', color: '#10b981', marginLeft: '4px' }}>
                      {Number(session.accuracy_percentage || 0).toFixed(1)}%
                    </span>
                    {/* {session.target_distance && (
                      <span style={{ color: '#64748b', marginLeft: '8px' }}>
                        • 📏 {session.target_distance}m
                      </span>
                    )} */}
                  </div>
                  {/* Show performance remark for test sessions */}
                  {(() => {
                    // Detect if this is a test session (you may need to adjust this logic based on your data structure)
                    const isTestSession = session.session_name?.toLowerCase().includes('test') ||
                                         session.session_type === 'test';

                    if (isTestSession) {
                      const remark = getPerformanceRemark(session.accuracy_percentage, 'test');
                      return (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '4px'
                        }}>
                          <div style={getRemarkBadgeStyle(remark)}>
                            {remark.emoji} {remark.rating}
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                            Test Remark: {remark.description}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Session Overview */}
        {selectedSession && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            marginBottom: '32px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              📊 Currently Viewing: {selectedSession ? (() => {
                const sessionIndex = sessions.findIndex(s => s.id === selectedSession.id);
                return sessionIndex >= 0 ? `Session #${sessions.length - sessionIndex} (ID: ${selectedSession.id})` : `Session ID: ${selectedSession.id} (Not Found in List)`;
              })() : 'No Session Selected'}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                  {analytics.accuracy}%
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Accuracy</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {analytics.mpi}mm
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>MPI Distance</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {analytics.shotsAnalyzed}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Shots Fired</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ef4444' }}>
                  {analytics.groupSize}mm
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Group Size</div>
              </div>
            </div>
            {/* Show performance remark for test sessions */}
            {(() => {
              const isTestSession = selectedSession.session_name?.toLowerCase().includes('test') ||
                                   selectedSession.session_type === 'test';

              if (isTestSession) {
                const remark = getPerformanceRemark(selectedSession.accuracy_percentage, 'test');
                return (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: `2px solid ${remark.color}20`
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        ...getRemarkBadgeStyle(remark),
                        fontSize: '0.875rem',
                        padding: '8px 16px'
                      }}>
                        {remark.emoji} {remark.rating}
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0', fontStyle: 'italic' }}>
                      🎯 Test Session Remark: {remark.description} accuracy range
                    </p>
                  </div>
                );
              }
              return null;
            })()}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#0369a1', margin: '0' }}>
                💡 Click "VIEW DETAILS" on any session above to see complete shooting parameters, detailed analysis, and shot-by-shot breakdown
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShooterProfilePage;
