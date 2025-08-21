import { useState, useEffect } from 'react';
// import ModernNavigation from './ModernNavigation';
import TargetTemplateSelector from './TargetTemplateSelector';

const Simulator = () => {
  const [shooterName, setShooterName] = useState('Test Shooter');
  const [numberOfShots, setNumberOfShots] = useState(5);
  const [hits, setHits] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [bullseye, setBullseye] = useState(null);
  const [simulationPhase, setSimulationPhase] = useState('SELECT_BULLSEYE'); // SELECT_BULLSEYE, READY, SIMULATING
  const [finalAccuracy, setFinalAccuracy] = useState(null);
  const [finalMetrics, setFinalMetrics] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [cursorPos, setCursorPos] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateRandomShots = (count) => {
    const shots = [];
    const validCount = Math.max(1, parseInt(count) || 1);

    // Use bullseye position or default to center
    const centerX = bullseye ? bullseye.x : 200;
    const centerY = bullseye ? bullseye.y : 200;

    // Calculate shot spread based on template
    let spreadRadius = 80; // Default spread
    if (selectedTemplate) {
      // Use template diameter to determine shot spread
      // Smaller templates = tighter grouping
      const targetPhysicalWidth = 133; // 13.3 cm in mm
      const targetPixelWidth = 400; // SVG width in pixels
      const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;
      spreadRadius = Math.max(20, (selectedTemplate.diameter / 2) * pixelsPerMm * 1.5);
    }

    for (let i = 0; i < validCount; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const radius = Math.random() * spreadRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const shot = {
        id: `shot-${i}-${Date.now()}-${Math.random()}`,
        x: Math.max(20, Math.min(380, x)),
        y: Math.max(20, Math.min(380, y))
      };

      // Validate shot before adding
      if (shot && typeof shot.x === 'number' && typeof shot.y === 'number' && !isNaN(shot.x) && !isNaN(shot.y)) {
        shots.push(shot);
      }
    }
    return shots;
  };

  const handleTemplateChange = (template) => {
    setSelectedTemplate(template);
  };

  const getTemplateRadius = () => {
    if (!selectedTemplate) return 50;

    // Target image dimensions: 14 cm × 13.3 cm
    // SVG viewBox: 400 × 400 pixels
    // Use the smaller dimension (13.3 cm) to maintain aspect ratio
    const targetPhysicalWidth = 133; // 13.3 cm in mm
    const targetPixelWidth = 400; // SVG width in pixels

    // Calculate scale: pixels per mm
    const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;

    // Convert template diameter (mm) to radius (pixels)
    return (selectedTemplate.diameter / 2) * pixelsPerMm;
  };

  const handleTargetClick = (e) => {
    if (isSimulating) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (simulationPhase === 'SELECT_BULLSEYE') {
      setBullseye({ x, y });
      setSimulationPhase('READY');
    }
  };

  const handleSimulate = () => {
    if (!bullseye) {
      alert('Please click on the target to set your bullseye first');
      return;
    }

    setIsSimulating(true);
    setSimulationPhase('SIMULATING');
    setHits([]);

    const shots = generateRandomShots(numberOfShots);
    console.log('Generated shots:', shots); // Debug log
    let index = 0;

    const addShot = () => {
      if (index < shots.length && shots[index]) {
        const shot = shots[index];
        console.log('Adding shot:', shot); // Debug log
        if (shot && typeof shot.x === 'number' && typeof shot.y === 'number') {
          setHits(prev => {
            const newHits = [...prev, shot];
            // Calculate final results when all shots are placed
            if (newHits.length === shots.length) {
              setTimeout(() => {
                // Calculate accuracy and all shooting metrics
                const accuracy = calculateAccuracyForHits(newHits);
                const metrics = calculateShootingMetrics(newHits);
                console.log('Final results calculated:', { accuracy, metrics, hits: newHits.length });
                setFinalAccuracy(accuracy);
                setFinalMetrics(metrics);
              }, 100);
            }
            return newHits;
          });
        }
        index++;
        setTimeout(addShot, 600);
      } else {
        setIsSimulating(false);
        setSimulationPhase('READY');
      }
    };

    setTimeout(addShot, 1000);
  };

  const handleReset = () => {
    setHits([]);
    setIsSimulating(false);
    setBullseye(null);
    setSimulationPhase('SELECT_BULLSEYE');
    setFinalAccuracy(null);
    setFinalMetrics(null);
    setUploadedImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
        // Reset bullseye when new image is uploaded
        setBullseye(null);
        setSimulationPhase('SELECT_BULLSEYE');
        setHits([]);
        setFinalAccuracy(null);
        setFinalMetrics(null);
      };
      reader.readAsDataURL(file);
    }
  };



  const calculateAccuracyForHits = (shotHits) => {
    if (!shotHits.length || !bullseye) {
      // Return random accuracy between 65-85% when no shots
      return Math.floor(Math.random() * 21) + 65; // 65-85
    }

    // Calculate average distance from bullseye
    const distances = shotHits.map(hit => {
      const dx = hit.x - bullseye.x;
      const dy = hit.y - bullseye.y;
      return Math.sqrt(dx * dx + dy * dy);
    });

    const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;

    // Template-based accuracy calculation (matches dashboard)
    let finalAccuracy = 0;
    if (selectedTemplate) {
      // Use template radius as reference for accuracy calculation
      const templateRadius = getTemplateRadius();

      // Standard accuracy formula: Accuracy % = (1 - Mean Distance from Reference Point / Target Radius) × 100
      const baseAccuracy = Math.max(0, (1 - avgDistance / templateRadius) * 100);

      // Add some realistic variation (±5% randomness)
      const randomFactor = (Math.random() - 0.5) * 10; // ±5% randomness
      finalAccuracy = baseAccuracy + randomFactor;

      // Clamp to realistic range
      finalAccuracy = Math.max(0, Math.min(100, finalAccuracy));
    } else {
      // Fallback for no template: use 100 pixel reference (original behavior)
      const referenceDistance = 100;
      let baseAccuracy = Math.max(30, (1 - (avgDistance / referenceDistance)) * 100);

      // Add randomness for variation
      const randomFactor = (Math.random() - 0.5) * 25; // ±12.5% randomness
      finalAccuracy = baseAccuracy + randomFactor;

      // Force into 65-85% range
      if (finalAccuracy > 85) finalAccuracy = 80 + Math.random() * 5;
      if (finalAccuracy < 65) finalAccuracy = 65 + Math.random() * 10;
    }

    // Final round
    finalAccuracy = Math.round(finalAccuracy * 10) / 10;
    return finalAccuracy;
  };

  const calculateShootingMetrics = (shotHits) => {
    if (!shotHits.length || !bullseye) {
      return {
        mpi: 0,
        maxDistance: 0,
        groupSize: 0,
        trueMPI: { x: 0, y: 0 },
        referencePoint: { x: 0, y: 0 },
        shotsAnalyzed: 0
      };
    }

    // Convert pixels to mm (using same scale as template calculation)
    const targetPhysicalWidth = 133; // 13.3 cm in mm
    const targetPixelWidth = 400; // SVG width in pixels
    const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;

    // Calculate distances from bullseye
    const distances = shotHits.map(hit => {
      const dx = hit.x - bullseye.x;
      const dy = hit.y - bullseye.y;
      return Math.sqrt(dx * dx + dy * dy);
    });

    // 1. MPI (Mean Point of Impact) - average distance from bullseye
    const avgDistancePixels = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
    const mpi = Math.round((avgDistancePixels / pixelsPerMm) * 10) / 10;

    // 2. Max Distance - furthest shot from bullseye
    const maxDistancePixels = Math.max(...distances);
    const maxDistance = Math.round((maxDistancePixels / pixelsPerMm) * 10) / 10;

    // 3. Group Size - diameter of smallest circle containing all shots
    let groupSizePixels = 0;
    if (shotHits.length > 1) {
      for (let i = 0; i < shotHits.length; i++) {
        for (let j = i + 1; j < shotHits.length; j++) {
          const dx = shotHits[i].x - shotHits[j].x;
          const dy = shotHits[i].y - shotHits[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          groupSizePixels = Math.max(groupSizePixels, distance);
        }
      }
    }
    const groupSize = Math.round((groupSizePixels / pixelsPerMm) * 10) / 10;

    // 4. True MPI - center of shot group (geometric center)
    const avgX = shotHits.reduce((sum, hit) => sum + hit.x, 0) / shotHits.length;
    const avgY = shotHits.reduce((sum, hit) => sum + hit.y, 0) / shotHits.length;
    const trueMPI = {
      x: Math.round(avgX - 200), // Convert to (0,0) coordinate system
      y: Math.round(200 - avgY)  // Convert to (0,0) coordinate system with inverted Y
    };

    // 5. Reference Point - bullseye coordinates
    const referencePoint = {
      x: Math.round(bullseye.x - 200), // Convert to (0,0) coordinate system
      y: Math.round(200 - bullseye.y)  // Convert to (0,0) coordinate system with inverted Y
    };

    // 6. Shots Analyzed
    const shotsAnalyzed = shotHits.length;

    return {
      mpi,
      maxDistance,
      groupSize,
      trueMPI,
      referencePoint,
      shotsAnalyzed
    };
  };

  const calculateMPIForHits = (shotHits) => {
    return calculateShootingMetrics(shotHits).mpi;
  };

  // Main calculation functions
  const calculateAccuracy = () => calculateAccuracyForHits(hits);
  const calculateMetrics = () => calculateShootingMetrics(hits);

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
  {/* ModernNavigation removed, now rendered globally in App.jsx */}

      {/* Header - Compact */}
      <div style={{
        padding: '16px 20px',
        textAlign: 'center',
        flexShrink: 0
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          marginBottom: '4px',
          margin: 0
        }}>🎲 Shot Simulator</h1>
        <p style={{
          fontSize: 'clamp(0.875rem, 2vw, 1rem)',
          color: '#94a3b8',
          margin: 0
        }}>Generate random shots on target</p>
      </div>

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 16px',
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* Control Panel - Compact */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '12px',
          flexShrink: 0
        }}>
          {/* Target Template Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: '600', color: '#374151', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              🎯 Target Template Selection
            </label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const templateId = e.target.value;
                if (templateId) {
                  const templates = [
                    {
                      id: 'air-pistol-10m',
                      name: '10m Air Pistol (Individual)',
                      diameter: 11.5,
                      distance: '10m',
                      caliber: '4.5mm air pistol',
                      description: 'Standard 10-ring target for air pistol competition'
                    },
                    {
                      id: 'pistol-25m-precision',
                      name: '25m Pistol Precision',
                      diameter: 50,
                      distance: '25m',
                      caliber: '.22 LR rimfire',
                      description: 'Precision pistol target for 25m competition'
                    },
                    {
                      id: 'pistol-25m-rapid',
                      name: '25m Rapid Fire Pistol',
                      diameter: 50,
                      distance: '25m',
                      caliber: '.22 Short',
                      description: 'Rapid fire pistol target'
                    },
                    {
                      id: 'rifle-50m',
                      name: '50m Rifle Prone',
                      diameter: 10.4,
                      distance: '50m',
                      caliber: '.22 LR',
                      description: 'Small bore rifle target'
                    },
                    {
                      id: 'air-rifle-10m',
                      name: '10m Air Rifle',
                      diameter: 0.5,
                      distance: '10m',
                      caliber: '4.5mm air rifle',
                      description: 'Precision air rifle target'
                    },
                    {
                      id: 'custom',
                      name: 'Custom Target',
                      diameter: 30,
                      distance: 'Variable',
                      caliber: 'Various',
                      description: 'Custom target configuration'
                    }
                  ];
                  const template = templates.find(t => t.id === templateId);
                  handleTemplateChange(template);
                } else {
                  handleTemplateChange(null);
                }
              }}
              disabled={isSimulating}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                background: 'white',
                color: '#374151',
                cursor: isSimulating ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">Select a target template...</option>
              <option value="air-pistol-10m">10m Air Pistol - 11.5mm @ 10m</option>
              <option value="pistol-25m-precision">25m Pistol Precision - 50mm @ 25m</option>
              <option value="pistol-25m-rapid">25m Rapid Fire Pistol - 50mm @ 25m</option>
              <option value="rifle-50m">50m Rifle Prone - 10.4mm @ 50m</option>
              <option value="air-rifle-10m">10m Air Rifle - 0.5mm @ 10m</option>
              <option value="custom">Custom Target - 30mm @ Variable</option>
            </select>

            {/* Template Details - Compact */}
            {selectedTemplate && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <div>
                    <span style={{ fontWeight: '600', color: '#6b7280' }}>Distance: </span>
                    <span style={{ color: '#374151' }}>{selectedTemplate.distance}</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '600', color: '#6b7280' }}>Diameter: </span>
                    <span style={{ color: '#059669', fontWeight: '600' }}>{selectedTemplate.diameter}mm</span>
                  </div>
                  <div>
                    <span style={{ fontWeight: '600', color: '#6b7280' }}>Caliber: </span>
                    <span style={{ color: '#374151' }}>{selectedTemplate.caliber}</span>
                  </div>
                </div>
              </div>
            )}
          </div>



          {/* Form Controls - Responsive */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ fontWeight: '600', color: '#374151', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Shooter Name
              </label>
              <input
                type="text"
                value={shooterName}
                onChange={(e) => setShooterName(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                disabled={isSimulating}
              />
            </div>

            <div>
              <label style={{ fontWeight: '600', color: '#374151', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                Number of Shots
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={numberOfShots}
                onChange={(e) => setNumberOfShots(parseInt(e.target.value) || 1)}
                style={{
                  padding: '8px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                disabled={isSimulating}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleSimulate}
                disabled={isSimulating || !shooterName.trim() || simulationPhase === 'SELECT_BULLSEYE'}
                style={{
                  background: (isSimulating || !shooterName.trim() || simulationPhase === 'SELECT_BULLSEYE') ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: 'none',
                  color: 'white',
                  cursor: (isSimulating || !shooterName.trim() || simulationPhase === 'SELECT_BULLSEYE') ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {isSimulating ? '🎯 Simulating...' : simulationPhase === 'SELECT_BULLSEYE' ? '🎯 Set Bullseye' : '🎲 Start'}
              </button>
              <button
                onClick={handleReset}
                disabled={isSimulating}
                style={{
                  background: isSimulating ? '#d1d5db' : '#6b7280',
                  color: 'white',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: isSimulating ? 'not-allowed' : 'pointer'
                }}
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Instructions Banner - Compact */}
        {simulationPhase === 'SELECT_BULLSEYE' && (
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
            textAlign: 'center',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
              🎯 Step 1: Set Your Bullseye
            </div>
            <div style={{ color: '#a16207', fontSize: '12px' }}>
              Click anywhere on the target below to set your bullseye reference point
            </div>
          </div>
        )}

        {simulationPhase === 'READY' && !isSimulating && (
          <div style={{
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '12px',
            textAlign: 'center',
            flexShrink: 0
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '4px' }}>
              ✅ Ready to Simulate
            </div>
            <div style={{ color: '#047857', fontSize: '12px' }}>
              Bullseye set! Click "Start Simulation" to generate random shots around your bullseye
            </div>
          </div>
        )}

        {/* Main Content Area - Responsive Layout */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 1fr) minmax(280px, 400px)',
          gridTemplateRows: isMobile ? 'auto 1fr' : 'auto',
          gap: '16px',
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {/* Target Display */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {/* Image Upload - Compact */}
            <div style={{ textAlign: 'center', marginBottom: '12px', width: '100%', flexShrink: 0 }}>
              <label style={{
                display: 'inline-block',
                padding: '6px 12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                borderRadius: '6px',
                cursor: isSimulating ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                opacity: isSimulating ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}>
                📷 Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isSimulating}
                  style={{ display: 'none' }}
                />
              </label>
              {uploadedImage && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '10px',
                  color: '#059669',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  ✅ Custom image uploaded
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setBullseye(null);
                      setSimulationPhase('SELECT_BULLSEYE');
                      setHits([]);
                      setFinalAccuracy(null);
                      setFinalMetrics(null);
                    }}
                    disabled={isSimulating}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '2px 4px',
                      fontSize: '9px',
                      cursor: isSimulating ? 'not-allowed' : 'pointer',
                      opacity: isSimulating ? 0.6 : 1
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div
              onClick={handleTargetClick}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.round(e.clientX - rect.left);
                const y = Math.round(e.clientY - rect.top);
                setCursorPos(prev => {
                  const newPos = { x, y };
                  // Only update if position changed significantly (reduces re-renders)
                  if (!prev || Math.abs(prev.x - newPos.x) > 3 || Math.abs(prev.y - newPos.y) > 3) {
                    return newPos;
                  }
                  return prev;
                });
              }}
              onMouseLeave={() => setCursorPos(null)}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '400px',
                aspectRatio: '1',
                backgroundImage: uploadedImage ? `url('${uploadedImage}')` : `url('${import.meta.env.BASE_URL}target.svg')`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                border: '2px solid #3b82f6',
                borderRadius: '8px',
                cursor: simulationPhase === 'SELECT_BULLSEYE' && !isSimulating ? 'crosshair' : 'default',
                flexShrink: 0
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

              {/* Template Ring - Show when template is selected and bullseye is set */}
              {selectedTemplate && bullseye && (
                <div style={{
                  position: 'absolute',
                  left: `${bullseye.x}px`,
                  top: `${bullseye.y}px`,
                  width: `${getTemplateRadius() * 2}px`,
                  height: `${getTemplateRadius() * 2}px`,
                  border: '3px solid #00ff41',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0, 255, 65, 0.1)',
                  boxShadow: '0 0 16px rgba(0, 255, 65, 0.6)',
                  zIndex: 5,
                  pointerEvents: 'none'
                }}>
                  {/* Template Info Label */}
                  <div style={{
                    position: 'absolute',
                    top: '-45px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 255, 65, 0.95)',
                    color: '#000',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    border: '2px solid #00ff41'
                  }}>
                    {selectedTemplate.name} - {selectedTemplate.diameter}mm
                  </div>
                </div>
              )}

              {/* Bullseye Marker - Show when set */}
              {bullseye && (
                <div style={{
                  position: 'absolute',
                  left: `${bullseye.x}px`,
                  top: `${bullseye.y}px`,
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#008000',
                  border: '3px solid #004d00',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  boxShadow: '0 0 12px rgba(0, 128, 0, 0.8)',
                  pointerEvents: 'none'
                }} />
              )}

              {/* Shot Marks */}
              {hits.filter(hit => hit && typeof hit.x === 'number' && typeof hit.y === 'number').map((hit, index) => (
                <div
                  key={hit.id || `shot-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${hit.x - 4}px`,
                    top: `${hit.y - 4}px`,
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ff4444',
                    border: '1px solid #fff',
                    borderRadius: '50%',
                    boxShadow: '0 0 4px rgba(255, 68, 68, 0.8)',
                    zIndex: 15
                  }}
                />
              ))}
            </div>
          </div>

          {/* Results Panel - Responsive and Compact */}
          {bullseye && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'auto',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '12px',
                textAlign: 'center',
                margin: '0 0 12px 0'
              }}>
                Results
              </h3>

              {/* Template Info - Compact */}
              {selectedTemplate && (
                <div style={{
                  textAlign: 'center',
                  padding: '8px',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  border: '1px solid #10b981',
                  flexShrink: 0
                }}>
                  <div style={{ color: '#065f46', fontSize: '0.75rem', fontWeight: '600', marginBottom: '2px' }}>
                    TARGET TEMPLATE
                  </div>
                  <div style={{ color: '#047857', fontSize: '0.875rem', fontWeight: '700' }}>
                    {selectedTemplate.name}
                  </div>
                  <div style={{ color: '#059669', fontSize: '0.625rem' }}>
                    {selectedTemplate.diameter}mm @ {selectedTemplate.distance}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minHeight: 0 }}>
                {/* Primary Metrics Row - Responsive */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
                  gap: isMobile ? '6px' : '8px',
                  flexShrink: 0
                }}>
                  <div style={{
                    textAlign: 'center',
                    padding: '12px 8px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2px' }}>
                      {finalMetrics?.shotsAnalyzed || hits.length}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '600' }}>
                      🔢 SHOTS
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    padding: '12px 8px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2px' }}>
                      {finalMetrics?.mpi !== undefined ? `${finalMetrics.mpi}mm` : (isSimulating ? '...' : (hits.length > 0 ? '...' : '0mm'))}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '600' }}>
                      MPI SCORE
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    padding: '12px 8px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2px' }}>
                      {finalAccuracy !== null ? `${finalAccuracy}%` : (isSimulating ? '...' : (hits.length > 0 ? '...' : 'Ready'))}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '600' }}>
                      ACCURACY
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics Grid - Responsive and Scrollable */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: isMobile ? '6px' : '8px',
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto'
                }}>
                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '8px',
                    border: '2px solid #f59e0b',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ color: '#92400e', fontSize: '0.7rem', fontWeight: '600', marginBottom: '2px' }}>
                      📏 Max Distance
                    </div>
                    <div style={{ color: '#a16207', fontSize: '1.1rem', fontWeight: '700' }}>
                      {finalMetrics?.maxDistance !== undefined ? `${finalMetrics.maxDistance}mm` : (isSimulating ? '...' : '-')}
                    </div>
                  </div>

                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    borderRadius: '8px',
                    border: '2px solid #10b981',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ color: '#065f46', fontSize: '0.7rem', fontWeight: '600', marginBottom: '2px' }}>
                      🎯 Group Size
                    </div>
                    <div style={{ color: '#047857', fontSize: '1.1rem', fontWeight: '700' }}>
                      {finalMetrics?.groupSize !== undefined ? `${finalMetrics.groupSize}mm` : (isSimulating ? '...' : '-')}
                    </div>
                  </div>

                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
                    borderRadius: '8px',
                    border: '2px solid #ec4899',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ color: '#9d174d', fontSize: '0.7rem', fontWeight: '600', marginBottom: '2px' }}>
                      ⊕ True MPI
                    </div>
                    <div style={{ color: '#be185d', fontSize: '0.9rem', fontWeight: '700' }}>
                      {finalMetrics?.trueMPI ? `(${finalMetrics.trueMPI.x}, ${finalMetrics.trueMPI.y})` : (isSimulating ? '...' : '(-, -)')}
                    </div>
                  </div>

                  <div style={{
                    padding: '10px',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    borderRadius: '8px',
                    border: '2px solid #0ea5e9',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    <div style={{ color: '#0c4a6e', fontSize: '0.7rem', fontWeight: '600', marginBottom: '2px' }}>
                      📍 Reference Point
                    </div>
                    <div style={{ color: '#0369a1', fontSize: '0.9rem', fontWeight: '700' }}>
                      {finalMetrics?.referencePoint ? `(${finalMetrics.referencePoint.x}, ${finalMetrics.referencePoint.y})` : (bullseye ? `(${Math.round(bullseye.x - 200)}, ${Math.round(200 - bullseye.y)})` : '(-, -)')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Simulator;
