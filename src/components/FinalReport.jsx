import { useMemo, memo } from 'react';

const FinalReport = memo(({ shooter, hits = [], bullseye = null, template = null, laneId = null }) => {
  // Filter out any bullseye bullets from hits array to ensure accurate shot count
  const actualShots = hits.filter(hit => !hit.isBullseye);
  
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

    // Calculate group size (maximum distance between any two shots)
    let groupSize = 0;
    for (let i = 0; i < actualShots.length; i++) {
      for (let j = i + 1; j < actualShots.length; j++) {
        const distance = calculateDistance(actualShots[i], actualShots[j]);
        groupSize = Math.max(groupSize, distance);
      }
    }

    // Template-based accuracy calculation (matches TargetDisplay)
    let accuracy = 0;
    if (template) {
      // Calculate template radius in pixels
      const targetPhysicalWidth = 133; // 13.3 cm in mm
      const targetPixelWidth = 400; // SVG width in pixels
      const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;
      const templateRadius = (template.diameter / 2) * pixelsPerMm;

      // Standard accuracy formula: Accuracy % = (1 - Mean Distance from Reference Point / Target Radius) × 100
      accuracy = Math.max(0, (1 - avgDistance / templateRadius) * 100);
    } else {
      // Fallback for no template: use 100 pixel reference
      const referenceDistance = 100;
      accuracy = Math.max(0, Math.min(100, (1 - (avgDistance / referenceDistance)) * 100));
    }

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
      mpiCoords: trueMPI ? { x: trueMPI.x - 200, y: 200 - trueMPI.y } : null // Convert to (0,0) coordinate system
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

  // Calculate score for a single hit based on distance from reference point
  const getHitScore = (hit) => {
    if (!template) return 0;

    const referencePoint = bullseye || getTargetCenter();
    const distance = calculateDistance(hit, referencePoint);

    // Target image dimensions: 14 cm × 13.3 cm
    // SVG viewBox: 400 × 400 pixels
    // Use the smaller dimension (13.3 cm) to maintain aspect ratio
    const targetPhysicalWidth = 133; // 13.3 cm in mm
    const targetPixelWidth = 400; // SVG width in pixels

    // Calculate scale: pixels per mm
    const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;

    // Convert template diameter (mm) to radius (pixels)
    const templateRadius = (template.diameter / 2) * pixelsPerMm;

    if (distance <= templateRadius * 0.3) return 10; // Inner ring
    if (distance <= templateRadius * 0.6) return 5;  // Middle ring
    if (distance <= templateRadius) return 1;        // Outer ring
    return 0; // Miss
  };

  // Calculate total score
  const getTotalScore = () => {
    return actualShots.reduce((total, hit) => total + getHitScore(hit), 0);
  };

  const stats = useMemo(() => calculateMPIAndAccuracy(), [actualShots, bullseye, template]);
  const totalScore = useMemo(() => getTotalScore(), [actualShots, template, bullseye]);

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

      {/* Performance Rating Badge */}
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
          background: stats.accuracy >= 90 ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' :
                     stats.accuracy >= 75 ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' :
                     stats.accuracy >= 50 ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)' :
                     'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}>
          {stats.accuracy >= 90 ? '🏆 EXPERT MARKSMAN' :
           stats.accuracy >= 75 ? '🥇 SKILLED SHOOTER' :
           stats.accuracy >= 50 ? '📈 IMPROVING SHOOTER' :
           '🎯 BEGINNER LEVEL'}
        </div>
      </div>

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
