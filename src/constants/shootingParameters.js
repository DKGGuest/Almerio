// Shooting Parameters Constants
// Based on military shooting requirements

export const SESSION_TYPES = {
  GROUPING: 'grouping',
  ZEROING: 'zeroing', 
  PRACTICE: 'practice',
  TEST: 'test'
};

export const SESSION_TYPE_OPTIONS = [
  { value: SESSION_TYPES.GROUPING, label: 'Grouping' },
  { value: SESSION_TYPES.ZEROING, label: 'Zeroing' },
  { value: SESSION_TYPES.PRACTICE, label: 'Practice' },
  { value: SESSION_TYPES.TEST, label: 'Test' }
];

export const FIRING_MODES = {
  UNTIMED: 'untimed',
  TIMED: 'timed',
  SNAP: 'snap',
  MOVING: 'moving'
};

export const FIRING_MODE_OPTIONS = [
  { value: FIRING_MODES.UNTIMED, label: 'Untimed' },
  { value: FIRING_MODES.TIMED, label: 'Timed' },
  { value: FIRING_MODES.SNAP, label: 'Snap' },
  // { value: FIRING_MODES.MOVING, label: 'Moving' }
];

export const WEAPON_TYPES = {
  RIFLE_762_SLR: '7.62mm-rifle-slr',
  LMG_762: '7.62mm-lmg',
  PISTOL_9MM: '9mm-pistol',
  CARBINE_9MM: '9mm-carbine',
  RIFLE_556_SLR: '5.56mm-slr',
  LMG_556: '5.56mm-lmg'
};

export const WEAPON_TYPE_OPTIONS = [
  { value: WEAPON_TYPES.RIFLE_762_SLR, label: '7.62 mm - Rifle (SLR)' },
  { value: WEAPON_TYPES.LMG_762, label: '7.62 mm - LMG' },
  { value: WEAPON_TYPES.PISTOL_9MM, label: '9mm - Pistol' },
  { value: WEAPON_TYPES.CARBINE_9MM, label: '9mm - Carbine' },
  { value: WEAPON_TYPES.RIFLE_556_SLR, label: '5.56 mm - SLR' },
  { value: WEAPON_TYPES.LMG_556, label: '5.56 mm - LMG' }
];

export const TARGET_TYPES = {
  FIG11_COMBAT: 'fig11-combat',
  COMBAT_120CM: 'combat-120cm',
  GROUPING_30CM: 'grouping-30cm'
};

export const TARGET_TYPE_OPTIONS = [
  { value: TARGET_TYPES.FIG11_COMBAT, label: 'FIG 11 - Combat Target' },
  { value: TARGET_TYPES.COMBAT_120CM, label: '120 cm Combat Target' },
  { value: TARGET_TYPES.GROUPING_30CM, label: '30 cm Grouping Target' }
];

export const SHOOTING_POSITIONS = {
  LS: 'ls', // Lying Supported
  LU: 'lu', // Lying Unsupported
  LB: 'lb', // Lying on Bipod
  BC: 'bc', // Battle Crouch
  SFTS: 'sfts', // Standing in Fire Trench Supported
  SFTU: 'sftu', // Standing in Fire Trench Unsupported
  KU: 'ku', // Kneeling Unsupported
  SU: 'su', // Standing Unsupported
  SFTB: 'sftb' // Standing Fire Trench Bipod
};

export const SHOOTING_POSITION_OPTIONS = [
  { value: SHOOTING_POSITIONS.LS, label: 'LS - Lying Supported' },
  { value: SHOOTING_POSITIONS.LU, label: 'LU - Lying Unsupported' },
  { value: SHOOTING_POSITIONS.LB, label: 'LB - Lying on Bipod' },
  { value: SHOOTING_POSITIONS.BC, label: 'BC - Battle Crouch' },
  { value: SHOOTING_POSITIONS.SFTS, label: 'SFTS - Standing in Fire Trench Supported' },
  { value: SHOOTING_POSITIONS.SFTU, label: 'SFTU - Standing in Fire Trench Unsupported' },
  { value: SHOOTING_POSITIONS.KU, label: 'KU - Kneeling Unsupported' },
  { value: SHOOTING_POSITIONS.SU, label: 'SU - Standing Unsupported' },
  { value: SHOOTING_POSITIONS.SFTB, label: 'SFTB - Standing Fire Trench Bipod' }
];

