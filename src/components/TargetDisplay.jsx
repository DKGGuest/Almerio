import { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react';

// Highly optimized bullet component with custom comparison
const BulletMark = memo(({ bullet, bullseyeId, onBulletClick }) => {
  // Safety check to prevent errors
  if (!bullet || typeof bullet.x !== 'number' || typeof bullet.y !== 'number') {
    return null;
  }

  // Scale bullet position from 400px coordinate space to 298px container
  const containerSize = 298;
  const coordinateSpace = 400;
  const scale = containerSize / coordinateSpace;
  const scaledX = bullet.x * scale;
  const scaledY = bullet.y * scale;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${scaledX}px`,
        top: `${scaledY}px`,
        zIndex: 10,
        willChange: 'transform', // Optimize for animations
      }}
    >
      <div
        className="bullet-base"
        onClick={(e) => onBulletClick(e, bullet.id)}
        title={`Bullet at (${bullet.x - 200}, ${200 - bullet.y})`}
      />
      {bullet.id === bullseyeId && (
        <div className="bullet-selection-overlay" />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.bullet.id === nextProps.bullet.id &&
    prevProps.bullet.x === nextProps.bullet.x &&
    prevProps.bullet.y === nextProps.bullet.y &&
    prevProps.bullseyeId === nextProps.bullseyeId
  );
});

BulletMark.displayName = 'BulletMark';

// Shooting Parameters Form Component
const ShootingParametersForm = ({ onSave, onCancel, existingParams = null }) => {
  const [params, setParams] = useState(existingParams || {
    firingMode: 'snap',
    timeLimit: 10,
    targetDistance: 25,
    zeroingDistance: 25,
    targetType: 'standard',
    windDirection: 0,
    windSpeed: 0,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(params);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '20px', fontWeight: '700' }}>
          🎯 Shooting Parameters
        </h3>

        <form onSubmit={handleSubmit}>
          {/* Firing Mode */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Firing Mode:
            </label>
            <select
              value={params.firingMode}
              onChange={(e) => setParams({...params, firingMode: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="snap">Snap - Reaction-based firing (shoot as soon as target appears)</option>
              <option value="jumper">Jumper - Quick target acquisition</option>
              <option value="timed">Timed - Shoot within time window</option>
            </select>
          </div>

          {/* Time Limit (only for timed mode) */}
          {params.firingMode === 'timed' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Time Limit (seconds):
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={params.timeLimit}
                onChange={(e) => setParams({...params, timeLimit: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}

          {/* Target Distance */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Target Distance (meters):
            </label>
            <select
              value={params.targetDistance}
              onChange={(e) => setParams({...params, targetDistance: parseInt(e.target.value)})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="10">10m - Close range</option>
              <option value="25">25m - Standard pistol</option>
              <option value="50">50m - Long pistol/Short rifle</option>
              <option value="100">100m - Standard rifle</option>
              <option value="200">200m - Long range rifle</option>
            </select>
          </div>

          {/* Zeroing Distance */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Zeroing Distance (meters):
            </label>
            <select
              value={params.zeroingDistance}
              onChange={(e) => setParams({...params, zeroingDistance: parseInt(e.target.value)})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="25">25m - Standard zero</option>
              <option value="50">50m - Medium zero</option>
              <option value="100">100m - Long zero</option>
            </select>
          </div>

          {/* Target Type */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Target Type:
            </label>
            <select
              value={params.targetType}
              onChange={(e) => setParams({...params, targetType: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="standard">Standard Bullseye</option>
              <option value="silhouette">Human Silhouette</option>
              <option value="precision">Precision Target</option>
              <option value="tactical">Tactical Target</option>
              <option value="custom">Custom Target</option>
            </select>
          </div>

          {/* Wind Direction */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Wind Direction (degrees from North):
            </label>
            <input
              type="number"
              min="0"
              max="360"
              step="1"
              value={params.windDirection}
              onChange={(e) => setParams({...params, windDirection: parseInt(e.target.value) || 0})}
              placeholder="0-360 degrees"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              0° = North, 90° = East, 180° = South, 270° = West
            </small>
          </div>

          {/* Wind Speed */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Wind Speed (m/s):
            </label>
            <input
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={params.windSpeed}
              onChange={(e) => setParams({...params, windSpeed: parseFloat(e.target.value) || 0})}
              placeholder="Wind speed in meters per second"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              0 = No wind, 5-10 = Light breeze, 10+ = Strong wind
            </small>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Notes (optional):
            </label>
            <textarea
              value={params.notes}
              onChange={(e) => setParams({...params, notes: e.target.value})}
              placeholder="Additional notes about this shooting session..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                minHeight: '60px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                background: 'white',
                color: '#6b7280',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Save Parameters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Parameter Viewer Component
const ParameterViewer = ({ parameters, onClose }) => {
  const getFiringModeDescription = (mode) => {
    switch(mode) {
      case 'snap': return 'Snap - Reaction-based firing (shoot as soon as target appears)';
      case 'jumper': return 'Jumper - Quick target acquisition';
      case 'timed': return 'Timed - Shoot within time window';
      default: return mode;
    }
  };

  const getTargetTypeDescription = (type) => {
    switch(type) {
      case 'standard': return 'Standard Bullseye';
      case 'silhouette': return 'Human Silhouette';
      case 'precision': return 'Precision Target';
      case 'tactical': return 'Tactical Target';
      case 'custom': return 'Custom Target';
      default: return type;
    }
  };

  const getWindDirectionDescription = (degrees) => {
    if (degrees >= 0 && degrees < 45) return `${degrees}° (North-Northeast)`;
    if (degrees >= 45 && degrees < 90) return `${degrees}° (Northeast-East)`;
    if (degrees >= 90 && degrees < 135) return `${degrees}° (East-Southeast)`;
    if (degrees >= 135 && degrees < 180) return `${degrees}° (Southeast-South)`;
    if (degrees >= 180 && degrees < 225) return `${degrees}° (South-Southwest)`;
    if (degrees >= 225 && degrees < 270) return `${degrees}° (Southwest-West)`;
    if (degrees >= 270 && degrees < 315) return `${degrees}° (West-Northwest)`;
    if (degrees >= 315 && degrees <= 360) return `${degrees}° (Northwest-North)`;
    return `${degrees}°`;
  };

  const getWindSpeedDescription = (speed) => {
    if (speed === 0) return `${speed} m/s (No wind)`;
    if (speed > 0 && speed <= 3) return `${speed} m/s (Light breeze)`;
    if (speed > 3 && speed <= 7) return `${speed} m/s (Moderate breeze)`;
    if (speed > 7 && speed <= 12) return `${speed} m/s (Strong breeze)`;
    if (speed > 12) return `${speed} m/s (Very strong wind)`;
    return `${speed} m/s`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '700' }}>
            🎯 Current Parameters
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '4px'
            }}>
              Firing Mode:
            </label>
            <p style={{ margin: 0, color: '#1f2937' }}>
              {getFiringModeDescription(parameters.firingMode)}
            </p>
          </div>

          {parameters.firingMode === 'timed' && (
            <div style={{
              padding: '12px',
              background: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #f59e0b'
            }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: '#92400e',
                marginBottom: '4px'
              }}>
                Time Limit:
              </label>
              <p style={{ margin: 0, color: '#78350f' }}>
                {parameters.timeLimit} seconds
              </p>
            </div>
          )}

          <div style={{
            padding: '12px',
            background: '#ecfdf5',
            borderRadius: '8px',
            border: '1px solid #10b981'
          }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: '#065f46',
              marginBottom: '4px'
            }}>
              Target Distance:
            </label>
            <p style={{ margin: 0, color: '#047857' }}>
              {parameters.targetDistance}m
            </p>
          </div>

          <div style={{
            padding: '12px',
            background: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #3b82f6'
          }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: '#1e40af',
              marginBottom: '4px'
            }}>
              Zeroing Distance:
            </label>
            <p style={{ margin: 0, color: '#1d4ed8' }}>
              {parameters.zeroingDistance}m - Weapon zeroed for this distance
            </p>
          </div>

          <div style={{
            padding: '12px',
            background: '#fdf4ff',
            borderRadius: '8px',
            border: '1px solid #a855f7'
          }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: '#7c2d12',
              marginBottom: '4px'
            }}>
              Target Type:
            </label>
            <p style={{ margin: 0, color: '#92400e' }}>
              {getTargetTypeDescription(parameters.targetType)}
            </p>
          </div>

          <div style={{
            padding: '12px',
            background: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #f59e0b'
          }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: '#92400e',
              marginBottom: '4px'
            }}>
              Wind Direction:
            </label>
            <p style={{ margin: 0, color: '#78350f' }}>
              {getWindDirectionDescription(parameters.windDirection || 0)}
            </p>
          </div>

          <div style={{
            padding: '12px',
            background: '#e0f2fe',
            borderRadius: '8px',
            border: '1px solid #0284c7'
          }}>
            <label style={{ 
              display: 'block', 
              fontWeight: '600', 
              color: '#0c4a6e',
              marginBottom: '4px'
            }}>
              Wind Speed:
            </label>
            <p style={{ margin: 0, color: '#0369a1' }}>
              {getWindSpeedDescription(parameters.windSpeed || 0)}
            </p>
          </div>

          {parameters.notes && (
            <div style={{
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #d1d5db'
            }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '4px'
              }}>
                Notes:
              </label>
              <p style={{ margin: 0, color: '#6b7280', fontStyle: 'italic' }}>
                {parameters.notes}
              </p>
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          marginTop: '24px' 
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const TargetDisplay = memo(({
  template,
  hits = [],
  bullseye = null,
  laneId = null,
  shooter = null,
  message = null,
  onBullseyeSet = null,
  onAddHit = null,
  onAnalyticsUpdate = null,
  onParametersUpdate = null
}) => {
  // Debug: log incoming props and local state every render
  console.log('[TargetDisplay] props:', { hits, bullseye, laneId, shooter, message });
  const targetRef = useRef(null);
  const [bullets, setBullets] = useState([]);
  const [bullseyeId, setBullseyeId] = useState(null);
  const [shootingPhase, setShootingPhase] = useState('SELECT_BULLSEYE'); // SELECT_BULLSEYE, SHOOTING, DONE
  const [showResults, setShowResults] = useState(false);
  const [cursorPos, setCursorPos] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isCustomPositioning, setIsCustomPositioning] = useState(false);
  const [showParameterForm, setShowParameterForm] = useState(false);
  const [shootingParameters, setShootingParameters] = useState(null);
  const [showParameterView, setShowParameterView] = useState(false);

  // Sync with external hits and bullseye (for lane system) - DISABLED to prevent bullet disappearing

  // Clear local state ONLY on genuine lane reset; avoid clearing when switching tabs
  useEffect(() => {
    console.log('[TargetDisplay] Reset watcher', { hitsLen: hits.length, bullseye, hasTemplate: !!template, hasImage: !!uploadedImage, shooter: !!shooter, localBullets: bullets.length });
    // Do not clear if we still have local bullets; tab switches may not pass hits immediately
    if (!hits.length && !bullseye && !template && !uploadedImage && !shooter && bullets.length === 0) {
      console.log('[TargetDisplay] Clearing local state after full reset');
      setBullets([]);
      setBullseyeId(null);
      setShootingPhase('SELECT_BULLSEYE');
      setShowResults(false);
      setUploadedImage(null);
      setIsCustomPositioning(false);
      setShootingParameters(null);
      setShowParameterForm(false);
      setShowParameterView(false);
    }
  }, [hits, bullseye, template, uploadedImage, shooter, bullets.length]);


  // Sync local state with parent lane state after reset
  useEffect(() => {
    // Only perform a FULL reset when we explicitly get a RESET signal via onAddHit
    // or when everything is truly empty AND there are no local bullets.
    if (!hits.length && !bullseye && !template && !uploadedImage && !shooter && bullets.length === 0) {
      setBullets([]);
      setBullseyeId(null);
      setShootingPhase('SELECT_BULLSEYE');
      setShowResults(false);
      setUploadedImage(null);
      setIsCustomPositioning(false);
      setShootingParameters(null);
      setShowParameterForm(false);
      setShowParameterView(false);
    }
  }, [hits, bullseye, template, uploadedImage, shooter, bullets.length]);
  // This was causing bullets to disappear during rapid firing
  // Simplified hits synchronization to prevent infinite loops
  useEffect(() => {
    if (!hits) return;

    // Convert hits to bullets format
    const convertedBullets = hits.map((hit, index) => ({
      id: hit.id || `hit-${index}-${hit.timestamp || Date.now()}`,
      x: hit.x,
      y: hit.y,
      timestamp: hit.timestamp || Date.now()
    }));

    setBullets(prev => {
      // Preserve any existing bullseye bullet
      const existingBullseye = prev.find(b => b.isBullseye === true);

      if (hits.length === 0) {
        // If no hits, keep only bullseye
        return existingBullseye ? [existingBullseye] : [];
      } else {
        // Combine bullseye with new hits
        return existingBullseye ? [existingBullseye, ...convertedBullets] : convertedBullets;
      }
    });
  }, [hits?.length]); // Only depend on hits length to prevent infinite loops

  // Simplified bullseye handling
  useEffect(() => {
    if (template && !bullseyeId && !isCustomPositioning) {
      // Only automatically place bullseye at center when NOT in custom positioning mode
      const bullseyeBullet = {
        id: 'bullseye-center',
        x: 200,
        y: 200,
        timestamp: Date.now(),
        isBullseye: true
      };

      setBullets([bullseyeBullet]); // clear any existing and set new bullseye
      setBullseyeId('bullseye-center');
      setShootingPhase('SHOOTING');
    } else if (template && !bullseyeId && isCustomPositioning) {
      // When template is selected and custom positioning is enabled, wait for user to click
      setShootingPhase('SELECT_BULLSEYE');
      setBullets([]); // Clear any existing bullets
    } else if (!template && bullseyeId) {
      // If template is deselected, reset bullseye
      setBullseyeId(null);
      setBullets(prev => prev.filter(b => !b.isBullseye));
      setShootingPhase('SELECT_BULLSEYE');
      setIsCustomPositioning(false);
    }
  }, [template, bullseyeId, isCustomPositioning]);


  // Simplified phase management
  useEffect(() => {
    const nonBullseyeBullets = bullets.filter(b => !b.isBullseye);
    if (nonBullseyeBullets.length === 0 && !bullseyeId) {
      setShootingPhase('SELECT_BULLSEYE');
      setShowResults(false);
    } else if (nonBullseyeBullets.length > 0 && bullseyeId) {
      setShootingPhase('SHOOTING');
    }
  }, [bullets.length, bullseyeId]);

  // Use ref to track if we're currently processing a click to prevent race conditions
  const isProcessingClick = useRef(false);

  const handleTargetClick = useCallback((e) => {
    // Prevent rapid-fire clicks from causing issues
    if (isProcessingClick.current) return;
    isProcessingClick.current = true;

    // Reset the flag after a short delay
    setTimeout(() => {
      isProcessingClick.current = false;
    }, 50);

    if (!targetRef.current) return;

    // Check if click is on an existing bullet
    const clickedElement = e.target;
    if (clickedElement.classList.contains('bullet-mark') || clickedElement.classList.contains('bullet-base')) {
      return; // Prevent adding new bullet when clicking on existing bullet
    }

    const rect = targetRef.current.getBoundingClientRect();

    // Calculate exact click position relative to the target area with pixel rounding
    // Scale coordinates to match the coordinate system (298px container mapped to 400px coordinate space)
    const containerSize = 298;
    const coordinateSpace = 400;
    const scale = coordinateSpace / containerSize;
    const x = Math.round((e.clientX - rect.left) * scale);
    const y = Math.round((e.clientY - rect.top) * scale);

    if (shootingPhase === 'SELECT_BULLSEYE' && isCustomPositioning) {
      // First click sets the bullseye when in custom positioning mode
      const bullseyePoint = { x, y };
      setBullseyeId('bullseye-center');
      setShootingPhase('SHOOTING');
      setIsCustomPositioning(false);

      // Create a special bullseye marker
      const bullseyeBullet = {
        id: 'bullseye-center',
        x: x,
        y: y,
        timestamp: Date.now(),
        isBullseye: true
      };

      // Optimized: Use functional update to avoid array operations
      setBullets(prev => {
        const filtered = prev.filter(b => !b.isBullseye);
        filtered.unshift(bullseyeBullet);
        return filtered;
      });

      if (onBullseyeSet) {
        onBullseyeSet(bullseyePoint);
      }
    } else if (shootingPhase === 'SHOOTING') {
      // Generate unique ID with better entropy
      const newBullet = {
        id: `bullet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y,
        timestamp: Date.now()
      };

      // Use functional update for better performance and consistency
      setBullets(prev => {
        // Ensure we don't duplicate bullets at the same position
        const existingAtPosition = prev.find(b =>
          !b.isBullseye && Math.abs(b.x - x) < 3 && Math.abs(b.y - y) < 3
        );
        if (existingAtPosition) return prev;

        return [...prev, newBullet];
      });

      if (onAddHit) {
        onAddHit(newBullet);
      }
    }
    // Do nothing if shootingPhase === 'DONE'
  }, [shootingPhase, onBullseyeSet, onAddHit]);

  const handleBulletClick = useCallback((e, bulletId) => {
    e.stopPropagation(); // Prevent triggering target click

    // Only allow bullseye selection in SELECT_BULLSEYE phase
    if (shootingPhase !== 'SELECT_BULLSEYE') {
      return;
    }

    setBullseyeId(bulletId);

    // If we have an external onBullseyeSet callback (lane system), use it
    if (onBullseyeSet) {
      const bullet = bullets.find(b => b.id === bulletId);
      if (bullet) {
        onBullseyeSet({ x: bullet.x, y: bullet.y });
      }
    }
  }, [shootingPhase, bullets, onBullseyeSet]);

  // Memoize expensive calculations
  const getTemplateRadius = useMemo(() => {
    if (!template) return 50;

    // Target image dimensions: 14 cm × 13.3 cm
    // SVG viewBox: 400 × 400 pixels
    // Use the smaller dimension (13.3 cm) to maintain aspect ratio
    const targetPhysicalWidth = 133; // 13.3 cm in mm
    const targetPixelWidth = 400; // SVG width in pixels

    // Calculate scale: pixels per mm
    const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;

    // Convert template diameter (mm) to radius (pixels)
    const radius = (template.diameter / 2) * pixelsPerMm;



    return radius;
  }, [template]);

  const getBullseyeBullet = useMemo(() => {
    return bullets.find(bullet => bullet.id === bullseyeId);
  }, [bullets, bullseyeId]);

  // Memoize filtered bullets for performance
  const nonBullseyeBullets = useMemo(() => {
    return bullets.filter(b => !b.isBullseye);
  }, [bullets]);

  const calculateDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTargetCenter = () => {
    if (!targetRef.current) return { x: 0, y: 0 };
    const rect = targetRef.current.getBoundingClientRect();
    return {
      x: rect.width / 2,
      y: rect.height / 2
    };
  };

  // Calculate MPI using geometric iterative method (line division approach)
  const calculateIterativeMPI = (shots) => {
    if (shots.length === 0) return null;
    if (shots.length === 1) {
      const singleShotMPI = { x: shots[0].x, y: shots[0].y };

      return singleShotMPI;
    }

    // Step 1: Start with first two shots - bisect the line between them
    let mpi = {
      x: (shots[0].x + shots[1].x) / 2,
      y: (shots[0].y + shots[1].y) / 2
    };

    // Step 2+: For each additional shot, use geometric line division
    for (let i = 2; i < shots.length; i++) {
      const currentShot = shots[i];
      const n = i + 1; // Current shot number (1-indexed)

      // Create a line from current MPI to the new shot
      const lineVector = {
        x: currentShot.x - mpi.x,
        y: currentShot.y - mpi.y
      };

      // Divide this line into n equal parts
      // The new MPI is at position 1/n along this line from the current MPI
      // This pulls the MPI toward the new shot by the appropriate amount
      const divisionPoint = 1 / n;

      mpi = {
        x: mpi.x + (lineVector.x * divisionPoint),
        y: mpi.y + (lineVector.y * divisionPoint)
      };
    }



    return mpi;
  };

  const calculateMPIAndAccuracy = (shotsToAnalyze) => {
    if (shotsToAnalyze.length === 0) {
      return {
        mpi: 0,
        accuracy: 0,
        avgDistance: 0,
        maxDistance: 0,
        referencePoint: 'none',
        mpiCoords: null,
        groupSize: 0
      };
    }

    // Calculate the true MPI using iterative geometric method
    const trueMPI = calculateIterativeMPI(shotsToAnalyze);

    // Determine reference point for accuracy calculation: actual bullseye position
    const bullseyeBullet = bullets.find(b => b.isBullseye);
    const referencePoint = bullseyeBullet ? { x: bullseyeBullet.x, y: bullseyeBullet.y } : { x: 200, y: 200 };
    const referenceLabel = bullseyeBullet ? `bullseye (${bullseyeBullet.x - 200}, ${200 - bullseyeBullet.y})` : 'center origin (0,0)';

    // Calculate distances from each bullet to reference point (for accuracy)
    const distancesToReference = shotsToAnalyze.map(bullet => calculateDistance(bullet, referencePoint));
    const avgDistanceToReference = distancesToReference.reduce((sum, dist) => sum + dist, 0) / distancesToReference.length;
    const maxDistanceToReference = Math.max(...distancesToReference);

    // Calculate group size (spread) - distances from each shot to the MPI
    let groupSize = 0;
    if (trueMPI && shotsToAnalyze.length > 1) {
      const distancesToMPI = shotsToAnalyze.map(bullet => calculateDistance(bullet, trueMPI));
      groupSize = Math.max(...distancesToMPI) * 2; // Diameter of the group
    }

    // Template-based accuracy calculation
    let accuracy = 0;
    if (template) {
      // Use template radius as reference for accuracy calculation
      // NOTE: Visual ring diameter is 2x the radius, so the radius is just getTemplateRadius
      const visualTemplateRadius = getTemplateRadius; // This is the actual radius of the ring

      // Debug: Check the values
      console.log('🎯 Accuracy Debug:', {
        bullseyeCoords: getBullseyeBullet ? `(${getBullseyeBullet.x}, ${getBullseyeBullet.y})` : 'NO BULLSEYE',
        avgDistanceToReference: avgDistanceToReference,
        calculatedTemplateRadius: getTemplateRadius,
        visualTemplateRadius: visualTemplateRadius,
        ratio: avgDistanceToReference / visualTemplateRadius,
        rawAccuracy: (1 - avgDistanceToReference / visualTemplateRadius) * 100,
        finalAccuracy: Math.max(0, (1 - avgDistanceToReference / visualTemplateRadius) * 100),
        bulletsCount: shotsToAnalyze.length,
        firstBulletCoords: shotsToAnalyze.length > 0 ? `(${shotsToAnalyze[0].x}, ${shotsToAnalyze[0].y})` : 'NO BULLETS'
      });

      // Standard accuracy formula:
      // Accuracy % = (1 - Mean Distance from Reference Point / Target Radius) × 100
      accuracy = Math.max(0, (1 - avgDistanceToReference / visualTemplateRadius) * 100);



      // Store debug info for visual display
      window.debugAccuracy = {
        templateRadius: visualTemplateRadius,
        templateRadiusMM: visualTemplateRadius * (133/400),
        shotDistance: avgDistanceToReference,
        shotDistanceMM: avgDistanceToReference * (133/400),
        calculatedAccuracy: accuracy
      };
    } else {
      // Fallback for no template: use 100 pixel reference (original behavior)
      const referenceDistance = 100;
      accuracy = Math.max(0, Math.min(100, (1 - (avgDistanceToReference / referenceDistance)) * 100));
    }

    // Convert pixels to mm using the same scale as template calculations
    const targetPhysicalWidth = 133; // 13.3 cm in mm
    const targetPixelWidth = 400; // SVG width in pixels
    const mmPerPixel = targetPhysicalWidth / targetPixelWidth;

    // MPI distance from reference point in mm
    const mpiDistanceFromReference = trueMPI ? calculateDistance(trueMPI, referencePoint) * mmPerPixel : 0;

    // Debug: Compare MPI vs Max Distance
    console.log('🔍 Distance Debug:', {
      shotsCount: shotsToAnalyze.length,
      trueMPI: trueMPI,
      referencePoint: referencePoint,
      mpiDistancePixels: trueMPI ? calculateDistance(trueMPI, referencePoint) : 0,
      mpiDistanceMM: mpiDistanceFromReference,
      maxDistancePixels: maxDistanceToReference,
      maxDistanceMM: maxDistanceToReference * mmPerPixel,
      mmPerPixel: mmPerPixel,
      distancesToReference: distancesToReference
    });

    return {
      mpi: mpiDistanceFromReference,
      accuracy: accuracy,
      avgDistance: avgDistanceToReference * mmPerPixel, // Convert to mm
      maxDistance: maxDistanceToReference * mmPerPixel, // Convert to mm
      referencePoint: referenceLabel,
      referenceCoords: referencePoint,
      mpiCoords: trueMPI,
      groupSize: groupSize * mmPerPixel // Convert to mm
    };
  };

  const getAccuracyRating = (accuracy) => {
    if (accuracy >= 90) return { rating: 'Expert', class: 'expert' };
    if (accuracy >= 75) return { rating: 'Skilled', class: 'skilled' };
    if (accuracy >= 50) return { rating: 'Improving', class: 'improving' };
    return { rating: 'Beginner', class: 'beginner' };
  };

  // Simplified stats calculation to prevent errors
  const stats = useMemo(() => {
    try {
      const nonBullseyeBullets = bullets.filter(b => !b.isBullseye);

      // Only calculate if we have bullets and are not actively shooting
      if (nonBullseyeBullets.length === 0) {
        return {
          mpi: 0,
          accuracy: 0,
          avgDistance: 0,
          maxDistance: 0,
          referencePoint: 'no shots',
          mpiCoords: null,
          groupSize: 0
        };
      }

      // For external hits (like from Simulator), always calculate
      if (nonBullseyeBullets.length > 0) {
        return calculateMPIAndAccuracy(nonBullseyeBullets);
      }

      return {
        mpi: 0,
        accuracy: 0,
        avgDistance: 0,
        maxDistance: 0,
        referencePoint: 'calculating...',
        mpiCoords: null,
        groupSize: 0
      };
    } catch (error) {
      console.warn('Error calculating stats:', error);
      return {
        mpi: 0,
        accuracy: 0,
        avgDistance: 0,
        maxDistance: 0,
        referencePoint: 'error',
        mpiCoords: null,
        groupSize: 0
      };
    }
  }, [bullets, bullseyeId, template]);

  const accuracyRating = useMemo(() => getAccuracyRating(stats.accuracy), [stats.accuracy]);

  // Send analytics data to parent component
  useEffect(() => {
    if (onAnalyticsUpdate) {
      // Get reference coordinates (actual bullseye position)
      const bullseyeBullet = bullets.find(b => b.isBullseye);
      const referenceCoords = bullseyeBullet ? { x: bullseyeBullet.x, y: bullseyeBullet.y } : { x: 200, y: 200 };
      const bullseyeCoords = bullseyeBullet ? { x: bullseyeBullet.x, y: bullseyeBullet.y } : null;

      onAnalyticsUpdate({
        stats: {
          ...stats,
          referenceCoords
        },
        shootingPhase,
        showResults,
        bullets: bullets.filter(b => !b.isBullseye),
        bullseye: bullseyeCoords,
        bullseyeId,
        accuracyRating
      });
    }
  }, [stats, shootingPhase, showResults, bullets, bullseyeId, accuracyRating, onAnalyticsUpdate]);

  // Add event listener for custom parameter form trigger from AdminDashboard
  useEffect(() => {
    const handleOpenParameterForm = (event) => {
      console.log('TargetDisplay received openParameterForm event:', event.detail);
      console.log('Current laneId:', laneId);
      console.log('Event laneId:', event.detail?.laneId);
      
      if (event.detail && event.detail.laneId === laneId) {
        console.log('Lane ID matches, opening parameter form');
        if (shootingParameters) {
          console.log('Has existing parameters, showing viewer');
          setShowParameterView(true);
        } else {
          console.log('No existing parameters, showing form');
          setShowParameterForm(true);
        }
      }
    };

    // Listen directly on the target container div
    const targetContainer = document.querySelector(`[data-lane-id="${laneId}"]`);
    console.log('Setting up event listener for:', laneId, targetContainer);
    
    if (targetContainer) {
      targetContainer.addEventListener('openParameterForm', handleOpenParameterForm);
      return () => {
        targetContainer.removeEventListener('openParameterForm', handleOpenParameterForm);
      };
    }
  }, [laneId, shootingParameters]);

  // Error boundary to prevent white screen
  try {
    return (
    <div className="modern-target-container" data-lane-id={laneId}>
      {/* Enhanced Lane Header Box - Styled like AdminDashboard */}
      <div style={{
        background: 'transparent',
        border: 'none',
        borderRadius: '0px',
        padding: 0,
        marginBottom: 0,
        boxShadow: 'none',
        color: 'inherit'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: 18, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🎯</div>
            <span style={{ 
              fontWeight: 700, 
              fontSize: 16,
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              letterSpacing: '0.5px'
            }}>
              {laneId ? `Lane ${laneId.replace('lane', '')}` : 'Target Display'}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>📊</span>
              <span>{bullets.filter(b => !b.isBullseye).length} shots</span>
            </div>
          </div>
        </div>
        
        {/* Shooter and Status Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          opacity: 0.9
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {shooter ? (
              <>
                <span>👤</span>
                <span style={{ fontWeight: 600 }}>{shooter}</span>
              </>
            ) : (
              <>
                {/* <span>⚠️</span> */}
                {/* <span style={{ fontStyle: 'italic' }}>No shooter assigned</span> */}
              </>
            )}
          </div>
          
          {message && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: 11
            }}>
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Compact instruction banner */}
      {(shootingPhase === 'SELECT_BULLSEYE' || shootingPhase === 'SHOOTING') && (
        <div style={{
          background: shootingPhase === 'SELECT_BULLSEYE' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          border: `1px solid ${shootingPhase === 'SELECT_BULLSEYE' ? '#f59e0b' : '#22c55e'}`,
          borderRadius: '4px',
          padding: '6px 8px',
          marginBottom: 6,
          textAlign: 'center',
          fontSize: 11,
          color: shootingPhase === 'SELECT_BULLSEYE' ? '#92400e' : '#166534',
          fontWeight: 600
        }}>
          {shootingPhase === 'SELECT_BULLSEYE' ? '🎯 Click target to set bullseye' : '🔫 Click to place shots'}
        </div>
      )}



      {/* Compact target area */}
      <div style={{
        background: '#000',
        borderRadius: '6px',
        padding: '4px',
        marginBottom: 8
      }}>
        <div
          ref={targetRef}
          className="modern-target-area"
          onClick={handleTargetClick}
          onMouseMove={useCallback((e) => {
            if (!targetRef.current) return;
            const rect = targetRef.current.getBoundingClientRect();
            // Scale coordinates to match the coordinate system (298px container mapped to 400px coordinate space)
            const containerSize = 298;
            const coordinateSpace = 400;
            const scale = coordinateSpace / containerSize;
            const x = Math.round((e.clientX - rect.left) * scale);
            const y = Math.round((e.clientY - rect.top) * scale);
            setCursorPos(prev => {
              const newPos = { x, y };
              if (!prev || Math.abs(prev.x - newPos.x) > 3 || Math.abs(prev.y - newPos.y) > 3) {
                return newPos;
              }
              return prev;
            });
          }, [])}
          onMouseLeave={useCallback(() => {
            setCursorPos(null);
          }, [])}
          style={{
            backgroundImage: uploadedImage ? `url('${uploadedImage}')` : `url('${import.meta.env.BASE_URL}target.svg')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            width: '100%',
            maxWidth: '298px',
            height: '298px',
            margin: '0 auto',
            display: 'block',
          }}
        >
          {/* Show cursor coordinates in top-left corner - always visible when cursor is over target */}
          {cursorPos && (
            <div style={{
              position: 'absolute',
              top: 8,
              left: 12,
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 'bold',
              zIndex: 100,
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              fontFamily: 'monospace'
            }}>
              ({cursorPos.x - 200}, {200 - cursorPos.y})
            </div>
          )}
          {/* Grid Overlay - 298px */}
          <svg
            width="298"
            height="298"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              pointerEvents: 'none'
            }}
          >
            {/* Vertical lines - scaled for 298px */}
            {[...Array(11)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={(i * 29.8)}
                y1={0}
                x2={(i * 29.8)}
                y2={298}
                stroke="#ff6b6b"
                strokeWidth={i === 5 ? 2 : 1}
                opacity={i === 5 ? 0.5 : 0.18}
              />
            ))}
            {/* Horizontal lines - scaled for 298px */}
            {[...Array(11)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={(i * 29.8)}
                x2={298}
                y2={(i * 29.8)}
                stroke="#ff6b6b"
                strokeWidth={i === 5 ? 2 : 1}
                opacity={i === 5 ? 0.5 : 0.18}
              />
            ))}

            {/* Grid coordinate labels - scaled for 298px */}
            {/* X-axis labels (bottom) */}
            {[...Array(11)].map((_, i) => (
              <text
                key={`x-label-${i}`}
                x={(i * 29.8)}
                y={290}
                textAnchor="middle"
                fontSize="9"
                fill="#ff6b6b"
                fontWeight={i === 5 ? "bold" : "normal"}
                opacity={0.8}
              >
                {(i - 5) * 40}
              </text>
            ))}

            {/* Y-axis labels (left side) */}
            {[...Array(11)].map((_, i) => (
              <text
                key={`y-label-${i}`}
                x={4}
                y={(i * 29.8) + 4}
                textAnchor="start"
                fontSize="9"
                fill="#ff6b6b"
                fontWeight={i === 5 ? "bold" : "normal"}
                opacity={0.8}
              >
                {(5 - i) * 40}
              </text>
            ))}

            {/* Center origin marker - scaled */}
            <circle
              cx={149}
              cy={149}
              r={2.2}
              fill="#ffff00"
              stroke="#000"
              strokeWidth={1}
              opacity={0.8}
            />
            <text
              x={153}
              y={145}
              fontSize="9"
              fill="#ffff00"
              fontWeight="bold"
              opacity={0.9}
            >
              (0,0)
            </text>


          </svg>
          {/* MPI Indicator */}
          {stats.mpiCoords && bullets.length > 1 && typeof stats.mpiCoords.x === 'number' && typeof stats.mpiCoords.y === 'number' && (
            <div
              className="mpi-indicator"
              style={{
                left: `${stats.mpiCoords.x * (298/400)}px`,
                top: `${stats.mpiCoords.y * (298/400)}px`,
                zIndex: 15,
                position: 'absolute',
              }}
              title={`True MPI: Mean Point of Impact (${(stats.mpiCoords.x - 200).toFixed(1)}, ${(200 - stats.mpiCoords.y).toFixed(1)})`}
            >
              <div className="mpi-cross-h"></div>
              <div className="mpi-cross-v"></div>
              <div className="mpi-center"></div>
            </div>
          )}

          {/* Template Preview Ring - Shows template size at (0,0) when no bullseye is set */}
          {template && !bullseyeId && shootingPhase === 'SELECT_BULLSEYE' && !isCustomPositioning && (
            <div
              className="template-preview-ring"
              style={{
                left: `${200 * (298/400)}px`,
                top: `${200 * (298/400)}px`,
                width: `${getTemplateRadius * 2 * (298/400)}px`,
                height: `${getTemplateRadius * 2 * (298/400)}px`,
                zIndex: 5,
                position: 'absolute',
              }}
            />
          )}

          {/* Template Ring - ALWAYS visible when template is selected */}
          {template && bullseyeId && getBullseyeBullet && (
            <div
              className="template-ring-always-visible"
              style={{
                left: `${getBullseyeBullet.x * (298/400)}px`,
                top: `${getBullseyeBullet.y * (298/400)}px`,
                width: `${getTemplateRadius * 2 * (298/400)}px`,
                height: `${getTemplateRadius * 2 * (298/400)}px`,
                zIndex: 15,
                position: 'absolute',
                border: '4px solid #00ff41',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0, 255, 65, 0.2)',
                boxShadow: '0 0 16px rgba(0, 255, 65, 0.8)',
                animation: 'shootingRingPulse 3s ease-in-out infinite',
              }}
            >
              {/* Center dot - always visible */}
              {/* <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ffff00',
                  border: '2px solid #000',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 8px rgba(255, 255, 0, 0.9)',
                  zIndex: 20,
                }}
              /> */}


            </div>
          )}



          {/* Template Ring - Simplified during shooting for performance */}
          {shootingPhase === 'SHOOTING' && template && bullseyeId && getBullseyeBullet && (
            <div
              style={{
                position: 'absolute',
                left: `${getBullseyeBullet.x * (298/400)}px`,
                top: `${getBullseyeBullet.y * (298/400)}px`,
                width: `${(getTemplateRadius + 2) * 2 * (298/400)}px`,
                height: `${(getTemplateRadius + 2) * 2 * (298/400)}px`,
                border: '2px solid #00ff41',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 25,
                pointerEvents: 'none',
                background: 'rgba(0, 255, 65, 0.1)',
                willChange: 'transform',
              }}
            >
              {/* Bullseye center dot */}
              {/* <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '8px',
                height: '8px',
                backgroundColor: '#ffff00',
                border: '2px solid #000',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 8px rgba(255, 255, 0, 0.9)',
                zIndex: 30,
              }} /> */}


            </div>
          )}

          {/* Bullet Marks - optimized rendering with memoized components */}
          {nonBullseyeBullets && Array.isArray(nonBullseyeBullets) && nonBullseyeBullets.map((bullet) => (
            bullet && bullet.id ? (
              <BulletMark
                key={bullet.id}
                bullet={bullet}
                bullseyeId={bullseyeId}
                onBulletClick={handleBulletClick}
              />
            ) : null
          ))}
          {/* Always render the green bullseye marker last and on top - persists until reset */}
          {getBullseyeBullet && (
            <div
              style={{
                position: 'absolute',
                left: `${getBullseyeBullet.x * (298/400)}px`,
                top: `${getBullseyeBullet.y * (298/400)}px`,
                width: '16px',
                height: '16px',
                backgroundColor: '#008000',
                border: '3px solid #004d00',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                pointerEvents: 'none',
                boxShadow: '0 0 12px 4px rgba(0,128,0,0.7)'
              }}
              title="Bullseye - Click Reset to clear"
            />
          )}
        </div>
      </div>








      {/* Compact Control Panel */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center',
        marginTop: 8
      }}>
        {/* Upload Image Button */}
        <div style={{ position: 'relative' }}>
          <input
            type="file"
            accept="image/*"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
              zIndex: 2
            }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setUploadedImage(event.target?.result);
                };
                reader.readAsDataURL(file);
              }
            }}
            title="Upload custom target image"
          />
          <button
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '32px',
              boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)',
              pointerEvents: 'none' // Let the file input handle the click
            }}
          >
            <span>📸</span>
            <span>{uploadedImage ? 'Change Image' : 'Upload Image'}</span>
          </button>
        </div>

        {/* Clear uploaded image button */}
        {uploadedImage && (
          <button
            onClick={() => setUploadedImage(null)}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '32px',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)'
            }}
            title="Remove uploaded image and use default target"
          >
            <span>🗑️</span>
            <span>Remove Image</span>
          </button>
        )}

        {/* Custom positioning button */}
        {template && !isCustomPositioning && (shootingPhase === 'SHOOTING' || shootingPhase === 'SELECT_BULLSEYE') && bullets.filter(b => !b.isBullseye).length === 0 && (
          <button
            onClick={() => {
              setIsCustomPositioning(true);
              setShootingPhase('SELECT_BULLSEYE');
              // Clear existing bullseye to allow custom positioning
              setBullseyeId(null);
              setBullets(prev => prev.filter(b => !b.isBullseye));
            }}
            style={{
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '32px',
              boxShadow: '0 2px 6px rgba(107, 114, 128, 0.3)'
            }}
            title="Click to set custom target position"
          >
            <span>📍</span>
            <span>Custom Position</span>
          </button>
        )}

        {/* Instructions when in custom positioning mode */}
        {isCustomPositioning && shootingPhase === 'SELECT_BULLSEYE' && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            padding: '6px 8px',
            color: '#2563eb',
            fontWeight: '600',
            textAlign: 'center',
            fontSize: '12px',
            width: '100%',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            📍 Click on target to set custom bullseye position
          </div>
        )}


        {/* Done Firing Button - Only show if parameters are set */}
        {shootingPhase === 'SHOOTING' && nonBullseyeBullets.length > 0 && shootingParameters && (
          <button
            onClick={() => {
              setShootingPhase('DONE');
              setShowResults(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '32px',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
            }}
          >
            <span>✅</span>
            <span>Done Firing</span>
          </button>
        )}

        {/* Always show reset button when bullseye is set */}
        {bullseyeId && (
          <button
            onClick={() => {
              if (onAddHit) {
                onAddHit({ type: 'RESET' });
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '32px',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
            }}
            title="Clear all shots and bullseye"
          >
            <span>🔄</span>
            <span>Reset</span>
          </button>
        )}

        {/* Sync local state with parent lane state after reset */}
        {/* ...existing code... */}

        {shootingPhase === 'DONE' && !bullseyeId && (
          <button
            onClick={() => {
              setBullets([]);
              setBullseyeId(null);
              setShootingPhase('SELECT_BULLSEYE');
              setShowResults(false);
              setUploadedImage(null);
              setShootingParameters(null); // Reset parameters on reset
              setShowParameterForm(false);
              setShowParameterView(false);
              if (onBullseyeSet) {
                onBullseyeSet(null);
              }
              if (onAddHit) {
                onAddHit({ type: 'RESET' });
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '32px',
              boxShadow: '0 2px 6px rgba(107, 114, 128, 0.3)'
            }}
          >
            <span>🔄</span>
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Parameter Form Modal */}
      {showParameterForm && (
        <ShootingParametersForm
          existingParams={shootingParameters}
          onSave={(params) => {
            setShootingParameters(params);
            setShowParameterForm(false);
            // Notify parent about parameters update
            if (onParametersUpdate) {
              onParametersUpdate(laneId, params);
            }
          }}
          onCancel={() => setShowParameterForm(false)}
        />
      )}

      {/* Parameter Viewer Modal */}
      {showParameterView && shootingParameters && (
        <ParameterViewer
          parameters={shootingParameters}
          onClose={() => setShowParameterView(false)}
        />
      )}
    </div>
  );
  } catch (error) {
    console.error('TargetDisplay render error:', error);
    return (
      <div className="modern-target-container">
        <div className="target-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <div className="flex items-center space-x-2">
            <div className="target-icon" style={{ fontSize: 28, color: '#ff6b6b' }}>⚠️</div>
            <span className="target-title" style={{ color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>Error Loading Target</span>
          </div>
          <div style={{ color: '#ff6b6b', fontWeight: 500, fontSize: 14, marginTop: 4 }}>
            Please refresh the page or reset the target
          </div>
        </div>
        <div style={{ padding: 20, textAlign: 'center' }}>
          <button
            className="modern-btn danger"
            onClick={() => window.location.reload()}
            style={{ margin: '0 auto' }}
          >
            <span className="btn-icon">🔄</span>
            <span className="btn-text">Reload Page</span>
          </button>
        </div>
      </div>
    );
  }
});

TargetDisplay.displayName = 'TargetDisplay';

export default TargetDisplay;
