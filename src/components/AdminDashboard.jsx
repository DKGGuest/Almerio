import { useState, useRef, useCallback, useEffect } from 'react';
import TargetDisplay from './TargetDisplay';
import ShotBreakdown from './ShotBreakdown';
import FinalReport from './FinalReport';
import TargetTemplateSelector from './TargetTemplateSelector';
// import ModernNavigation from './ModernNavigation';

// Shooter Assignment Form Component - Compact
const ShooterAssignmentForm = ({ onAssign, isMobile = false }) => {
  const [shooterName, setShooterName] = useState('');

  const handleSubmit = () => {
    if (shooterName.trim()) {
      onAssign(shooterName.trim());
      setShooterName('');
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: isMobile ? '4px' : '6px',
      alignItems: 'center',
      flex: 1
    }}>
      <input
        type="text"
        value={shooterName}
        onChange={(e) => setShooterName(e.target.value)}
        placeholder={isMobile ? "Shooter name" : "Enter shooter name"}
        style={{
          padding: isMobile ? '4px 6px' : '6px 8px',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          fontSize: isMobile ? '11px' : '12px',
          background: 'white',
          flex: 1,
          minWidth: 0
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <button
        onClick={handleSubmit}
        disabled={!shooterName.trim()}
        style={{
          background: !shooterName.trim() ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: isMobile ? '4px 8px' : '6px 10px',
          fontSize: isMobile ? '10px' : '11px',
          fontWeight: '600',
          borderRadius: '4px',
          border: 'none',
          cursor: !shooterName.trim() ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap'
        }}
      >
        ASSIGN
      </button>
    </div>
  );
};

// Performance Analytics Tab Component - No Scroll
const PerformanceAnalyticsTab = ({ analyticsData, activeLane, laneId = null, isMobile = false, isTablet = false }) => {
  // Consider data available whenever we have any analyzed bullets or a finished session
  const hasData = !!(analyticsData && (analyticsData.showResults || analyticsData.shootingPhase === 'DONE'));

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <h3 style={{
        fontSize: isMobile ? '0.875rem' : isTablet ? '1rem' : '1.125rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: isMobile ? '8px' : '12px',
        margin: `0 0 ${isMobile ? '8px' : '12px'} 0`,
        flexShrink: 0
      }}>
        📊 {laneId ? `Lane ${laneId.replace('lane', '')} - Performance Analytics` : 'Performance Analytics'}
      </h3>

      {hasData ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '6px' : '8px',
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {/* Primary Stats - Compact */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '4px' : '8px',
            flexShrink: 0
          }}>
            <div style={{
              padding: isMobile ? '8px' : '12px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              borderRadius: isMobile ? '6px' : '8px',
              border: '1px solid #3b82f6',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#1e40af',
                fontSize: isMobile ? '0.625rem' : '0.75rem',
                fontWeight: '600',
                marginBottom: '2px'
              }}>
                📍 MPI
              </div>
              <div style={{
                color: '#1d4ed8',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: '800'
              }}>
                {analyticsData.stats.mpi.toFixed(1)}
              </div>
              <div style={{
                color: '#3b82f6',
                fontSize: isMobile ? '0.5rem' : '0.625rem'
              }}>
                mm
              </div>
            </div>

            <div style={{
              padding: isMobile ? '8px' : '12px',
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              borderRadius: isMobile ? '6px' : '8px',
              border: '1px solid #10b981',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#065f46',
                fontSize: isMobile ? '0.625rem' : '0.75rem',
                fontWeight: '600',
                marginBottom: '2px'
              }}>
                🎯 Accuracy
              </div>
              <div style={{
                color: '#047857',
                fontSize: isMobile ? '1.25rem' : '1.5rem',
                fontWeight: '800'
              }}>
                {analyticsData.stats.accuracy.toFixed(1)}
              </div>
              <div style={{
                color: '#059669',
                fontSize: isMobile ? '0.5rem' : '0.625rem'
              }}>
                %
              </div>
            </div>
          </div>

          {/* Detailed Stats - Compact & Scrollable */}
          <div style={{
            flex: 1,
            background: '#f8fafc',
            borderRadius: isMobile ? '6px' : '8px',
            padding: isMobile ? '8px' : '12px',
            border: '1px solid #e2e8f0',
            minHeight: 0,
            overflow: 'auto'
          }}>
            <h4 style={{
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: isMobile ? '6px' : '8px',
              margin: `0 0 ${isMobile ? '6px' : '8px'} 0`
            }}>
              Detailed Metrics
            </h4>

            <div style={{
              display: 'grid',
              gap: isMobile ? '4px' : '6px'
            }}>
              {[
                { label: '📏 Max Distance', value: `${analyticsData.stats.maxDistance.toFixed(1)} mm` },
                { label: '🎯 Group Size', value: `${analyticsData.stats.groupSize.toFixed(1)} mm` },
                { label: '🔢 Shots Analyzed', value: analyticsData.bullets.length },
                {
                  label: '⊕ True MPI',
                  value: analyticsData.stats.mpiCoords ?
                    `(${Math.round(analyticsData.stats.mpiCoords.x - 200)}, ${Math.round(200 - analyticsData.stats.mpiCoords.y)})` :
                    '(-, -)'
                },
                {
                  label: '📍 Reference Point',
                  value: analyticsData.stats.referenceCoords ?
                    `(${Math.round(analyticsData.stats.referenceCoords.x - 200)}, ${Math.round(200 - analyticsData.stats.referenceCoords.y)})` :
                    '(-, -)'
                }
              ].map((metric, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: isMobile ? '6px' : '8px',
                  background: 'white',
                  borderRadius: isMobile ? '4px' : '6px',
                  border: '1px solid #e5e7eb'
                }}>
                  <span style={{
                    color: '#6b7280',
                    fontSize: isMobile ? '0.625rem' : '0.75rem',
                    fontWeight: '500'
                  }}>
                    {metric.label}
                  </span>
                  <span style={{
                    color: '#374151',
                    fontSize: isMobile ? '0.625rem' : '0.75rem',
                    fontWeight: '600'
                  }}>
                    {metric.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? '2rem' : '3rem', marginBottom: isMobile ? '8px' : '12px' }}>📊</div>
          <h4 style={{
            fontSize: isMobile ? '0.875rem' : '1rem',
            fontWeight: '600',
            marginBottom: isMobile ? '4px' : '6px',
            margin: `0 0 ${isMobile ? '4px' : '6px'} 0`
          }}>
            No Analytics Data
          </h4>
          <p style={{
            fontSize: isMobile ? '0.625rem' : '0.75rem',
            margin: 0,
            lineHeight: 1.3
          }}>
            {!activeLane.shooter ? 'Assign a shooter and take some shots to see analytics' :
             activeLane.hits.length === 0 ? 'Take some shots to see performance analytics' :
             'Analytics will appear after shooting is complete'}
          </p>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = ({ onLogout, lanes, addLane, removeLane, updateLane }) => {
  // Track the currently active lane
  const [activeLaneId, setActiveLaneId] = useState('lane1');
  // Track active tab in the right panel
  const [activeTab, setActiveTab] = useState('analytics');
  // Track analytics data for the active lane
  const [analyticsData, setAnalyticsData] = useState({});
  // Track screen size for responsive design
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024
  });

  useEffect(() => {
    console.log('[AdminDashboard] lanes prop changed:', lanes);
  }, [lanes]);

  useEffect(() => {
    console.log('[AdminDashboard] activeLaneId changed:', activeLaneId);
  }, [activeLaneId]);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close a lane (remove it)
  const closeLane = (laneId) => {
    if (Object.keys(lanes).length > 1) {
      removeLane(laneId);
      // If the closed lane was active, switch to another lane
      if (activeLaneId === laneId) {
        const remainingLaneIds = Object.keys(lanes).filter(id => id !== laneId);
        setActiveLaneId(remainingLaneIds[0]);
      }
    }
  };

  // Switch active lane
  const switchLane = (laneId) => {
    setActiveLaneId(laneId);
  };

  // updateLane is now from props

  // Handle analytics data updates
  const handleAnalyticsUpdate = useCallback((data) => {
    setAnalyticsData(prev => ({
      ...prev,
      [activeLaneId]: data
    }));
  }, [activeLaneId]);

  // Handle bullseye setting
  const handleBullseyeSet = useCallback((bullseye) => {
    updateLane(activeLaneId, {
      bullseye,
      message: '📍 Target Acquired'
    });
  }, [activeLaneId]);

  // Handle adding hits
  const handleAddHit = useCallback((hit) => {
    // Handle reset signal from TargetDisplay
    if (hit && hit.type === 'RESET') {
      updateLane(activeLaneId, {
        hits: [],
        bullseye: null,
        message: '🎯 Target Reset'
      });
      return;
    }

    const activeLane = lanes[activeLaneId];
    const newHits = [...activeLane.hits, hit];
    updateLane(activeLaneId, {
      hits: newHits,
      message: '🎯 Hit Registered'
    });

    // Show calculating message after a few shots
    if (newHits.length >= 3) {
      setTimeout(() => {
        updateLane(activeLaneId, {
          hits: newHits,
          message: '🧠 Calculating Score...'
        });
      }, 1000);
    }
  }, [activeLaneId, lanes]);

  // Handle parameters update
  const handleParametersUpdate = useCallback((laneId, parameters) => {
    updateLane(laneId, {
      parameters,
      message: '⚙️ Parameters Set'
    });
  }, []);



  // Handle shooter assignment
  const handleShooterAssignment = (shooterName) => {
    if (shooterName.trim()) {
      updateLane(activeLaneId, {
        shooter: shooterName.trim(),
        message: '👤 Shooter Ready'
      });
    }
  };

  // Simulate shot for testing
  const simulateShot = () => {
    const activeLane = lanes[activeLaneId];
    if (!activeLane.shooter) {
      updateLane(activeLaneId, { message: '⚠️ No Shooter Assigned' });
      return;
    }

    // Show "firing" message first
    updateLane(activeLaneId, { message: '🔥 FIRING...' });

    setTimeout(() => {
      // Simulate a random shot for testing
      const hit = {
        x: Math.random() * 300 + 50, // Random x between 50-350
        y: Math.random() * 300 + 50, // Random y between 50-350
        timestamp: Date.now()
      };
      handleAddHit(hit);
    }, 500);
  };

  // Lane entries
  const laneEntries = Object.entries(lanes);
  const activeLane = lanes[activeLaneId];

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      overflow: 'hidden'
    }}>
      {/* Modern Navigation */}
  {/* ModernNavigation removed, now rendered globally in App.jsx */}

      {/* Lane Controls - Responsive Design */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: screenSize.isMobile ? '6px 0' : '8px 0'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: screenSize.isMobile ? '0 12px' : '0 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: screenSize.isMobile ? 'column' : 'row',
            gap: screenSize.isMobile ? '8px' : '0'
          }}>
            <span style={{
              color: '#94a3b8',
              fontSize: screenSize.isMobile ? '0.75rem' : '0.875rem',
              fontWeight: '600',
              letterSpacing: '0.05em'
            }}>
              LANE CONTROLS
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: screenSize.isMobile ? '6px' : '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              width: screenSize.isMobile ? '100%' : 'auto',
              justifyContent: screenSize.isMobile ? 'center' : 'flex-start'
            }}>
              {laneEntries.map(([laneId]) => (
                <button
                  key={laneId}
                  onClick={() => switchLane(laneId)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: screenSize.isMobile ? '4px' : '6px',
                    padding: screenSize.isMobile ? '4px 8px' : '6px 12px',
                    background: laneId === activeLaneId
                      ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: laneId === activeLaneId ? 'white' : '#94a3b8',
                    border: 'none',
                    borderRadius: screenSize.isMobile ? '4px' : '6px',
                    fontSize: screenSize.isMobile ? '0.625rem' : '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: 'fit-content'
                  }}
                >
                  <span>{laneId === activeLaneId ? '⚡' : '○'}</span>
                  <span>{laneId.toUpperCase()}</span>
                  {laneEntries.length > 1 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '16px',
                        height: '16px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title="Close Lane"
                      onClick={e => { e.stopPropagation(); closeLane(laneId); }}
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
              <button
                onClick={addLane}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: screenSize.isMobile ? '4px' : '6px',
                  padding: screenSize.isMobile ? '4px 8px' : '6px 12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: screenSize.isMobile ? '4px' : '6px',
                  fontSize: screenSize.isMobile ? '0.625rem' : '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Add Lane"
              >
                <span>＋</span>
                <span>Add Lane</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Two-Panel No-Scroll Design */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: screenSize.isMobile ? '8px' : screenSize.isTablet ? '12px' : '16px',
        minHeight: 0,
        overflow: 'auto' // Changed from 'hidden' to 'auto' to allow scrolling if needed
      }}>
        {activeLane ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: screenSize.isDesktop ? '1.32fr 1.32fr' : '1fr',
            gridTemplateRows: screenSize.isDesktop ? '1fr' : 'minmax(350px, auto) minmax(250px, auto)', // Changed 1fr to auto
            gap: screenSize.isMobile ? '8px' : screenSize.isTablet ? '12px' : '16px',
            flex: 1,
            minHeight: 0,
            overflow: 'visible', // Changed from 'hidden' to 'visible'
            justifyContent: 'center',
            maxWidth: screenSize.isDesktop ? '132%' : '100%',
            margin: screenSize.isDesktop ? '0 auto' : '0'
          }}>
            {/* Panel 1: Target Display - Wider */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: screenSize.isMobile ? '8px' : '12px',
              padding: screenSize.isMobile ? '12px' : screenSize.isTablet ? '16px' : '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              minHeight: screenSize.isMobile ? '350px' : '400px',
              overflow: 'visible' // Changed from 'hidden' to 'visible'
            }}>
              {/* Header Section - Compact */}
              <div style={{
                marginBottom: screenSize.isMobile ? '8px' : '12px',
                flexShrink: 0
              }}>
                <h3 style={{
                  fontSize: screenSize.isMobile ? '0.875rem' : screenSize.isTablet ? '1rem' : '1.125rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  marginBottom: screenSize.isMobile ? '6px' : '8px',
                  margin: `0 0 ${screenSize.isMobile ? '6px' : '8px'} 0`
                }}>
                  🎯 Target Display
                </h3>

                {/* Enhanced Controls Section */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: screenSize.isMobile ? '8px' : '12px',
                  marginBottom: screenSize.isMobile ? '12px' : '16px',
                  flexShrink: 0
                }}>
                  {/* Shooter and Template Row */}
                  <div style={{
                    display: 'flex',
                    flexDirection: screenSize.isMobile ? 'column' : 'row',
                    gap: screenSize.isMobile ? '8px' : '12px',
                    alignItems: screenSize.isMobile ? 'stretch' : 'center'
                  }}>
                    {activeLane.shooter ? (
                      <div style={{
                        fontWeight: '600',
                        color: '#2563eb',
                        fontSize: screenSize.isMobile ? '14px' : '16px',
                        padding: screenSize.isMobile ? '10px 14px' : '12px 16px',
                        background: 'rgba(37,99,235,0.1)',
                        borderRadius: '8px',
                        display: 'inline-block',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        border: '2px solid rgba(37,99,235,0.2)'
                      }}
                    >
                        👤 {activeLane.shooter}
                      </div>
                    ) : (
                      <div style={{ flex: 1 }}>
                        <ShooterAssignmentForm
                          onAssign={handleShooterAssignment}
                          isMobile={screenSize.isMobile}
                        />
                      </div>
                    )}
                    {/* Dynamic SET/VIEW PARAMETERS Button */}
                    <button
                      onClick={() => {
                        console.log('Parameters button clicked for lane:', activeLaneId);
                        console.log('Current parameters exist:', !!activeLane.parameters);
                        // Trigger the parameter form in TargetDisplay directly
                        const targetContainer = document.querySelector(`[data-lane-id="${activeLaneId}"]`);
                        console.log('Target container found:', targetContainer);
                        if (targetContainer) {
                          const event = new CustomEvent('openParameterForm', { 
                            detail: { laneId: activeLaneId },
                            bubbles: true,
                            cancelable: true
                          });
                          console.log('Dispatching event:', event);
                          targetContainer.dispatchEvent(event);
                        }
                      }}
                      style={{
                        background: activeLane.parameters
                          ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' // Blue for VIEW PARAMETERS
                          : 'linear-gradient(135deg, #059669 0%, #047857 100%)', // Green for SET
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: screenSize.isMobile ? '10px 14px' : '12px 16px',
                        fontSize: screenSize.isMobile ? '14px' : '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: activeLane.parameters
                          ? '0 2px 6px rgba(59, 130, 246, 0.3)' // Blue shadow
                          : '0 2px 6px rgba(5, 150, 105, 0.3)' // Green shadow
                      }}
                      title={activeLane.parameters ? "Get Shooting Parameters" : "Set Shooting Parameters"}
                    >
                      <span style={{ fontSize: screenSize.isMobile ? '14px' : '16px' }}>
                        {activeLane.parameters ? '👁️' : '⚙️'}
                      </span>
                      <span>{activeLane.parameters ? 'GET PARAMETER' : 'SET PARAMETER'}</span>
                    </button>
                  </div>

                  {/* Action Buttons Row */}
                  <div style={{
                    display: 'flex',
                    gap: screenSize.isMobile ? '8px' : '12px',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={simulateShot}
                      disabled={!activeLane.shooter}
                      style={{
                        background: !activeLane.shooter ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: screenSize.isMobile ? '6px 12px' : '8px 16px',
                        fontSize: screenSize.isMobile ? '12px' : '14px',
                        fontWeight: '600',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: !activeLane.shooter ? 'not-allowed' : 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                        height: '32px'
                      }}
                    >
                      🎯 SIMULATE
                    </button>

                    {/* Template Dropdown Selector */}
                    <select
                      value={activeLane.template?.id || ''}
                      onChange={(e) => {
                        const templateId = e.target.value;
                        const TARGET_TEMPLATES = [
                          {
                            id: 'air-pistol-10m',
                            name: '10m Air Pistol (Individual)',
                            diameter: 11.5,
                            distance: '10m',
                            caliber: '4.5mm air pistol',
                            description: 'Standard 10-ring target for air pistol competition'
                          },
                          {
                            id: 'pistol-25m-precision',
                            name: '25m Pistol Precision',
                            diameter: 50,
                            distance: '25m',
                            caliber: '.22 LR rimfire',
                            description: 'Precision pistol target for 25m competition'
                          },
                          {
                            id: 'pistol-25m-rapid',
                            name: '25m Rapid Fire Pistol',
                            diameter: 50,
                            distance: '25m',
                            caliber: '.22 Short',
                            description: 'Rapid fire pistol target'
                          },
                          {
                            id: 'rifle-50m',
                            name: '50m Rifle Prone',
                            diameter: 10.4,
                            distance: '50m',
                            caliber: '.22 LR',
                            description: 'Small bore rifle target'
                          },
                          {
                            id: 'air-rifle-10m',
                            name: '10m Air Rifle',
                            diameter: 0.5,
                            distance: '10m',
                            caliber: '4.5mm air rifle',
                            description: 'Precision air rifle target'
                          },
                          {
                            id: 'custom',
                            name: 'Custom Target',
                            diameter: 30,
                            distance: 'Variable',
                            caliber: 'Various',
                            description: 'Custom target configuration'
                          }
                        ];
                        if (templateId) {
                          const template = TARGET_TEMPLATES.find(t => t.id === templateId);
                          updateLane(activeLaneId, {
                            template,
                            message: '🔒 Target Locked'
                          });
                        } else {
                          updateLane(activeLaneId, {
                            template: null,
                            message: '🔓 Target Unlocked'
                          });
                        }
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'black', // Changed from 'white' to 'black'
                        padding: screenSize.isMobile ? '6px 12px' : '8px 16px',
                        fontSize: screenSize.isMobile ? '12px' : '14px',
                        fontWeight: '600',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
                        height: '32px',
                        minWidth: screenSize.isMobile ? '120px' : '160px'
                      }}
                    >
                      <option value="">📋 Select Template</option>
                      <option value="air-pistol-10m">🎯 10m Air Pistol</option>
                      <option value="pistol-25m-precision">🎯 25m Precision</option>
                      <option value="pistol-25m-rapid">🎯 25m Rapid Fire</option>
                      <option value="rifle-50m">🎯 50m Rifle</option>
                      <option value="air-rifle-10m">🎯 10m Air Rifle</option>
                      <option value="custom">🎯 Custom Target</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Target Display - Fixed Container to Show Buttons */}
              <div style={{
                flex: 1,
                minHeight: 'auto', // Changed from 0 to auto
                overflow: 'visible', // Changed from auto to visible
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: '20px' // Add padding to ensure buttons are visible
              }}>
                <TargetDisplay
                  hits={activeLane.hits}
                  bullseye={activeLane.bullseye}
                  template={activeLane.template}
                  laneId={activeLaneId}
                  uploadedImage={activeLane.uploadedImage}
                  parameters={activeLane.parameters}
                  onBullseyeSet={handleBullseyeSet}
                  onAddHit={handleAddHit}
                  onAnalyticsUpdate={handleAnalyticsUpdate}
                  onParametersUpdate={handleParametersUpdate}
                  onImageUpload={img => updateLane(activeLaneId, { uploadedImage: img })}
                />

                {/* TEMPORARY TEST BUTTON - Remove after confirming fix */}
                {/* <div style={{
                  background: 'lime',
                  border: '3px solid red',
                  padding: '10px',
                  margin: '10px 0',
                  textAlign: 'center',
                  borderRadius: '8px'
                }}>
                  <button
                    onClick={() => console.log('TEST BUTTON CLICKED IN DASHBOARD')}
                    style={{
                      background: 'blue',
                      color: 'white',
                      border: '2px solid yellow',
                      borderRadius: '6px',
                      padding: '10px 20px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🧪 DASHBOARD TEST BUTTON
                  </button>
                </div> */}
              </div>
            </div>

            {/* Panel 2: Analytics & Reports - No Scroll */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: screenSize.isMobile ? '8px' : '12px',
              padding: screenSize.isMobile ? '12px' : screenSize.isTablet ? '16px' : '20px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              minHeight: 0,
              overflow: 'hidden'
            }}>
              {/* Compact Tab Navigation */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                marginBottom: screenSize.isMobile ? '8px' : '12px',
                flexShrink: 0,
                overflowX: 'auto',
                gap: screenSize.isMobile ? '2px' : '4px'
              }}>
                {[
                  { id: 'analytics', label: '📊 Performance Analytics', icon: '📊' },
                  { id: 'breakdown', label: '🎯 Shot Breakdown', icon: '🎯' },
                  { id: 'report', label: '📋 Final Report', icon: '📋' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: screenSize.isMobile ? '4px 8px' : '6px 12px',
                      fontSize: screenSize.isMobile ? '10px' : '12px',
                      fontWeight: '600',
                      border: 'none',
                      background: 'transparent',
                      color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
                      borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      marginBottom: '-1px',
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content'
                    }}
                  >
                    {screenSize.isMobile ? tab.icon : `${tab.icon} ${tab.label.split(' ').slice(1).join(' ')}`}
                  </button>
                ))}
              </div>

              {/* Tab Content - Scrollable Container */}
              <div style={{
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {activeTab === 'analytics' && (
                  <PerformanceAnalyticsTab
                    analyticsData={analyticsData[activeLaneId]}
                    activeLane={activeLane}
                    laneId={activeLaneId}
                    isMobile={screenSize.isMobile}
                    isTablet={screenSize.isTablet}
                  />
                )}

                {activeTab === 'breakdown' && (
                  <ShotBreakdown
                    shooter={activeLane.shooter}
                    hits={activeLane.hits}
                    bullseye={activeLane.bullseye}
                    template={activeLane.template}
                    laneId={activeLaneId}
                  />
                )}

                {activeTab === 'report' && (
                  <FinalReport
                    shooter={activeLane.shooter}
                    hits={activeLane.hits}
                    bullseye={activeLane.bullseye}
                    template={activeLane.template}
                    laneId={activeLaneId}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎯</div>
            <h2 style={{ fontSize: '1.5rem', color: '#94a3b8', marginBottom: '8px', margin: '0 0 8px 0' }}>
              No Active Lanes
            </h2>
            <p style={{ color: '#64748b', margin: 0 }}>
              Add a lane using the + button above
            </p>
          </div>
        )}
      </main>

      {/* Admin Dashboard Footer - Sticky */}
      <footer style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 0',
        flexShrink: 0
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: screenSize.isMobile ? '0 12px' : '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: screenSize.isMobile ? '8px' : '12px',
            flexDirection: screenSize.isMobile ? 'column' : 'row'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: screenSize.isMobile ? '8px' : '12px',
              flexDirection: screenSize.isMobile ? 'column' : 'row',
              textAlign: screenSize.isMobile ? 'center' : 'left'
            }}>
              <div style={{
                color: 'white',
                fontSize: screenSize.isMobile ? '0.75rem' : '0.875rem',
                fontWeight: '600'
              }}>
                🎯 Shooting Range Management
              </div>
              <div style={{
                color: '#64748b',
                fontSize: screenSize.isMobile ? '0.625rem' : '0.75rem'
              }}>
                Professional Target System
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: screenSize.isMobile ? '8px' : '16px',
              fontSize: screenSize.isMobile ? '0.625rem' : '0.75rem',
              flexDirection: screenSize.isMobile ? 'column' : 'row',
              textAlign: screenSize.isMobile ? 'center' : 'left'
            }}>
              <div style={{ color: '#64748b' }}>
                © 2025 Shooting Range System • Admin Dashboard
              </div>
              <div style={{
                color: '#3b82f6',
                fontWeight: '600',
                background: 'rgba(59, 130, 246, 0.15)',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: screenSize.isMobile ? '0.5rem' : '0.625rem'
              }}>
                v2.1.0
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