export const SHOT_TYPES = {
  SINGLE: 'single',
  BURST: 'burst'
};

export const SHOT_TYPE_OPTIONS = [
  { value: SHOT_TYPES.SINGLE, label: 'Single Shot' },
  { value: SHOT_TYPES.BURST, label: 'Burst Shot' }
];

export const TARGET_DISTANCES = {
  DISTANCE_25M: 25,
  DISTANCE_50M: 50,
  DISTANCE_100M: 100,
  DISTANCE_200M: 200,
  DISTANCE_300M: 300
};

export const TARGET_DISTANCE_OPTIONS = [
  { value: TARGET_DISTANCES.DISTANCE_25M, label: '25 M' },
  { value: TARGET_DISTANCES.DISTANCE_50M, label: '50 M' },
  { value: TARGET_DISTANCES.DISTANCE_100M, label: '100 M' },
  { value: TARGET_DISTANCES.DISTANCE_200M, label: '200 M' },
  { value: TARGET_DISTANCES.DISTANCE_300M, label: '300 M' }
];

export const ESA_VALUES = {
  ESA_5: 5,
  ESA_6: 6,
  ESA_18: 18,
  ESA_20: 20,
  ESA_24: 24,
  ESA_32: 32,
  ESA_35: 35,
  ESA_40: 40,
  ESA_48: 48,
  ESA_60: 60,
  ESA_64: 64,
  ESA_96: 96
};

export const ESA_OPTIONS = [
  { value: ESA_VALUES.ESA_5, label: '5' },
  { value: ESA_VALUES.ESA_6, label: '6' },
  { value: ESA_VALUES.ESA_18, label: '18' },
  { value: ESA_VALUES.ESA_20, label: '20' },
  { value: ESA_VALUES.ESA_24, label: '24' },
  { value: ESA_VALUES.ESA_32, label: '32' },
  { value: ESA_VALUES.ESA_35, label: '35' },
  { value: ESA_VALUES.ESA_40, label: '40' },
  { value: ESA_VALUES.ESA_48, label: '48' },
  { value: ESA_VALUES.ESA_60, label: '60' },
  { value: ESA_VALUES.ESA_64, label: '64' },
  { value: ESA_VALUES.ESA_96, label: '96' }
];

// Default parameter values
export const DEFAULT_PARAMETERS = {
  sessionType: SESSION_TYPES.PRACTICE,
  firingMode: FIRING_MODES.UNTIMED,
  weaponType: WEAPON_TYPES.RIFLE_762_SLR,
  targetType: TARGET_TYPES.FIG11_COMBAT,
  shootingPosition: SHOOTING_POSITIONS.LS,
  shotType: SHOT_TYPES.SINGLE,
  numberOfRounds: 10,
  targetDistance: TARGET_DISTANCES.DISTANCE_25M,
  esa: null, // ESA parameter - null means no ESA ring displayed
  timeLimit: null,
  notes: ''
};

