import { useMemo, memo } from 'react';
import { calculateZoneScore, getZoneName, calculateRingRadii } from '../constants/shootingParameters';

const ShotBreakdown = memo(({ shooter, hits = [], bullseye = null, template = null, laneId = null, shootingParameters = null, visualRingRadii = null }) => {
  // Filter out bullseye. If any timed WINDOW shots exist, include only WINDOW shots; otherwise include all non-bullseye shots (jumper/snap)
  const hasWindowShots = hits.some(h => h.timePhase === 'WINDOW');
  const actualShots = hits.filter(hit => {
    if (hit.isBullseye) return false;
    if (hasWindowShots) return hit.timePhase === 'WINDOW';
    return true; // include jumper/snap/untimed
  });

  // Debug logging for TIMED mode shot filtering
  const isDebugMode = window.location.search.includes('debug=true');
  if (isDebugMode && shootingParameters?.firingMode === 'timed') {
    console.log('🎯 ShotBreakdown TIMED Debug:', {
      totalHits: hits.length,
      hasWindowShots,
      actualShots: actualShots.length,
      hitPhases: hits.map(h => ({ id: h.id, timePhase: h.timePhase, isBullseye: h.isBullseye })),
      firingMode: shootingParameters?.firingMode
    });
  }

  // Work in the same 400x400 coordinate space used everywhere else
  const TARGET_PX = 400;

  // Get target center coordinates (400x400 target with center at 200,200)
  const getTargetCenter = () => ({ x: TARGET_PX / 2, y: TARGET_PX / 2 });

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate zone-based score for a single hit
  const getHitScore = (hit) => {
    // ALWAYS recalculate score to ensure consistency with current template and parameters
    // This fixes the TIMED mode scoring issue where pre-calculated scores from the database
    // were inconsistent with the visual ring radii used during shooting

    // Compute zone-based score using current template and parameters
    const referencePoint = bullseye || getTargetCenter();

    // Use visual ring radii if provided (from TargetDisplay), otherwise calculate
    let ringRadii;
    if (visualRingRadii) {
      // Use the exact same ring radii as the visual display
      ringRadii = visualRingRadii;
    } else {
      // Fallback to calculated ring radii
      const effectiveTemplate = template || { diameter: 150 }; // 150mm = 50px radius fallback (consistent with TargetDisplay)
      const esaParameter = shootingParameters?.esa || null;
      ringRadii = calculateRingRadii(effectiveTemplate, esaParameter);
    }

    // Debug logging for TIMED mode reference point and ring radii
    if (isDebugMode && shootingParameters?.firingMode === 'timed') {
      console.log('🎯 Scoring Reference Point:', {
        bullseye,
        referencePoint,
        targetCenter: getTargetCenter(),
        template: template ? { name: template.name, diameter: template.diameter } : 'none',
        esaParameter: shootingParameters?.esa,
        ringRadii: {
          green: ringRadii.greenBullseyeRadius?.toFixed(1),
          orange: ringRadii.orangeESARadius?.toFixed(1),
          blue: ringRadii.blueInnerRadius?.toFixed(1)
        },
        usingVisualRingRadii: !!visualRingRadii
      });
    }

    return calculateZoneScore(hit, referencePoint, ringRadii);
  };

  // Calculate total score
  const getTotalScore = () => {
    return actualShots.reduce((total, hit) => total + getHitScore(hit), 0);
  };

  const totalScore = useMemo(() => getTotalScore(), [actualShots, template, bullseye]);

  // Calculate zone breakdown for display
  const zoneBreakdown = useMemo(() => {
    const breakdown = { 3: 0, 2: 0, 1: 0, 0: 0 };
    actualShots.forEach((hit, index) => {
      const score = getHitScore(hit);
      breakdown[score]++;

      // Debug logging for TIMED mode scoring
      if (isDebugMode && shootingParameters?.firingMode === 'timed') {
        console.log(`🎯 Shot #${index + 1} Score:`, {
          hit: { x: hit.x, y: hit.y, timePhase: hit.timePhase },
          score,
          bullseye,
          template: template?.name || 'default'
        });
      }
    });

    if (isDebugMode && shootingParameters?.firingMode === 'timed') {
      console.log('🎯 Zone Breakdown:', breakdown);
    }

    return breakdown;
  }, [actualShots, template, bullseye, isDebugMode, shootingParameters]);

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
        {(actualShots.length > 0) && (
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            marginTop: '4px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <span>🔵 Blue Zone (3pts): {zoneBreakdown[3]}</span>
            <span>🟠 Orange Zone (2pts): {zoneBreakdown[2]}</span>
            <span>🟢 Green Zone (1pt): {zoneBreakdown[1]}</span>
            <span>⚪ Outside (0pts): {zoneBreakdown[0]}</span>
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
              const zoneName = getZoneName(score);
              return (
                <div
                  key={index}
                  style={{
                    background: score === 3 ? 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)' : // Blue inner circle
                               score === 2 ? 'linear-gradient(135deg, #ff6600 0%, #cc5200 100%)' : // Orange ESA zone
                               score === 1 ? 'linear-gradient(135deg, #00ff00 0%, #00cc00 100%)' : // Green bullseye zone
                               'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Outside target
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
                  <div style={{
                    fontSize: '0.625rem',
                    opacity: 0.8,
                    marginTop: '2px'
                  }}>
                    {score === 3 ? '🔵' : score === 2 ? '🟠' : score === 1 ? '🟢' : '⚪'}
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
