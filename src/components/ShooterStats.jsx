import { useMemo, memo } from 'react';

const ShooterStats = memo(({ shooter, hits = [], bullseye = null, template = null }) => {
  // Filter out any bullseye bullets from hits array to ensure accurate shot count
  const actualShots = hits.filter(hit => !hit.isBullseye);
  // Get target center coordinates (400x400 target with center at 200,200)
  const getTargetCenter = () => {
    return { x: 200, y: 200 }; // Center of 400x400 target
  };

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate MPI using geometric iterative method (line division approach)
  const calculateIterativeMPI = (shots) => {
    if (shots.length === 0) return null;
    if (shots.length === 1) return { x: shots[0].x, y: shots[0].y };

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

  // Calculate MPI and Accuracy using same logic as TargetDisplay
  const calculateMPIAndAccuracy = () => {
    if (actualShots.length === 0) {
      return {
        mpi: 0,
        accuracy: 0,
        avgDistance: 0,
        maxDistance: 0,
        referencePoint: 'none',
        groupSize: 0
      };
    }

    // Calculate the true MPI using iterative geometric method
    const trueMPI = calculateIterativeMPI(actualShots);

    // Determine reference point: custom bullseye or target center
    let referencePoint;
    let referenceLabel;

    if (bullseye) {
      referencePoint = bullseye;
      referenceLabel = 'custom bullseye';
    } else {
      referencePoint = getTargetCenter();
      referenceLabel = 'center';
    }

    // Calculate distances from each hit to reference point
    const distances = actualShots.map(hit => calculateDistance(hit, referencePoint));
    const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
    const maxDistance = Math.max(...distances);

    // Calculate group size (spread) - distances from each shot to the MPI
    let groupSize = 0;
    if (trueMPI && actualShots.length > 1) {
      const distancesToMPI = actualShots.map(hit => calculateDistance(hit, trueMPI));
      groupSize = Math.max(...distancesToMPI) * 2; // Diameter of the group
    }

    // Template-based accuracy calculation
    let accuracy = 0;
    if (template) {
      // Calculate template radius in pixels
      const targetPhysicalWidth = 133; // 13.3 cm in mm
      const targetPixelWidth = 400; // SVG width in pixels
      const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;
      const templateRadius = (template.diameter / 2) * pixelsPerMm;

      // Accuracy based on how close shots are to target size
      const normalizedDistance = avgDistance / templateRadius;
      accuracy = Math.max(0, Math.min(100, (1 - normalizedDistance / 2) * 100));
    } else {
      // Fallback for no template: use 100 pixel reference
      const referenceDistance = 100;
      accuracy = Math.max(0, Math.min(100, (1 - (avgDistance / referenceDistance)) * 100));
    }

    // Convert pixels to mm using the same scale as template calculations
    const targetPhysicalWidth = 133; // 13.3 cm in mm
    const targetPixelWidth = 400; // SVG width in pixels
    const mmPerPixel = targetPhysicalWidth / targetPixelWidth;

    // MPI distance from reference point in mm
    const mpiDistanceFromReference = trueMPI ? calculateDistance(trueMPI, referencePoint) * mmPerPixel : 0;

    return {
      mpi: mpiDistanceFromReference,
      accuracy: accuracy,
      avgDistance: avgDistance,
      maxDistance: maxDistance,
      referencePoint: referenceLabel,
      groupSize: groupSize * mmPerPixel // Convert to mm
    };
  };

  // Calculate score for a single hit based on distance from reference point
  const getHitScore = (hit) => {
    if (!template) return 0;

    const referencePoint = bullseye || getTargetCenter();
    const distance = calculateDistance(hit, referencePoint);

    // Target image dimensions: 14 cm × 13.3 cm
    // SVG viewBox: 400 × 400 pixels
    // Use the smaller dimension (13.3 cm) to maintain aspect ratio
    const targetPhysicalWidth = 133; // 13.3 cm in mm
    const targetPixelWidth = 400; // SVG width in pixels

    // Calculate scale: pixels per mm
    const pixelsPerMm = targetPixelWidth / targetPhysicalWidth;

    // Convert template diameter (mm) to radius (pixels)
    const templateRadius = (template.diameter / 2) * pixelsPerMm;

    if (distance <= templateRadius * 0.3) return 10; // Inner ring
    if (distance <= templateRadius * 0.6) return 5;  // Middle ring
    if (distance <= templateRadius) return 1;        // Outer ring
    return 0; // Miss
  };

  // Calculate total score
  const getTotalScore = () => {
    return actualShots.reduce((total, hit) => total + getHitScore(hit), 0);
  };

  const stats = useMemo(() => calculateMPIAndAccuracy(), [actualShots, bullseye, template]);
  const totalScore = useMemo(() => getTotalScore(), [actualShots, template, bullseye]);

  if (!shooter) {
    return (
      <div className="card bg-gray-800">
        <div className="text-center text-gray-400 py-4">
          <div className="text-2xl mb-2">👤</div>
          <div>No shooter assigned</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Final Report Centered at Top */}
      <div className="mb-4 text-center">
        <h4 className="text-lg font-semibold text-shooter-accent">
          📊 Final Report
        </h4>
      </div>

      {/* Bottom Row: Name on Left, Shots on Right */}
      <div className="flex items-center justify-between mb-3">
        {/* Shooter Name at Bottom Left */}
        <div className="text-lg font-bold" style={{ color: '#2563eb' }}>
          Shooter Name : {shooter}
        </div>

        {/* Shot count at Bottom Right */}
        <div className="text-sm text-blue-700 font-semibold">
          {actualShots.length} shots
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-shooter-accent">
            {totalScore}
          </div>
          <div className="text-xs text-blue-600 font-semibold">TOTAL SCORE</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-shooter-accent">
            {stats.accuracy.toFixed(1)}%
          </div>
          <div className="text-xs text-blue-600 font-semibold">ACCURACY</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-blue-700 font-medium">Shots Fired:</span>
          <span className="text-blue-900 font-semibold">{actualShots.length}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-blue-700 font-medium">MPI:</span>
          <span className="text-blue-900 font-semibold">{stats.mpi.toFixed(1)} mm</span>
        </div>

        <div className="flex justify-between">
          <span className="text-blue-700 font-medium">Group Size:</span>
          <span className="text-blue-900 font-semibold">{stats.groupSize.toFixed(1)} mm</span>
        </div>

        <div className="flex justify-between">
          <span className="text-blue-700 font-medium">Max Distance:</span>
          <span className="text-blue-900 font-semibold">{stats.maxDistance.toFixed(1)} mm</span>
        </div>

        <div className="flex justify-between">
          <span className="text-blue-700 font-medium">Reference:</span>
          <span className="text-blue-900 font-semibold">
            {stats.referencePoint === 'custom bullseye' ? 'Custom Bullseye' : 'Target Center'}
          </span>
        </div>

        {bullseye && template && (
          <div className="flex justify-between">
            <span className="text-blue-700 font-medium">Template:</span>
            <span className="text-blue-900 font-semibold">{template.diameter}mm</span>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      {actualShots.length > 0 && bullseye && (
        <div className="mt-4 pt-4 border-t border-blue-300">
          <div className="text-xs text-blue-700 font-semibold mb-2">SHOT BREAKDOWN:</div>
          <div className="flex flex-wrap gap-3">
            {actualShots.map((hit, index) => {
              const score = getHitScore(hit);
              return (
                <div
                  key={index}
                  className={`score-badge-item text-center py-1 px-2 rounded text-xs font-bold ${
                    score === 10 ? 'bg-green-800 text-black' :
                    score === 5 ? 'bg-yellow-600 text-black' :
                    score === 1 ? 'bg-orange-700 text-black' :
                    'bg-red-700 text-black'
                  }`}
                >
                  {score}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Rating */}
      <div className="mt-4 pt-4 border-t border-blue-300">
        <div className="text-xs text-blue-700 font-semibold mb-2">PERFORMANCE:</div>
        <div className={`score-badge ${
          stats.accuracy >= 90 ? 'expert' :
          stats.accuracy >= 75 ? 'skilled' :
          stats.accuracy >= 50 ? 'improving' :
          'beginner'
        }`}>
          {stats.accuracy >= 90 ? '🏆 EXPERT' :
           stats.accuracy >= 75 ? '🎯 SKILLED' :
           stats.accuracy >= 50 ? '📈 IMPROVING' :
           '🔰 BEGINNER'}
        </div>
      </div>
    </div>
  );
});

ShooterStats.displayName = 'ShooterStats';

export default ShooterStats;
