import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import progressionConfig from '../config/progression.json';

import { AutoClickStroke } from './AutoClickStroke';

interface LevelUpOverlayProps {
  isOpen: boolean;
  level: number;
  onClose: () => void;
  triggerConfetti: () => void;
  isAutoMode: boolean;
  setAutoMode: (val: boolean) => void;
}

export const LevelUpOverlay: React.FC<LevelUpOverlayProps> = ({
  isOpen,
  level,
  onClose,
  triggerConfetti,
  isAutoMode,
  setAutoMode,
}) => {
  const [isDismissPress, setIsDismissPress] = React.useState(false);

  const handleDismissComplete = () => {
    setIsDismissPress(true);
    setTimeout(() => {
      setIsDismissPress(false);
      onClose();
    }, 100);
  };

  const handleDismissClick = () => {
    if (isAutoMode) {
      setAutoMode(false);
    }
    onClose();
  };
  // Trigger particle burst on mount
  useEffect(() => {
    if (isOpen) {
      triggerConfetti();
      // Schedule multiple bursts for absolute dopamine overflow!
      const timer1 = setTimeout(triggerConfetti, 300);
      const timer2 = setTimeout(triggerConfetti, 600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, triggerConfetti]);

  // Determine Level Visual style according to config
  const getLevelVisuals = (lvl: number) => {
    // Find matching tier
    const sortedVisuals = [...progressionConfig.levelVisuals].sort((a, b) => b.level - a.level);
    const matched = sortedVisuals.find((v) => lvl >= v.level);
    return matched || { tier: 'Bronze', badgeColor: '#cd7f32', glow: 'none' };
  };

  const currentVisuals = getLevelVisuals(level);
  const oldVisuals = getLevelVisuals(Math.max(1, level - 1));

  const praiseMessage = React.useMemo(() => {
    if (!isOpen) return '';
    const messages = [
      `Congratulations! You are officially level ${level}. Your strategic gameplay (opening boxes) has unlocked new levels of empty satisfaction.`,
      `Splendid! You have achieved level ${level}! That is ${level} levels closer to complete, meaningless completionism.`,
      `Wow! Level ${level}! Your dedication to tap-to-open mechanics has proven your ability to waste time beautifully.`,
      `Unbelievable! You are now level ${level}! Our algorithms have officially registered a temporary spike in your dopamine levels.`,
      `Incredible! Level ${level} reached! Your virtual collection is growing, but your real-life responsibilities remain unchanged.`,
      `Awesome! You've ascended to level ${level}. Truly a masterclass in pressing digital buttons for colored pixels.`,
      `Hooray! Level ${level} is yours! You are officially ${level} times more accomplished at this than you were when you started.`,
      `Spectacular! Level ${level} unlocked! Feel the rush of progress without the burden of real productivity.`,
      `Sensational! You are now level ${level}! A major milestone on your journey to becoming a certified box-opening champion.`,
      `Bravo! Level ${level} achieved! Your reward? The privilege of opening even more boxes for even higher numbers.`,
      `Astonishing! You hit level ${level}! If only your bank account grew as fast as this virtual level counter.`,
      `Majestic! Level ${level} is here! Your virtual status has been elevated to heights that don't matter to anyone else.`
    ];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }, [isOpen, level]);

  const dismissButtonText = React.useMemo(() => {
    if (!isOpen) return 'Awesome!';
    const variants = [
      'Awesome!',
      'Wow!',
      'Whoa!',
      'Amazing!',
      'Cool!',
      'Sweet!',
      'Nice!',
      'Epic!',
      'Yay!',
      'Neat!',
      'Great!',
      'Rad!'
    ];
    const randomIndex = Math.floor(Math.random() * variants.length);
    return variants[randomIndex];
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(77, 56, 52, 0.85)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
          }}
        >
          {/* Confetti Celebration Panel */}
          <motion.div
            initial={{ scale: 0.3, y: 100, rotate: -15 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.3, y: 100, rotate: 15 }}
            transition={{ type: 'spring', damping: 12, stiffness: 150 }}
            className={`kawaii-panel ${currentVisuals.glow !== 'none' ? currentVisuals.glow : ''}`}
            style={{
              width: '100%',
              maxWidth: '360px',
              backgroundColor: '#FFFDF9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '32px 20px',
              gap: '24px',
              textAlign: 'center',
              borderWidth: '4px',
            }}
          >
            {/* Celebration Title */}
            <div>
              <motion.h1
                animate={{
                  scale: [1, 1.15, 1, 1.15, 1],
                  rotate: [0, -5, 5, -5, 0],
                }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                className="title-bubble"
                style={{ fontSize: '42px', margin: 0, lineHeight: 1 }}
              >
                LEVEL UP!
              </motion.h1>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#FF5C8A',
                  marginTop: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                🎉 Dopamine Rush Enabled 🎉
              </div>
            </div>

            {/* Level Transition Visuals */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Old Level Badge */}
              <div
                className={`kawaii-panel shine-sweep-container badge-tier-${oldVisuals.tier.toLowerCase()}`}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  borderColor: '#4D3834',
                  boxShadow: '0 4px 0 #4D3834',
                  padding: 0,
                  flexDirection: 'column',
                }}
              >
                <div className="shine-sweep-overlay" />
                <span
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '24px',
                    color: '#FFFDF9',
                    position: 'relative',
                    zIndex: 2,
                  }}
                  className="text-stroke-brown"
                >
                  {level - 1}
                </span>
              </div>

              {/* Arrow */}
              <span style={{ fontSize: '32px', color: '#4D3834', fontWeight: 'bold' }}>➜</span>

              {/* New Level Badge */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`kawaii-panel shine-sweep-container badge-tier-${currentVisuals.tier.toLowerCase()}`}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  borderColor: '#4D3834',
                  boxShadow: '0 6px 0 #4D3834',
                  padding: 0,
                  flexDirection: 'column',
                  borderWidth: '4px',
                }}
              >
                <div className="shine-sweep-overlay" />
                <span
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '36px',
                    color: '#FFFDF9',
                    position: 'relative',
                    zIndex: 2,
                  }}
                  className="text-stroke-brown"
                >
                  {level}
                </span>
              </motion.div>
            </div>

            {/* Praise message */}
            <div style={{ color: '#4D3834', fontSize: '14px', lineHeight: 1.5, fontWeight: 500 }}>
              {praiseMessage}
            </div>

            {/* Dismiss Button */}
            <button
              className="btn-primary"
              onClick={handleDismissClick}
              style={{
                width: '100%',
                fontSize: '18px',
                backgroundColor: '#06D6A0',
                boxShadow: isDismissPress ? '0 2px 0 #4D3834' : '0 6px 0 #4D3834',
                transform: isDismissPress ? 'translateY(4px)' : undefined,
                padding: '16px',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              {isAutoMode && isOpen && (
                <AutoClickStroke duration={4} onComplete={handleDismissComplete} strokeColor="#036B50" />
              )}
              <span style={{ position: 'relative', zIndex: 2 }}>{dismissButtonText}</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
