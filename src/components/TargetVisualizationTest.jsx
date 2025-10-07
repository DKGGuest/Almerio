import React, { useState } from 'react';
import TargetVisualization from './TargetVisualization';
import { TARGET_TEMPLATES } from './TargetTemplateSelector';

const TargetVisualizationTest = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(TARGET_TEMPLATES[0]);
  const [esaValue, setEsaValue] = useState(30);

  // Create mock session parameters
  const sessionParameters = {
    template_id: selectedTemplate.id,
    template_name: selectedTemplate.name,
    esa: esaValue
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 Target Visualization Test - Black Rings Enhancement</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Target Distance Template:
          </label>
          <select 
            value={selectedTemplate.id} 
            onChange={(e) => {
              const template = TARGET_TEMPLATES.find(t => t.id === e.target.value);
              setSelectedTemplate(template);
            }}
            style={{ padding: '8px', fontSize: '14px' }}
          >
            {TARGET_TEMPLATES.map(template => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.diameter}mm @ {template.distance}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            ESA Parameter:
          </label>
          <input 
            type="range" 
            min="5" 
            max="96" 
            value={esaValue}
            onChange={(e) => setEsaValue(parseInt(e.target.value))}
            style={{ width: '150px' }}
          />
          <span style={{ marginLeft: '10px' }}>{esaValue}</span>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '20px',
        marginTop: '20px'
      }}>
        {/* Small size */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Small (240px)</h3>
          <TargetVisualization
            sessionParameters={sessionParameters}
            containerSize={240}
            showTitle={false}
          />
        </div>

        {/* Medium size */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Medium (320px)</h3>
          <TargetVisualization
            sessionParameters={sessionParameters}
            containerSize={320}
            showTitle={false}
          />
        </div>

        {/* Large size */}
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>Large (400px)</h3>
          <TargetVisualization
            sessionParameters={sessionParameters}
            containerSize={400}
            showTitle={false}
          />
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🔍 Test Instructions:</h3>
        <ol>
          <li><strong>Change Target Distance:</strong> Select different templates (10m, 25m, 50m, etc.) to see how all rings scale proportionally</li>
          <li><strong>Adjust ESA Parameter:</strong> Move the ESA slider to see how the orange ring size affects the overall target</li>
          <li><strong>Verify Black Rings:</strong> Check that 6 black rings appear evenly spaced between the green bullseye ring and blue concentric ring</li>
          <li><strong>Check Scaling:</strong> Ensure black rings maintain equal spacing at all container sizes</li>
        </ol>
        
        <div style={{ marginTop: '15px' }}>
          <h4>Expected Behavior:</h4>
          <ul>
            <li>✅ 6 black rings positioned between green bullseye ring and blue concentric ring</li>
            <li>✅ Equal spacing between all black rings</li>
            <li>✅ All rings scale proportionally when target distance changes</li>
            <li>✅ Ring order: Green (outermost) → Black Rings → Blue (innermost), Orange (middle)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TargetVisualizationTest;
