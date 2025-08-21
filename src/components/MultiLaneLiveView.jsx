import React, { useState } from 'react';
import TargetDisplay from './TargetDisplay';
import TargetTemplateSelector from './TargetTemplateSelector';



// Multi Target live page: three independent targets, one shared shooter, shared template
const MultiLaneLiveView = () => {
  // Single shooter for all three targets
  const [shooter, setShooter] = useState('');
  // One template applied to all targets
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isAssigned, setIsAssigned] = useState(false);
  // Per-target state
  const [targets, setTargets] = useState([
    { id: 'target1', hits: [], bullseye: null, parameters: null, uploadedImage: null },
    { id: 'target2', hits: [], bullseye: null, parameters: null, uploadedImage: null },
    { id: 'target3', hits: [], bullseye: null, parameters: null, uploadedImage: null }
  ]);
  const [analytics, setAnalytics] = useState({}); // per-target analytics

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
  };

  const updateTarget = (idx, patch) => {
    setTargets(prev => prev.map((t, i) => i === idx ? { ...t, ...patch } : t));
  };

  const handleAddHit = (idx, hit) => {
    if (hit && hit.type === 'RESET') {
      updateTarget(idx, { hits: [], bullseye: null, uploadedImage: null, parameters: null });
      return;
    }
    updateTarget(idx, { hits: [...targets[idx].hits, hit] });
  };

  const handleBullseyeSet = (idx, bullseye) => updateTarget(idx, { bullseye });
  const handleParametersUpdate = (idx, _laneId, params) => updateTarget(idx, { parameters: params });
  const handleAnalyticsUpdate = (idx, data) => setAnalytics(prev => ({ ...prev, [targets[idx].id]: data }));

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
        /* Hide everything after the target area (upload/delete/reset/params/results/etc.) */
        .multi-target-mode .modern-target-container > div:nth-child(n+4) { display: none !important; }
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

        {/* Template selector shared across all targets */}
        <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: 8, padding: '6px 10px' }}>
          <TargetTemplateSelector selectedTemplate={selectedTemplate} onTemplateChange={handleTemplateChange} />
        </div>
      </div>

      {/* Targets grid: 3 across on white background */}
      {/* White panel on black background */}
      <div style={{ background: '#ffffff', padding: 8, borderRadius: 8, maxWidth: 940, margin: '10px auto' }}>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(3, 298px)', justifyContent: 'center', alignItems: 'start' }}>
          {targets.map((t, idx) => (
            <div key={t.id} style={{ background: 'transparent', width: 298, margin: '0 4px', border: 'none' }}>
              <TargetDisplay
                hits={t.hits}
                bullseye={t.bullseye}
                template={selectedTemplate}
                laneId={t.id}
                uploadedImage={t.uploadedImage}
                parameters={t.parameters}
                shooter={shooter}
                onBullseyeSet={(pt) => handleBullseyeSet(idx, pt)}
                onAddHit={(hit) => handleAddHit(idx, hit)}
                onAnalyticsUpdate={(data) => handleAnalyticsUpdate(idx, data)}
                onParametersUpdate={(_laneId, params) => handleParametersUpdate(idx, _laneId, params)}
                onImageUpload={(img) => updateTarget(idx, { uploadedImage: img })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MultiLaneLiveView;
