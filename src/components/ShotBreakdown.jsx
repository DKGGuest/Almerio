import { useMemo, memo } from 'react';

const ShotBreakdown = memo(({ shooter, hits = [], bullseye = null, template = null, laneId = null }) => {
  // Filter out any bullseye bullets from hits array to ensure accurate shot count
  const actualShots = hits.filter(hit => !hit.isBullseye);
  
  // Get target center coordinates (298x298 target with center at 149,149)
  const getTargetCenter = () => {
    return { x: 149, y: 149 }; // Center of 298x298 target
  };

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate score for a single hit based on distance from reference point
  const getHitScore = (hit) => {
    // Allow scoring even if template or bullseye is missing by using sensible fallbacks
    const targetPhysicalWidth = 133; // 13.3 cm in mm (smaller side)
    const targetPixelWidth = 298;    // Current SVG width in pixels used by breakdown visuals
    const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;

    // Reference: use chosen bullseye if available, otherwise target center
    const referencePoint = bullseye || getTargetCenter();
    const distance = calculateDistance(hit, referencePoint);

    // Determine a working radius for scoring rings
    // If a template is provided, use its physical diameter -> px radius.
    // Otherwise, fall back to the visible target radius so default bullseye works.
    const templateRadius = (template && template.diameter)
      ? (template.diameter / 2) * pixelsPerMm
      : (targetPixelWidth / 2) - 2; // approx visual radius used in the SVG

    // Debug logging
    console.log('Scoring debug (fallback-aware):', {
      hit,
      bullseye,
      usedCenterFallback: !bullseye,
      usedTemplateFallback: !(template && template.diameter),
      distance,
      templateRadius,
      templateDiameter: template?.diameter,
      pixelsPerMm,
      rings: {
        inner: templateRadius * 0.3,
        middle: templateRadius * 0.6,
        outer: templateRadius
      }
    });

    // Scoring rings based on template (or fallback) radius
    if (distance <= templateRadius * 0.3) return 10; // Inner ring (30% of template radius)
    if (distance <= templateRadius * 0.6) return 5;  // Middle ring (60% of template radius)
    if (distance <= templateRadius) return 1;        // Outer ring (full template radius)
    return 0; // Miss
  };

  // Calculate total score
  const getTotalScore = () => {
    return actualShots.reduce((total, hit) => total + getHitScore(hit), 0);
  };

  const totalScore = useMemo(() => getTotalScore(), [actualShots, template, bullseye]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '8px',
      padding: '12px'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '12px',
        flexShrink: 0
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '700',
          color: '#1e293b',
          margin: '0 0 4px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          🎯 {laneId ? `Lane ${laneId.replace('lane', '')} - Shot Breakdown` : 'Shot Breakdown'}
        </h3>
        {(actualShots.length > 0) && (
          <div style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#059669'
          }}>
            Total Score: {totalScore}{!template ? ' (default scale)' : ''}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        {!shooter ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👤</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>No Shooter Assigned</div>
              <div style={{ fontSize: '0.75rem' }}>Assign a shooter to see shot breakdown</div>
            </div>
          </div>
        ) : actualShots.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#64748b'
          }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>No Shots Fired</div>
              <div style={{ fontSize: '0.75rem' }}>Start shooting to see breakdown</div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
            gap: '8px',
            flex: 1,
            alignContent: 'start'
          }}>
            {actualShots.map((hit, index) => {
              const score = getHitScore(hit);
              return (
                <div
                  key={index}
                  style={{
                    background: score === 10 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                               score === 5 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                               score === 1 ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                               'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    marginBottom: '4px',
                    opacity: 0.9
                  }}>
                    #{index + 1}
                  </div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: '800'
                  }}>
                    {score}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
});

ShotBreakdown.displayName = 'ShotBreakdown';

export default ShotBreakdown;
