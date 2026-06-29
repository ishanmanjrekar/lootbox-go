import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onStart: () => void;
}

const LOADING_PHRASES = [
  "Rerouting mid-tier dopamine bursts...",
  "Stuffing pinata with absolute emptiness...",
  "Rigging gacha chest drop rates to 0.001%...",
  "Consulting virtual pinata union reps...",
  "Calibrating microtransaction popups...",
  "Generating artificial FOMO loops...",
  "Adding extra sparkles and paper fringe...",
  "Dopamine matrix ready to disappoint!"
];

const FLOATING_ITEMS = [
  // Left Column side items
  { icon: '🪅', top: '10%', left: '6%', size: '32px', delay: 0, type: 'emoji' },
  { icon: '🍬', top: '25%', left: '8%', size: '28px', delay: 0.8, type: 'emoji' },
  { icon: '🪙', top: '40%', left: '5%', size: '26px', delay: 1.5, type: 'emoji' },
  { icon: '🎁', top: '55%', left: '7%', size: '30px', delay: 0.3, type: 'emoji' },
  { icon: '🍭', top: '70%', left: '8%', size: '32px', delay: 2.1, type: 'emoji' },
  { icon: '★', top: '18%', left: '16%', size: '24px', delay: 1.2, type: 'shape' },
  { icon: '✦', top: '48%', left: '18%', size: '26px', delay: 0.7, type: 'shape' },
  { icon: '♥', top: '78%', left: '15%', size: '22px', delay: 2.9, type: 'shape' },

  // Right Column side items
  { icon: '🎉', top: '12%', right: '6%', size: '30px', delay: 0.5, type: 'emoji' },
  { icon: '🎈', top: '28%', right: '8%', size: '32px', delay: 1.9, type: 'emoji' },
  { icon: '💎', top: '42%', right: '5%', size: '28px', delay: 2.4, type: 'emoji' },
  { icon: '🪙', top: '58%', right: '7%', size: '26px', delay: 0.1, type: 'emoji' },
  { icon: '🪅', top: '72%', right: '8%', size: '30px', delay: 1.6, type: 'emoji' },
  { icon: '✦', top: '20%', right: '16%', size: '26px', delay: 2.5, type: 'shape' },
  { icon: '✿', top: '50%', right: '18%', size: '28px', delay: 3.2, type: 'shape' },
  { icon: '★', top: '80%', right: '15%', size: '24px', delay: 0.9, type: 'shape' },
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const [isExiting, setIsExiting] = useState(false);

  // Set up simulated progress bar
  useEffect(() => {
    const totalDuration = 3000; // 3 seconds
    const intervalTime = 30; // Update every 30ms
    const totalSteps = totalDuration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const nextProgress = Math.min(100, Math.floor((currentStep / totalSteps) * 100));
      setProgress(nextProgress);

      const segmentSize = 100 / (LOADING_PHRASES.length - 1);
      const nextPhraseIndex = Math.min(
        LOADING_PHRASES.length - 1,
        Math.floor(nextProgress / segmentSize)
      );
      setPhraseIndex(nextPhraseIndex);

      if (nextProgress >= 100) {
        clearInterval(interval);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  const handleTapToPlay = () => {
    if (progress < 100 || isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onStart();
    }, 450); // allow fadeout animation
  };

  const currentPhrase = LOADING_PHRASES[phraseIndex];

  // Asset paths

  const defaultBoxIcon = `${import.meta.env.BASE_URL}assets/boxes/box-5-closed.png`;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          onClick={handleTapToPlay}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, #EBF8FF 0%, #FFFDF9 55%, #FFEBF0 100%)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '40px 16px',
            boxSizing: 'border-box',
            touchAction: 'none',
            userSelect: 'none',
            cursor: progress >= 100 ? 'pointer' : 'default',
            overflow: 'hidden',
          }}
        >
          {/* Inject style block for repeating shine animations */}
          <style>{`
            @keyframes textShine {
              0% {
                background-position: -200% center;
              }
              100% {
                background-position: 200% center;
              }
            }
            .shine-lootbox {
              background: linear-gradient(
                120deg,
                #FF5C8A 0%,
                #FF5C8A 30%,
                #FFE0E6 45%,
                #FFFFFF 50%,
                #FFE0E6 55%,
                #FF5C8A 70%,
                #FF5C8A 100%
              );
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: textShine 3s linear infinite;
            }
            .shine-go {
              background: linear-gradient(
                120deg,
                #FFD166 0%,
                #FFD166 30%,
                #FFFFEB 45%,
                #FFFFFF 50%,
                #FFFFEB 55%,
                #FFD166 70%,
                #FFD166 100%
              );
              background-size: 200% auto;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              animation: textShine 3s linear infinite;
            }
          `}</style>

          {/* Drifting Side Items */}
          {FLOATING_ITEMS.map((item, idx) => {
            if (item.type === 'emoji') {
              return (
                <motion.div
                  key={idx}
                  animate={{
                    y: [0, -20, 0],
                    rotate: [0, 12, -12, 0],
                    scale: [1, 1.1, 0.93, 1],
                    filter: [
                      'drop-shadow(0 3px 0 rgba(77, 56, 52, 0.12)) hue-rotate(0deg)',
                      'drop-shadow(0 3px 0 rgba(77, 56, 52, 0.12)) hue-rotate(180deg)',
                      'drop-shadow(0 3px 0 rgba(77, 56, 52, 0.12)) hue-rotate(360deg)',
                    ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4.0 + idx * 0.45,
                    delay: item.delay,
                    ease: 'easeInOut',
                  }}
                  style={{
                    position: 'absolute',
                    top: item.top,
                    left: item.left,
                    right: item.right,
                    fontSize: item.size,
                    opacity: 0.45,
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                >
                  {item.icon}
                </motion.div>
              );
            } else {
              return (
                <motion.div
                  key={idx}
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 360],
                    scale: [1, 1.15, 0.85, 1],
                    color: ['#FF5C8A', '#FFD166', '#06D6A0', '#4EA8DE', '#9B5DE5', '#FF5C8A'],
                  }}
                  transition={{
                    y: { repeat: Infinity, duration: 3.2 + idx * 0.35, delay: item.delay, ease: 'easeInOut' },
                    scale: { repeat: Infinity, duration: 3.2 + idx * 0.35, delay: item.delay, ease: 'easeInOut' },
                    rotate: { repeat: Infinity, duration: 6.0 + idx * 0.7, ease: 'linear' },
                    color: { repeat: Infinity, duration: 5.0, ease: 'linear' }
                  }}
                  style={{
                    position: 'absolute',
                    top: item.top,
                    left: item.left,
                    right: item.right,
                    fontSize: item.size,
                    opacity: 0.6,
                    zIndex: 1,
                    pointerEvents: 'none',
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    textShadow: '0 2px 0 rgba(77, 56, 52, 0.15)',
                  }}
                >
                  {item.icon}
                </motion.div>
              );
            }
          })}

          {/* Top Branding Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              marginTop: '10px',
              zIndex: 10,
            }}
          >
            {/* Logo Area */}
            <div
              style={{
                position: 'relative',
                width: '170px',
                height: '170px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
              }}
            >
              {/* Spinning Conic Rainbow Sunburst 1 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  width: '190px',
                  height: '190px',
                  borderRadius: '50%',
                  background:
                    'conic-gradient(from 0deg, rgba(255, 92, 138, 0.25), rgba(255, 209, 102, 0.25), rgba(6, 214, 160, 0.25), rgba(78, 168, 222, 0.25), rgba(155, 93, 229, 0.25), rgba(255, 92, 138, 0.25))',
                  zIndex: 0,
                  pointerEvents: 'none',
                  filter: 'blur(8px)',
                }}
              />

              {/* Spinning Conic Rainbow Sunburst 2 */}
              <motion.div
                animate={{ rotate: -360, scale: [0.94, 1.06, 0.94] }}
                transition={{
                  rotate: { repeat: Infinity, duration: 28, ease: 'linear' },
                  scale: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
                }}
                style={{
                  position: 'absolute',
                  width: '175px',
                  height: '175px',
                  borderRadius: '50%',
                  background:
                    'conic-gradient(from 180deg, rgba(155, 93, 229, 0.2), rgba(78, 168, 222, 0.2), rgba(6, 214, 160, 0.2), rgba(255, 209, 102, 0.2), rgba(255, 92, 138, 0.2), rgba(155, 93, 229, 0.2))',
                  zIndex: 0,
                  pointerEvents: 'none',
                  filter: 'blur(12px)',
                }}
              />

              {/* Blush cheeks */}
              <div
                style={{
                  position: 'absolute',
                  width: '34px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FF8C94',
                  opacity: 0.65,
                  left: '14px',
                  bottom: '36px',
                  filter: 'blur(2.5px)',
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '34px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: '#FF8C94',
                  opacity: 0.65,
                  right: '14px',
                  bottom: '36px',
                  filter: 'blur(2.5px)',
                  zIndex: 1,
                }}
              />

              {/* Pinata Box */}
              <motion.img
                src={defaultBoxIcon}
                alt="Lootbox Go! Logo"
                animate={
                  progress < 100
                    ? {
                        y: [0, -12, 0],
                        rotate: [0, -4, 4, 0],
                        scale: [1, 1.04, 0.98, 1],
                      }
                    : {
                        scale: [1, 1.06, 0.97, 1.01, 1],
                        rotate: [0, -2, 2, 0],
                      }
                }
                transition={
                  progress < 100
                    ? {
                        y: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' },
                        rotate: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' },
                        scale: { repeat: Infinity, duration: 2.0, ease: 'easeInOut' },
                      }
                    : {
                        repeat: Infinity,
                        duration: 1.4,
                        ease: 'easeInOut',
                      }
                }
                style={{
                  width: '135px',
                  height: '135px',
                  objectFit: 'contain',
                  zIndex: 2,
                  filter: 'drop-shadow(0 7px 0 var(--border-color))',
                }}
              />
            </div>

            {/* Prominent Two-Line Title Logo with CSS Filter Shadow */}
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                margin: '4px 0 6px 0',
                filter: 'drop-shadow(0 5px 0 var(--border-color))' // Clean gacha drop shadow
              }}
            >
              <h1
                className="shine-lootbox"
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '56px',
                  margin: '0',
                  textAlign: 'center',
                  lineHeight: '0.85',
                  letterSpacing: '1px',
                }}
              >
                LOOTBOX
              </h1>
              <h1
                className="shine-go"
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '78px',
                  margin: '2px 0 0 0',
                  textAlign: 'center',
                  lineHeight: '0.85',
                  letterSpacing: '1.5px',
                }}
              >
                GO!
              </h1>
            </div>

            {/* Smaller, Muted, Subtitle */}
            <p
              style={{
                margin: '8px 0 0 0',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#A89691', // Fades slightly into background
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                opacity: 0.8,
              }}
            >
              A Satirical Idle Clicker
            </p>
          </div>

          {/* Bottom Interactive Area */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              zIndex: 10,
              marginBottom: '15px',
            }}
          >
            <AnimatePresence mode="wait">
              {progress < 100 ? (
                <motion.div
                  key="loading-panel"
                  initial={{ opacity: 1, scale: 0.95 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  className="kawaii-card"
                  style={{
                    width: '90%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '22px 18px',
                    backgroundColor: 'var(--bg-primary)',
                    boxShadow: '0 6px 0 var(--border-color)',
                  }}
                >
                  <div
                    style={{
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <motion.p
                      key={phraseIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        textAlign: 'center',
                        lineHeight: '1.45',
                      }}
                    >
                      {currentPhrase}
                    </motion.p>
                  </div>

                  {/* Rainbow progress bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '28px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '3px solid var(--border-color)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      boxShadow: 'inset 0 2px 4px rgba(77, 56, 52, 0.1)',
                    }}
                  >
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ type: 'tween', ease: 'linear', duration: 0.05 }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #55A630 0%, #FFD166 25%, #FF5C8A 50%, #4EA8DE 75%, #9B5DE5 100%)',
                        borderRight: progress > 0 ? '3px solid var(--border-color)' : 'none',
                        backgroundImage:
                          'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent), linear-gradient(90deg, #55A630 0%, #FFD166 25%, #FF5C8A 50%, #4EA8DE 75%, #9B5DE5 100%)',
                        backgroundSize: '20px 20px, 100% 100%',
                      }}
                    />

                    <span
                      style={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontFamily: 'var(--font-title)',
                        fontSize: '13px',
                        color: 'var(--text-main)',
                        textShadow: '1px 1px 0px var(--bg-primary)',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px',
                        pointerEvents: 'none',
                      }}
                    >
                      {progress}%
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="ready-panel"
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        '0 8px 0 var(--border-color), 0 0 15px rgba(255, 209, 102, 0.4)',
                        '0 8px 0 var(--border-color), 0 0 25px rgba(255, 209, 102, 0.8)',
                        '0 8px 0 var(--border-color), 0 0 15px rgba(255, 209, 102, 0.4)',
                      ],
                    }}
                    transition={{
                      scale: { repeat: Infinity, duration: 1.3, ease: 'easeInOut' },
                      boxShadow: { repeat: Infinity, duration: 1.3, ease: 'easeInOut' },
                    }}
                    style={{
                      width: '280px',
                      height: '70px',
                      backgroundColor: 'var(--accent-honey)',
                      border: '4px solid var(--border-color)',
                      borderRadius: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        right: '4px',
                        height: '16px',
                        borderRadius: '12px 12px 4px 4px',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 100%)',
                        pointerEvents: 'none',
                      }}
                    />

                    <span
                      style={{
                        fontFamily: 'var(--font-title)',
                        fontSize: '34px',
                        color: 'var(--text-white)',
                        WebkitTextStroke: '2px var(--border-color)',
                        textShadow: '3px 3px 0 var(--border-color)',
                        letterSpacing: '1.5px',
                      }}
                    >
                      TAP TO PLAY
                    </span>
                  </motion.button>

                  <p
                    style={{
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      textShadow: '0 1px 0 var(--bg-primary)',
                    }}
                  >
                    Resuming dopamine harvest...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
