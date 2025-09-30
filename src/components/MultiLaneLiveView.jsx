import React, { useState } from 'react';
import TargetDisplay from './TargetDisplay';
import TargetTemplateSelector from './TargetTemplateSelector';
import ShotBreakdown from './ShotBreakdown';
import FinalReport from './FinalReport';
import ShooterStats from './ShooterStats';



// Multi Target live page: three independent targets, one shared shooter, shared template
const MultiLaneLiveView = () => {
  // Single shooter for all three targets
  const [shooter, setShooter] = useState('');
  // One template applied to all targets
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isAssigned, setIsAssigned] = useState(false);
  // Per-target state
  const [targets, setTargets] = useState([
    { id: 'target1', hits: [], bullseye: null, uploadedImage: null },
    { id: 'target2', hits: [], bullseye: null, uploadedImage: null },
    { id: 'target3', hits: [], bullseye: null, uploadedImage: null }
  ]);
  const [sharedParameters, setSharedParameters] = useState(null); // one parameter set across all targets
  const [showResults, setShowResults] = useState(false); // controls analytics panels

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
  };

  const updateTarget = (idx, patch) => {
    setTargets(prev => prev.map((t, i) => i === idx ? { ...t, ...patch } : t));
  };

  const handleAddHit = (idx, hit) => {
    if (hit && hit.type === 'RESET') {
      // Do not clear parameters here since parameters are shared across all targets
      updateTarget(idx, { hits: [], bullseye: null, uploadedImage: null });
      return;
    }
    updateTarget(idx, { hits: [...targets[idx].hits, hit] });
  };

  const handleBullseyeSet = (idx, bullseye) => updateTarget(idx, { bullseye });
  // When any TargetDisplay saves parameters, update shared and reflect to all
  const handleParametersUpdate = (_idx, _laneId, params) => {
    setSharedParameters(params);
    setTargets(prev => prev.map(t => ({ ...t })));
  };

  const openParameterFor = (laneId) => {
    const targetContainer = document.querySelector(`[data-lane-id="${laneId}"]`);
    if (targetContainer) {
      const event = new CustomEvent('openParameterForm', {
        detail: { laneId },
        bubbles: true,
        cancelable: true
      });
      targetContainer.dispatchEvent(event);
    }
  };

  return (
    <div className="multi-target-mode" style={{ padding: 16, background: '#000000', minHeight: '100vh' }}>
      {/* Hide TargetDisplay chrome ONLY on this page */}
      <style>{`
        /* Header bar (lane title + shots badge) */
        .multi-target-mode .modern-target-container > div:first-child { display: none !important; }
        /* Instruction banner */
        .multi-target-mode .modern-target-container > div:nth-child(2) { display: none !important; }
        /* Target wrapper (remove black background/padding) */
        .multi-target-mode .modern-target-container > div:nth-child(3) {
          background: transparent !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin-bottom: 0 !important;
          box-shadow: none !important;
        }
        /* Hide everything after the target area except modal overlays */
        .multi-target-mode .modern-target-container > div:nth-child(n+4) { display: none !important; }
        /* Re-enable parameter/viewer modal overlays which use inline position: fixed */
        /* Use flex so modals remain centered */
        .multi-target-mode .modern-target-container > div[style*="position: fixed"] {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        /* Ensure target area itself is visible and clickable */
        .multi-target-mode .modern-target-container .modern-target-area {
          display: block !important;
          pointer-events: auto !important;
          position: relative;
          z-index: 1;
          width: 298px !important;
          height: 298px !important;
          margin: 0 auto !important;
        }
        /* Prevent overlay elements from blocking clicks */
        .multi-target-mode .modern-target-container .template-preview-ring,
        .multi-target-mode .modern-target-container .template-ring-always-visible,
        .multi-target-mode .modern-target-container .mpi-indicator {
          pointer-events: none !important;
        }
      `}</style>

      {/* Top controls: shooter (shared) + template (shared) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        background: '#ffffff',
        border: 'none',
        borderRadius: 8,
        padding: '8px 12px',
        marginBottom: 8
      }}>
        {/* Shooter assignment - single for all three */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: '#111827', fontWeight: 600 }}>Shooter:</label>
          <input
            value={shooter}
            onChange={(e) => setShooter(e.target.value)}
            placeholder="Enter shooter name"
            readOnly={isAssigned}
            style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1',
              background: isAssigned ? '#f3f4f6' : '#ffffff', color: '#111827', outline: 'none', minWidth: 220,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          />
          <button
            onClick={() => setIsAssigned(prev => !prev)}
            style={{
              padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: isAssigned ? '#ef4444' : '#2563eb', color: '#fff', fontWeight: 700
            }}
            title={isAssigned ? 'Unassign shooter' : 'Assign shooter'}
          >
            {isAssigned ? 'Unassign' : 'Assign'}
          </button>
        </div>

        {/* Template selector and shared parameters button */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 8,
          padding: '6px 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 8
        }}>
          <TargetTemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={handleTemplateChange} />
          <button
            onClick={() => openParameterFor('target1')}
            style={{
              background: sharedParameters
                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              alignSelf: 'flex-end',
              boxShadow: sharedParameters
                ? '0 2px 6px rgba(59, 130, 246, 0.3)'
                : '0 2px 6px rgba(5, 150, 105, 0.3)'
            }}
            title={sharedParameters ? 'Get Shooting Parameters' : 'Set Shooting Parameters'}
          >
            <span style={{ marginRight: 6 }}>{sharedParameters ? '👁️' : '⚙️'}</span>
            {sharedParameters ? 'GET PARAMETER' : 'SET PARAMETER'}
          </button>
        </div>
      </div>



      {/* Targets grid: 3 across on white background */}
      {/* White panel on black background */}
      <div style={{ background: '#ffffff', padding: 8, borderRadius: 8, maxWidth: 940, margin: '10px auto' }}>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, 298px)', justifyContent: 'center', alignItems: 'start' }}>
          {targets.map((t, idx) => (
            <div key={t.id} style={{ background: 'transparent', width: 298, margin: '0 4px', border: 'none' }}>
              <div style={{
                textAlign: 'center',
                fontWeight: 700,
                color: '#111827',
                margin: '4px 0 6px 0',
                fontSize: 14
              }}>
                {`Target ${idx + 1}`}
              </div>
              <TargetDisplay
                hits={t.hits}
                bullseye={t.bullseye}
                template={selectedTemplate}
                laneId={t.id}
                uploadedImage={t.uploadedImage}
                parameters={sharedParameters}
                shooter={shooter}
                onBullseyeSet={(pt) => handleBullseyeSet(idx, pt)}
                onAddHit={(hit) => handleAddHit(idx, hit)}
                onParametersUpdate={(_laneId, params) => handleParametersUpdate(idx, _laneId, params)}
                onImageUpload={(img) => updateTarget(idx, { uploadedImage: img })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions row: Done Firing + Reset (single for all three) - placed BELOW targets */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        background: '#ffffff',
        borderRadius: 8,
        padding: '8px 12px',
        margin: '8px auto',
        maxWidth: 940
      }}>
        <button
          onClick={() => setShowResults(true)}
          disabled={targets.every(t => t.hits.filter(h => !h.isBullseye).length === 0) || !sharedParameters}
          style={{
            background: (targets.some(t => t.hits.filter(h => !h.isBullseye).length > 0) && sharedParameters)
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : '#9ca3af',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 14,
            fontWeight: 700,
            cursor: (targets.some(t => t.hits.filter(h => !h.isBullseye).length > 0) && sharedParameters) ? 'pointer' : 'not-allowed',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)'
          }}
          title="Show analytics after shooting"
        >
          ✅ Done Firing
        </button>
        <button
          onClick={() => {
            // Clear all per-target data
            setTargets(prev => prev.map(t => ({ ...t, hits: [], bullseye: null, uploadedImage: null })));
            // Clear shared state
            setShooter('');
            setIsAssigned(false);
            setSelectedTemplate(null);
            setSharedParameters(null);
            // Hide results
            setShowResults(false);
          }}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
          }}
          title="Reset all targets"
        >
          ♻️ Reset
        </button>
      </div>


      {/* Results section - appears only when Done Firing pressed */}
      {showResults && (
        <div style={{ background: '#ffffff', padding: 8, borderRadius: 8, maxWidth: 940, margin: '10px auto' }}>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {/* Target 1 */}
            <div>
              <ShooterStats
                title="Performance Analytics (T1)"
                shooter={shooter}
                hits={targets[0]?.hits || []}
                bullseye={targets[0]?.bullseye || null}
                template={selectedTemplate}
              />
            </div>
            <div>
              <ShotBreakdown
                shooter={shooter}
                hits={targets[0]?.hits || []}
                bullseye={targets[0]?.bullseye || null}
                template={selectedTemplate}
                shootingParameters={sharedParameters}
              />
            </div>
            <div>
              <FinalReport
                shooter={shooter}
                hits={targets[0]?.hits || []}
                bullseye={targets[0]?.bullseye || null}
                template={selectedTemplate}
              />
            </div>

            {/* Target 2 */}
            <div>
              <ShooterStats
                title="Performance Analytics (T2)"
                shooter={shooter}
                hits={targets[1]?.hits || []}
                bullseye={targets[1]?.bullseye || null}
                template={selectedTemplate}
              />
            </div>
            <div>
              <ShotBreakdown
                shooter={shooter}
                hits={targets[1]?.hits || []}
                bullseye={targets[1]?.bullseye || null}
                template={selectedTemplate}
                shootingParameters={sharedParameters}
              />
            </div>
            <div>
              <FinalReport
                shooter={shooter}
                hits={targets[1]?.hits || []}
                bullseye={targets[1]?.bullseye || null}
                template={selectedTemplate}
              />
            </div>




            {/* Target 3 */}
            <div>
              <ShooterStats
                title="Performance Analytics (T3)"
                shooter={shooter}
                hits={targets[2]?.hits || []}
                bullseye={targets[2]?.bullseye || null}
                template={selectedTemplate}
              />
            </div>
            <div>
              <ShotBreakdown
                shooter={shooter}
                hits={targets[2]?.hits || []}
                bullseye={targets[2]?.bullseye || null}
                template={selectedTemplate}
                shootingParameters={sharedParameters}
              />
            </div>
            <div>
              <FinalReport
                shooter={shooter}
                hits={targets[2]?.hits || []}
                bullseye={targets[2]?.bullseye || null}
                template={selectedTemplate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiLaneLiveView;
