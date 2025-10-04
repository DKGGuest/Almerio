import { useMemo, memo, useRef, useEffect } from 'react';
import { calculateZoneScore, calculateRingRadii } from '../constants/shootingParameters';
import { getPerformanceRemark } from '../utils/performanceRemarks';

const FinalReport = memo(({ shooter, hits = [], bullseye = null, template = null, laneId = null, onSaveReport = null, sessionType = null, shootingParameters = null, visualRingRadii = null }) => {
  // Ref to track if report has been saved to prevent duplicates
  const reportSavedRef = useRef(false);

  // Build actual shots list
  // If there are WINDOW-tagged shots (timed mode), include only those; otherwise include all non-bullseye shots (jumper/normal)
  const hasWindowShots = hits.some(h => h.timePhase === 'WINDOW');
  const actualShots = hits.filter(hit => {
    if (hit.isBullseye) return false;
    if (hasWindowShots) return hit.timePhase === 'WINDOW';
    return true; // jumper/normal/no timed window
  });

  // Get target center coordinates (400x400 target with center at 200,200)
  const getTargetCenter = () => {
    return { x: 200, y: 200 }; // Center of 400x400 target
  };

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate MPI and Accuracy using same logic as TargetDisplay
  const calculateMPIAndAccuracy = () => {
    if (actualShots.length === 0) {
      return {
        mpi: 0,
        accuracy: 0,
        avgDistance: 0,
        maxDistance: 0,
        referencePoint: 'none',
        groupSize: 0
      };
    }

    // Calculate the true MPI using iterative geometric method
    const trueMPI = calculateIterativeMPI(actualShots);

    // Determine reference point: custom bullseye or target center
    let referencePoint;
    let referenceLabel;

    if (bullseye) {
      referencePoint = bullseye;
      referenceLabel = 'custom bullseye';
    } else {
      referencePoint = getTargetCenter();
      referenceLabel = 'center';
    }

    // Calculate distances from reference point
    const distances = actualShots.map(shot => calculateDistance(shot, referencePoint));
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const maxDistance = Math.max(...distances);

    // Calculate group size using industry standard extreme spread method
    // Group Size = maximum distance between any two shots (center-to-center)
    // This matches the shooting sports standard used by military, competitive shooting, etc.
    let groupSize = 0;
    if (actualShots.length > 1) {
      for (let i = 0; i < actualShots.length; i++) {
        for (let j = i + 1; j < actualShots.length; j++) {
          const dx = actualShots[i].x - actualShots[j].x;
          const dy = actualShots[i].y - actualShots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          groupSize = Math.max(groupSize, distance);
        }
      }
    }

    // Score-based accuracy calculation
    const totalScore = actualShots.reduce((sum, hit) => sum + getHitScore(hit), 0);
    const maxPossibleScore = actualShots.length * 3; // 3 points is maximum per shot
    const accuracy = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    // Convert pixels to mm using the same scale as template calculations
    const targetPhysicalWidth = 133; // 13.3 cm in mm
    const targetPixelWidth = 400; // SVG width in pixels
    const mmPerPixel = targetPhysicalWidth / targetPixelWidth;

    // MPI distance from reference point in mm
    const mpiDistanceFromReference = trueMPI ? calculateDistance(trueMPI, referencePoint) * mmPerPixel : 0;

    return {
      mpi: mpiDistanceFromReference,
      accuracy: accuracy,
      avgDistance: avgDistance,
      maxDistance: maxDistance * mmPerPixel, // Convert to mm
      referencePoint: referenceLabel,
      groupSize: groupSize * mmPerPixel, // Convert to mm
      mpiCoords: trueMPI ? { x: trueMPI.x - 200, y: 200 - trueMPI.y } : null, // Convert to (0,0) coordinate system
      totalScore: totalScore,
      maxPossibleScore: maxPossibleScore
    };
  };

  // Calculate iterative MPI
  const calculateIterativeMPI = (shots) => {
    if (shots.length === 0) return null;
    if (shots.length === 1) return shots[0];

    let mpi = { x: 0, y: 0 };
    shots.forEach(shot => {
      mpi.x += shot.x;
      mpi.y += shot.y;
    });
    mpi.x /= shots.length;
    mpi.y /= shots.length;

    return mpi;
  };

  // Calculate zone-based score for a single hit
  const getHitScore = (hit) => {
    // For SNAP mode, use the database score to preserve 0-point scoring for HIDE phase shots
    // For other modes, recalculate to ensure consistency with current template and parameters
    if (shootingParameters?.firingMode === 'snap' && hit.score !== undefined) {
      // Use the pre-calculated score from the database for Snap mode
      // This preserves the correct 0-point scoring for shots fired during HIDE phase
      return hit.score;
    }

    // ALWAYS recalculate score to ensure consistency with current template and parameters
    // This fixes the TIMED mode scoring issue where pre-calculated scores from the database
    // were inconsistent with the visual ring radii used during shooting

    // Compute zone-based score using current template and parameters
    const referencePoint = bullseye || getTargetCenter();

    // Use visual ring radii if provided (from TargetDisplay), otherwise calculate
    let ringRadii;
    if (visualRingRadii) {
      ringRadii = visualRingRadii;
    } else {
      // Create a template object if we don't have one, using a fallback diameter
      const effectiveTemplate = template || { diameter: 150 }; // 150mm = 50px radius fallback (consistent with TargetDisplay)
      const esaParameter = shootingParameters?.esa || null;
      ringRadii = calculateRingRadii(effectiveTemplate, esaParameter);
    }

    return calculateZoneScore(hit, referencePoint, ringRadii);
  };

  // Calculate total score
  const getTotalScore = () => {
    return actualShots.reduce((total, hit) => total + getHitScore(hit), 0);
  };

  const stats = useMemo(() => calculateMPIAndAccuracy(), [actualShots, bullseye, template]);
  const totalScore = useMemo(() => getTotalScore(), [actualShots, template, bullseye, visualRingRadii]);

  const performanceRemark = useMemo(() => getPerformanceRemark(stats.accuracy, sessionType), [stats.accuracy, sessionType]);

  // Auto-save report to backend if callback provided (with deduplication)
  useEffect(() => {
    if (!onSaveReport || !shooter || actualShots.length === 0 || reportSavedRef.current) return;

    // Use the performance remark system
    const remarkData = getPerformanceRemark(stats.accuracy, sessionType);
    const performanceRating = remarkData.rating;
    const performanceEmoji = remarkData.emoji;

    const report = {
      totalScore,
      accuracyPercentage: stats.accuracy,
      mpiDistance: stats.mpi,
      groupSize: stats.groupSize,
      maxDistance: stats.maxDistance,
      avgDistance: stats.avgDistance,
      // Already in target coordinate system (0,0 at center; +x right, +y up)
      trueMpiX: stats.mpiCoords ? stats.mpiCoords.x : 0,
      trueMpiY: stats.mpiCoords ? stats.mpiCoords.y : 0,
      referencePoint: stats.referencePoint,
      shotsAnalyzed: actualShots.length,
      shotsFired: hits.filter(h => !h.isBullseye).length,
      templateName: template?.name || null,
      templateDiameter: template?.diameter || null,
      firingMode: null,
      targetDistance: null,
      zeroingDistance: null,
      performanceRating,
      performanceEmoji
    };

    onSaveReport(report);
    reportSavedRef.current = true; // Mark as saved to prevent duplicates
  }, [shooter, actualShots.length, totalScore, stats.accuracy, stats.mpi, stats.groupSize, template?.name]);

  if (!shooter) {
    return (
      <div className="card bg-gray-800">
        <div className="text-center text-gray-400 py-4">
          <div className="text-2xl mb-2">👤</div>
          <div>No shooter assigned</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '8px',
      padding: '12px',
      border: '1px solid rgba(148, 163, 184, 0.2)'
    }}>
      {/* Compact Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '8px',
        flexShrink: 0
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          📊 {laneId ? `Lane ${laneId.replace('lane', '')} - Final Report` : 'Final Report'}
        </h3>
      </div>

      {/* Shooter Info - Compact */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        borderRadius: '6px',
        padding: '8px 12px',
        marginBottom: '8px',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          👤 {shooter}
        </div>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          🎯 {actualShots.length} shots
        </div>
      </div>

      {/* Key Metrics - Compact */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '6px',
        marginBottom: '8px',
        flexShrink: 0
      }}>
        {/* Total Score */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '6px',
          padding: '10px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            marginBottom: '2px'
          }}>
            {totalScore}
          </div>
          <div style={{
            fontSize: '0.625rem',
            opacity: 0.9,
            textTransform: 'uppercase'
          }}>
            Score
          </div>
        </div>

        {/* Accuracy */}
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '6px',
          padding: '10px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            marginBottom: '2px'
          }}>
            {stats.accuracy.toFixed(1)}%
          </div>
          <div style={{
            fontSize: '0.625rem',
            opacity: 0.9,
            textTransform: 'uppercase'
          }}>
            Accuracy
          </div>
        </div>
      </div>

      {/* Performance Rating Badge - Commented out for general display */}
      {/*
      <div style={{
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '12px 24px',
          borderRadius: '25px',
          fontSize: '0.875rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          background: performanceRemark.bgColor,
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          {performanceRemark.emoji} {performanceRemark.rating}
        </div>
      </div>
      */}

      {/* Show remark explanation ONLY for TEST sessions */}
      {sessionType === 'test' && (
        <div style={{
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '0.875rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            background: performanceRemark.bgColor,
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}>
            {performanceRemark.emoji} {performanceRemark.rating}
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '0.75rem',
            color: '#64748b',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '4px' }}>
              Test Session Remark: {performanceRemark.description}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
              Marksman: &gt;70% • First Class: 70%-60% • Second Class: 60%-40% • Failed: &lt;40%
            </div>
          </div>
        </div>
      )}

      {/* Detailed Statistics */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {[
          { icon: '📍', label: 'MPI Distance', value: `${stats.mpi.toFixed(1)} mm`, color: '#3b82f6' },
          { icon: '🎯', label: 'Group Size', value: `${stats.groupSize.toFixed(1)} mm`, color: '#10b981' },
          { icon: '📏', label: 'Max Distance', value: `${stats.maxDistance.toFixed(1)} mm`, color: '#f59e0b' },
          { icon: '⊕', label: 'True MPI', value: stats.mpiCoords ? `(${Math.round(stats.mpiCoords.x)}, ${Math.round(stats.mpiCoords.y)})` : '(-, -)', color: '#8b5cf6' },
          { icon: '📍', label: 'Reference Point', value: stats.referencePoint, color: '#06b6d4' },
          { icon: '🔢', label: 'Shots Analyzed', value: `${actualShots.length} total`, color: '#ef4444' }
        ].map((stat, index) => (
          <div key={index} style={{
            background: 'white',
            borderRadius: '8px',
            padding: '12px',
            border: `2px solid ${stat.color}20`,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '1rem' }}>{stat.icon}</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: stat.color,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {stat.label}
              </span>
            </div>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: '700',
              color: '#1e293b'
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons - Compact */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginTop: '8px',
        flexShrink: 0
      }}>
        <button style={{
          flex: 1,
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 8px',
          fontSize: '0.625rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px'
        }}>
          📄 Export
        </button>
        <button style={{
          flex: 1,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 8px',
          fontSize: '0.625rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px'
        }}>
          📊 Save
        </button>
      </div>
    </div>
  );
});

FinalReport.displayName = 'FinalReport';

export default FinalReport;