// Helper functions
export const getSessionTypeLabel = (value) => {
  const option = SESSION_TYPE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const getFiringModeLabel = (value) => {
  const option = FIRING_MODE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const getWeaponTypeLabel = (value) => {
  const option = WEAPON_TYPE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const getTargetTypeLabel = (value) => {
  const option = TARGET_TYPE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const getShootingPositionLabel = (value) => {
  const option = SHOOTING_POSITION_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const getShotTypeLabel = (value) => {
  const option = SHOT_TYPE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const getTargetDistanceLabel = (value) => {
  const option = TARGET_DISTANCE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : `${value} M`;
};

export const getESALabel = (value) => {
  const option = ESA_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

// Helper function to get filtered firing mode options based on session type
export const getFilteredFiringModeOptions = (sessionType) => {
  // For Grouping and Zeroing sessions, only show Untimed and Timed modes
  if (sessionType === SESSION_TYPES.GROUPING || sessionType === SESSION_TYPES.ZEROING) {
    return FIRING_MODE_OPTIONS.filter(option =>
      option.value === FIRING_MODES.UNTIMED || option.value === FIRING_MODES.TIMED
    );
  }
  // For Practice and Test sessions, show all firing modes
  return FIRING_MODE_OPTIONS;
};

// Helper function to validate if a firing mode is allowed for a session type
export const isFiringModeValidForSessionType = (firingMode, sessionType) => {
  const validOptions = getFilteredFiringModeOptions(sessionType);
  return validOptions.some(option => option.value === firingMode);
};

// Zone-based scoring system constants
export const ZONE_SCORES = {
  BLUE_INNER_CIRCLE: 3,    // Inside blue inner circle (innermost zone)
  ORANGE_ESA_ZONE: 2,      // Between orange ESA ring and blue inner circle
  GREEN_BULLSEYE_ZONE: 1,  // Between green bullseye ring and orange ESA ring
  OUTSIDE_TARGET: 0        // Outside green bullseye ring
};

// Calculate zone-based score for a bullet hit
export const calculateZoneScore = (hit, bullseyePosition, ringRadii) => {
  if (!hit || !bullseyePosition || !ringRadii) {
    return ZONE_SCORES.OUTSIDE_TARGET;
  }

  // Calculate distance from hit to bullseye center
  const dx = hit.x - bullseyePosition.x;
  const dy = hit.y - bullseyePosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Debug logging for TIMED and SNAP modes
  const isDebugMode = window.location.search.includes('debug=true');
  if (isDebugMode) {
    console.log('🎯 Zone Score Debug:', {
      hit: { x: hit.x, y: hit.y },
      bullseyePosition,
      distance: distance.toFixed(2),
      ringRadii: {
        blue: ringRadii.blueInnerRadius?.toFixed(2),
        orange: ringRadii.orangeESARadius?.toFixed(2),
        green: ringRadii.greenBullseyeRadius?.toFixed(2)
      },
      score: distance <= ringRadii.blueInnerRadius ? 3 :
             distance <= ringRadii.orangeESARadius ? 2 :
             distance <= ringRadii.greenBullseyeRadius ? 1 : 0
    });
  }

  // Determine zone based on distance and ring radii
  // Zone scoring: innermost to outermost
  // FIXED: Correct zone-based scoring logic

  // 3 points: Shot lands INSIDE the blue inner circle (innermost ring)
  if (ringRadii.blueInnerRadius && distance <= ringRadii.blueInnerRadius) {
    if (isDebugMode) console.log('✅ Blue zone (3 pts)');
    return ZONE_SCORES.BLUE_INNER_CIRCLE; // 3 points
  }

  // 2 points: Shot lands BETWEEN orange ESA ring and blue inner circle
  if (ringRadii.orangeESARadius && distance <= ringRadii.orangeESARadius) {
    if (isDebugMode) console.log('✅ Orange zone (2 pts)');
    return ZONE_SCORES.ORANGE_ESA_ZONE; // 2 points
  }

  // 1 point: Shot lands BETWEEN green bullseye ring and orange ESA ring
  if (ringRadii.greenBullseyeRadius && distance <= ringRadii.greenBullseyeRadius) {
    if (isDebugMode) console.log('✅ Green zone (1 pt)');
    return ZONE_SCORES.GREEN_BULLSEYE_ZONE; // 1 point
  }

  // 0 points: Shot lands OUTSIDE the green bullseye ring
  if (isDebugMode) console.log('❌ Outside target (0 pts)');
  return ZONE_SCORES.OUTSIDE_TARGET; // 0 points
};

// Helper function to calculate ring radii based on template and ESA parameters
// This matches the exact logic from TargetDisplay component
export const calculateRingRadii = (template, esaParameter = null) => {
  // Target image dimensions: 14 cm × 13.3 cm
  // SVG viewBox: 400 × 400 pixels
  // Use the smaller dimension (13.3 cm) to maintain aspect ratio
  const targetPhysicalWidth = 133; // 13.3 cm in mm
  const targetPixelWidth = 400; // SVG width in pixels
  const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;

  // Convert template diameter (mm) to radius (pixels) - this is the GREEN bullseye ring (outermost)
  // Use 50px default to match TargetDisplay fallback
  const greenBullseyeRadius = template?.diameter ? (template.diameter / 2) * pixelsPerMm : 50;

  // Calculate ESA ring radius (ORANGE ring - middle) based on ESA parameter
  // This matches the exact TargetDisplay logic
  let orangeESARadius = null;
  if (esaParameter && esaParameter > 0) {
    // ESA calculation matching TargetDisplay exactly
    const maxESA = 96;
    const minESA = 5;
    const maxRatio = 0.85; // Maximum 85% of green ring
    const minRatio = 0.15; // Minimum 15% of green ring

    // Linear interpolation between min and max ratios
    const esaRatio = minRatio + ((esaParameter - minESA) / (maxESA - minESA)) * (maxRatio - minRatio);

    // Calculate ESA radius, ensuring it's always smaller than the green ring
    orangeESARadius = Math.min(greenBullseyeRadius * esaRatio, greenBullseyeRadius * 0.9);
  } else {
    // Default ESA ring = 70% of green ring when no ESA parameter
    orangeESARadius = greenBullseyeRadius * 0.7;
  }

  // BLUE inner circle radius = 25% of ESA ring radius (innermost)
  const blueInnerRadius = orangeESARadius ? orangeESARadius * 0.25 : greenBullseyeRadius * 0.175; // 0.7 * 0.25 = 0.175

  return {
    greenBullseyeRadius,    // Outermost ring (green)
    orangeESARadius,        // Middle ring (orange)
    blueInnerRadius         // Innermost ring (blue)
  };
};

// Enhanced function to calculate ring radii with actual ESA parameter from shooting parameters
export const calculateRingRadiiWithESA = (template, shootingParameters = null) => {
  const esaParameter = shootingParameters?.esa || null;
  return calculateRingRadii(template, esaParameter);
};

// Function to calculate diameter from custom distance input
// Based on TARGET_TEMPLATES pattern: 10m=130mm, 25m=120mm, 50m=110mm, 100m=100mm, 200m=90mm, 300m=80mm
export const calculateDiameterFromDistance = (distanceMeters) => {
  // Ensure we have a valid numeric distance
  const distance = parseFloat(distanceMeters);
  if (isNaN(distance) || distance <= 0) {
    return 100; // Default diameter if invalid input
  }

  // Analysis of TARGET_TEMPLATES data points:
  // Distance (m) | Diameter (mm)
  // 10          | 130
  // 25          | 120
  // 50          | 110
  // 100         | 100
  // 200         | 90
  // 300         | 80

  // The relationship is approximately linear with some variation
  // Using piecewise linear interpolation for accuracy

  if (distance <= 10) {
    // For distances 10m and below, use 130mm (largest rings)
    return 130;
  } else if (distance <= 25) {
    // Linear interpolation between 10m (130mm) and 25m (120mm)
    const ratio = (distance - 10) / (25 - 10);
    return 130 - (ratio * (130 - 120));
  } else if (distance <= 50) {
    // Linear interpolation between 25m (120mm) and 50m (110mm)
    const ratio = (distance - 25) / (50 - 25);
    return 120 - (ratio * (120 - 110));
  } else if (distance <= 100) {
    // Linear interpolation between 50m (110mm) and 100m (100mm)
    const ratio = (distance - 50) / (100 - 50);
    return 110 - (ratio * (110 - 100));
  } else if (distance <= 200) {
    // Linear interpolation between 100m (100mm) and 200m (90mm)
    const ratio = (distance - 100) / (200 - 100);
    return 100 - (ratio * (100 - 90));
  } else if (distance <= 300) {
    // Linear interpolation between 200m (90mm) and 300m (80mm)
    const ratio = (distance - 200) / (300 - 200);
    return 90 - (ratio * (90 - 80));
  } else {
    // For distances beyond 300m, continue the trend (smaller rings)
    // Extrapolate using the 200m-300m slope: -10mm per 100m
    const extraDistance = distance - 300;
    const slopePerMeter = -10 / 100; // -0.1mm per meter
    return Math.max(80 + (extraDistance * slopePerMeter), 20); // Minimum 20mm diameter
  }
};

// Function to create a virtual template object from custom distance
export const createTemplateFromDistance = (distanceMeters, customId = null) => {
  const distance = parseFloat(distanceMeters);
  if (isNaN(distance) || distance <= 0) {
    return null;
  }

  const diameter = calculateDiameterFromDistance(distance);

  return {
    id: customId || `custom-${distance}m`,
    name: `${distance}m`,
    diameter: Math.round(diameter * 10) / 10, // Round to 1 decimal place
    distance: `${distance}m`,
    caliber: 'Custom',
    description: `Custom target for ${distance}m distance`,
    isCustom: true
  };
};

// Get zone name for display purposes
export const getZoneName = (score) => {
  switch (score) {
    case ZONE_SCORES.BLUE_INNER_CIRCLE:
      return 'Blue Inner Circle';
    case ZONE_SCORES.ORANGE_ESA_ZONE:
      return 'Orange ESA Zone';
    case ZONE_SCORES.GREEN_BULLSEYE_ZONE:
      return 'Green Bullseye Zone';
    case ZONE_SCORES.OUTSIDE_TARGET:
      return 'Outside Target';
    default:
      return 'Unknown Zone';
  }
};

// Test function for scoring logic - can be called from browser console
export const testScoringLogic = () => {
  console.log('🎯 Testing Shot Scoring Logic for TIMED and SNAP modes');
  console.log('='.repeat(60));

  // Test with different templates and ESA parameters
  const testTemplates = [
    { name: '10m', diameter: 130 },
    { name: '25m', diameter: 120 },
    { name: '50m', diameter: 110 },
    { name: '100m', diameter: 100 },
    { name: '200m', diameter: 90 },
    { name: '300m', diameter: 80 }
  ];

  const testESAValues = [null, 25, 50, 75];

  testTemplates.forEach(template => {
    console.log(`\n📏 Template: ${template.name} (${template.diameter}mm diameter)`);

    testESAValues.forEach(esa => {
      console.log(`\n  🎯 ESA Parameter: ${esa || 'default (70%)'}`);

      const ringRadii = calculateRingRadii(template, esa);
      console.log(`  Ring Radii:`, {
        green: ringRadii.greenBullseyeRadius.toFixed(1),
        orange: ringRadii.orangeESARadius.toFixed(1),
        blue: ringRadii.blueInnerRadius.toFixed(1)
      });

      // Test shots at different distances from center
      const testShots = [
        { x: 200, y: 200, desc: 'Center (bullseye)' },
        { x: 200 + ringRadii.blueInnerRadius * 0.5, y: 200, desc: 'Inside blue ring' },
        { x: 200 + ringRadii.orangeESARadius * 0.8, y: 200, desc: 'Between orange and blue' },
        { x: 200 + ringRadii.greenBullseyeRadius * 0.9, y: 200, desc: 'Between green and orange' },
        { x: 200 + ringRadii.greenBullseyeRadius * 1.1, y: 200, desc: 'Outside green ring' }
      ];

      testShots.forEach(shot => {
        const score = calculateZoneScore(shot, { x: 200, y: 200 }, ringRadii);
        const distance = Math.sqrt((shot.x - 200) ** 2 + (shot.y - 200) ** 2);
        console.log(`    ${shot.desc}: ${score} pts (distance: ${distance.toFixed(1)}px)`);
      });
    });
  });

  console.log('\n✅ Scoring logic test completed!');
  console.log('Expected behavior:');
  console.log('- Shots inside blue ring = 3 points');
  console.log('- Shots between orange and blue rings = 2 points');
  console.log('- Shots between green and orange rings = 1 point');
  console.log('- Shots outside green ring = 0 points');
};

// Test function to reproduce the user's TIMED mode issue
export const testTimedModeIssue = () => {
  console.log('🎯 Testing TIMED Mode Issue Reproduction');

  // Simulate the exact scenario from user's screenshot
  // Screenshot shows bullseye at (-90, 112) relative to center
  // In 400x400 coordinate system: center = (200, 200)
  // So bullseye = (200 + (-90), 200 - 112) = (110, 88)
  const bullseyePosition = { x: 110, y: 88 };
  const template = { name: '25M', diameter: 120 }; // 25M template
  const esaParameter = 50; // Typical ESA value

  // Calculate ring radii
  const ringRadii = calculateRingRadii(template, esaParameter);

  console.log('🎯 Test Setup:', {
    bullseyePosition,
    template,
    esaParameter,
    ringRadii: {
      green: ringRadii.greenBullseyeRadius?.toFixed(1),
      orange: ringRadii.orangeESARadius?.toFixed(1),
      blue: ringRadii.blueInnerRadius?.toFixed(1)
    }
  });

  // Simulate 9 shots with positions that should give 4-3-2 breakdown
  // Positions are relative to bullseye at (110, 88)
  const testShots = [
    // 4 shots that should score 1 point (between green and orange rings)
    { x: 150, y: 88, expected: 1 },  // 40px right of bullseye
    { x: 70, y: 88, expected: 1 },   // 40px left of bullseye
    { x: 110, y: 128, expected: 1 }, // 40px below bullseye
    { x: 110, y: 48, expected: 1 },  // 40px above bullseye

    // 3 shots that should score 2 points (between orange and blue rings)
    { x: 130, y: 88, expected: 2 },  // 20px right of bullseye
    { x: 90, y: 88, expected: 2 },   // 20px left of bullseye
    { x: 110, y: 108, expected: 2 }, // 20px below bullseye

    // 2 shots that should score 3 points (inside blue ring)
    { x: 115, y: 88, expected: 3 },  // 5px right of bullseye
    { x: 105, y: 88, expected: 3 }   // 5px left of bullseye
  ];

  console.log('🎯 Testing Shot Scoring:');
  const breakdown = { 3: 0, 2: 0, 1: 0, 0: 0 };

  testShots.forEach((shot, index) => {
    const actualScore = calculateZoneScore(shot, bullseyePosition, ringRadii);
    breakdown[actualScore]++;

    const distance = Math.sqrt((shot.x - bullseyePosition.x) ** 2 + (shot.y - bullseyePosition.y) ** 2);

    console.log(`Shot #${index + 1}:`, {
      position: { x: shot.x, y: shot.y },
      distance: distance.toFixed(1),
      expectedScore: shot.expected,
      actualScore,
      correct: actualScore === shot.expected ? '✅' : '❌'
    });
  });

  console.log('🎯 Final Breakdown:', {
    expected: '4-3-2 (Green-Orange-Blue)',
    actual: `${breakdown[1]}-${breakdown[2]}-${breakdown[3]} (Green-Orange-Blue)`,
    correct: (breakdown[1] === 4 && breakdown[2] === 3 && breakdown[3] === 2) ? '✅' : '❌'
  });

  return breakdown;
};

// Test function for shots outside green ring (0-point shots)
export const testOutsideTargetShots = () => {
  console.log('🎯 Testing Shots Outside Green Ring (0-Point Shots)');

  const bullseyePosition = { x: 200, y: 200 }; // Center bullseye
  const template = { name: '50M', diameter: 110 }; // 50M template
  const esaParameter = 30; // ESA value

  // Calculate ring radii
  const ringRadii = calculateRingRadii(template, esaParameter);

  console.log('🎯 Test Setup:', {
    bullseyePosition,
    template,
    esaParameter,
    ringRadii: {
      green: ringRadii.greenBullseyeRadius?.toFixed(1),
      orange: ringRadii.orangeESARadius?.toFixed(1),
      blue: ringRadii.blueInnerRadius?.toFixed(1)
    }
  });
};

// Test function for custom distance ring scaling
export const testCustomDistanceRingScaling = () => {
  console.log('🎯 Testing Custom Distance Ring Scaling');

  // Test distances to verify inverse relationship
  const testDistances = [10, 25, 50, 75, 100, 150, 200, 300, 500];

  console.log('Distance (m) | Diameter (mm) | Green Ring (px) | Orange Ring (px) | Blue Ring (px)');
  console.log('------------|---------------|-----------------|------------------|----------------');

  testDistances.forEach(distance => {
    const virtualTemplate = createTemplateFromDistance(distance);
    if (virtualTemplate) {
      const ringRadii = calculateRingRadii(virtualTemplate, 30); // Use ESA=30 for consistency

      console.log(
        `${distance.toString().padStart(11)} | ` +
        `${virtualTemplate.diameter.toFixed(1).padStart(13)} | ` +
        `${ringRadii.greenBullseyeRadius.toFixed(1).padStart(15)} | ` +
        `${ringRadii.orangeESARadius.toFixed(1).padStart(16)} | ` +
        `${ringRadii.blueInnerRadius.toFixed(1).padStart(14)}`
      );
    }
  });

  console.log('\n🎯 Verification: Larger distances should show smaller ring sizes (inverse relationship)');

  // Test specific examples
  const template10m = createTemplateFromDistance(10);
  const template300m = createTemplateFromDistance(300);

  const rings10m = calculateRingRadii(template10m, 30);
  const rings300m = calculateRingRadii(template300m, 30);

  console.log('\n🎯 Comparison Test:');
  console.log(`10m rings:  Green=${rings10m.greenBullseyeRadius.toFixed(1)}px, Orange=${rings10m.orangeESARadius.toFixed(1)}px, Blue=${rings10m.blueInnerRadius.toFixed(1)}px`);
  console.log(`300m rings: Green=${rings300m.greenBullseyeRadius.toFixed(1)}px, Orange=${rings300m.orangeESARadius.toFixed(1)}px, Blue=${rings300m.blueInnerRadius.toFixed(1)}px`);
  console.log(`✅ 10m rings are ${(rings10m.greenBullseyeRadius / rings300m.greenBullseyeRadius).toFixed(1)}x larger than 300m rings`);
};

// Additional test function for comprehensive shot scoring
export const testComprehensiveShotScoring = () => {
  console.log('🎯 Testing Comprehensive Shot Scoring');

  const bullseyePosition = { x: 200, y: 200 }; // Center bullseye
  const template = { name: '50M', diameter: 110 }; // 50M template
  const esaParameter = 30; // ESA value
  const ringRadii = calculateRingRadii(template, esaParameter);

  // Test shots including some outside the green ring
  const testShots = [
    // 2 shots inside blue ring (3 points)
    { x: 205, y: 200, expected: 3 },
    { x: 195, y: 200, expected: 3 },

    // 2 shots between orange and blue (2 points)
    { x: 215, y: 200, expected: 2 },
    { x: 185, y: 200, expected: 2 },

    // 2 shots between green and orange (1 point)
    { x: 235, y: 200, expected: 1 },
    { x: 165, y: 200, expected: 1 },

    // 3 shots OUTSIDE green ring (0 points) - these should now be tracked!
    { x: 300, y: 200, expected: 0 }, // Far right
    { x: 100, y: 200, expected: 0 }, // Far left
    { x: 200, y: 350, expected: 0 }  // Far below
  ];

  console.log('🎯 Testing Shot Scoring (Including Outside Shots):');
  const breakdown = { 3: 0, 2: 0, 1: 0, 0: 0 };

  testShots.forEach((shot, index) => {
    const actualScore = calculateZoneScore(shot, bullseyePosition, ringRadii);
    breakdown[actualScore]++;

    const distance = Math.sqrt((shot.x - bullseyePosition.x) ** 2 + (shot.y - bullseyePosition.y) ** 2);

    console.log(`Shot #${index + 1}:`, {
      position: { x: shot.x, y: shot.y },
      distance: distance.toFixed(1),
      expectedScore: shot.expected,
      actualScore,
      zone: actualScore === 3 ? 'Blue (3pts)' :
            actualScore === 2 ? 'Orange (2pts)' :
            actualScore === 1 ? 'Green (1pt)' : 'Outside (0pts)',
      correct: actualScore === shot.expected ? '✅' : '❌'
    });
  });

  console.log('🎯 Final Breakdown:', {
    expected: '2-2-2-3 (Blue-Orange-Green-Outside)',
    actual: `${breakdown[3]}-${breakdown[2]}-${breakdown[1]}-${breakdown[0]} (Blue-Orange-Green-Outside)`,
    totalShots: testShots.length,
    outsideShots: breakdown[0],
    correct: (breakdown[3] === 2 && breakdown[2] === 2 && breakdown[1] === 2 && breakdown[0] === 3) ? '✅' : '❌'
  });

  return breakdown;
};

// Make test functions available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testScoringLogic = testScoringLogic;
  window.testTimedModeIssue = testTimedModeIssue;
  window.testOutsideTargetShots = testOutsideTargetShots;
  window.testCustomDistanceRingScaling = testCustomDistanceRingScaling;
  window.testComprehensiveShotScoring = testComprehensiveShotScoring;
  window.calculateZoneScore = calculateZoneScore;
  window.calculateRingRadii = calculateRingRadii;
  window.calculateDiameterFromDistance = calculateDiameterFromDistance;
  window.createTemplateFromDistance = createTemplateFromDistance;
}
