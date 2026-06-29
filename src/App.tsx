import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoundingBox } from './components/BoundingBox';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore, getRequiredXpForLevel, type Reward } from './store/gameStore';
import boxesConfig from './config/boxes.json';
import { DebugPanel } from './components/DebugPanel';
import { StoreModal } from './components/StoreModal';
import { CollectionDrawer } from './components/CollectionDrawer';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { SplashScreen } from './components/SplashScreen';
import progressionConfig from './config/progression.json';
import energyConfig from './config/energy.json';


interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
  type: 'circle' | 'square' | 'star' | 'heart' | 'candy';
  rotation: number;
  vRot: number;
}

const KAWAII_ONE_LINERS = [
  "Sparkles, sweets, and happy thoughts... that's what my day is made of! ✨🍰",
  "Something wonderful is inside. Probably. 🌸",
  "Every box is a mystery. This one smells like cotton candy. 🍬",
  "A box a day keeps the real world away! 🦄",
  "Unicorn dust inside! Handle with virtual care. 🦄✨",
  "Dopamine delivery incoming! Click click click! 💕",
  "The boxes are calling and I must open them. 🌸💎",
  "Is it a legendary skin? Or just more fake XP? Open to find out! 👑",
  "Warning: Opening this box may trigger immediate satisfaction. 🌸✨"
];


