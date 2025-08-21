import { useState, useEffect } from 'react';

const ShooterMessage = ({ message, laneId }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      // Auto-hide certain messages after 3 seconds
      const autoHideMessages = ['🎯 Hit Registered', '📍 Target Acquired', '🎯 Target Reset'];
      if (autoHideMessages.some(msg => message.includes(msg))) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [message]);

  if (!message || !isVisible) return null;

  const getMessageStyle = () => {
    if (message.includes('🎯 Target Online')) return 'border-blue-400 text-blue-600';
    if (message.includes('👤 Shooter Ready')) return 'border-blue-500 text-blue-700';
    if (message.includes('🔒 Target Locked')) return 'border-blue-300 text-blue-600';
    if (message.includes('📍 Target Acquired')) return 'border-shooter-accent text-shooter-accent';
    if (message.includes('🎯 Hit Registered')) return 'border-blue-600 text-blue-800';
    if (message.includes('🧠 Calculating')) return 'border-blue-400 text-blue-600';
    return 'border-shooter-accent text-shooter-accent';
  };

  return (
    <div className={`hud-message animate-slide-up ${getMessageStyle()}`}>
      <div className="flex items-center space-x-2">
        <span className="text-xs opacity-75 font-bold">{laneId.toUpperCase()}:</span>
        <span className="font-mono">{message}</span>
      </div>
    </div>
  );
};

export default ShooterMessage;
