// Performance Remarks Utility
// Provides consistent performance rating and remarks across components

/**
 * Get performance remark based on accuracy and session type
 * @param {number} accuracy - Accuracy percentage (0-100)
 * @param {string} sessionType - Session type ('test', 'practice', etc.)
 * @returns {object} Performance remark object with rating, emoji, color, and bgColor
 */
export const getPerformanceRemark = (accuracy, sessionType) => {
  const acc = accuracy || 0;
  
  // Only show specific remarks for TEST sessions
  if (sessionType === 'test') {
    if (acc > 70) {
      return { 
        rating: 'MARKSMAN', 
        emoji: '🏆', 
        color: '#fbbf24', 
        bgColor: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        description: '>70%'
      };
    } else if (acc >= 60) {
      return { 
        rating: 'FIRST CLASS', 
        emoji: '🥇', 
        color: '#34d399', 
        bgColor: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        description: '70%-60%'
      };
    } else if (acc >= 40) {
      return { 
        rating: 'SECOND CLASS', 
        emoji: '🥈', 
        color: '#60a5fa', 
        bgColor: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        description: '60%-40%'
      };
    } else {
      return { 
        rating: 'FAILED', 
        emoji: '❌', 
        color: '#ef4444', 
        bgColor: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        description: '<40%'
      };
    }
  } else {
    // General performance ratings for other session types (no specific remarks)
    if (acc >= 90) {
      return { 
        rating: 'EXPERT MARKSMAN', 
        emoji: '🏆', 
        color: '#fbbf24', 
        bgColor: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        description: '≥90%'
      };
    } else if (acc >= 75) {
      return { 
        rating: 'SKILLED SHOOTER', 
        emoji: '🥇', 
        color: '#34d399', 
        bgColor: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        description: '≥75%'
      };
    } else if (acc >= 50) {
      return { 
        rating: 'IMPROVING SHOOTER', 
        emoji: '📈', 
        color: '#60a5fa', 
        bgColor: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        description: '≥50%'
      };
    } else {
      return { 
        rating: 'BEGINNER LEVEL', 
        emoji: '🎯', 
        color: '#94a3b8', 
        bgColor: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
        description: '<50%'
      };
    }
  }
};

/**
 * Check if a session type should show specific remarks
 * @param {string} sessionType - Session type
 * @returns {boolean} True if session type should show specific remarks
 */
export const shouldShowRemarks = (sessionType) => {
  return sessionType === 'test';
};

/**
 * Get remark badge style based on performance
 * @param {object} remark - Performance remark object
 * @returns {object} Style object for remark badge
 */
export const getRemarkBadgeStyle = (remark) => {
  return {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '15px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: remark.bgColor,
    color: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  };
};