function App() {
  const {
    level,
    xp,
    energy,
    pinatas,
    activeBoxSkin,
    openBox,
    updateEnergyRecharge,
    lastRechargeTime,
  } = useGameStore();

  // Dialog / Overlays State
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [displayedXp, setDisplayedXp] = useState(xp);
  const [displayedLevel, setDisplayedLevel] = useState(level);

  // Chest & Reward animation state
  const [chestState, setChestState] = useState<'idle' | 'opening' | 'open' | 'animating_xp'>('idle');
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [bannerText, setBannerText] = useState('');
  const [bannerStyle, setBannerStyle] = useState({
    backgroundColor: '#E8F4F8',
    transform: 'rotate(0deg)',
  });

  // Level Badge triple-tap reference
  const [tapCount, setTapCount] = useState(0);
  const lastTapRef = useRef<number>(0);

  // Particle System Canvas References
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Choose a random banner one-liner and style when box skin changes or when returning to idle
  useEffect(() => {
    if (chestState === 'idle') {
      const randomLine = KAWAII_ONE_LINERS[Math.floor(Math.random() * KAWAII_ONE_LINERS.length)];
      setBannerText(randomLine);

      const bgColors = ['#FFEBF0', '#E8F4F8', '#FFF7D6', '#F3E8FF', '#E8F8F5'];
      const rotations = ['rotate(-2.5deg)', 'rotate(2deg)', 'rotate(-1.5deg)', 'rotate(1.5deg)', 'rotate(0deg)'];
      
      setBannerStyle({
        backgroundColor: bgColors[Math.floor(Math.random() * bgColors.length)],
        transform: rotations[Math.floor(Math.random() * rotations.length)],
      });
    }
  }, [activeBoxSkin, chestState]);

  // Sync displayed XP and Level with the store state
  useEffect(() => {
    if (chestState === 'idle') {
      if (level > displayedLevel) {
        // If the level in the store increased while we were idle (e.g. from cheat menu),
        // show the level up modal and update displayed values!
        setDisplayedLevel(level);
        setDisplayedXp(xp);
        setShowLevelUpModal(true);
      } else {
        // Normal sync
        setDisplayedLevel(level);
        setDisplayedXp(xp);
      }
    }
  }, [xp, level, chestState, displayedLevel]);

  // 1-second passive energy recharge timer
  useEffect(() => {
    const interval = setInterval(() => {
      updateEnergyRecharge();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateEnergyRecharge]);

  // Live countdown timer for energy recharge
  useEffect(() => {
    const maxEnergy = energyConfig.maxEnergy;
    const rechargeIntervalMs = energyConfig.rechargeIntervalSeconds * 1000;

    if (energy >= maxEnergy) {
      setTimeLeftStr('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const elapsedTime = now - lastRechargeTime;
      const msLeft = Math.max(0, rechargeIntervalMs - Math.max(0, elapsedTime));
      const secondsLeft = Math.ceil(msLeft / 1000);
      
      const m = Math.floor(secondsLeft / 60);
      const s = secondsLeft % 60;
      const mStr = String(m).padStart(2, '0');
      const sStr = String(s).padStart(2, '0');
      setTimeLeftStr(`${mStr}:${sStr}`);
    };

    updateTimer(); // run immediately
    const timerInterval = setInterval(updateTimer, 500); // update every 500ms
    return () => clearInterval(timerInterval);
  }, [energy, lastRechargeTime]);

  // Sync energy recharge when visibility returns to visible (application resume)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateEnergyRecharge();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateEnergyRecharge]);

  // Handle Level Badge Tapping (Triple tap opens Debug Panel)
  const handleLevelBadgeTap = () => {
    if (import.meta.env.VITE_DISABLE_DEBUG === 'true') {
      return;
    }
    const now = Date.now();
    if (now - lastTapRef.current < 450) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 2) {
        setIsDebugOpen(true);
        setTapCount(0);
      }
    } else {
      setTapCount(1);
    }
    lastTapRef.current = now;
  };

  // Canvas particle loops
  useGameLoop((deltaTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * (deltaTime / 16.67);
      p.y += p.vy * (deltaTime / 16.67);
      p.vy += 0.25 * (deltaTime / 16.67); // gravity
      p.rotation += p.vRot * (deltaTime / 16.67);
      p.alpha -= 0.015 * (deltaTime / 16.67);

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;

      // Draw custom Kawaii shapes
      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'square') {
        ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
      } else if (p.type === 'star') {
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(
            Math.cos(((18 + j * 72) * Math.PI) / 180) * p.size,
            Math.sin(((18 + j * 72) * Math.PI) / 180) * p.size
          );
          ctx.lineTo(
            Math.cos(((54 + j * 72) * Math.PI) / 180) * (p.size / 2),
            Math.sin(((54 + j * 72) * Math.PI) / 180) * (p.size / 2)
          );
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'heart') {
        ctx.beginPath();
        ctx.moveTo(0, p.size / 4);
        ctx.quadraticCurveTo(0, -p.size / 2, -p.size / 2, -p.size / 2);
        ctx.quadraticCurveTo(-p.size, -p.size / 2, -p.size, 0);
        ctx.quadraticCurveTo(-p.size, p.size / 2, 0, p.size);
        ctx.quadraticCurveTo(p.size, p.size / 2, p.size, 0);
        ctx.quadraticCurveTo(p.size, -p.size / 2, p.size / 2, -p.size / 2);
        ctx.quadraticCurveTo(0, -p.size / 2, 0, p.size / 4);
        ctx.fill();
      } else if (p.type === 'candy') {
        // wrappers
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size / 2);
        ctx.lineTo(-p.size, p.size / 2);
        ctx.lineTo(-p.size / 2, 0);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(p.size, -p.size / 2);
        ctx.lineTo(p.size, p.size / 2);
        ctx.lineTo(p.size / 2, 0);
        ctx.closePath();
        ctx.fill();

        // candy ball
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  });

  const spawnParticles = (x: number, y: number, count = 25) => {
    const colors = ['#FF5C8A', '#4EA8DE', '#FFD166', '#06D6A0', '#FFC6FF', '#D8B4F8'];
    const types: ('circle' | 'square' | 'star' | 'heart' | 'candy')[] = [
      'circle',
      'square',
      'star',
      'heart',
      'candy',
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3, // fly upwards
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        type: types[Math.floor(Math.random() * types.length)],
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() * 2 - 1) * 0.1,
      });
    }
  };

  const triggerConfettiRain = () => {
    // Spawns particles on both left and right sides cascading down
    const colors = ['#FF5C8A', '#4EA8DE', '#FFD166', '#06D6A0', '#FFC6FF', '#D8B4F8'];
    const types: ('circle' | 'square' | 'star' | 'heart' | 'candy')[] = [
      'circle',
      'square',
      'star',
      'heart',
      'candy',
    ];

    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x: Math.random() * 450,
        y: -10,
        vx: (Math.random() * 2 - 1) * 2,
        vy: 1 + Math.random() * 4,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        type: types[Math.floor(Math.random() * types.length)],
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() * 2 - 1) * 0.05,
      });
    }
  };

  const handleOpenBox = () => {
    if (chestState !== 'idle') return;

    if (energy < 1) {
      setIsStoreOpen(true);
      return;
    }

    const reward = openBox();
    if (!reward) {
      alert('Out of Energy! ⚡ Visit the Store to buy a refill or get free Pinatas!');
      return;
    }

    setCurrentReward(reward);
    setChestState('opening');
    spawnParticles(225, 400, 15);

    // Opening shake and delay
    setTimeout(() => {
      setChestState('open');
      spawnParticles(225, 400, 45);
    }, 600);
  };

  const animateXpGain = (totalXpToAdd: number) => {
    setChestState('animating_xp');
    setCurrentReward(null);

    let currentLvl = displayedLevel;
    let currentXpVal = displayedXp;
    let xpLeftToAdd = totalXpToAdd;

    const tick = () => {
      const reqXp = getRequiredXpForLevel(currentLvl);
      const spaceInBar = reqXp - currentXpVal;

      if (xpLeftToAdd >= spaceInBar) {
        currentXpVal = reqXp;
        xpLeftToAdd -= spaceInBar;
        setDisplayedXp(reqXp);

        setTimeout(() => {
          currentLvl += 1;
          currentXpVal = 0;
          setDisplayedLevel(currentLvl);
          setDisplayedXp(0);
          setShowLevelUpModal(true);

          setTimeout(() => {
            if (xpLeftToAdd > 0) {
              tick();
            } else {
              setChestState('idle');
            }
          }, 400);
        }, 600);
      } else {
        currentXpVal += xpLeftToAdd;
        xpLeftToAdd = 0;
        setDisplayedXp(currentXpVal);

        setTimeout(() => {
          setChestState('idle');
        }, 600);
      }
    };

    tick();
  };

  const handleCloseReward = () => {
    if (currentReward && currentReward.type === 'xp') {
      animateXpGain(currentReward.amount);
    } else {
      setChestState('idle');
      setCurrentReward(null);
    }
  };

  // Get current Level Progress calculations
  const displayedRequiredXp = getRequiredXpForLevel(displayedLevel);
  const displayedXpPercent = Math.min(100, (displayedXp / displayedRequiredXp) * 100);

  // Level visual tiers helper
  const getLevelTier = (lvl: number) => {
    const sortedVisuals = [...progressionConfig.levelVisuals].sort((a, b) => b.level - a.level);
    const matched = sortedVisuals.find((v) => lvl >= v.level);
    return matched || { tier: 'Bronze', badgeColor: '#cd7f32', glow: 'none' };
  };
  const currentTierInfo = getLevelTier(level);

  const rewardButtonText = useMemo(() => {
    if (!currentReward) return 'AWESOME!';
    const variants = [
      'AWESOME!',
      'WOW!',
      'WHOA!',
      'AMAZING!',
      'COOL!',
      'SWEET!',
      'NICE!',
      'EPIC!',
      'YAY!',
      'NEAT!',
      'GREAT!',
      'RAD!'
    ];
    const randomIndex = Math.floor(Math.random() * variants.length);
    return variants[randomIndex];
  }, [currentReward]);

  // Asset paths
  const energyIcon = `${import.meta.env.BASE_URL}assets/icons/energy.png`;
  const pinataIcon = `${import.meta.env.BASE_URL}assets/icons/pinata.png`;
  const cartIcon = `${import.meta.env.BASE_URL}assets/icons/shopping_cart.png`;
  const xpCrownIcon = `${import.meta.env.BASE_URL}assets/icons/xp_crown.png`;

  return (
    <BoundingBox width={450} height={800}>
      <div className="game-container">
        <AnimatePresence>
          {isSplashActive && (
            <SplashScreen onStart={() => setIsSplashActive(false)} />
          )}
        </AnimatePresence>

        {/* Particle Canvas Overlay Layer */}
        <canvas
          ref={canvasRef}
          className="particle-layer"
          width={450}
          height={800}
        />

        {/* --- HUD LAYER --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Energy Display */}
            <div
              className="kawaii-panel"
              style={{
                minHeight: '42px',
                height: 'auto',
                padding: energy < energyConfig.maxEnergy ? '2px 12px' : '0 12px',
                gap: '6px',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <img src={energyIcon} alt="Energy" style={{ width: '24px', height: '24px' }} />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: '1.1',
                }}
              >
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{energy}/10</span>
                {energy < energyConfig.maxEnergy && timeLeftStr && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#FF5C8A',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {timeLeftStr}
                  </span>
                )}
              </div>
            </div>

            {/* Store shopping cart trigger */}
            <button
              className="kawaii-panel"
              onClick={() => setIsStoreOpen(true)}
              style={{
                height: '42px',
                width: '54px',
                padding: 0,
                backgroundColor: '#FFD166',
                cursor: 'pointer',
              }}
            >
              <img src={cartIcon} alt="Shop" style={{ width: '26px', height: '26px' }} />
            </button>

            {/* Pinata Wallet */}
            <div className="kawaii-panel" style={{ height: '42px', padding: '0 12px', gap: '6px' }}>
              <img src={pinataIcon} alt="Pinatas" style={{ width: '24px', height: '24px' }} />
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{pinatas}</span>
            </div>
          </div>

          {/* XP Bar Component */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={xpCrownIcon} alt="XP" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#FFEBF0',
                  border: '3px solid #4D3834',
                  borderRadius: '16px',
                  height: '26px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 3px 0 #4D3834',
                }}
              >
                {/* Green filled bar progress */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayedXpPercent}%` }}
                  transition={{ type: 'spring', damping: 15 }}
                  style={{
                    height: '100%',
                    backgroundColor: '#06D6A0',
                    borderRadius: '12px 0 0 12px',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    width: '100%',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    color: '#3D2622',
                    zIndex: 2,
                  }}
                >
                  {displayedXp} / {displayedRequiredXp} XP
                </span>
              </div>
            </div>

            {/* Level status row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 4px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#8E7A75' }}>
                Earn XP to Level Up
              </span>

              {/* LEVEL TEXT BADGE (TRIPLE TAP DETECTOR) */}
              <div
                onClick={handleLevelBadgeTap}
                className={currentTierInfo.glow !== 'none' ? currentTierInfo.glow : ''}
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '16px',
                  color: '#FFFDF9',
                  cursor: 'pointer',
                  border: `2px solid #4D3834`,
                  borderRadius: '12px',
                  padding: '4px 12px',
                  backgroundColor: currentTierInfo.badgeColor,
                  boxShadow: '0 3px 0 #4D3834',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textShadow: '1px 1px 0px #4D3834, -1px -1px 0px #4D3834, 1px -1px 0px #4D3834, -1px 1px 0px #4D3834',
                }}
              >
                <span>LEVEL {displayedLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- VIEWPORT CENTRE STAGE --- */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            gap: '12px',
          }}
        >
          <AnimatePresence mode="wait">
            {chestState === 'idle' && (
              <motion.div
                key="idle-view"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                {/* Description One-Liner Box */}
                <div
                  className="kawaii-card"
                  style={{
                    backgroundColor: bannerStyle.backgroundColor,
                    transform: bannerStyle.transform,
                    maxWidth: '300px',
                    textAlign: 'center',
                    padding: '10px 14px',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {bannerText}
                </div>

                {/* Closed Lootbox breathing animation */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95, rotate: [0, -3, 3, -3, 0] }}
                  onClick={handleOpenBox}
                  className="breathe"
                  style={{
                    cursor: 'pointer',
                    width: '270px',
                    height: '270px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}assets/boxes/${activeBoxSkin}-closed.png`}
                    alt="Lootbox"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: energy < 1 ? 'grayscale(0.7)' : 'none',
                    }}
                  />
                </motion.div>
              </motion.div>
            )}

            {chestState === 'opening' && (
              <motion.div
                key="opening-view"
                animate={{
                  rotate: [0, -8, 8, -8, 8, -4, 4, 0],
                  scale: [1, 1.15, 1.05, 1.25, 1.1, 1.35],
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{
                  width: '270px',
                  height: '270px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}assets/boxes/${activeBoxSkin}-closed.png`}
                  alt="Opening Lootbox"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </motion.div>
            )}

            {chestState === 'open' && (
              <motion.div
                key="open-view"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  width: '100%',
                }}
              >
                {/* Opened Lootbox Image */}
                <div style={{ width: '220px', height: '220px', position: 'relative', zIndex: 10 }}>
                  <img
                    src={`${import.meta.env.BASE_URL}assets/boxes/${activeBoxSkin}-open.png`}
                    alt="Open Lootbox"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* Reward Reveal Card */}
                {currentReward && (
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    {/* Starburst backdrop for skin unlock */}
                    {currentReward.type === 'skin' && (
                      <>
                        <div className="starburst-bg" />
                        <div className="sparkle-container">
                          <span className="sparkle-particle sp-1">✨</span>
                          <span className="sparkle-particle sp-2">🌟</span>
                          <span className="sparkle-particle sp-3">✨</span>
                          <span className="sparkle-particle sp-4">⭐</span>
                          <span className="sparkle-particle sp-5">✨</span>
                          <span className="sparkle-particle sp-6">🌟</span>
                        </div>
                      </>
                    )}
                    <motion.div
                      initial={{ scale: 0, rotateY: 180, opacity: 0 }}
                      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 12 }}
                      className="kawaii-panel"
                      style={{
                        padding: '16px 24px',
                        width: '240px',
                        flexDirection: 'column',
                        gap: '8px',
                        backgroundColor:
                          currentReward.type === 'skin' ? '#FFC6FF' : '#FFFDF9',
                        borderWidth: '4px',
                        zIndex: 2,
                      }}
                    >
                    <div
                      style={{
                        color: '#8E7A75',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                      }}
                    >
                      {currentReward.type === 'skin' ? '✨ NEW UNLOCK! ✨' : 'REWARD Gained'}
                    </div>

                    {currentReward.type === 'xp' ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <img src={xpCrownIcon} alt="XP" style={{ width: '28px', height: '28px' }} />
                        <span
                          className="title-bubble"
                          style={{ fontSize: '32px', color: '#06D6A0' }}
                        >
                          +{currentReward.amount}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            fontWeight: 'bold',
                            fontSize: '16px',
                            color: '#3D2622',
                            lineHeight: '1.3',
                          }}
                        >
                          {(() => {
                            const name =
                              boxesConfig.boxes.find((b: any) => b.id === currentReward.boxId)?.name ||
                              'New Theme';
                            return name;
                          })()}
                        </div>
                        <div
                          style={{
                            width: '80px',
                            height: '80px',
                            margin: '4px 0',
                            borderRadius: '12px',
                            border: '2px solid #4D3834',
                            backgroundColor: '#FFFDF9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <img
                            src={`${import.meta.env.BASE_URL}assets/boxes/${currentReward.boxId}-closed.png`}
                            alt="New skin unlocked"
                            style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                          />
                        </div>
                        <div style={{ fontSize: '11px', color: '#8E7A75', fontWeight: 500 }}>
                          Auto-equipped the theme!
                        </div>
                      </>
                    )}
                  </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- FOOTER / CONTROLS LAYER --- */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
            paddingBottom: '126px', // leave room for collapsed collection drawer title
          }}
        >
          {chestState === 'open' ? (
            <button
              className="btn-primary"
              onClick={handleCloseReward}
              style={{ width: '100%', maxWidth: '240px', backgroundColor: '#06D6A0' }}
            >
              {rewardButtonText}
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleOpenBox}
              disabled={chestState === 'opening' || chestState === 'animating_xp'}
              style={{
                width: '100%',
                maxWidth: '240px',
                ...(energy < 1 ? {
                  backgroundColor: '#dedede',
                  color: '#a0a0a0',
                  boxShadow: '0 6px 0 #4D3834',
                } : {}),
              }}
            >
              <span>OPEN BOX</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '16px' }}>
                <img src={energyIcon} alt="cost" style={{ width: '18px', height: '18px' }} />
                <span>x1</span>
              </div>
            </button>
          )}
        </div>

        {/* Bottom slide drawer collection */}
        <CollectionDrawer
          isOpen={isCollectionOpen}
          onToggle={() => setIsCollectionOpen(!isCollectionOpen)}
        />

        {/* Modal: Store overlays */}
        <StoreModal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} />

        {/* Modal: Debug Operations cheat sheet */}
        {import.meta.env.VITE_DISABLE_DEBUG !== 'true' && (
          <DebugPanel isOpen={isDebugOpen} onClose={() => setIsDebugOpen(false)} />
        )}

        {/* Modal: celebratory Level Up */}
        <LevelUpOverlay
          isOpen={showLevelUpModal}
          level={displayedLevel}
          onClose={() => setShowLevelUpModal(false)}
          triggerConfetti={triggerConfettiRain}
        />
      </div>
    </BoundingBox>
  );
}

export default App;
