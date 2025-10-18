import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionDetails } from '../services/api';
import { getPerformanceRemark, shouldShowRemarks, getRemarkBadgeStyle } from '../utils/performanceRemarks';
import {
  getSessionTypeLabel,
  getFiringModeLabel,
  getWeaponTypeLabel,
  getTargetTypeLabel,
  getShootingPositionLabel,
  getShotTypeLabel,
  calculateZoneScore,
  calculateRingRadii
} from '../constants/shootingParameters';
import { TARGET_TEMPLATES } from '../components/TargetTemplateSelector';
import TargetVisualization from './TargetVisualization';

const SessionDetailsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get target center coordinates (400x400 target with center at 200,200)
  const getTargetCenter = () => {
    return { x: 200, y: 200 }; // Center of 400x400 target
  };

  // Calculate correct score for a shot with intelligent fallback logic
  const getCorrectHitScore = (shot, sessionData) => {
    // Debug logging to track scoring flow
    console.log('🎯 SessionDetails - getCorrectHitScore:', {
      shotNumber: shot.shot_number,
      coordinates: `(${shot.x_coordinate}, ${shot.y_coordinate})`,
      storedScore: shot.score_points,
      hasStoredScore: shot.score_points !== undefined && shot.score_points !== null
    });

    // For historical sessions, prefer stored scores since they were calculated
    // with the correct visualRingRadii during the live session
    if (shot.score_points !== undefined && shot.score_points !== null) {
      console.log(`✅ Using stored score for shot ${shot.shot_number}: ${shot.score_points} pts`);
      return shot.score_points;
    }

    // Fallback: recalculate score if stored score is missing
    // This should rarely happen for properly saved sessions
    console.warn('⚠️ Missing stored score for shot, recalculating:', shot);

    // Convert shot coordinates to hit format
    const hit = {
      x: Number(shot.x_coordinate),
      y: Number(shot.y_coordinate)
    };

    // Get reference point (bullseye or target center)
    const referencePoint = sessionData?.bullseye_position ?
      { x: sessionData.bullseye_position.x, y: sessionData.bullseye_position.y } :
      getTargetCenter();

    // Get template from session data
    const template = sessionData?.template ?
      TARGET_TEMPLATES.find(t => t.name === sessionData.template) :
      { diameter: 150 }; // fallback

    // Calculate ring radii (without visualRingRadii, may be inaccurate)
    const esaParameter = sessionData?.parameters?.esa || null;
    const ringRadii = calculateRingRadii(template, esaParameter);

    const recalculatedScore = calculateZoneScore(hit, referencePoint, ringRadii);
    console.log(`🔄 Recalculated score for shot ${shot.shot_number}: ${recalculatedScore} pts`);

    return recalculatedScore;
  };

  // Helper function to convert firing mode for display
  const getFiringModeDisplay = (mode) => {
    switch(mode) {
      case 'jumper': return 'Untimed';
      case 'snap': return 'Snap';
      case 'timed': return 'Timed';
      case 'moving': return 'Moving Target';
      case 'practice': return 'Practice';
      case 'ir-grid': return 'Untimed IR Shots';
      default: return getFiringModeLabel(mode) || mode || 'Practice';
    }
  };

  // Helper function to get session type with fallback logic
  const getSessionType = () => {
    // If parameters exist, use the session_type
    if (sessionData?.parameters?.session_type) {
      return sessionData.parameters.session_type;
    }

    // If no parameters but has shots, it's likely a practice session
    if (sessionData?.shots && sessionData.shots.length > 0) {
      return 'practice';
    }

    // Default fallback
    return 'practice';
  };

  // Helper function to get firing mode with fallback logic
  const getFiringMode = () => {
    // If parameters exist, use the firing_mode
    if (sessionData?.parameters?.firing_mode) {
      return sessionData.parameters.firing_mode;
    }

    // If no parameters, check final report
    if (sessionData?.finalReport?.firing_mode) {
      return sessionData.finalReport.firing_mode;
    }

    // Only use fallback if no data is available at all
    return null; // Let the display function handle null values
  };

  // Helper function to get target distance with fallback logic
  const getTargetDistance = () => {
    // If parameters exist, use the target_distance
    if (sessionData?.parameters?.target_distance) {
      return `${sessionData.parameters.target_distance}m`;
    }

    // If no parameters, check final report
    if (sessionData?.finalReport?.target_distance) {
      return `${sessionData.finalReport.target_distance}m`;
    }

    // Check if template name gives us a clue about distance
    if (sessionData?.finalReport?.template_name) {
      const templateName = sessionData.finalReport.template_name.toLowerCase();
      if (templateName.includes('25m') || templateName.includes('25')) return '25m';
      if (templateName.includes('50m') || templateName.includes('50')) return '50m';
      if (templateName.includes('100m') || templateName.includes('100')) return '100m';
      if (templateName.includes('200m') || templateName.includes('200')) return '200m';
    }

    // Only use fallback if no data is available
    return 'N/A';
  };

  // Helper function to get time limit with fallback logic
  const getTimeLimit = () => {
    // If parameters exist, use the time_limit
    if (sessionData?.parameters?.time_limit !== undefined && sessionData?.parameters?.time_limit !== null) {
      return `${sessionData.parameters.time_limit}s`;
    }

    // Only use fallback if no data is available
    return 'N/A';
  };

  // Helper function to get target distance from TARGET_TEMPLATES or custom distance
  const getTargetDistanceFromTemplate = () => {
    // Check for custom distance first (database uses snake_case)
    if (sessionData?.parameters?.use_custom_distance && sessionData?.parameters?.custom_distance) {
      const customDistance = parseFloat(sessionData.parameters.custom_distance);
      if (!isNaN(customDistance) && customDistance > 0) {
        return `${customDistance}m (Custom)`;
      }
    }

    // Also check for camelCase version for backward compatibility
    if (sessionData?.parameters?.useCustomDistance && sessionData?.parameters?.customDistance) {
      const customDistance = parseFloat(sessionData.parameters.customDistance);
      if (!isNaN(customDistance) && customDistance > 0) {
        return `${customDistance}m (Custom)`;
      }
    }

    // First, try to get template_id from parameters
    const templateId = sessionData?.parameters?.template_id;
    if (templateId) {
      const template = TARGET_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        return template.distance; // This returns the actual distance like "10m", "25m", etc.
      }
    }

    // Fallback: try to get template_name and match it
    const templateName = sessionData?.parameters?.template_name || sessionData?.finalReport?.template_name;
    if (templateName) {
      const template = TARGET_TEMPLATES.find(t => t.name === templateName);
      if (template) {
        return template.distance;
      }
    }

    // Final fallback: use target_distance parameter if available
    if (sessionData?.parameters?.target_distance) {
      return `${sessionData.parameters.target_distance}m`;
    }

    return 'N/A';
  };

  // Helper function to get the actual template object for TargetVisualization
  const getTemplateForVisualization = () => {
    console.log('🎯 SessionDetailsPage - Getting template for visualization:', {
      sessionData: sessionData,
      parameters: sessionData?.parameters,
      finalReport: sessionData?.finalReport
    });

    // First, try to get template_id from parameters
    const templateId = sessionData?.parameters?.template_id;
    if (templateId) {
      const template = TARGET_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        console.log('✅ Found template by template_id:', template);
        return template;
      }
    }

    // Fallback: try to get template_name and match it
    const templateName = sessionData?.parameters?.template_name || sessionData?.finalReport?.template_name;
    if (templateName) {
      const template = TARGET_TEMPLATES.find(t => t.name === templateName);
      if (template) {
        console.log('✅ Found template by template_name:', template);
        return template;
      }
    }

    // Check legacy sessionData.template field
    if (sessionData?.template) {
      const template = TARGET_TEMPLATES.find(t => t.name === sessionData.template);
      if (template) {
        console.log('✅ Found template by legacy sessionData.template:', template);
        return template;
      }
    }

    console.log('⚠️ No template found for visualization, using default');
    return null; // Let TargetVisualization handle the default
  };

  // Load session details
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        setLoading(true);
        const data = await getSessionDetails(sessionId);
        console.log('🔍 SessionDetailsPage - Raw session data:', data);
        console.log('📊 Parameters data:', data?.parameters);
        console.log('📋 Final report data:', data?.finalReport);
        console.log('🎯 Template name sources:', {
          parametersTemplateName: data?.parameters?.template_name,
          finalReportTemplateName: data?.finalReport?.template_name,
          parametersTargetDistance: data?.parameters?.target_distance
        });
        console.log('📈 Accuracy sources:', {
          analyticsAccuracy: data?.analytics?.accuracy_percentage,
          finalReportAccuracy: data?.finalReport?.accuracy_percentage
        });
        console.log('🎯 Target distance lookup:', {
          templateId: data?.parameters?.template_id,
          templateName: data?.parameters?.template_name,
          targetDistance: data?.parameters?.target_distance,
          availableTemplates: TARGET_TEMPLATES.map(t => ({ id: t.id, name: t.name, distance: t.distance }))
        });
        setSessionData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  // Calculate analytics from session data
  const analytics = useMemo(() => {
    if (!sessionData?.analytics) {
      return {
        mpi: 0,
        accuracy: 0,
        maxDistance: 0,
        groupSize: 0,
        shotsAnalyzed: 0,
        trueMPI: { x: 0, y: 0 }
      };
    }

    const analyticsData = sessionData.analytics;

    // Use final report accuracy if available, otherwise fall back to analytics accuracy
    const accuracyValue = sessionData?.finalReport?.accuracy_percentage !== undefined
      ? sessionData.finalReport.accuracy_percentage
      : analyticsData.accuracy_percentage || 0;

    return {
      mpi: Number(analyticsData.mpi_distance || 0).toFixed(1),
      accuracy: Number(accuracyValue).toFixed(1),
      maxDistance: Number(analyticsData.max_distance || 0).toFixed(1),
      groupSize: Number(analyticsData.group_size || 0).toFixed(1),
      shotsAnalyzed: analyticsData.shots_analyzed || 0,
      trueMPI: {
        x: Number(analyticsData.mpi_coords_x || 0).toFixed(1),
        y: Number(analyticsData.mpi_coords_y || 0).toFixed(1)
      }
    };
  }, [sessionData]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            margin: '0 auto 16px'
          }} className="spinner"></div>
          <style>{`
            .spinner {
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading session details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Error Loading Session
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => navigate('/shooters')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
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
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '0'
    }}>
      {/* Header */}
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
              onClick={() => navigate(-1)}
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
                cursor: 'pointer'
              }}
            >
              ← Back
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
                  Session Details
                </h1>
                <p style={{ color: '#64748b', margin: '0', fontSize: '14px' }}>
                  {sessionData?.session?.shooter_name || 'Unknown Shooter'}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            {/* <div style={{ fontSize: '12px', color: '#64748b' }}>Session ID</div>
            <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>#{sessionId}</div> */}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Session Info Banner */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '12px 32px',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {getSessionType()} Session
          </div>
        </div>




{/* Final Report */}
        {sessionData?.finalReport?.total_score && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            marginBottom: '32px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              🏆 Final Report
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {sessionData.shots.reduce((total, shot) => total + getCorrectHitScore(shot, sessionData), 0)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Total Score</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#dcfce7',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                  {analytics.accuracy}%
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Accuracy</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#f3e8ff',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {analytics.mpi}mm
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>MPI Distance</div>
              </div>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#fef3c7',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {analytics.groupSize}mm
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Group Size</div>
              </div>
            </div>
            {/* Show performance remark for test sessions */}
            {(() => {
              const isTestSession = sessionData?.session?.session_name?.toLowerCase().includes('test') ||
                                   sessionData?.session?.session_type === 'test' ||
                                   getSessionType().toLowerCase().includes('test');

              if (isTestSession && sessionData?.finalReport?.accuracy_percentage) {
                const remark = getPerformanceRemark(sessionData.finalReport.accuracy_percentage, 'test');
                return (
                  <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: `3px solid ${remark.color}30`
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      🎯 Test Session Performance Remark
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        ...getRemarkBadgeStyle(remark),
                        fontSize: '1rem',
                        padding: '12px 24px'
                      }}>
                        {remark.emoji} {remark.rating}
                      </div>
                    </div>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b',
                      margin: '0',
                      fontStyle: 'italic'
                    }}>
                      Performance Range: {remark.description} accuracy
                    </p>
                    <div style={{
                      marginTop: '12px',
                      fontSize: '12px',
                      color: '#9ca3af',
                      fontStyle: 'italic'
                    }}>
                      Remarks: Marksman: &gt;70% • First Class: 70%-60% • Second Class: 60%-40% • Failed: &lt;40%
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}









        {/* Quick Stats Grid */}
        {/* <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
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
            <div style={{ color: '#64748b', fontSize: '14px' }}>Accuracy</div>
          </div>
          
          <div style={{
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
          </div>
          
          <div style={{
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
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>
              {analytics.groupSize}mm
            </div>
            <div style={{ color: '#64748b', fontSize: '14px' }}>Group Size</div>
          </div>
        </div> */}

        {/* Session Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Parameters */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              📋 Complete Session Parameters
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {/* Basic Parameters */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>
                  {getFiringMode() === 'ir-grid' ? '🔌' : '🎯'} Firing Mode:
                </span>
                <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getFiringModeDisplay(getFiringMode()) || 'N/A'}
                  {getFiringMode() === 'ir-grid' && (
                    <span style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}>
                      IR GRID
                    </span>
                  )}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>📋 Session Type:</span>
                <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{getSessionType()}</span>
              </div>

              {/* Weapon & Target - Always show */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>🔫 Weapon:</span>
                <span style={{ fontWeight: '600' }}>
                  {sessionData?.parameters?.weapon_type
                    ? (getWeaponTypeLabel(sessionData.parameters.weapon_type) || sessionData.parameters.weapon_type.replace(/-/g, ' ').toUpperCase())
                    : 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>🎯 Target Type:</span>
                <span style={{ fontWeight: '600' }}>
                  {sessionData?.parameters?.target_type
                    ? (getTargetTypeLabel(sessionData.parameters.target_type) || sessionData.parameters.target_type.replace(/-/g, ' ').toUpperCase())
                    : 'N/A'}
                </span>
              </div>

              {/* Target Distance (from TARGET_TEMPLATES) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>📏 Target Distance:</span>
                <span style={{ fontWeight: '600' }}>{getTargetDistanceFromTemplate()}</span>
              </div>

              {/* Shooting Position - Always show */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fefce8', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>🧍 Position:</span>
                <span style={{ fontWeight: '600' }}>
                  {sessionData?.parameters?.shooting_position
                    ? (getShootingPositionLabel(sessionData.parameters.shooting_position) || sessionData.parameters.shooting_position.toUpperCase())
                    : 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fefce8', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>💥 Shot Type:</span>
                <span style={{ fontWeight: '600' }}>
                  {sessionData?.parameters?.shot_type
                    ? (getShotTypeLabel(sessionData.parameters.shot_type) || sessionData.parameters.shot_type.charAt(0).toUpperCase() + sessionData.parameters.shot_type.slice(1))
                    : 'N/A'}
                </span>
              </div>

              {/* Rounds - Always show */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fdf2f8', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>🔢 Rounds:</span>
                <span style={{ fontWeight: '600' }}>{sessionData?.parameters?.number_of_rounds || 'N/A'}</span>
              </div>

              {/* Advanced Parameters - Always show */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f3e8ff', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>🎯 ESA:</span>
                <span style={{ fontWeight: '600' }}>{sessionData?.parameters?.esa || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f3e8ff', borderRadius: '4px' }}>
                <span style={{ color: '#64748b', fontWeight: '500' }}>🏃 Lane:</span>
                <span style={{ fontWeight: '600' }}>{sessionData?.session?.lane_id || 'N/A'}</span>
              </div>
            </div>

            {/* Advanced Settings Section - Mode-specific parameters */}
            {(sessionData?.parameters?.firing_mode === 'moving' ||
              sessionData?.parameters?.firing_mode === 'snap' ||
              sessionData?.parameters?.firing_mode === 'timed' ||
              sessionData?.parameters?.firing_mode === 'ir-grid') && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b', marginBottom: '12px' }}>
                  ⚙️ Advanced Settings
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  {/* Moving Target Parameters */}
                  {sessionData?.parameters?.firing_mode === 'moving' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>Moving Direction:</span>
                        <span style={{ fontWeight: '600' }}>{sessionData.parameters.moving_direction?.toUpperCase() || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>Moving Speed:</span>
                        <span style={{ fontWeight: '600' }}>{sessionData.parameters.moving_speed ? `${sessionData.parameters.moving_speed}x` : 'N/A'}</span>
                      </div>
                    </>
                  )}

                  {/* Snap Target Parameters */}
                  {sessionData?.parameters?.firing_mode === 'snap' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>Display Time:</span>
                        <span style={{ fontWeight: '600' }}>{sessionData.parameters.snap_display_time ? `${sessionData.parameters.snap_display_time}s` : 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>Disappear Time:</span>
                        <span style={{ fontWeight: '600' }}>{sessionData.parameters.snap_disappear_time ? `${sessionData.parameters.snap_disappear_time}s` : 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>Cycles:</span>
                        <span style={{ fontWeight: '600' }}>{sessionData.parameters.snap_cycles || 'N/A'}</span>
                      </div>
                    </>
                  )}

                  {/* Timed Mode Parameters */}
                  {sessionData?.parameters?.firing_mode === 'timed' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b', fontWeight: '500' }}>⏱️ Time Limit:</span>
                      <span style={{ fontWeight: '600' }}>{sessionData.parameters.time_limit ? `${sessionData.parameters.time_limit}s` : 'N/A'}</span>
                    </div>
                  )}

                  {/* IR Grid Mode Parameters */}
                  {sessionData?.parameters?.firing_mode === 'ir-grid' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>🔌 IR Grid Mode:</span>
                        <span style={{ fontWeight: '600', color: '#ef4444' }}>Real-time Detection</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>📡 Data Source:</span>
                        <span style={{ fontWeight: '600' }}>UART Serial Communication</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#fef2f2', borderRadius: '4px' }}>
                        <span style={{ color: '#64748b', fontWeight: '500' }}>🎯 Shot Detection:</span>
                        <span style={{ fontWeight: '600' }}>Infrared Grid System</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Additional Parameters Section */}
            {(sessionData?.parameters?.wind_speed || sessionData?.parameters?.moving_direction ||
              (sessionData?.parameters?.snap_display_time && sessionData?.parameters?.firing_mode === 'snap')) && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                  ⚙️ Advanced Settings
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  {sessionData?.parameters?.wind_speed > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b' }}>Wind Speed:</span>
                      <span style={{ fontWeight: '600' }}>{sessionData.parameters.wind_speed} m/s</span>
                    </div>
                  )}
                  {sessionData?.parameters?.moving_direction && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b' }}>Moving Direction:</span>
                      <span style={{ fontWeight: '600' }}>{sessionData.parameters.moving_direction}</span>
                    </div>
                  )}
                  {sessionData?.parameters?.snap_display_time && sessionData?.parameters?.firing_mode === 'snap' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <span style={{ color: '#64748b' }}>Snap Display:</span>
                      <span style={{ fontWeight: '600' }}>{sessionData.parameters.snap_display_time}s</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              📊 Performance Metrics
            </h3>

            {/* Performance Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Accuracy:</span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{analytics.accuracy}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>MPI Distance:</span>
                <span style={{ fontWeight: '600' }}>{analytics.mpi} mm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Group Size:</span>
                <span style={{ fontWeight: '600' }}>{analytics.groupSize} mm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Max Distance:</span>
                <span style={{ fontWeight: '600' }}>{analytics.maxDistance} mm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>True MPI:</span>
                <span style={{ fontWeight: '600' }}>({analytics.trueMPI.x}, {analytics.trueMPI.y})</span>
              </div>
            </div>

            {/* Target Visualization - Below True MPI */}
            {sessionData?.shots && sessionData.shots.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '16px'
              }}>
                <TargetVisualization
                  shots={sessionData.shots}
                  sessionParameters={sessionData.parameters}
                  template={getTemplateForVisualization()}
                  containerSize={298}
                  showTitle={false}
                  uploadedImage={sessionData?.uploadedImage}
                />
              </div>
            )}
          </div>
        </div>

        
        

        {/* Shots Table */}
        {sessionData?.shots && sessionData.shots.length > 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
              🎯 Shot Details ({sessionData.shots.length} shots)
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Shot #
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Coordinates (X, Y)
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Timestamp
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Score
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Distance from Center
                    </th>
                    {sessionData?.parameters?.firing_mode === 'ir-grid' && (
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                        Data Source
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sessionData.shots.map((shot, index) => {
                    const isIRShot = sessionData?.parameters?.firing_mode === 'ir-grid' || shot.time_phase === 'IR_GRID';
                    return (
                      <tr key={index} style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: isIRShot
                          ? (index % 2 === 0 ? '#fef2f2' : '#fecaca')
                          : (index % 2 === 0 ? 'white' : '#f8fafc')
                      }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>
                          {isIRShot && <span style={{ color: '#ef4444', marginRight: '4px' }}>🔌</span>}
                          {shot.shot_number || index + 1}
                        </td>
                        <td style={{ padding: '12px' }}>({Number(shot.x_coordinate) - 200}, {200 - Number(shot.y_coordinate)})</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>
                          {shot.timestamp_fired ? new Date(shot.timestamp_fired).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            backgroundColor: isIRShot ? '#fecaca' : '#dbeafe',
                            color: isIRShot ? '#dc2626' : '#1e40af',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {getCorrectHitScore(shot, sessionData)} pts
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          {Math.sqrt(
                            Math.pow(Number(shot.x_coordinate) - 200, 2) +
                            Math.pow(Number(shot.y_coordinate) - 200, 2)
                          ).toFixed(1)}mm
                        </td>
                        {sessionData?.parameters?.firing_mode === 'ir-grid' && (
                          <td style={{ padding: '12px', fontSize: '12px', color: '#64748b' }}>
                            <span style={{
                              backgroundColor: '#ef4444',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>
                              IR GRID
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetailsPage;
