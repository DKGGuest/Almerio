import { useMemo, memo } from 'react';
import { calculateRingRadii } from '../constants/shootingParameters';
import { TARGET_TEMPLATES } from './TargetTemplateSelector';

// Helper function to get target type background image
const getTargetTypeBackgroundImage = (parameters, template) => {
  console.log('🎯 TargetVisualization - getTargetTypeBackgroundImage debug:', {
    parameters: parameters,
    template: template,
    targetType: parameters?.targetType,
    target_type: parameters?.target_type
  });

  // First try to get image from template
  if (template?.image) {
    console.log('✅ Using template image:', template.image);
    return `url('${import.meta.env.BASE_URL}${template.image}')`;
  }

  // Try both targetType and target_type (database field name)
  const targetType = parameters?.targetType || parameters?.target_type;
  if (!targetType) {
    console.log('⚠️ No target type found in parameters');
    return null;
  }

  // Map target type values to image filenames
  const targetTypeImageMap = {
    'fig11-combat': 'FIG 11 - Combat Target.webp',
    'combat-120cm': '120 cm Combat Target.jpg',
    'grouping-30cm': '30 cm Grouping Target.jpeg'
  };

  const imageFilename = targetTypeImageMap[targetType];
  if (!imageFilename) {
    console.log('⚠️ No image mapping found for target type:', targetType);
    return null;
  }

  console.log('✅ Using target type image:', imageFilename);
  return `url('${import.meta.env.BASE_URL}${imageFilename}')`;
};

