import { useState, useCallback, memo } from 'react';
import TargetDisplay from './TargetDisplay';
import ShotBreakdown from './ShotBreakdown';
import FinalReport from './FinalReport';
import TargetTemplateSelector from './TargetTemplateSelector';

const LanePanel = memo(({ laneId, lane, onUpdateLane }) => {
  const [shooterName, setShooterName] = useState(lane.shooter);
  const [analyticsData, setAnalyticsData] = useState(null);

  const handleShooterAssignment = () => {
    if (shooterName.trim()) {
      onUpdateLane(laneId, { 
        shooter: shooterName.trim(),
        message: '👤 Shooter Ready'
      });
    }
  };

  const handleShooterNameChange = (e) => {
    setShooterName(e.target.value);
  };

  const handleTemplateChange = (template) => {
    onUpdateLane(laneId, { 
      template,
      message: '🔒 Target Locked'
    });
  };

  const handleBullseyeSet = useCallback((bullseye) => {
    onUpdateLane(laneId, {
      bullseye,
      message: '📍 Target Acquired'
    });
  }, [laneId, onUpdateLane]);

  const handleAddHit = useCallback((hit) => {
    // Handle reset signal from TargetDisplay
    if (hit && hit.type === 'RESET') {
      onUpdateLane(laneId, {
        hits: [],
        bullseye: null,
        message: '🎯 Target Reset'
      });
      return;
    }

    const newHits = [...lane.hits, hit];
    onUpdateLane(laneId, {
      hits: newHits,
      message: '🎯 Hit Registered'
    });

    // Show calculating message after a few shots
    if (newHits.length >= 3) {
      setTimeout(() => {
        onUpdateLane(laneId, {
          hits: newHits,
          message: '🧠 Calculating Score...'
        });
      }, 1000);
    }
  }, [lane.hits, laneId, onUpdateLane]);

  const handleAnalyticsUpdate = useCallback((data) => {
    setAnalyticsData(data);
  }, []);

  const simulateShot = () => {
    if (!lane.shooter) {
      onUpdateLane(laneId, { message: '⚠️ No Shooter Assigned' });
      return;
    }

    // Show "firing" message first
    onUpdateLane(laneId, { message: '🔥 FIRING...' });

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

  return (
    <div className={`lane-panel ${lane.enabled ? 'active' : 'inactive'}`}>
      {/* Lane Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-shooter-accent">
          {laneId.toUpperCase()}
        </h3>
        <div className={`text-sm font-bold font-mono ${lane.enabled ? 'lane-status-active' : 'lane-status-inactive'}`}>
          {lane.enabled ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>

      {/* All components in single horizontal line */}
      <div className="all-components-single-line ">
        <div className="shooter-assignment-inline">
          {lane.shooter ? (
            <span
              className="shooter-assigned-inline"
              style={{
                fontWeight: 700,
                color: '#2563eb',
                fontSize: 16,
                padding: '8px 16px',
                background: 'rgba(37,99,235,0.07)',
                borderRadius: 8,
                display: 'inline-block',
                letterSpacing: 1,
              }}
            >
              ASSIGNED SHOOTER: {lane.shooter}
            </span>
          ) : (
            <>
              <label className="label-compact-inline ">
                Shooter Assignment
              </label>
              <input
                type="text"
                value={shooterName}
                onChange={handleShooterNameChange}
                placeholder="Name"
                className="input-field-compact-inline "
              />
              <button
                onClick={handleShooterAssignment}
                className="btn-primary btn-compact-inline"
                disabled={!shooterName.trim()}
              >
                ASSIGN
              </button>
            </>
          )}
        </div>

        <div className="template-section-inline">
          <TargetTemplateSelector
            selectedTemplate={lane.template}
            onTemplateChange={handleTemplateChange}
          />
        </div>
      </div>

      {/* Two-column layout: Target Display and Performance Analytics */}
      <div className="target-analytics-grid">
        <div className="target-display-column">
          <TargetDisplay
            hits={lane.hits}
            bullseye={lane.bullseye}
            template={lane.template}
            onBullseyeSet={handleBullseyeSet}
            onAddHit={handleAddHit}
            onAnalyticsUpdate={handleAnalyticsUpdate}
          />

          {/* Controls moved inside target display column */}
          <div className="lane-controls-center mt-4" style={{ justifyContent: 'center' }}>
            <button
              onClick={simulateShot}
              className="btn-secondary"
              disabled={!lane.shooter}
              style={{ width: '180px', fontSize: '15px', padding: '10px 0', margin: '0 auto', display: 'block' }}
            >
              SIMULATE SHOT
            </button>
          </div>
        </div>

        <div className="performance-analytics-column">
          {/* Performance Analytics will be always visible */}
          <div className="performance-analytics-container">
            <div className="performance-analytics-header">
              <h3 className="performance-analytics-title">Performance Analytics</h3>
            </div>
            <div className="performance-analytics-content">
              {/* Always show the complete analytics layout */}
              <div className="blue-stats-content">
                <div className="blue-stats-grid">
                  <div className="blue-stat-card blue-primary">
                    <div className="blue-stat-icon">📍</div>
                    <div className="blue-stat-content">
                      <div className="blue-stat-label">MPI</div>
                      <div className="blue-stat-value">
                        {analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults ?
                          analyticsData.stats.mpi.toFixed(1) : '-'}
                      </div>
                      <div className="blue-stat-unit">mm</div>
                    </div>
                    <div className="blue-stat-description">Mean Point of Impact</div>
                  </div>

                  <div className="blue-stat-card blue-secondary">
                    <div className="blue-stat-icon">🎯</div>
                    <div className="blue-stat-content">
                      <div className="blue-stat-label">Accuracy</div>
                      <div className="blue-stat-value">
                        {analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults ?
                          analyticsData.stats.accuracy.toFixed(1) : '-'}
                      </div>
                      <div className="blue-stat-unit">%</div>
                    </div>
                    <div className={`blue-accuracy-badge ${analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults ?
                      (analyticsData.accuracyRating?.class || 'good') : 'pending'}`}>
                      {analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults ?
                        (analyticsData.accuracyRating?.rating || 'Good') : 'PENDING'}
                    </div>
                  </div>
                </div>

                <div className="blue-detailed-stats">
                  <div className="blue-detail-row">
                    <span className="blue-detail-label">📏 Max Distance</span>
                    <span className="blue-detail-value">
                      {analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults ?
                        `${analyticsData.stats.maxDistance.toFixed(1)} mm` : '- mm'}
                    </span>
                  </div>
                  <div className="blue-detail-row">
                    <span className="blue-detail-label">🎯 Group Size</span>
                    <span className="blue-detail-value">
                      {analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults ?
                        `${analyticsData.stats.groupSize.toFixed(1)} mm` : '- mm'}
                    </span>
                  </div>
                  <div className="blue-detail-row">
                    <span className="blue-detail-label">🔢 Shots Analyzed</span>
                    <span className="blue-detail-value">
                      {analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults ?
                        analyticsData.bullets.length : '-'}
                    </span>
                  </div>
                  <div className="blue-detail-row">
                    <span className="blue-detail-label">⊕ True MPI</span>
                    <span className="blue-detail-value">
                      {analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults && analyticsData.stats.mpiCoords ?
                        `(${Math.round(analyticsData.stats.mpiCoords.x - 200)}, ${Math.round(200 - analyticsData.stats.mpiCoords.y)})` : '(-, -)'}
                    </span>
                  </div>
                  <div className="blue-detail-row">
                    <span className="blue-detail-label">📍 Reference Point</span>
                    <span className="blue-detail-value">
                      {analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults && analyticsData.stats.referenceCoords ?
                        `(${Math.round(analyticsData.stats.referenceCoords.x - 200)}, ${Math.round(200 - analyticsData.stats.referenceCoords.y)})` : '(-, -)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Shooting Results - Full Width Rectangle */}
      {analyticsData && analyticsData.shootingPhase === 'DONE' && analyticsData.showResults && analyticsData.bullets.length > 0 && (
        <div className="shooting-results-full-width mb-6">
          <div className="shooting-results-header">
            <h3 className="shooting-results-title">🎯 Shooting Results</h3>
          </div>
          <div className="shooting-results-content">
            <div className="shooting-results-grid">
              <div className="result-stat-card">
                <div className="result-stat-icon">📍</div>
                <div className="result-stat-content">
                  <div className="result-stat-label">MPI</div>
                  <div className="result-stat-value">{analyticsData.stats.mpi.toFixed(1)}</div>
                  <div className="result-stat-unit">mm</div>
                </div>
                <div className="result-stat-description">Mean Point of Impact</div>
              </div>

              <div className="result-stat-card">
                <div className="result-stat-icon">🎯</div>
                <div className="result-stat-content">
                  <div className="result-stat-label">Accuracy</div>
                  <div className="result-stat-value">{analyticsData.stats.accuracy.toFixed(1)}</div>
                  <div className="result-stat-unit">%</div>
                </div>
                <div className={`result-accuracy-badge ${analyticsData.accuracyRating?.class || 'good'}`}>
                  {analyticsData.accuracyRating?.rating || 'Good'}
                </div>
              </div>

              <div className="result-stat-card">
                <div className="result-stat-icon">📏</div>
                <div className="result-stat-content">
                  <div className="result-stat-label">Max Distance</div>
                  <div className="result-stat-value">{analyticsData.stats.maxDistance.toFixed(1)}</div>
                  <div className="result-stat-unit">mm</div>
                </div>
                <div className="result-stat-description">Furthest Shot</div>
              </div>

              <div className="result-stat-card">
                <div className="result-stat-icon">🎯</div>
                <div className="result-stat-content">
                  <div className="result-stat-label">Group Size</div>
                  <div className="result-stat-value">{analyticsData.stats.groupSize.toFixed(1)}</div>
                  <div className="result-stat-unit">mm</div>
                </div>
                <div className="result-stat-description">Shot Grouping</div>
              </div>

              <div className="result-stat-card">
                <div className="result-stat-icon">🔢</div>
                <div className="result-stat-content">
                  <div className="result-stat-label">Shots</div>
                  <div className="result-stat-value">{analyticsData.bullets.length}</div>
                  <div className="result-stat-unit">total</div>
                </div>
                <div className="result-stat-description">Shots Analyzed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Report Section */}
      <div className="final-report-section mb-6">
        <FinalReport
          shooter={lane.shooter}
          hits={lane.hits}
          bullseye={lane.bullseye}
          template={lane.template}
        />
      </div>

      {/* Shot Breakdown Section - separate component */}
      <div className="shot-breakdown-section">
        <ShotBreakdown
          shooter={lane.shooter}
          hits={lane.hits}
          bullseye={lane.bullseye}
          template={lane.template}
          shootingParameters={lane.parameters}
          visualRingRadii={analyticsData?.visualRingRadii}
        />
      </div>
    </div>
  );
});

LanePanel.displayName = 'LanePanel';

export default LanePanel;
