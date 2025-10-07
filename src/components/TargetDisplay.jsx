import { useRef, useState, useEffect, useMemo, useCallback, memo } from 'react';
import { TARGET_TEMPLATES } from './TargetTemplateSelector';
import {
  SESSION_TYPES,
  SESSION_TYPE_OPTIONS,
  FIRING_MODES,
  FIRING_MODE_OPTIONS,
  WEAPON_TYPE_OPTIONS,
  TARGET_TYPE_OPTIONS,
  SHOOTING_POSITION_OPTIONS,
  SHOT_TYPE_OPTIONS,
  ESA_OPTIONS,
  DEFAULT_PARAMETERS,
  getSessionTypeLabel,
  getFiringModeLabel,
  getWeaponTypeLabel,
  getTargetTypeLabel,
  getShootingPositionLabel,
  getShotTypeLabel,
  getESALabel,
  getFilteredFiringModeOptions,
  isFiringModeValidForSessionType,
  calculateZoneScore,
  calculateRingRadii,
  calculateDiameterFromDistance,
  createTemplateFromDistance
} from '../constants/shootingParameters';

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
        zIndex: 40, // Above colored rings, below MPI dot
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
    ...DEFAULT_PARAMETERS,
    // Keep existing snap mode defaults for backward compatibility
    timeLimit: 10,
    snapDisplayTime: 3,
    snapDisappearTime: 2,
    snapCycles: 5,
    snapStartBehavior: existingParams?.snapStartBehavior || 'appear',
    zeroingDistance: 25,
    templateId: '',
    // Custom distance input fields
    useCustomDistance: false,
    customDistance: '',
    windDirection: 0,
    windSpeed: 0,
    movingDirection: 'LTR',
    movingSpeed: 80
  });

  // Handle session type change with firing mode validation
  const handleSessionTypeChange = (newSessionType) => {
    // If current firing mode is not valid for the new session type, reset to Untimed
    const newFiringMode = isFiringModeValidForSessionType(params.firingMode, newSessionType)
      ? params.firingMode
      : FIRING_MODES.UNTIMED;

    setParams({
      ...params,
      sessionType: newSessionType,
      firingMode: newFiringMode
    });
  };

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
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #4f46e5, #06b6d4) border-box',
        border: '2px solid transparent',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '520px',
        width: '90vw',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(6px)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
          background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
          padding: '12px 16px', borderRadius: '10px', color: 'white'
        }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '800', letterSpacing: 0.2 }}>
            🎯 Shooting Parameters
          </h3>
          <button
            onClick={onCancel}
            aria-label="Close"
            title="Close"
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 20, fontWeight: 800, color: 'white'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type of Session */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Type of Session:
            </label>
            <select
              value={params.sessionType}
              onChange={(e) => handleSessionTypeChange(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {SESSION_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Type of Firing Mode */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Type of Firing Mode:
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
              {getFilteredFiringModeOptions(params.sessionType).map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {/* Helper text for filtered options */}
            {(params.sessionType === SESSION_TYPES.GROUPING || params.sessionType === SESSION_TYPES.ZEROING) && (
              <div style={{
                marginTop: '4px',
                fontSize: '12px',
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                ℹ️ {params.sessionType === SESSION_TYPES.GROUPING ? 'Grouping' : 'Zeroing'} sessions support Untimed and Timed modes only
              </div>
            )}
          </div>

          {/* Type of Weapon */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Type of Weapon:
            </label>
            <select
              value={params.weaponType}
              onChange={(e) => setParams({...params, weaponType: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {WEAPON_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Type of Target */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Type of Target:
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
              {TARGET_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Type of Position */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Type of Position:
            </label>
            <select
              value={params.shootingPosition}
              onChange={(e) => setParams({...params, shootingPosition: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {SHOOTING_POSITION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Type of Shot */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Type of Shot:
            </label>
            <select
              value={params.shotType}
              onChange={(e) => setParams({...params, shotType: e.target.value})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {SHOT_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* No of Rounds */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              No of Rounds:
            </label>
            <input
              type="number"
              value={params.numberOfRounds || ''}
              onChange={(e) => setParams({...params, numberOfRounds: parseInt(e.target.value) || null})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              min="1"
              max="100"
              placeholder="Enter number of rounds"
            />
          </div>

          {/* ESA Parameter */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              ESA:
            </label>
            <select
              value={params.esa || ''}
              onChange={(e) => setParams({...params, esa: e.target.value ? parseInt(e.target.value) : null})}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '2px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Select ESA...</option>
              {ESA_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* COMMENTED OUT - Target Distance Parameter
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Target Distance:
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
              {TARGET_DISTANCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          */}

          {/* Moving target settings */}
          {params.firingMode === 'moving' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>Direction</label>
                  <select
                    value={params.movingDirection}
                    onChange={(e)=> setParams({ ...params, movingDirection: e.target.value })}
                    style={{ width:'100%', padding:'8px 12px', border:'2px solid #e5e7eb', borderRadius:6, fontSize:14 }}
                  >
                    <option value="LTR">Left ➜ Right</option>
                    <option value="RTL">Right ➜ Left</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>Speed (px/sec)</label>
                  <input type="number" min="10" step="10" value={params.movingSpeed ?? 80}
                    onChange={(e)=> setParams({ ...params, movingSpeed: Math.max(10, parseInt(e.target.value||'0')) })}
                    style={{ width:'100%', padding:'8px 12px', border:'2px solid #e5e7eb', borderRadius:6, fontSize:14 }} />
                </div>
              </div>
            </div>
          )}




          {/* Snap mode settings */}
          {params.firingMode === 'snap' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>Target display time (s)</label>
                  <input type="number" min="1" step="1" value={params.snapDisplayTime ?? 3}
                    onChange={(e)=> setParams({ ...params, snapDisplayTime: Math.max(1, parseInt(e.target.value||'0')) })}
                    style={{ width:'100%', padding:'8px 12px', border:'2px solid #e5e7eb', borderRadius:6, fontSize:14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>Target disappear time (s)</label>
                  <input type="number" min="0" step="1" value={params.snapDisappearTime ?? 2}
                    onChange={(e)=> setParams({ ...params, snapDisappearTime: Math.max(0, parseInt(e.target.value||'0')) })}
                    style={{ width:'100%', padding:'8px 12px', border:'2px solid #e5e7eb', borderRadius:6, fontSize:14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>Cycles (times target appears)</label>
                  <input type="number" min="1" step="1" value={params.snapCycles ?? 5}
                    onChange={(e)=> setParams({ ...params, snapCycles: Math.max(1, parseInt(e.target.value||'0')) })}
                    style={{ width:'100%', padding:'8px 12px', border:'2px solid #e5e7eb', borderRadius:6, fontSize:14 }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#374151' }}>After countdown:</label>
                  <select
                    value={params.snapStartBehavior || 'appear'}
                    onChange={(e)=> setParams({ ...params, snapStartBehavior: e.target.value })}
                    style={{ width:'100%', padding:'8px 12px', border:'2px solid #e5e7eb', borderRadius:6, fontSize:14 }}
                  >
                    <option value="appear">Show target immediately</option>
                    <option value="disappear">Wait the disappear time, then show</option>
                  </select>
                </div>
              </div>
            </div>
          )}

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
                step="1"
                value={params.timeLimit}
                onChange={(e) => setParams({ ...params, timeLimit: Math.max(1, parseInt(e.target.value || '0')) })}
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

          {/* Rounds field (only for timed mode) */}
          {params.firingMode === 'timed' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                No. of rounds:
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={params.rounds || 1}
                onChange={(e) => {
                  const v = parseInt(e.target.value || '0');
                  setParams({ ...params, rounds: isNaN(v) ? 1 : Math.max(1, Math.floor(v)) });
                }}
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
          {/* <div style={{ marginBottom: '16px' }}>
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
          </div> */}

          {/* Zeroing Distance */}
          {/* <div style={{ marginBottom: '16px' }}>
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
          </div> */}

          {/* Target Distance Selection - Template or Custom */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Select Target Distance:
            </label>

            {/* Distance Type Toggle */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="distanceType"
                  checked={!params.useCustomDistance}
                  onChange={() => setParams({ ...params, useCustomDistance: false, customDistance: '' })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Use Template Distance</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="distanceType"
                  checked={params.useCustomDistance}
                  onChange={() => setParams({ ...params, useCustomDistance: true, templateId: '' })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Enter Custom Distance</span>
              </label>
            </div>

            {/* Template Selection */}
            {!params.useCustomDistance && (
              <select
                value={params.templateId}
                onChange={(e) => setParams({ ...params, templateId: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select template...</option>
                <option value="air-pistol-10m">10m</option>
                <option value="pistol-25m-precision">25m</option>
                <option value="pistol-25m-rapid">50m</option>
                <option value="rifle-50m">100m</option>
                <option value="air-rifle-10m">200m</option>
                <option value="custom">300m</option>
              </select>
            )}

            {/* Custom Distance Input */}
            {params.useCustomDistance && (
              <div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  value={params.customDistance}
                  onChange={(e) => setParams({ ...params, customDistance: e.target.value })}
                  placeholder="Enter distance in meters (e.g., 75)"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}>
                  Ring sizes will scale automatically: larger distances = smaller rings
                </div>
              </div>
            )}
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
const ParameterViewer = ({ parameters, onClose, onEdit }) => {
  const getTemplateName = (templateId) => {
    // Check if using custom distance
    if (parameters.useCustomDistance && parameters.customDistance) {
      const customDistance = parseFloat(parameters.customDistance);
      if (!isNaN(customDistance) && customDistance > 0) {
        const diameter = calculateDiameterFromDistance(customDistance);
        return `${customDistance}m (Custom - ${diameter.toFixed(1)}mm diameter)`;
      }
    }

    // Fallback to template lookup
    const t = TARGET_TEMPLATES.find(tt => tt.id === templateId);
    return t ? t.name : '-';
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
        background: 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #4f46e5, #06b6d4) border-box',
        border: '2px solid transparent',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(6px)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px',
          background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
          padding: '12px 16px', borderRadius: '10px', color: 'white'
        }}>
          <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '800' }}>
            🎯 Current Parameters
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'white',
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
              {getFiringModeLabel(parameters.firingMode)}
            </p>
          </div>

          <div style={{
            padding: '12px',
            background: '#eef2ff',
            borderRadius: '8px',
            border: '1px solid #6366f1'
          }}>
            <label style={{
              display: 'block',
              fontWeight: '600',
              color: '#3730a3',
              marginBottom: '4px'
            }}>
              Session Type:
            </label>
            <p style={{ margin: 0, color: '#1e3a8a' }}>
              {getSessionTypeLabel(parameters.sessionType)}
            </p>
          </div>

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
              Weapon Type:
            </label>
            <p style={{ margin: 0, color: '#047857' }}>
              {getWeaponTypeLabel(parameters.weaponType)}
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
              Target Type:
            </label>
            <p style={{ margin: 0, color: '#78350f' }}>
              {getTargetTypeLabel(parameters.targetType)}
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
              Shooting Position:
            </label>
            <p style={{ margin: 0, color: '#1d4ed8' }}>
              {getShootingPositionLabel(parameters.shootingPosition)}
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
              Shot Type:
            </label>
            <p style={{ margin: 0, color: '#92400e' }}>
              {getShotTypeLabel(parameters.shotType)}
            </p>
          </div>

          {parameters.numberOfRounds && (
            <div style={{
              padding: '12px',
              background: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #22c55e'
            }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#15803d',
                marginBottom: '4px'
              }}>
                Number of Rounds:
              </label>
              <p style={{ margin: 0, color: '#166534' }}>
                {parameters.numberOfRounds}
              </p>
            </div>
          )}

          {parameters.esa && (
            <div style={{
              padding: '12px',
              background: '#eff6ff',
              borderRadius: '8px',
              border: '1px solid #3b82f6'
            }}>
              <label style={{
                display: 'block',
                fontWeight: '600',
                color: '#1d4ed8',
                marginBottom: '4px'
              }}>
                ESA:
              </label>
              <p style={{ margin: 0, color: '#1e40af' }}>
                {getESALabel(parameters.esa)}
              </p>
            </div>
          )}

          {/* Target Distance parameter display removed to match commented out form controls */}

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

          {/* <div style={{
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
          </div> */}

          {/* <div style={{
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
          </div> */}

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
              Select Target Distance:
            </label>
            <p style={{ margin: 0, color: '#92400e' }}>
              {getTemplateName(parameters.templateId)}
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
          justifyContent: 'space-between',
          gap: '12px',
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
          <button
            onClick={() => {
              if (onEdit) onEdit();
            }}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            title="Edit parameters"
          >
            Edit Parameters
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
  onParametersUpdate = null,
  parameters = null
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
  const [shootingParameters, setShootingParameters] = useState(parameters || null);
  const [showParameterView, setShowParameterView] = useState(false);

  // Snap mode state
  const [snapState, setSnapState] = useState('IDLE'); // IDLE | COUNTDOWN | DISPLAY | HIDE | ENDED
  const [snapCycle, setSnapCycle] = useState(0);
  const [snapTimer, setSnapTimer] = useState(0);
  const [snapCountdownSec, setSnapCountdownSec] = useState(0);

  // Timed mode state
  const [timedState, setTimedState] = useState('IDLE'); // IDLE | COUNTDOWN | WINDOW | ENDED
  const [countdownSec, setCountdownSec] = useState(0);
  const [windowSecLeft, setWindowSecLeft] = useState(0);

  // Moving target mode state
  const [movingState, setMovingState] = useState('IDLE'); // IDLE | COUNTDOWN | MOVING | ENDED
  const [movingCountdownSec, setMovingCountdownSec] = useState(0);

  // Moving target state (animation refs)
  const movingAnimRef = useRef(null);
  const movingXRef = useRef(200);
  const lastTsRef = useRef(null);
  const movingDirRef = useRef(1);

  // Keep local parameters in sync with admin-provided parameters prop
  useEffect(() => {
    if (!parameters) return;
    setShootingParameters(parameters);

    // Don't re-initialize if any cycle is already running
    if ((parameters.firingMode !== 'moving') && (timedState !== 'IDLE' || snapState !== 'IDLE')) return;

    if (parameters.firingMode === 'timed') {
      // Ensure bullseye exists at center before starting (so ring is visible)
      if (!bullseyeId) {
        const bull = { id: 'bullseye-center', x: 200, y: 200, timestamp: Date.now(), isBullseye: true };
        setBullets(prev => {
          const nonBull = prev.filter(b => !b.isBullseye);
          return [bull, ...nonBull];
        });
        setBullseyeId('bullseye-center');
      }

      if (!parameters.hasRun) {
        setTimedState('COUNTDOWN');
        setCountdownSec(3);
        setWindowSecLeft(parameters.timeLimit || 10);
        setSnapState('IDLE');
        setSnapCycle(0);
      } else {
        // Already run once; remain idle until user edits parameters or resets
        setCountdownSec(0);
        setWindowSecLeft(parameters.timeLimit || 10);
        setSnapState('IDLE');
        setSnapCycle(0);
      }
      cancelAnimationFrame(movingAnimRef.current || 0);
    } else if (parameters.firingMode === 'moving') {
      // Initialize moving target; run one countdown then a single traverse handled by movingState effect
      cancelAnimationFrame(movingAnimRef.current || 0);
      if (!bullseyeId) {
        const bull = { id: 'bullseye-center', x: 200, y: 200, timestamp: Date.now(), isBullseye: true };
        setBullets(prev => {
          const nonBull = prev.filter(b => !b.isBullseye);
          return [bull, ...nonBull];
        });
        setBullseyeId('bullseye-center');
      }
      setShootingPhase('SHOOTING');
      setMovingState('COUNTDOWN');
      setMovingCountdownSec(3);
    } else if (parameters.firingMode === 'jumper') {
      // Jumper: ensure bullseye and allow free shooting
      cancelAnimationFrame(movingAnimRef.current || 0);
      if (!bullseyeId) {
        const bull = { id: 'bullseye-center', x: 200, y: 200, timestamp: Date.now(), isBullseye: true };
        setBullets(prev => {
          const nonBull = prev.filter(b => !b.isBullseye);
          return [bull, ...nonBull];
        });
        setBullseyeId('bullseye-center');
      }
      setShootingPhase('SHOOTING');
    } else if (parameters.firingMode === 'snap') {
      // Snap mode: ensure bullseye; start with COUNTDOWN only if it hasn't run yet
      cancelAnimationFrame(movingAnimRef.current || 0);
      if (!bullseyeId) {
        const bull = { id: 'bullseye-center', x: 200, y: 200, timestamp: Date.now(), isBullseye: true };
        setBullets(prev => {
          const nonBull = prev.filter(b => !b.isBullseye);
          return [bull, ...nonBull];
        });
        setBullseyeId('bullseye-center');
      }
      setShootingPhase('SHOOTING');

      if (!parameters.hasRun) {
        setSnapCycle(0);
        setSnapState('COUNTDOWN');
        setSnapCountdownSec(3);
        setSnapTimer(0);
      }
      setTimedState('IDLE');
    } else {
      // Default reset
      cancelAnimationFrame(movingAnimRef.current || 0);
      setShootingPhase('SELECT_BULLSEYE');
      setTimedState('IDLE');
      setCountdownSec(0);
      setWindowSecLeft(0);
    }
  }, [parameters, onParametersUpdate, laneId, timedState, bullseyeId, snapState]);

  // Timers for countdown and window
  useEffect(() => {
    // Run timers whenever we are in countdown/window states
    if (!(timedState === 'COUNTDOWN' || timedState === 'WINDOW')) return;

    let countdownTimer = null;
    let windowTimer = null;

    if (timedState === 'COUNTDOWN') {
      console.log('[TargetDisplay] Starting countdown timer');
      // tick down each second
      countdownTimer = setInterval(() => {
        setCountdownSec(prev => {
          console.log('[TargetDisplay] Countdown tick:', prev);
          if (prev <= 1) {
            console.log('[TargetDisplay] Countdown complete, switching to WINDOW');
            clearInterval(countdownTimer);
            setTimedState('WINDOW');
            // Mark as started only after countdown completes
            if (onParametersUpdate && laneId && shootingParameters) {
              try {
                // CRITICAL FIX: Merge hasRun with existing parameters to preserve custom distance settings
                const updatedParams = { ...shootingParameters, hasRun: true };
                setTimeout(() => onParametersUpdate(laneId, updatedParams), 0);
              } catch (_) {}
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timedState === 'WINDOW') {
      console.log('[TargetDisplay] Starting window timer');
      windowTimer = setInterval(() => {
        setWindowSecLeft(prev => {
          console.log('[TargetDisplay] Window tick:', prev);
          if (prev <= 1) {
            console.log('[TargetDisplay] Window complete, switching to ENDED');
            clearInterval(windowTimer);
            setTimedState('ENDED');
            // hide bullseye after time
            setBullseyeId(null);
            setBullets(prevB => prevB.filter(b => !b.isBullseye));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimer) clearInterval(countdownTimer);
      if (windowTimer) clearInterval(windowTimer);
    };
  }, [timedState]);

  // Safety: when the timed window opens, force SHOOTING state and ensure bullseye exists
  useEffect(() => {
    if (timedState !== 'WINDOW') return;
    setShootingPhase('SHOOTING');
    if (!bullseyeId) {
      const bull = { id: 'bullseye-center', x: 200, y: 200, timestamp: Date.now(), isBullseye: true };
      setBullets(prev => {
        const nonBull = prev.filter(b => !b.isBullseye);
        return [bull, ...nonBull];
      });
      setBullseyeId('bullseye-center');
    }
  }, [timedState]);


  // When timed window ends, reveal analytics automatically
  useEffect(() => {
    if (shootingParameters?.firingMode === 'timed' && timedState === 'ENDED') {
      setShowResults(true);
      setShootingPhase('DONE');
    }
  }, [shootingParameters?.firingMode, timedState]);


  // Sync with external hits and bullseye (for lane system) - DISABLED to prevent bullet disappearing

  // Clear local state ONLY on genuine lane reset; avoid clearing when switching tabs
  useEffect(() => {
    console.log('[TargetDisplay] Reset watcher', { hitsLen: hits.length, bullseye, hasTemplate: !!template, hasImage: !!uploadedImage, shooter: !!shooter, localBullets: bullets.length, hasParameters: !!parameters });
    // Do not clear if we still have local bullets; tab switches may not pass hits immediately
    // CRITICAL FIX: Don't clear shooting parameters if we have valid parameters prop (even if template is temporarily null)
    if (!hits.length && !bullseye && !template && !uploadedImage && !shooter && bullets.length === 0 && !parameters) {
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
  }, [hits, bullseye, template, uploadedImage, shooter, bullets.length, parameters]);


  // Sync local state with parent lane state after reset
  useEffect(() => {
    // Only perform a FULL reset when we explicitly get a RESET signal via onAddHit
    // or when everything is truly empty AND there are no local bullets.
    // CRITICAL FIX: Don't clear shooting parameters if we have valid parameters prop (even if template is temporarily null)
    if (!hits.length && !bullseye && !template && !uploadedImage && !shooter && bullets.length === 0 && !parameters) {
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
  }, [hits, bullseye, template, uploadedImage, shooter, bullets.length, parameters]);
  // Snap mode: DISPLAY/HIDE cycle transitions
  useEffect(() => {
    const mode = (shootingParameters?.firingMode || parameters?.firingMode) || null;
    if (mode !== 'snap') return;

    if (!(snapState === 'DISPLAY' || snapState === 'HIDE')) return;

    if (snapTimer > 0) {
      const t = setTimeout(() => setSnapTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }

    const displayTime = Math.max(1, parseInt(shootingParameters?.snapDisplayTime ?? parameters?.snapDisplayTime ?? 3));
    const hideTime = Math.max(0, parseInt(shootingParameters?.snapDisappearTime ?? parameters?.snapDisappearTime ?? 2));
    const totalCycles = Math.max(1, parseInt(shootingParameters?.snapCycles ?? parameters?.snapCycles ?? 5));

    if (snapState === 'DISPLAY') {
      setSnapState('HIDE');
      setSnapTimer(hideTime);
    } else { // HIDE
      const next = snapCycle + 1;
      if (next >= totalCycles) {
        setSnapState('ENDED');
        setShowResults(true);
        setShootingPhase('DONE');
      } else {
        setSnapCycle(next);
        setSnapState('DISPLAY');
        setSnapTimer(displayTime);
      }
    }
  }, [snapState, snapTimer, snapCycle, shootingParameters?.snapDisplayTime, shootingParameters?.snapDisappearTime, shootingParameters?.snapCycles, parameters?.snapDisplayTime, parameters?.snapDisappearTime, parameters?.snapCycles, shootingParameters?.firingMode, parameters?.firingMode]);

  // Snap COUNTDOWN -> DISPLAY and mark hasRun
  useEffect(() => {
    const mode = (shootingParameters?.firingMode || parameters?.firingMode) || null;
    if (mode !== 'snap') return;
    if (snapState !== 'COUNTDOWN') return;

    if (snapCountdownSec > 0) {
      const t = setTimeout(() => setSnapCountdownSec(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    }

    const displayTime = Math.max(1, parseInt(shootingParameters?.snapDisplayTime ?? parameters?.snapDisplayTime ?? 3));
    const hideTime = Math.max(0, parseInt(shootingParameters?.snapDisappearTime ?? parameters?.snapDisappearTime ?? 2));
    const startBehavior = (shootingParameters?.snapStartBehavior ?? parameters?.snapStartBehavior ?? 'appear');

    if (startBehavior === 'disappear') {
      // Start with hidden period, but do NOT count a display yet
      setSnapCycle(-1);
      setSnapState('HIDE');
      setSnapTimer(hideTime);
    } else {
      setSnapState('DISPLAY');
      setSnapTimer(displayTime);
    }
    // mark parameters as hasRun so we don't restart on shots or updates
    if (onParametersUpdate && laneId && shootingParameters) {
      try {
        // CRITICAL FIX: Merge hasRun with existing parameters to preserve custom distance settings
        const updatedParams = { ...shootingParameters, hasRun: true };
        setTimeout(() => onParametersUpdate(laneId, updatedParams), 0);
      } catch (_) {}
    }
  }, [snapState, snapCountdownSec, shootingParameters?.snapDisplayTime, parameters?.snapDisplayTime, shootingParameters?.snapDisappearTime, parameters?.snapDisappearTime, shootingParameters?.snapStartBehavior, parameters?.snapStartBehavior, shootingParameters?.firingMode, parameters?.firingMode]);

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

  // Bullseye handling (timed vs normal)
  useEffect(() => {
    const mode = (shootingParameters?.firingMode || parameters?.firingMode) || null;
    const isTimed = mode === 'timed';

    // Jumper and Untimed modes: do NOT force template/bullseye reset; ensure we can shoot freely
    if (!isTimed && (mode === 'jumper' || mode === 'untimed')) {
      if (!bullseyeId && !isCustomPositioning) {
        const bullseyeBullet = {
          id: 'bullseye-center',
          x: 200,
          y: 200,
          timestamp: Date.now(),
          isBullseye: true
        };
        setBullets(prev => {
          const nonBullseyeBullets = prev.filter(b => !b.isBullseye);
          return [bullseyeBullet, ...nonBullseyeBullets];
        });
        setBullseyeId('bullseye-center');
        setShootingPhase('SHOOTING');
      }
      return;
    }

    // Snap mode: allow shooting without template; ensure bullseye exists
    if (!isTimed && (mode === 'snap' || mode === 'untimed')) {
      if (!bullseyeId && !isCustomPositioning) {
        const bullseyeBullet = {
          id: 'bullseye-center', x: 200, y: 200, timestamp: Date.now(), isBullseye: true
        };
        setBullets(prev => {
          const nonBullseyeBullets = prev.filter(b => !b.isBullseye);
          return [bullseyeBullet, ...nonBullseyeBullets];
        });
        setBullseyeId('bullseye-center');
        setShootingPhase('SHOOTING');
      }
      return;
    }

    // Timed mode: place bullseye at window start regardless of template, so shooting can proceed
    if (isTimed) {
      if (!bullseyeId && !isCustomPositioning && timedState === 'WINDOW') {
        const bullseyeBullet = {
          id: 'bullseye-center',
          x: 200,
          y: 200,
          timestamp: Date.now(),
          isBullseye: true
        };
        setBullets(prev => {
          const nonBullseyeBullets = prev.filter(b => !b.isBullseye);
          return [bullseyeBullet, ...nonBullseyeBullets];
        });
        setBullseyeId('bullseye-center');
        setShootingPhase('SHOOTING');
      }
      return;
    }

    // Non-timed with template: place immediately when not custom positioning
    if (template && !bullseyeId && !isCustomPositioning) {
      const bullseyeBullet = {
        id: 'bullseye-center',
        x: 200,
        y: 200,
        timestamp: Date.now(),
        isBullseye: true
      };
      setBullets(prev => {
        const nonBullseyeBullets = prev.filter(b => !b.isBullseye);
        return [bullseyeBullet, ...nonBullseyeBullets];
      });
      setBullseyeId('bullseye-center');
      setShootingPhase('SHOOTING');
    } else if (template && !bullseyeId && isCustomPositioning) {
      setShootingPhase('SELECT_BULLSEYE');
      setBullets([]);
    }
  }, [template, bullseyeId, isCustomPositioning, shootingParameters?.firingMode, timedState, parameters?.firingMode]);

  // Force bullseye ring re-render when template changes (for snap/timed modes)
  useEffect(() => {
    // If we have a bullseye and the template or templateId changes, force a re-render
    // by updating the bullseye timestamp (this will trigger ring size recalculation)
    if (bullseyeId) {
      setBullets(prev => prev.map(bullet =>
        bullet.isBullseye
          ? { ...bullet, timestamp: Date.now() }
          : bullet
      ));
    }
  }, [template, shootingParameters?.templateId, parameters?.templateId]);

  // Simplified phase management
  useEffect(() => {
    const nonBullseyeBullets = bullets.filter(b => !b.isBullseye);

    if (nonBullseyeBullets.length === 0 && !bullseyeId) {
      setShootingPhase('SELECT_BULLSEYE');
      setShowResults(false);
    } else if (bullseyeId && !isCustomPositioning) {
      // If we have a bullseye and not in custom positioning, we should be in SHOOTING phase
      setShootingPhase('SHOOTING');
    }
  }, [bullets.length, bullseyeId, isCustomPositioning, shootingPhase]);

  // Use ref to track last click timestamp to prevent duplicate clicks at same position
  const lastClickTime = useRef(0);
  const lastClickPosition = useRef({ x: 0, y: 0 });

  const handleTargetClick = useCallback((e) => {
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

    // Prevent duplicate clicks at nearly the same position within a short time window
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;
    const distanceFromLastClick = Math.sqrt(
      Math.pow(x - lastClickPosition.current.x, 2) + Math.pow(y - lastClickPosition.current.y, 2)
    );

    // If click is within 5px of last click and within 100ms, ignore it (likely accidental double-click)
    if (timeSinceLastClick < 100 && distanceFromLastClick < 5) {
      return;
    }

    // Update last click tracking
    lastClickTime.current = now;
    lastClickPosition.current = { x, y };

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
      // Allow shots anywhere on target - including outside green ring for 0-point scoring
      // No validation needed - all shots should be tracked and scored

      // Generate unique ID with better entropy
      const mode = (shootingParameters?.firingMode || parameters?.firingMode) || null;
      const includeInStats = mode === 'moving' ? (movingState === 'MOVING') : true;
      const newBullet = {
        id: `bullet-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        x,
        y,
        timestamp: Date.now(),
        timePhase: typeof timedState === 'string' ? timedState : 'IDLE',
        includeInStats,
        // Add snapState for Snap firing mode scoring logic
        snapState: mode === 'snap' ? snapState : null
      };

      // Debug logging for TIMED mode shot creation
      const isDebugMode = window.location.search.includes('debug=true');
      if (isDebugMode && mode === 'timed') {
        console.log('🎯 TIMED Shot Created:', {
          position: { x, y },
          timePhase: newBullet.timePhase,
          timedState,
          mode,
          timestamp: newBullet.timestamp
        });
      }

      // Use functional update for better performance and consistency
      setBullets(prev => {
        // Ensure we don't duplicate bullets at the same position
        const existingAtPosition = prev.find(b =>
          !b.isBullseye && Math.abs(b.x - x) < 3 && Math.abs(b.y - y) < 3
        );
        // In jumper mode allow repeated shots at nearly the same coordinates
        if (existingAtPosition && mode !== 'jumper') {
          return prev;
        }

        return [...prev, newBullet];
      });

      if (onAddHit) {
        onAddHit(newBullet);
      }
    }
    // Do nothing if shootingPhase === 'DONE' or other phases
    // Do nothing if shootingPhase === 'DONE'
  }, [shootingPhase, onBullseyeSet, onAddHit, shootingParameters?.firingMode, parameters?.firingMode]);

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
    // Get the current parameters (either from shooting or regular parameters)
    const currentParams = shootingParameters || parameters;

    // If we have a template, use its diameter
    if (template) {
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
    }

    // Check for custom distance input first
    if (currentParams?.useCustomDistance && currentParams?.customDistance) {
      const customDistance = parseFloat(currentParams.customDistance);
      if (!isNaN(customDistance) && customDistance > 0) {
        // Create virtual template from custom distance
        const virtualTemplate = createTemplateFromDistance(customDistance);
        if (virtualTemplate) {
          const targetPhysicalWidth = 133; // 13.3 cm in mm
          const targetPixelWidth = 400; // SVG width in pixels
          const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;
          const radius = (virtualTemplate.diameter / 2) * pixelsPerMm;
          return radius;
        }
      }
    }

    // If no custom distance but we have a templateId in parameters, find and use that template
    if (currentParams?.templateId) {
      const selectedTemplate = TARGET_TEMPLATES.find(t => t.id === currentParams.templateId);
      if (selectedTemplate) {
        const targetPhysicalWidth = 133; // 13.3 cm in mm
        const targetPixelWidth = 400; // SVG width in pixels
        const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;
        const radius = (selectedTemplate.diameter / 2) * pixelsPerMm;
        return radius;
      }
    }

    // Default radius when no template is selected
    return 50;
  }, [template, shootingParameters, parameters]);

  // Calculate ESA ring radius based on the green bullseye ring size
  const getESARadius = useMemo(() => {
    // Get the current parameters (either from shooting or regular parameters)
    const currentParams = shootingParameters || parameters;

    // Get the green bullseye ring radius (this is our 100% reference)
    const greenRingRadius = getTemplateRadius;

    // Calculate ESA radius based on ESA parameter
    let esaRadius;
    if (currentParams?.esa && currentParams.esa > 0) {
      // ESA calculation when ESA parameter is set
      const maxESA = 96;
      const minESA = 5;
      const maxRatio = 0.85; // Maximum 85% of green ring
      const minRatio = 0.15; // Minimum 15% of green ring

      // Linear interpolation between min and max ratios
      const esaRatio = minRatio + ((currentParams.esa - minESA) / (maxESA - minESA)) * (maxRatio - minRatio);

      // Calculate ESA radius, ensuring it's always smaller than the green ring
      esaRadius = Math.min(greenRingRadius * esaRatio, greenRingRadius * 0.9);
    } else {
      // Default ESA ring = 70% of green ring when no ESA parameter (matches calculateRingRadii)
      esaRadius = greenRingRadius * 0.7;
    }

    return esaRadius;
  }, [getTemplateRadius, shootingParameters, parameters]);

  // Calculate dark orange circle radius - exactly 25% of ESA ring radius
  const getOrangeCircleRadius = useMemo(() => {
    // ESA radius should always exist now (either from parameter or default 70%)
    if (!getESARadius) {
      return null;
    }

    // Dark orange circle radius = 25% of ESA ring radius
    const orangeRadius = getESARadius * 0.25;

    return orangeRadius;
  }, [getESARadius]);

  // Calculate 6 black ring positions between green bullseye ring and blue concentric ring
  const getBlackRings = useMemo(() => {
    const greenRadius = getTemplateRadius;
    const blueRadius = getOrangeCircleRadius;

    if (!greenRadius || !blueRadius) {
      return [];
    }

    // Calculate the area between blue ring and green ring for black rings
    const availableArea = greenRadius - blueRadius;

    // Create 6 evenly-spaced black rings between blue and green rings
    const numberOfBlackRings = 6;
    const rings = [];

    for (let i = 1; i <= numberOfBlackRings; i++) {
      // Calculate radius for each black ring, evenly distributed
      const ringPosition = i / (numberOfBlackRings + 1); // Positions: 0.143, 0.286, 0.429, 0.571, 0.714, 0.857
      const blackRingRadius = blueRadius + (availableArea * ringPosition);
      rings.push(blackRingRadius);
    }

    return rings;
  }, [getTemplateRadius, getOrangeCircleRadius]);

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

    // Calculate group size using industry standard extreme spread method
    // Group Size = maximum distance between any two shots (center-to-center)
    let groupSize = 0;
    if (shotsToAnalyze.length > 1) {
      for (let i = 0; i < shotsToAnalyze.length; i++) {
        for (let j = i + 1; j < shotsToAnalyze.length; j++) {
          const dx = shotsToAnalyze[i].x - shotsToAnalyze[j].x;
          const dy = shotsToAnalyze[i].y - shotsToAnalyze[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          groupSize = Math.max(groupSize, distance);
        }
      }
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

      // Score-based accuracy calculation using actual ring radii from TargetDisplay
      const totalScore = shotsToAnalyze.reduce((sum, bullet) => {
        // Use the actual ring radii from TargetDisplay calculations
        const bullseyePosition = getBullseyeBullet || { x: 200, y: 200 };
        const ringRadii = {
          greenBullseyeRadius: getTemplateRadius,
          orangeESARadius: getESARadius,
          blueInnerRadius: getOrangeCircleRadius
        };
        return sum + calculateZoneScore(bullet, bullseyePosition, ringRadii);
      }, 0);

      const maxPossibleScore = shotsToAnalyze.length * 3; // 3 points is maximum per shot
      accuracy = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      // Store debug info for visual display
      window.debugAccuracy = {
        templateRadius: visualTemplateRadius,
        templateRadiusMM: visualTemplateRadius * (133/400),
        shotDistance: avgDistanceToReference,
        shotDistanceMM: avgDistanceToReference * (133/400),
        calculatedAccuracy: accuracy,
        totalScore: totalScore,
        maxPossibleScore: maxPossibleScore
      };
    } else {
      // Fallback for no template: use score-based calculation with default ring radii
      const totalScore = shotsToAnalyze.reduce((sum, bullet) => {
        const bullseyePosition = getBullseyeBullet || { x: 200, y: 200 };
        // Use default ring radii when no template is available (consistent with getTemplateRadius default)
        const ringRadii = {
          greenBullseyeRadius: 50,    // Default green ring radius (matches getTemplateRadius default)
          orangeESARadius: 35,        // 70% of green ring (50 * 0.7 = 35)
          blueInnerRadius: 8.75       // 25% of orange ring (35 * 0.25 = 8.75)
        };
        return sum + calculateZoneScore(bullet, bullseyePosition, ringRadii);
      }, 0);

      const maxPossibleScore = shotsToAnalyze.length * 3; // 3 points is maximum per shot
      accuracy = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
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
      const nonBullseyeBullets = bullets.filter(b => !b.isBullseye && (b.includeInStats !== false));

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
        accuracyRating,
        visualRingRadii: {
          greenBullseyeRadius: getTemplateRadius,
          orangeESARadius: getESARadius,
          blueInnerRadius: getOrangeCircleRadius,
          blackRings: getBlackRings
        }
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

            {/* Snap countdown overlay (centered, like timed mode) */}
            {(shootingParameters?.firingMode || parameters?.firingMode) === 'snap' && snapState === 'COUNTDOWN' && (
              <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, pointerEvents: 'none' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{
                    color: '#dc2626',
                    textShadow: '0 4px 14px rgba(0,0,0,0.35)',
                    fontWeight: 900,
                    fontSize: 'min(10vw, 64px)',
                    marginBottom: '12px',
                    letterSpacing: '1px'
                  }}>
                    Starts in
                  </div>
                  <div style={{
                    color: '#dc2626',
                    textShadow: '0 4px 14px rgba(0,0,0,0.35)',
                    fontWeight: 900,
                    fontSize: 'min(18vw, 140px)',
                    lineHeight: 1,
                    letterSpacing: '2px'
                  }}>
                    {snapCountdownSec}
                  </div>
                </div>
              </div>
            )}

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
              <span>{bullets.filter(b => !b.isBullseye && (b.includeInStats !== false)).length} shots</span>
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

          {/* Snap mode status overlay */}
          {(shootingParameters?.firingMode || parameters?.firingMode) === 'snap' && (snapState === 'DISPLAY' || snapState === 'HIDE') && (
            <div style={{ position: 'relative', height: 0 }}>
              <div style={{
                position: 'absolute', top: -36, left: 0, right: 0,
                textAlign: 'center',
                color: snapState === 'DISPLAY' ? '#065f46' : '#dc2626',
                background: snapState === 'DISPLAY' ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${snapState === 'DISPLAY' ? '#10b981' : '#ef4444'}`,
                borderRadius: 6, padding: '4px 8px',
                fontWeight: 700
              }}>
                {snapState === 'DISPLAY' ? '🎯 Target Visible - Fire Now!' : '🚫 Target Hidden - No Points!'}
                {snapTimer > 0 && ` (${snapTimer}s)`}
              </div>
            </div>
          )}

          {/* Auto analytics reveal when timed window ends */}
          {shootingParameters?.firingMode === 'timed' && timedState === 'ENDED' && nonBullseyeBullets.length > 0 && (
            <div style={{ position: 'relative', height: 0 }}>
              <div style={{
                position: 'absolute', top: -36, left: 0, right: 0,
                textAlign: 'center', color: '#111827', background: '#e5e7eb',
                border: '1px solid #9ca3af', borderRadius: 6, padding: '4px 8px',
                fontWeight: 700
              }}>
                Time up — showing analytics below
              </div>

      {/* Moving mode countdown overlay */}
      {(shootingParameters?.firingMode || parameters?.firingMode) === 'moving' && movingState === 'COUNTDOWN' && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, pointerEvents: 'none' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{
              color: '#dc2626', textShadow: '0 4px 14px rgba(0,0,0,0.35)', fontWeight: 900,
              fontSize: 'min(10vw, 64px)', marginBottom: '12px', letterSpacing: '1px'
            }}>
              Starts in
            </div>
            <div style={{ color: '#dc2626', textShadow: '0 4px 14px rgba(0,0,0,0.35)', fontWeight: 900,
              fontSize: 'min(18vw, 140px)', lineHeight: 1, letterSpacing: '2px' }}>
              {movingCountdownSec}
            </div>
          </div>
        </div>
      )}

      {/* Moving mode status overlay during movement */}
      {(shootingParameters?.firingMode || parameters?.firingMode) === 'moving' && movingState === 'MOVING' && (
        <div style={{ position: 'relative', height: 0 }}>
          <div style={{ position: 'absolute', top: -36, left: 0, right: 0, textAlign:'center', color:'#065f46', background:'#ecfdf5', border:'1px solid #10b981', borderRadius:6, padding:'4px 8px', fontWeight:700 }}>
            Moving… fire only when green bullseye is visible
          </div>
        </div>
      )}


            </div>
          )}
        </div>
      </div>

      {/* Timed overlays */}
      {(shootingParameters?.firingMode || parameters?.firingMode) === 'timed' && timedState === 'COUNTDOWN' && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, pointerEvents: 'none' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{
              color: '#dc2626',
              textShadow: '0 4px 14px rgba(0,0,0,0.35)',
              fontWeight: 900,
              fontSize: 'min(10vw, 64px)',
              marginBottom: '12px',
              letterSpacing: '1px'
            }}>
              Starts in
            </div>
            <div style={{
              color: '#dc2626',
              textShadow: '0 4px 14px rgba(0,0,0,0.35)',
              fontWeight: 900,
              fontSize: 'min(18vw, 140px)',
              lineHeight: 1,
              letterSpacing: '2px'
            }}>
              {countdownSec}
            </div>
          </div>
        </div>
      )}

      {/* Rounds display - always visible during timed mode */}
      {(shootingParameters?.firingMode || parameters?.firingMode) === 'timed' && (timedState === 'COUNTDOWN' || timedState === 'WINDOW' || timedState === 'ENDED') && (
        <div style={{ position: 'relative', height: 0 }}>
          <div style={{
            position: 'absolute', top: timedState === 'COUNTDOWN' ? -72 : -36, left: 0, right: 0,
            textAlign: 'center', color: '#374151', background: '#f3f4f6',
            border: '1px solid #9ca3af', borderRadius: 6, padding: '4px 8px',
            fontWeight: 600
          }}>
            Rounds: {shootingParameters?.rounds ?? parameters?.rounds ?? 1}
          </div>
        </div>
      )}
      {(shootingParameters?.firingMode || parameters?.firingMode) === 'timed' && timedState === 'WINDOW' && (
        <div style={{ position: 'relative', height: 0 }}>
          <div style={{
            position: 'absolute', top: -36, left: 0, right: 0,
            textAlign: 'center', color: '#065f46', background: '#ecfdf5',
            border: '1px solid #10b981', borderRadius: 6, padding: '4px 8px',
            fontWeight: 700
          }}>
            Time left: {windowSecLeft}s
          </div>
        </div>
      )}

      {/* Compact instruction banner */}

      {(shootingPhase === 'SELECT_BULLSEYE' || shootingPhase === 'SHOOTING' || (shootingParameters?.firingMode === 'timed' && (timedState === 'COUNTDOWN' || timedState === 'WINDOW'))) && (
        <div style={{
          background: shootingPhase === 'SELECT_BULLSEYE' ? 'rgba(251, 191, 36, 0.1)' :
                     shootingPhase === 'SHOOTING' ? 'rgba(34, 197, 94, 0.1)' :
                     timedState === 'COUNTDOWN' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          border: `1px solid ${shootingPhase === 'SELECT_BULLSEYE' ? '#f59e0b' :
                               shootingPhase === 'SHOOTING' ? '#22c55e' :
                               timedState === 'COUNTDOWN' ? '#f59e0b' : '#22c55e'}`,
          borderRadius: '4px',
          padding: '6px 8px',
          marginBottom: 6,
          textAlign: 'center',
          fontSize: 11,
          color: shootingPhase === 'SELECT_BULLSEYE' ? '#92400e' :
                 shootingPhase === 'SHOOTING' ? '#166534' :
                 timedState === 'COUNTDOWN' ? '#92400e' : '#166534',
          fontWeight: 600
        }}>
          {shootingPhase === 'SELECT_BULLSEYE' ? '🎯 Click target to set bullseye' :
           shootingPhase === 'SHOOTING' ? '🔫 Click to place shots' :
           timedState === 'COUNTDOWN' ? '⏱️ Get ready...' : '🔫 Click to place shots'}
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
            // Show background target image with concentric rings BEFORE parameters are set
            // After parameters are chosen, remove background to show only colored rings
            backgroundImage: (shootingParameters || parameters) ? 'none' :
                           (uploadedImage ? `url('${uploadedImage}')` : `url('${import.meta.env.BASE_URL}target.svg')`),
            backgroundColor: (shootingParameters || parameters) ? '#f0f0f0' : 'transparent',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.90, // Increased opacity for better target visibility while maintaining colored ring prominence
            position: 'relative',
            width: '100%',
            maxWidth: '302px',
            height: '302px',
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
                zIndex: 50, // Highest z-index - always visible on top
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
                zIndex: 10, // Background layer for colored rings
                position: 'absolute',
              }}
            />
          )}

          {/* Template Ring - ALWAYS visible when template is selected */}
          {bullseyeId && getBullseyeBullet && !(((shootingParameters?.firingMode || parameters?.firingMode) === 'snap') && snapState === 'HIDE') && (
            <div
              className="template-ring-always-visible"
              style={{
                left: `${getBullseyeBullet.x * (298/400)}px`,
                top: `${getBullseyeBullet.y * (298/400)}px`,
                width: `${getTemplateRadius * 2 * (298/400)}px`,
                height: `${getTemplateRadius * 2 * (298/400)}px`,
                zIndex: 10, // Background layer for colored rings
                position: 'absolute',
                border: '2px solid #00ff33',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
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

          {/* ESA Blue Ring - Visible when ESA parameter is set and bullseye exists */}
          {bullseyeId && getBullseyeBullet && getESARadius && !(((shootingParameters?.firingMode || parameters?.firingMode) === 'snap') && snapState === 'HIDE') && (
            <div
              className="esa-ring-always-visible"
              style={{
                left: `${getBullseyeBullet.x * (298/400)}px`,
                top: `${getBullseyeBullet.y * (298/400)}px`,
                width: `${getESARadius * 2 * (298/400)}px`,
                height: `${getESARadius * 2 * (298/400)}px`,
                zIndex: 12, // Background layer for colored rings
                position: 'absolute',
                border: '3px solid #ff7700',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Black rings between green bullseye ring and blue concentric ring */}
          {bullseyeId && getBullseyeBullet && getBlackRings && getBlackRings.length > 0 && !(((shootingParameters?.firingMode || parameters?.firingMode) === 'snap') && snapState === 'HIDE') &&
            getBlackRings.map((blackRingRadius, index) => (
              <div
                key={`black-ring-${index}`}
                className="black-ring-always-visible"
                style={{
                  left: `${getBullseyeBullet.x * (298/400)}px`,
                  top: `${getBullseyeBullet.y * (298/400)}px`,
                  width: `${blackRingRadius * 2 * (298/400)}px`,
                  height: `${blackRingRadius * 2 * (298/400)}px`,
                  zIndex: 11, // Between green (10) and orange (12)
                  position: 'absolute',
                  border: '1px solid #000000',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'transparent',
                  pointerEvents: 'none',
                }}
              />
            ))
          }

          {/* Dark Orange Circle - Automatically appears inside ESA ring (25% of ESA radius) */}
          {bullseyeId && getBullseyeBullet && getOrangeCircleRadius && !(((shootingParameters?.firingMode || parameters?.firingMode) === 'snap') && snapState === 'HIDE') && (
            <div
              className="orange-circle-always-visible"
              style={{
                left: `${getBullseyeBullet.x * (298/400)}px`,
                top: `${getBullseyeBullet.y * (298/400)}px`,
                width: `${getOrangeCircleRadius * 2 * (298/400)}px`,
                height: `${getOrangeCircleRadius * 2 * (298/400)}px`,
                zIndex: 14, // Background layer for colored rings
                position: 'absolute',
                border: '3px solid #0077ff',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'transparent',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Template Ring - Simplified during shooting for performance */}
          {shootingPhase === 'SHOOTING' && bullseyeId && getBullseyeBullet && !(((shootingParameters?.firingMode || parameters?.firingMode) === 'snap') && snapState === 'HIDE') && (
            <div
              style={{
                position: 'absolute',
                left: `${getBullseyeBullet.x * (298/400)}px`,
                top: `${getBullseyeBullet.y * (298/400)}px`,
                width: `${(getTemplateRadius + 2) * 2 * (298/400)}px`,
                height: `${(getTemplateRadius + 2) * 2 * (298/400)}px`,
                border: '2px solid #00ff33',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10, // Background layer for colored rings
                pointerEvents: 'none',
                background: 'transparent',
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

          {/* ESA Blue Ring - Simplified during shooting for performance */}
          {shootingPhase === 'SHOOTING' && bullseyeId && getBullseyeBullet && getESARadius && !(((shootingParameters?.firingMode || parameters?.firingMode) === 'snap') && snapState === 'HIDE') && (
            <div
              style={{
                position: 'absolute',
                left: `${getBullseyeBullet.x * (298/400)}px`,
                top: `${getBullseyeBullet.y * (298/400)}px`,
                width: `${getESARadius * 2 * (298/400)}px`,
                height: `${getESARadius * 2 * (298/400)}px`,
                border: '1px solid #ff7700',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 12, // Background layer for colored rings
                pointerEvents: 'none',
                background: 'transparent',
                willChange: 'transform',
              }}
            />
          )}

          {/* Black rings - Simplified during shooting for performance */}
          {shootingPhase === 'SHOOTING' && bullseyeId && getBullseyeBullet && getBlackRings && getBlackRings.length > 0 && !(((shootingParameters?.firingMode || parameters?.firingMode) === 'snap') && snapState === 'HIDE') &&
            getBlackRings.map((blackRingRadius, index) => (
              <div
                key={`black-ring-shooting-${index}`}
                style={{
                  position: 'absolute',
                  left: `${getBullseyeBullet.x * (298/400)}px`,
                  top: `${getBullseyeBullet.y * (298/400)}px`,
                  width: `${blackRingRadius * 2 * (298/400)}px`,
                  height: `${blackRingRadius * 2 * (298/400)}px`,
                  border: '1px solid #000000',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 11, // Between green (10) and orange (12)
                  pointerEvents: 'none',
                  background: 'transparent',
                  willChange: 'transform',
                }}
              />
            ))
          }

          {/* Dark Orange Circle - Simplified during shooting for performance */}
          {shootingPhase === 'SHOOTING' && bullseyeId && getBullseyeBullet && getOrangeCircleRadius && !(((shootingParameters?.firingMode || parameters?.firingMode) === 'snap') && snapState === 'HIDE') && (
            <div
              style={{
                position: 'absolute',
                left: `${getBullseyeBullet.x * (298/400)}px`,
                top: `${getBullseyeBullet.y * (298/400)}px`,
                width: `${getOrangeCircleRadius * 2 * (298/400)}px`,
                height: `${getOrangeCircleRadius * 2 * (298/400)}px`,
                border: '1px solid #0077ff',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 14, // Background layer for colored rings
                pointerEvents: 'none',
                background: 'transparent',
                willChange: 'transform',
              }}
            />
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
          {/* Green bullseye center marker removed - keeping only the ring borders */}
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



        {/* Done Firing (Untimed and Jumper modes) */}
        {(((shootingParameters?.firingMode || parameters?.firingMode) === 'jumper') ||
          ((shootingParameters?.firingMode || parameters?.firingMode) === 'untimed')) &&
         shootingPhase === 'SHOOTING' && nonBullseyeBullets.length > 0 && (
          <button
            onClick={() => { setShowResults(true); setShootingPhase('DONE'); }}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.35)',
              marginLeft: '8px'
            }}
            title="Finalize shooting session and show analytics"
          >
            <span>✅</span>
            <span>Done Firing</span>
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

            // Timed mode: initialize countdown
            if (params?.firingMode === 'timed') {
              setTimedState('COUNTDOWN');
              setCountdownSec(3);
              setWindowSecLeft(params.timeLimit || 10);
              // Stop any moving animation
              cancelAnimationFrame(movingAnimRef.current || 0);
            } else if (params?.firingMode === 'moving') {
              // Initialize Moving Target: show countdown identical to timed, then run single traverse
              setTimedState('IDLE');
              setCountdownSec(0);
              setWindowSecLeft(0);
              setMovingState('COUNTDOWN');
              setMovingCountdownSec(3);
              setShowResults(false);
              setShootingPhase('SHOOTING');
              // Ensure green bullseye exists
              setBullets(prev => {
                const hasBull = prev.some(b => b.isBullseye);
                if (hasBull) return prev;
                return [{ id: 'bullseye-center', x: 200, y: 200, timestamp: Date.now(), isBullseye: true }, ...prev];
              });
              setBullseyeId('bullseye-center');
              cancelAnimationFrame(movingAnimRef.current || 0);
            } else {
              // Reset timed/moving state when not in those modes
              setTimedState('IDLE');
              setCountdownSec(0);
              setWindowSecLeft(0);
              setMovingState('IDLE');
              setMovingCountdownSec(0);
              cancelAnimationFrame(movingAnimRef.current || 0);
            }

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
          onEdit={() => {
            setShowParameterView(false);
            setShowParameterForm(true);
          }}
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