// Optimized bullet component for static display - matches TargetDisplay.jsx styling
const StaticBulletMark = memo(({ shot, containerSize = 320 }) => {
  // Safety check and convert string coordinates to numbers
  if (!shot) {
    return null;
  }

  const x = parseFloat(shot.x_coordinate);
  const y = parseFloat(shot.y_coordinate);
  
  if (isNaN(x) || isNaN(y)) {
    return null;
  }

  // Scale shot position from 400px coordinate space to container size
  const coordinateSpace = 400;
  const scale = containerSize / coordinateSpace;
  const scaledX = x * scale;
  const scaledY = y * scale;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${scaledX}px`,
        top: `${scaledY}px`,
        zIndex: 40, // Same as TargetDisplay
        willChange: 'transform',
      }}
    >
      <div
        className="bullet-base"
        title={`Shot ${shot.shot_number || 'unknown'}: (${(x - 200).toFixed(1)}, ${(200 - y).toFixed(1)}) - ${shot.score_points || 0} pts`}
        style={{
          cursor: 'default',
        }}
      />
    </div>
  );
});

StaticBulletMark.displayName = 'StaticBulletMark';

// Main target visualization component - matches TargetDisplay.jsx exactly
const TargetVisualization = ({
  shots = [],
  sessionParameters = null,
  template = null,
  containerSize = 320,
  showTitle = true,
  uploadedImage = null
}) => {
  // Determine template from parameters or use default
  const effectiveTemplate = useMemo(() => {
    console.log('🎯 TargetVisualization - Template resolution debug:', {
      explicitTemplate: template,
      sessionParameters: sessionParameters,
      templateId: sessionParameters?.templateId,
      template_id: sessionParameters?.template_id,
      templateName: sessionParameters?.template_name,
      availableTemplates: TARGET_TEMPLATES.map(t => ({ id: t.id, name: t.name, diameter: t.diameter }))
    });

    if (template) return template;

    // Try to find template from session parameters - check multiple possible field names
    if (sessionParameters?.templateId) {
      const foundTemplate = TARGET_TEMPLATES.find(t => t.id === sessionParameters.templateId);
      if (foundTemplate) {
        console.log('✅ Found template by templateId:', foundTemplate);
        return foundTemplate;
      }
    }

    // Also try template_id (snake_case from database)
    if (sessionParameters?.template_id) {
      const foundTemplate = TARGET_TEMPLATES.find(t => t.id === sessionParameters.template_id);
      if (foundTemplate) {
        console.log('✅ Found template by template_id:', foundTemplate);
        return foundTemplate;
      }
    }

    // Try to find by template name
    if (sessionParameters?.template_name) {
      const foundTemplate = TARGET_TEMPLATES.find(t => t.name === sessionParameters.template_name);
      if (foundTemplate) {
        console.log('✅ Found template by template_name:', foundTemplate);
        return foundTemplate;
      }
    }

    // Default template
    console.log('⚠️ No template found, using default diameter: 100');
    return { diameter: 100 };
  }, [template, sessionParameters]);

  // Calculate ring radii using the EXACT same logic as TargetDisplay
  // This ensures perfect visual consistency between live and historical displays
  const ringRadii = useMemo(() => {
    // CRITICAL: Use the same distance-dependent calculations as TargetDisplay

    // 1. Calculate template radius (green bullseye ring) - same as TargetDisplay.getTemplateRadius
    let templateRadius;
    if (effectiveTemplate) {
      // Target image dimensions: 14 cm × 13.3 cm
      // SVG viewBox: 400 × 400 pixels
      // Use the smaller dimension (13.3 cm) to maintain aspect ratio
      const targetPhysicalWidth = 133; // 13.3 cm in mm
      const targetPixelWidth = 400; // SVG width in pixels

      // Calculate scale: pixels per mm
      const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;

      // Convert template diameter (mm) to radius (pixels)
      templateRadius = (effectiveTemplate.diameter / 2) * pixelsPerMm;
    } else {
      // Default radius when no template is selected
      templateRadius = 50;
    }

    // 2. Calculate ESA radius (orange ring) - same as TargetDisplay.getESARadius
    let esaRadius;
    const esaParameter = sessionParameters?.esa;
    if (esaParameter && esaParameter > 0) {
      // ESA calculation when ESA parameter is set
      const maxESA = 96;
      const minESA = 5;
      const maxRatio = 0.85; // Maximum 85% of green ring
      const minRatio = 0.15; // Minimum 15% of green ring

      // Linear interpolation between min and max ratios
      const ratio = minRatio + ((esaParameter - minESA) / (maxESA - minESA)) * (maxRatio - minRatio);
      esaRadius = templateRadius * Math.max(minRatio, Math.min(maxRatio, ratio));
    } else {
      // Default ESA radius when no ESA parameter is set (70% of green ring)
      esaRadius = templateRadius * 0.7;
    }

    // 3. Calculate blue inner radius - same as TargetDisplay.getOrangeCircleRadius
    // Dark orange circle radius = 25% of ESA ring radius
    const blueInnerRadius = esaRadius * 0.25;

    return {
      greenBullseyeRadius: templateRadius,
      orangeESARadius: esaRadius,
      blueInnerRadius: blueInnerRadius
    };
  }, [effectiveTemplate, sessionParameters]);

  // Scale factor for container
  const scale = containerSize / 400;

  // Calculate black ring positions between green bullseye ring and blue concentric ring
  const blackRings = useMemo(() => {
    const greenRadius = ringRadii.greenBullseyeRadius;
    const blueRadius = ringRadii.blueInnerRadius;

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
  }, [ringRadii.greenBullseyeRadius, ringRadii.blueInnerRadius]);

  // Calculate scaled ring radii for display - using the same structure as TargetDisplay
  const scaledRingRadii = {
    green: ringRadii.greenBullseyeRadius * scale,
    orange: ringRadii.orangeESARadius * scale,
    blue: ringRadii.blueInnerRadius * scale,
    // Scale black rings using the same scale factor
    blackRings: blackRings.map(radius => radius * scale)
  };

  console.log('🎯 TargetVisualization - Ring radii calculated:', {
    containerSize,
    scale,
    template: effectiveTemplate,
    esaParameter: sessionParameters?.esa,
    originalRadii: {
      green: ringRadii.greenBullseyeRadius?.toFixed(1),
      orange: ringRadii.orangeESARadius?.toFixed(1),
      blue: ringRadii.blueInnerRadius?.toFixed(1),
      blackRings: blackRings.map(r => r?.toFixed(1))
    },
    scaledRadii: {
      green: scaledRingRadii.green?.toFixed(1),
      orange: scaledRingRadii.orange?.toFixed(1),
      blue: scaledRingRadii.blue?.toFixed(1),
      blackRings: scaledRingRadii.blackRings?.map(r => r?.toFixed(1))
    },
    ringOrder: 'Green (outermost) → Black Rings → Blue (innermost), Orange (middle)'
  });

  // Center position for rings (center of container)
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '12px'
    }}>
      {showTitle && (
        <h4 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#374151', 
          margin: 0,
          textAlign: 'center'
        }}>
          🎯 Shot Placement Visualization
        </h4>
      )}
      
      <div
        style={{
          position: 'relative',
          width: `${containerSize}px`,
          height: `${containerSize}px`,
          // Priority: 1) Uploaded image, 2) Target type image, 3) Default target
          backgroundImage: uploadedImage ? `url('${uploadedImage}')` :
                          getTargetTypeBackgroundImage(sessionParameters, effectiveTemplate) ||
                          `url('${import.meta.env.BASE_URL}target.svg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.90,
          margin: '0 auto',
          display: 'block',
        }}
      >
        {/* Grid Overlay - exactly like TargetDisplay.jsx */}
        <svg
          width={containerSize}
          height={containerSize}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            pointerEvents: 'none'
          }}
        >
          {/* Vertical lines */}
          {[...Array(11)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(i * containerSize / 10)}
              y1={0}
              x2={(i * containerSize / 10)}
              y2={containerSize}
              stroke="#ff6b6b"
              strokeWidth={i === 5 ? 2 : 1}
              opacity={i === 5 ? 0.5 : 0.18}
            />
          ))}
          {/* Horizontal lines */}
          {[...Array(11)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={(i * containerSize / 10)}
              x2={containerSize}
              y2={(i * containerSize / 10)}
              stroke="#ff6b6b"
              strokeWidth={i === 5 ? 2 : 1}
              opacity={i === 5 ? 0.5 : 0.18}
            />
          ))}

          {/* Grid coordinate labels */}
          {/* X-axis labels (bottom) */}
          {[...Array(11)].map((_, i) => (
            <text
              key={`x-label-${i}`}
              x={(i * containerSize / 10)}
              y={containerSize - 10}
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
              y={(i * containerSize / 10) + 4}
              textAnchor="start"
              fontSize="9"
              fill="#ff6b6b"
              fontWeight={i === 5 ? "bold" : "normal"}
              opacity={0.8}
            >
              {(5 - i) * 40}
            </text>
          ))}

          {/* Center origin marker */}
          <circle
            cx={centerX}
            cy={centerY}
            r={2.2}
            fill="#ffff00"
            stroke="#000"
            strokeWidth={1}
            opacity={0.8}
          />
          <text
            x={centerX + 4}
            y={centerY - 4}
            fontSize="9"
            fill="#ffff00"
            fontWeight="bold"
            opacity={0.9}
          >
            (0,0)
          </text>
        </svg>

        {/* Green bullseye ring (outermost) */}
        <div
          style={{
            position: 'absolute',
            left: `${centerX}px`,
            top: `${centerY}px`,
            width: `${scaledRingRadii.green * 2}px`,
            height: `${scaledRingRadii.green * 2}px`,
            border: '2px solid #00ff33',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'transparent',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        />

        {/* Orange ESA ring (middle) */}
        {scaledRingRadii.orange && (
          <div
            style={{
              position: 'absolute',
              left: `${centerX}px`,
              top: `${centerY}px`,
              width: `${scaledRingRadii.orange * 2}px`,
              height: `${scaledRingRadii.orange * 2}px`,
              border: '3px solid #ff7700',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              zIndex: 12,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Black rings inside green bullseye ring */}
        {scaledRingRadii.blackRings && scaledRingRadii.blackRings.map((blackRingRadius, index) => (
          <div
            key={`black-ring-${index}`}
            style={{
              position: 'absolute',
              left: `${centerX}px`,
              top: `${centerY}px`,
              width: `${blackRingRadius * 2}px`,
              height: `${blackRingRadius * 2}px`,
              border: '1px solid #000000',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              zIndex: 11, // Between green (10) and orange (12)
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Blue inner ring (innermost) */}
        {scaledRingRadii.blue && (
          <div
            style={{
              position: 'absolute',
              left: `${centerX}px`,
              top: `${centerY}px`,
              width: `${scaledRingRadii.blue * 2}px`,
              height: `${scaledRingRadii.blue * 2}px`,
              border: '3px solid #0077ff',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              zIndex: 14,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Shot marks */}
        {shots && shots.length > 0 && shots.map((shot, index) => (
          <StaticBulletMark
            key={shot.id || `shot-${shot.shot_number || index}`}
            shot={shot}
            containerSize={containerSize}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: '12px',
        color: '#6b7280',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #0077ff' }}></div>
          <span>3 pts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #ff7700' }}></div>
          <span>2 pts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #00ff33' }}></div>
          <span>1 pt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff3333' }}></div>
          <span>Shot</span>
        </div>
      </div>

      {shots && shots.length > 0 && (
        <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
          {shots.length} shots displayed
        </div>
      )}
    </div>
  );
};

export default TargetVisualization;
