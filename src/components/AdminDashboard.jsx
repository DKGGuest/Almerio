import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TargetDisplay from './TargetDisplay';
import ShotBreakdown from './ShotBreakdown';
import FinalReport from './FinalReport';
import { TARGET_TEMPLATES } from './TargetTemplateSelector';
import { calculateZoneScore, calculateRingRadii } from '../constants/shootingParameters';
// import ModernNavigation from './ModernNavigation';

// Shooter Assignment Form Component - Enhanced with Duplicate Detection
const ShooterAssignmentForm = ({ onAssign, currentShooter, isMobile = false, shooterSessionCount = 0, lanes, activeLaneId, navigateToProfile }) => {
  const [shooterName, setShooterName] = useState('');
  const [availableShooters, setAvailableShooters] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedShooterId, setSelectedShooterId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch shooters when typing
  const handleShooterNameChange = async (value) => {
    setShooterName(value);
    setSelectedShooterId(null);

    if (value.trim().length >= 2) {
      try {
        const { listShooters } = await import('../services/api');
        const allShooters = await listShooters();
        const matchingShooters = allShooters.filter(shooter =>
          shooter.shooter_name.toLowerCase().includes(value.toLowerCase())
        );
        setAvailableShooters(matchingShooters);
        setShowDropdown(true); // Always show dropdown when typing (for "Create New Shooter" option)
      } catch (error) {
        console.warn('Failed to fetch shooters:', error);
        setAvailableShooters([]);
        setShowDropdown(false);
      }
    } else {
      setAvailableShooters([]);
      setShowDropdown(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (shooterName.trim()) {
      try {
        setSubmitting(true);
        // Pass both name and ID if a specific shooter was selected
        await onAssign(shooterName.trim(), selectedShooterId);
      } finally {
        setSubmitting(false);
      }
      setShooterName('');
      setSelectedShooterId(null);
      setShowDropdown(false);
    }
  };

  const selectShooter = (shooter) => {
    setShooterName(shooter.shooter_name);
    setSelectedShooterId(shooter.id);
    setShowDropdown(false);
  };

  const createNewShooter = async () => {
    setSelectedShooterId('NEW'); // Special flag for new shooter
    setShowDropdown(false);

    // Automatically submit the assignment for new shooter
    if (shooterName.trim() && !submitting) {
      try {
        setSubmitting(true);
        await onAssign(shooterName.trim(), 'NEW');
      } finally {
        setSubmitting(false);
      }
      setShooterName('');
      setSelectedShooterId(null);
    }
  };

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      <div style={{
        display: 'flex',
        gap: isMobile ? '4px' : '6px',
        alignItems: 'center',
        flex: 1
      }}>
        <input
          type="text"
          value={shooterName}
          onChange={(e) => handleShooterNameChange(e.target.value)}
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
          onFocus={() => shooterName.length >= 2 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 300)}
        />
        {selectedShooterId && selectedShooterId !== 'NEW' && (
          <span style={{
            fontSize: isMobile ? '8px' : '9px',
            color: '#3b82f6',
            fontWeight: '600',
            padding: '2px 4px',
            backgroundColor: '#eff6ff',
            borderRadius: '3px'
          }}>
            #{selectedShooterId}
          </span>
        )}
        {selectedShooterId === 'NEW' && (
          <span style={{
            fontSize: isMobile ? '9px' : '10px',
            color: '#ffffff',
            fontWeight: '700',
            padding: '3px 6px',
            backgroundColor: '#10b981',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(16, 185, 129, 0.3)'
          }}>
            ✨ NEW SHOOTER
          </span>
        )}
        <button
          onClick={handleSubmit}
          disabled={!shooterName.trim() || submitting}
          style={{
            background: (!shooterName.trim() || submitting) ? '#9ca3af' :
                       selectedShooterId === 'NEW' ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' :
                       'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
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
          {submitting ? 'Creating...' : selectedShooterId === 'NEW' ? 'CREATE NEW' : 'ASSIGN'}
        </button>
      </div>

      {/* Dropdown for shooters and new shooter option */}
      {showDropdown && (
        <div
          onMouseDown={(e) => e.preventDefault()} // Prevent blur event when clicking dropdown
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
          {/* Create New Shooter Option - PROMINENT */}
          <div
            onClick={createNewShooter}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              borderBottom: '3px solid #10b981',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '2px solid #10b981',
              borderRadius: '6px 6px 0 0',
              fontWeight: '700'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#d1fae5';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ecfdf5';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px', color: '#047857' }}>✨ Create New Shooter "{shooterName}"</div>
              <div style={{ fontSize: '11px', color: '#059669', fontWeight: '500' }}>
                Start fresh with a completely new shooter profile
              </div>
            </div>
            <div style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#ffffff',
              backgroundColor: '#10b981',
              padding: '4px 8px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
            }}>
              ✨ NEW
            </div>
          </div>

          {/* Existing Shooters */}
          {availableShooters.map((shooter) => {
            const duplicateCount = availableShooters.filter(s => s.shooter_name === shooter.shooter_name).length;
            return (
              <div
                key={shooter.id}
                onClick={() => selectShooter(shooter)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8fafc'; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = 'white'; }}
              >
                <div>
                  <div style={{ fontWeight: '600', fontSize: '12px' }}>{shooter.shooter_name}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {shooter.total_sessions || 0} sessions • {shooter.skill_level || 'beginner'}
                    {duplicateCount > 1 && <span style={{ color: '#f59e0b' }}> • Duplicate</span>}
                  </div>
                </div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#3b82f6',
                  backgroundColor: '#eff6ff',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  #{shooter.id}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Session Count and Profile Button */}
      {currentShooter && (
        <>
          {/* Session Count Display */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              padding: isMobile ? '4px 8px' : '6px 10px',
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: '600',
              borderRadius: '4px',
              border: 'none',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={`${currentShooter} has completed ${shooterSessionCount} session(s)`}
          >
            🔢 {shooterSessionCount}
          </div>

          {/* View Profile Button */}
          <button
            onClick={() => {
              if (lanes && activeLaneId) {
                const activeLane = lanes[activeLaneId];
                if (activeLane?.shooterId) {
                  navigateToProfile(`/shooter-profile/${activeLane.shooterId}`);
                } else {
                  // Fallback to name-based route for legacy data
                  navigateToProfile(`/shooter/${encodeURIComponent(currentShooter)}`);
                }
              } else {
                // Fallback when props are not available
                navigateToProfile(`/shooter/${encodeURIComponent(currentShooter)}`);
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: isMobile ? '4px 8px' : '6px 10px',
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: '600',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title={`View ${currentShooter}'s profile`}
          >
            📊 PROFILE
          </button>
        </>
      )}
    </div>
  );
};

// Performance Analytics Tab Component - No Scroll
const PerformanceAnalyticsTab = ({ analyticsData, activeLane, laneId = null, isMobile = false, isTablet = false }) => {
  // Consider data available whenever we have any analyzed bullets or a finished session
  const hasData = !!(analyticsData && (analyticsData.showResults || analyticsData.shootingPhase === 'DONE'));

  // Calculate corrected accuracy using score-based method (same as Final Report)
  const getCorrectedAccuracy = () => {
    if (!analyticsData?.bullets || !activeLane) return 0;

    const bulletsOnly = analyticsData.bullets.filter(b => !b.isBullseye);
    if (bulletsOnly.length === 0) return 0;

    const tmpl = activeLane?.template || null;
    const refPoint = analyticsData?.bullseye ? { x: analyticsData.bullseye.x, y: analyticsData.bullseye.y } : { x: 200, y: 200 };

    const getHitScore = (hit) => {
      // Create a template object if we don't have one, using a fallback diameter
      const effectiveTemplate = tmpl || { diameter: 150 }; // 150mm = 50px radius fallback (consistent with TargetDisplay)
      const esaParameter = activeLane.parameters?.esa || null;
      const ringRadii = calculateRingRadii(effectiveTemplate, esaParameter);
      return calculateZoneScore(hit, refPoint, ringRadii);
    };

    // Score-based accuracy calculation (same as Final Report)
    const totalScore = bulletsOnly.reduce((sum, hit) => sum + getHitScore(hit), 0);
    const maxPossibleScore = bulletsOnly.length * 3; // 3 points is maximum per shot
    return maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  };

  const correctedAccuracy = getCorrectedAccuracy();

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
                {correctedAccuracy.toFixed(1)}
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
  const navigate = useNavigate();
  // Track the currently active lane
  const [activeLaneId, setActiveLaneId] = useState('lane1');
  // Track active tab in the right panel
  const [activeTab, setActiveTab] = useState('analytics');
  // Track analytics data for the active lane
  const [analyticsData, setAnalyticsData] = useState({});
  // Track last auto-saved final report signature per session to avoid duplicate writes
  const finalReportSigRef = useRef({});
  // Track screen size for responsive design
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024
  });
  // Track shooter session counts
  const [shooterSessionCounts, setShooterSessionCounts] = useState({});

  useEffect(() => {
    console.log('[AdminDashboard] lanes prop changed:', lanes);
  }, [lanes]);

  // Fetch session count for current shooter when lane changes
  useEffect(() => {
    const fetchCurrentShooterSessionCount = async () => {
      const activeLane = lanes[activeLaneId];
      if (activeLane?.shooter && !shooterSessionCounts[activeLane.shooter]) {
        const sessionCount = await fetchShooterSessionCount(activeLane.shooter);
        setShooterSessionCounts(prev => ({
          ...prev,
          [activeLane.shooter]: sessionCount
        }));
      }
    };

    fetchCurrentShooterSessionCount();
  }, [activeLaneId, lanes, shooterSessionCounts]);

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
  const handleAnalyticsUpdate = useCallback(async (data) => {
    setAnalyticsData(prev => ({ ...prev, [activeLaneId]: data }));

    // Persist calculated analytics when showResults is true or phase DONE
    try {
      const lane = lanes[activeLaneId];
      if (!lane?.sessionId) return;

      const { saveAnalytics, saveFinalReport } = await import('../services/api');
      const stats = data?.stats || {};
      const reference = stats.referenceCoords || { x: 200, y: 200 };
      const mpi = stats.mpiCoords || null;

      // Calculate accuracy using score-based method (same as Final Report) FIRST
      const bulletsOnly = (data?.bullets || []).filter(b => !b.isBullseye);
      const tmpl = lanes[activeLaneId]?.template || null;
      const refPoint = data?.bullseye ? { x: data.bullseye.x, y: data.bullseye.y } : { x: 200, y: 200 };

      const getHitScore = (hit) => {
        // Create a template object if we don't have one, using a fallback diameter
        const effectiveTemplate = tmpl || { diameter: 150 }; // 150mm = 50px radius fallback (consistent with TargetDisplay)
        const esaParameter = lane.parameters?.esa || null;
        const ringRadii = calculateRingRadii(effectiveTemplate, esaParameter);
        return calculateZoneScore(hit, refPoint, ringRadii);
      };

      // Score-based accuracy calculation (same as Final Report)
      const totalScore = bulletsOnly.reduce((sum, hit) => sum + getHitScore(hit), 0);
      const maxPossibleScore = bulletsOnly.length * 3; // 3 points is maximum per shot
      const acc = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      // 1) Save analytics snapshot
      await saveAnalytics(lane.sessionId, {
        mpiDistance: stats.mpi || 0,
        mpiXCoordinate: mpi ? mpi.x : 0,
        mpiYCoordinate: mpi ? mpi.y : 0,
        mpiCoordsX: mpi ? (mpi.x - 200) : 0,
        mpiCoordsY: mpi ? (200 - mpi.y) : 0,
        accuracyPercentage: acc, // Use the corrected score-based accuracy
        avgDistance: stats.avgDistance || 0,
        maxDistance: stats.maxDistance || 0,
        groupSize: stats.groupSize || 0,
        referencePointType: stats.referencePoint || 'center',
        referenceXCoordinate: reference.x,
        referenceYCoordinate: reference.y,
        shotsAnalyzed: bulletsOnly.length,
        bulletsCount: (data?.bullets || []).length,
        showResults: !!data?.showResults,
        shootingPhase: data?.shootingPhase || 'DONE'
      });

      // 2) Auto-save a compact final report (same logic as FinalReport component)

      const sessionType = lane.parameters?.sessionType;
      let performanceRating = 'BEGINNER';
      let performanceEmoji = '🔰';

      // Session-type specific remarks for TEST sessions
      if (sessionType === 'test') {
        if (acc > 70) { performanceRating = 'MARKSMAN'; performanceEmoji = '🏆'; }
        else if (acc >= 60) { performanceRating = 'FIRST CLASS'; performanceEmoji = '🥇'; }
        else if (acc >= 40) { performanceRating = 'SECOND CLASS'; performanceEmoji = '🥈'; }
        else { performanceRating = 'FAILED'; performanceEmoji = '❌'; }
      } else {
        // General performance ratings for other session types
        if (acc >= 90) { performanceRating = 'EXPERT MARKSMAN'; performanceEmoji = '🏆'; }
        else if (acc >= 80) { performanceRating = 'SKILLED SHOOTER'; performanceEmoji = '🥇'; }
        else if (acc >= 70) { performanceRating = 'COMPETENT SHOOTER'; performanceEmoji = '🥈'; }
        else if (acc >= 60) { performanceRating = 'DEVELOPING SHOOTER'; performanceEmoji = '🥉'; }
        else if (acc >= 50) { performanceRating = 'NOVICE SHOOTER'; performanceEmoji = '📈'; }
      }

      // Use the totalScore already calculated above

      // Convert MPI to target coordinate system (+x right, +y up with origin at center)
      const trueMpiX = mpi ? (mpi.x - 200) : 0;
      const trueMpiY = mpi ? (200 - mpi.y) : 0;

      const report = {
        totalScore,
        accuracyPercentage: acc, // Use the corrected score-based accuracy
        mpiDistance: stats.mpi || 0,
        groupSize: stats.groupSize || 0,
        maxDistance: stats.maxDistance || 0,
        avgDistance: stats.avgDistance || 0,
        trueMpiX,
        trueMpiY,
        referencePoint: data?.bullseye ? 'custom bullseye' : 'center',
        shotsAnalyzed: bulletsOnly.length,
        shotsFired: bulletsOnly.length,
        templateName: lanes[activeLaneId]?.template?.name || null,
        templateDiameter: lanes[activeLaneId]?.template?.diameter || null,
        firingMode: lanes[activeLaneId]?.parameters?.firingMode || null,
        targetDistance: lanes[activeLaneId]?.parameters?.targetDistance || null,
        zeroingDistance: lanes[activeLaneId]?.parameters?.zeroingDistance || null,
        performanceRating,
        performanceEmoji
      };

      // Simple signature to avoid duplicate saves for same computed snapshot
      const signature = JSON.stringify({
        s: lane.sessionId,
        a: report.accuracyPercentage,
        m: report.mpiDistance,
        g: report.groupSize,
        x: report.maxDistance,
        n: report.shotsAnalyzed,
        tX: report.trueMpiX,
        tY: report.trueMpiY,
        sc: report.totalScore,
        tmpl: report.templateDiameter
      });

      if (!finalReportSigRef.current) finalReportSigRef.current = {};
      if (finalReportSigRef.current[lane.sessionId] !== signature) {
        await saveFinalReport(lane.sessionId, report);
        finalReportSigRef.current[lane.sessionId] = signature;
      }
    } catch (e) {
      // Don't block UI if analytics save fails
      console.warn('Failed to save analytics/final report:', e.message);
    }
  }, [activeLaneId, lanes]);
  // Auto-switch to analytics tab when results are ready (timed mode expiry)
  useEffect(() => {
    const laneAnalytics = analyticsData[activeLaneId];
    if (laneAnalytics?.showResults) {
      setActiveTab('analytics');
    }
  }, [analyticsData, activeLaneId]);


  // Handle bullseye setting
  const handleBullseyeSet = useCallback(async (bullseye) => {
    updateLane(activeLaneId, { bullseye, message: '📍 Target Acquired' });

    // Persist to backend if session exists
    try {
      const lane = lanes[activeLaneId];
      if (lane?.sessionId && bullseye) {
        const { saveBullseye } = await import('../services/api');
        await saveBullseye(lane.sessionId, { x: bullseye.x, y: bullseye.y });
      }
    } catch (e) {
      console.warn('Failed to save bullseye:', e.message);
    }
  }, [activeLaneId, lanes]);

  // Handle adding hits
  const handleAddHit = useCallback(async (hit) => {
    // Handle reset signal from TargetDisplay
    if (hit && hit.type === 'RESET') {
      updateLane(activeLaneId, {
        hits: [],
        bullseye: null,
        template: null,
        parameters: null,
        uploadedImage: null,
        shooter: '',
        shooterId: null,
        sessionId: null,
        message: '🎯 Target Reset'
      });
      return;
    }

    const lane = lanes[activeLaneId];

    // Compute per-hit score using zone-based scoring system
    const refPoint = lane?.bullseye ? lane.bullseye : { x: 200, y: 200 };

    // Create a template object if we don't have one, using a fallback diameter
    const effectiveTemplate = lane?.template || { diameter: 150 }; // 150mm = 50px radius fallback (consistent with TargetDisplay)
    const esaParameter = lane?.parameters?.esa || null;
    const ringRadii = calculateRingRadii(effectiveTemplate, esaParameter);

    const scoreForHit = calculateZoneScore(hit, refPoint, ringRadii);

    const scoredHit = { ...hit, score: Number.isFinite(scoreForHit) ? scoreForHit : 0 };

    const newHits = [...lane.hits, scoredHit];
    updateLane(activeLaneId, { hits: newHits, message: '🎯 Hit Registered' });

    // Persist shot to backend with proper shot number calculation
    try {
      if (lane?.sessionId && scoredHit && !scoredHit.isBullseye) {
        const { saveShots, getSessionDetails } = await import('../services/api');

        // Get current shot count from database to ensure proper shot numbering
        let shotNumber = newHits.length; // Default fallback
        try {
          const sessionDetails = await getSessionDetails(lane.sessionId);
          const existingShots = sessionDetails?.shots || [];
          shotNumber = existingShots.length + 1; // Next shot number based on database
        } catch (shotCountError) {
          console.warn('Could not get shot count from database, using lane count:', shotCountError.message);
        }

        await saveShots(lane.sessionId, [{
          shotNumber: shotNumber,
          x: scoredHit.x,
          y: scoredHit.y,
          timestamp: scoredHit.timestamp || Date.now(),
          score: scoredHit.score || 0,
          isBullseye: !!scoredHit.isBullseye,
          timePhase: scoredHit.timePhase || null
        }]);
      }
    } catch (e) {
      console.warn('Failed to save shot:', e.message);
    }

    if (newHits.length >= 3) {
      setTimeout(() => {
        updateLane(activeLaneId, { hits: newHits, message: '🧠 Calculating Score...' });
      }, 1000);
    }
  }, [activeLaneId, lanes, updateLane]);

  // Handle parameters update
  const handleParametersUpdate = useCallback(async (laneId, parameters) => {
    // Map selected templateId from parameters to actual template object for this lane
    let template = null;
    if (parameters && parameters.templateId) {
      const match = (typeof parameters.templateId === 'string') ? parameters.templateId : '';
      template = (TARGET_TEMPLATES || []).find(t => t.id === match) || null;
    }

    // Merge with existing to preserve run-once flags; default hasRun=false if not provided
    const existing = lanes[laneId]?.parameters || {};
    const mergedParams = { ...existing, ...parameters };
    if (typeof mergedParams.hasRun === 'undefined') mergedParams.hasRun = false;

    updateLane(laneId, { parameters: mergedParams, template, message: template ? '🔒 Target Locked' : '⚙️ Parameters Set' });

    // Persist to backend (strip internal-only fields like hasRun)
    try {
      const lane = lanes[laneId];
      if (lane?.sessionId) {
        const { saveParameters } = await import('../services/api');
        const { hasRun, ...rest } = mergedParams;
        const paramsToSave = {
          ...rest,
          templateName: template?.name || null,
          templateDiameter: template?.diameter || null
        };
        await saveParameters(lane.sessionId, paramsToSave);
      }
    } catch (e) {
      console.warn('Failed to save parameters:', e.message);
    }
  }, [lanes, updateLane]);



  // Fetch shooter session count
  const fetchShooterSessionCount = async (shooterName) => {
    try {
      const { getShooterHistory } = await import('../services/api');
      const sessions = await getShooterHistory(shooterName);
      return sessions.length;
    } catch (e) {
      console.warn('Failed to fetch shooter session count:', e);
      return 0;
    }
  };

  // Handle shooter assignment
  const handleShooterAssignment = async (shooterName, shooterId = null) => {
    if (!shooterName.trim()) return;

    // Create/find shooter + create a new session in backend
    try {
      const sessionData = {
        shooter_name: shooterName.trim(),
        shooter_id: shooterId === 'NEW' ? null : shooterId, // Force new shooter if 'NEW' flag
        force_new_shooter: shooterId === 'NEW', // Add flag to force new shooter creation
        lane_id: activeLaneId,
        session_name: `${shooterName.trim()} - ${new Date().toLocaleString()}`
      };

      const session = await (await import('../services/api')).createSession(sessionData);

      updateLane(activeLaneId, {
        shooter: shooterName.trim(),
        shooterId: session.shooter_id, // Store the actual shooter ID from the session
        sessionId: session.id,
        message: shooterId === 'NEW' ? '👤 New Shooter Created (Session Started)' : '👤 Shooter Ready (Session Started)'
      });

      // Wait a moment for database transaction to complete, then fetch updated session count
      setTimeout(async () => {
        try {
          const sessionCount = await fetchShooterSessionCount(shooterName.trim());
          setShooterSessionCounts(prev => ({
            ...prev,
            [shooterName.trim()]: sessionCount
          }));
        } catch (e) {
          console.warn('Failed to update session count:', e);
        }
      }, 500); // 500ms delay to ensure database is updated

    } catch (e) {
      console.error('Failed to create session:', e);
      updateLane(activeLaneId, { message: '❌ Failed to start session' });
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                color: '#94a3b8',
                fontSize: screenSize.isMobile ? '0.75rem' : '0.875rem',
                fontWeight: '600',
                letterSpacing: '0.05em'
              }}>
                LANE CONTROLS
              </span>
              <button
                onClick={() => navigate('/shooters')}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: screenSize.isMobile ? '4px 8px' : '6px 12px',
                  fontSize: screenSize.isMobile ? '0.625rem' : '0.75rem',
                  fontWeight: '600',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                title="View all shooters and their profiles"
              >
                👥 ALL SHOOTERS
              </button>
            </div>
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
                          currentShooter={activeLane.shooter}
                          isMobile={screenSize.isMobile}
                          shooterSessionCount={shooterSessionCounts[activeLane.shooter] || 0}
                          lanes={lanes}
                          activeLaneId={activeLaneId}
                          navigateToProfile={navigate}
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
                    shootingParameters={activeLane.parameters}
                    visualRingRadii={analyticsData[activeLaneId]?.visualRingRadii}
                  />
                )}

                {activeTab === 'report' && (
                  <FinalReport
                    shooter={activeLane.shooter}
                    hits={activeLane.hits}
                    bullseye={activeLane.bullseye}
                    template={activeLane.template}
                    laneId={activeLaneId}
                    sessionType={activeLane.parameters?.sessionType}
                    shootingParameters={activeLane.parameters}
                    onSaveReport={async (report) => {
                      try {
                        const lane = lanes[activeLaneId];
                        if (lane?.sessionId) {
                          const { saveFinalReport } = await import('../services/api');
                          await saveFinalReport(lane.sessionId, report);
                        }
                      } catch (e) {
                        console.warn('Failed to save final report:', e.message);
                      }
                    }}
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
