import TargetDisplay from './TargetDisplay';
// import ModernNavigation from './ModernNavigation';

const TargetSimulatorDemo = () => {
  const sampleTemplate = {
    name: "Standard Target",
    diameter: 100
  };

  return (
    <div className="min-h-screen modern-help-bg">
      {/* Modern Navigation */}
  {/* ModernNavigation removed, now rendered globally in App.jsx */}

      {/* Hero Section */}
      <div className="help-hero-section">
        <div className="help-hero-content">
          <div className="help-hero-badge">
            <span className="help-badge-icon">🎯</span>
            <span className="help-badge-text">Interactive Tutorial</span>
          </div>
          <h1 className="help-hero-title">
            Shooting Target Simulator
          </h1>
          <p className="help-hero-subtitle">
            Learn how to use our advanced shooting analysis system with this interactive demo
          </p>
          <div className="help-quick-tips">
            <div className="help-tip-item">
              <span className="help-tip-icon">👆</span>
              <span>Click to place shots</span>
            </div>
            <div className="help-tip-item">
              <span className="help-tip-icon">🎯</span>
              <span>Set bullseye reference</span>
            </div>
            <div className="help-tip-item">
              <span className="help-tip-icon">📊</span>
              <span>View real-time analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="help-demo-section">
        <div className="help-demo-container">
          <div className="help-demo-header">
            <h2 className="help-demo-title">Try It Yourself</h2>
            <p className="help-demo-description">
              Click on the target below to experience our shooting analysis system
            </p>
          </div>
          <div className="help-target-wrapper">
            <TargetDisplay template={sampleTemplate} />
          </div>
        </div>
      </div>

      {/* Step-by-Step Guide */}
      <div className="help-guide-section">
        <div className="help-guide-container">
          <div className="help-guide-header">
            <h2 className="help-guide-title">Step-by-Step Guide</h2>
            <p className="help-guide-subtitle">Follow these steps to master the shooting analysis system</p>
          </div>

          <div className="help-steps-grid">
            <div className="help-step-card">
              <div className="help-step-number">1</div>
              <div className="help-step-content">
                <h3 className="help-step-title">Set Bullseye Reference</h3>
                <p className="help-step-description">
                  First click on the target sets the bullseye (green dot) - this is your reference point for all measurements
                </p>
                <div className="help-step-visual">🎯</div>
              </div>
            </div>

            <div className="help-step-card">
              <div className="help-step-number">2</div>
              <div className="help-step-content">
                <h3 className="help-step-title">Place Shot Marks</h3>
                <p className="help-step-description">
                  Continue clicking to place bullet marks (red dots) around the target to simulate your shot group
                </p>
                <div className="help-step-visual">🔴</div>
              </div>
            </div>

            <div className="help-step-card">
              <div className="help-step-number">3</div>
              <div className="help-step-content">
                <h3 className="help-step-title">Real-time Tracking</h3>
                <p className="help-step-description">
                  Watch coordinates display in real-time as you move your cursor over the target area
                </p>
                <div className="help-step-visual">📍</div>
              </div>
            </div>

            <div className="help-step-card">
              <div className="help-step-number">4</div>
              <div className="help-step-content">
                <h3 className="help-step-title">Auto Analytics</h3>
                <p className="help-step-description">
                  Performance analytics calculate automatically based on your shot group patterns and accuracy
                </p>
                <div className="help-step-visual">📊</div>
              </div>
            </div>

            <div className="help-step-card">
              <div className="help-step-number">5</div>
              <div className="help-step-content">
                <h3 className="help-step-title">View Results</h3>
                <p className="help-step-description">
                  Click "Done Firing" when finished to see detailed results, statistics, and performance metrics
                </p>
                <div className="help-step-visual">✅</div>
              </div>
            </div>

            <div className="help-step-card">
              <div className="help-step-number">6</div>
              <div className="help-step-content">
                <h3 className="help-step-title">Reset & Retry</h3>
                <p className="help-step-description">
                  Use "Reset Target" to clear all shots and start over with a new bullseye for practice
                </p>
                <div className="help-step-visual">🔄</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="help-features-section">
        <div className="help-features-container">
          <div className="help-features-header">
            <h2 className="help-features-title">Key Features</h2>
            <p className="help-features-subtitle">Discover the powerful capabilities of our shooting analysis system</p>
          </div>

          <div className="help-features-grid">
            <div className="help-feature-card">
              <div className="help-feature-icon">🔴</div>
              <div className="help-feature-content">
                <h3 className="help-feature-title">Precision Shot Tracking</h3>
                <p className="help-feature-description">
                  Red bullet marks show exact shot placement with millimeter accuracy for detailed analysis
                </p>
                <div className="help-feature-benefits">
                  <span className="help-benefit-tag">Accurate</span>
                  <span className="help-benefit-tag">Visual</span>
                </div>
              </div>
            </div>

            <div className="help-feature-card">
              <div className="help-feature-icon">🟢</div>
              <div className="help-feature-content">
                <h3 className="help-feature-title">Dynamic Bullseye System</h3>
                <p className="help-feature-description">
                  Green bullseye marker serves as your reference point for all distance and accuracy calculations
                </p>
                <div className="help-feature-benefits">
                  <span className="help-benefit-tag">Flexible</span>
                  <span className="help-benefit-tag">Reference</span>
                </div>
              </div>
            </div>

            <div className="help-feature-card">
              <div className="help-feature-icon">🎯</div>
              <div className="help-feature-content">
                <h3 className="help-feature-title">Interactive Interface</h3>
                <p className="help-feature-description">
                  Intuitive click-to-place system makes shot entry quick and natural for any skill level
                </p>
                <div className="help-feature-benefits">
                  <span className="help-benefit-tag">Easy</span>
                  <span className="help-benefit-tag">Intuitive</span>
                </div>
              </div>
            </div>

            <div className="help-feature-card">
              <div className="help-feature-icon">📊</div>
              <div className="help-feature-content">
                <h3 className="help-feature-title">Real-time Analytics</h3>
                <p className="help-feature-description">
                  Advanced algorithms provide instant performance metrics and shooting pattern analysis
                </p>
                <div className="help-feature-benefits">
                  <span className="help-benefit-tag">Instant</span>
                  <span className="help-benefit-tag">Detailed</span>
                </div>
              </div>
            </div>

            <div className="help-feature-card">
              <div className="help-feature-icon">📍</div>
              <div className="help-feature-content">
                <h3 className="help-feature-title">Coordinate Display</h3>
                <p className="help-feature-description">
                  Live coordinate tracking shows precise X,Y positions as you move across the target
                </p>
                <div className="help-feature-benefits">
                  <span className="help-benefit-tag">Live</span>
                  <span className="help-benefit-tag">Precise</span>
                </div>
              </div>
            </div>

            <div className="help-feature-card">
              <div className="help-feature-icon">🔄</div>
              <div className="help-feature-content">
                <h3 className="help-feature-title">Reset & Practice</h3>
                <p className="help-feature-description">
                  Easily reset targets for multiple practice sessions and continuous improvement
                </p>
                <div className="help-feature-benefits">
                  <span className="help-benefit-tag">Practice</span>
                  <span className="help-benefit-tag">Repeat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Footer */}
      <div className="help-footer-section">
        <div className="help-footer-container">
          <div className="help-footer-content">
            <div className="help-footer-main">
              <h3 className="help-footer-title">Ready to Get Started?</h3>
              <p className="help-footer-description">
                Return to the main dashboard to begin your shooting analysis session
              </p>
            </div>
            <div className="help-footer-actions">
              <a href="/dashboard" className="help-footer-btn primary">
                <span className="help-btn-icon">🎯</span>
                <span className="help-btn-text">Go to Dashboard</span>
              </a>
              <button
                className="help-footer-btn secondary"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <span className="help-btn-icon">⬆️</span>
                <span className="help-btn-text">Back to Top</span>
              </button>
            </div>
          </div>

          <div className="help-footer-bottom">
            <div className="help-footer-info">
              <span className="help-footer-brand">ALMERIO Defence & Aerospace</span>
              <span className="help-footer-separator">•</span>
              <span className="help-footer-version">Shooting Analysis System v2.0</span>
            </div>
            <div className="help-footer-links">
              <span className="help-footer-link">Documentation</span>
              <span className="help-footer-separator">•</span>
              <span className="help-footer-link">Support</span>
              <span className="help-footer-separator">•</span>
              <span className="help-footer-link">Contact</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetSimulatorDemo;
