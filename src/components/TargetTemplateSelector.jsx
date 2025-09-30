export const TARGET_TEMPLATES = [
  {
    id: 'air-pistol-10m',
    name: '10m',
    diameter: 130,
    distance: '10m',
    caliber: '4.5mm air pistol',
    description: 'Standard 10-ring target for air pistol competition'
  },
  {
    id: 'pistol-25m-precision',
    name: '25m',
    diameter: 120,
    distance: '25m',
    caliber: '.22 LR rimfire',
    description: 'Precision pistol target for 25m competition'
  },
  {
    id: 'pistol-25m-rapid',
    name: '50m',
    diameter: 110,
    distance: '50m',
    caliber: '.22 Short',
    description: 'Rapid fire pistol target'
  },
  {
    id: 'rifle-50m',
    name: '100m',
    diameter: 100,
    distance: '100m',
    caliber: '.22 LR',
    description: 'Small bore rifle target for 50m'
  },
  // {
  //   id: 'rifle-100m',
  //   name: '200m',
  //   diameter: 90,
  //   distance: '200m',
  //   caliber: '.22 LR',
  //   description: 'Standard rifle target for 100m'
  // },
  {
    id: 'air-rifle-10m',
    name: '200m',
    diameter: 90,
    distance: '200m',
    caliber: '7.62mm',
    description: 'Long range rifle target for 200m'
  },
  {
    id: 'custom',
    name: '300m',
    diameter: 80,
    distance: 'Variable',
    caliber: 'Various',
    description: 'Custom target configuration'
  },
  // {
  //   id: 'custom 1',
  //   name: 'Custom Target 1',
  //   diameter: 30,
  //   distance: '50m',
  //   caliber: 'Various',
  //   description: 'Custom target configuration'
  // }
];

const TargetTemplateSelector = ({ selectedTemplate, onTemplateChange, disabled = false, compact = false, isMobile = false }) => {
  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    if (templateId) {
      const template = TARGET_TEMPLATES.find(t => t.id === templateId);
      onTemplateChange(template);
    } else {
      onTemplateChange(null);
    }
  };

  // Compact mode for AdminDashboard
  if (compact) {
    return (
      <button
        onClick={() => {
          // Simple cycling through templates for compact mode
          const currentIndex = selectedTemplate ? TARGET_TEMPLATES.findIndex(t => t.id === selectedTemplate.id) : -1;
          const nextIndex = (currentIndex + 1) % TARGET_TEMPLATES.length;
          const nextTemplate = TARGET_TEMPLATES[nextIndex];
          onTemplateChange(nextTemplate);
        }}
        disabled={disabled}
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: isMobile ? '6px 12px' : '8px 16px',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: '600',
          borderRadius: '6px',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
          height: '32px'
        }}
        title={selectedTemplate ? `Current: ${selectedTemplate.name}. Click to cycle templates.` : 'Click to select template'}
      >
        📋 {selectedTemplate ? 'CHANGE' : 'SELECT'}
      </button>
    );
  }

  // Full mode for other components
  return (
    <div className="template-selector-wrapper">
      {/* Single line layout: Label, Dropdown and template details */}
      <div className="template-single-line-layout">
        <div className="template-label-dropdown-section">
          <label className="label-compact template-label-inline">
            Target Template
          </label>
          <select
            value={selectedTemplate?.id || ''}
            onChange={handleTemplateSelect}
            className="select-field-compact"
            disabled={disabled}
          >
            <option value="">Select Target Template...</option>
            {TARGET_TEMPLATES.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.diameter}mm @ {template.distance}
              </option>
            ))}
          </select>
        </div>

        <div className="template-details-inline">
          <div className="template-detail-item">
            <span className="template-label">Distance:</span>
            <span className="template-value">
              {selectedTemplate ? selectedTemplate.distance : '-'}
            </span>
          </div>
          <div className="template-detail-item">
            <span className="template-label">Diameter:</span>
            <span className="template-value-accent">
              {selectedTemplate ? `${selectedTemplate.diameter}mm` : '-'}
            </span>
          </div>
          <div className="template-detail-item">
            <span className="template-label">Caliber:</span>
            <span className="template-value">
              {selectedTemplate ? selectedTemplate.caliber : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetTemplateSelector;
