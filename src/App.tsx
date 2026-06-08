import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BoundingBox } from './components/BoundingBox';
import { useGameLoop } from './hooks/useGameLoop';
import { useGameStore } from './store/gameStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

function App() {
  const { coins, boxesOpened, openBox, addCoins, resetGame } = useGameStore();
  const [chestState, setChestState] = useState<'idle' | 'opening' | 'open'>('idle');
  const [reward, setReward] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Use the game loop hook to animate particles on a background canvas
  useGameLoop((deltaTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with semi-transparent black for a motion blur tail
    ctx.fillStyle = 'rgba(9, 10, 15, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * (deltaTime / 16.67);
      p.y += p.vy * (deltaTime / 16.67);
      p.vy += 0.2 * (deltaTime / 16.67); // gravity
      p.alpha -= 0.02 * (deltaTime / 16.67);

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  // Handle canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || 450;
        canvas.height = canvas.parentElement?.clientHeight || 800;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const spawnParticles = (x: number, y: number, count = 30) => {
    const colors = ['#a855f7', '#ec4899', '#3b82f6', '#f59e0b', '#10b981'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // burst upward
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 5,
      });
    }
  };

  const handleOpenBox = () => {
    if (coins < 10) return;
    
    // Spawn initial click sparks
    spawnParticles(225, 400, 15);

    setChestState('opening');
    setReward(null);

    // Roll rewards
    setTimeout(() => {
      openBox();
      const rewardsList = [
        '✨ Legendary Sword of Geminis',
        '💎 100 Rare Crystals',
        '⚔️ Mystic Shield',
        '🦊 Cute Fire Pet',
        '👑 Crown of Sovereignty',
        '🪙 Extra Gold Pile'
      ];
      const randomReward = rewardsList[Math.floor(Math.random() * rewardsList.length)];
      setReward(randomReward);
      setChestState('open');

      // Spawn big burst particles
      spawnParticles(225, 400, 40);
    }, 600);
  };

  const handleResetChest = () => {
    setChestState('idle');
    setReward(null);
  };

  return (
    <BoundingBox width={450} height={800}>
      <div 
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 16px',
          boxSizing: 'border-box',
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #090a0f, #12131c)'
        }}
      >
        {/* Particle Canvas Layer */}
        <canvas 
          ref={canvasRef} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />

        {/* HUD Layer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🪙</span>
            <span style={{ fontWeight: 600, fontSize: '18px' }}>{coins}</span>
          </div>
          
          <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📦</span>
            <span style={{ fontWeight: 600, fontSize: '18px' }}>{boxesOpened}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, zIndex: 10 }}>
          <AnimatePresence mode="wait">
            {chestState === 'idle' && (
              <motion.div
                key="idle-chest"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpenBox}
                style={{ cursor: coins >= 10 ? 'pointer' : 'not-allowed', position: 'relative' }}
              >
                {/* Pulsing Glow backdrop */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '240px',
                    height: '240px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%)',
                    zIndex: -1,
                  }}
                />
                
                <span style={{ fontSize: '120px', display: 'block', filter: coins < 10 ? 'grayscale(1)' : 'none' }}>📦</span>
                
                {coins < 10 && (
                  <div style={{ color: '#ef4444', fontWeight: 600, marginTop: '12px' }}>
                    Need More Coins!
                  </div>
                )}
              </motion.div>
            )}

            {chestState === 'opening' && (
              <motion.div
                key="opening-chest"
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1.05, 1.15, 1.1, 1.2],
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{ fontSize: '120px' }}
              >
                📦
              </motion.div>
            )}

            {chestState === 'open' && (
              <motion.div
                key="open-chest"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
              >
                <div style={{ fontSize: '120px', marginBottom: '16px' }}>🔓</div>
                
                {reward && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel" 
                    style={{ 
                      padding: '16px 24px', 
                      maxWidth: '280px', 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--color-primary)'
                    }}
                  >
                    <div style={{ color: 'var(--color-text-dim)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                      You Unlocked
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '20px', color: '#fff' }}>
                      {reward}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', zIndex: 10 }}>
          {chestState === 'open' ? (
            <button className="btn-primary" onClick={handleResetChest} style={{ width: '100%', maxWidth: '240px' }}>
              Awesome!
            </button>
          ) : (
            <button 
              className="btn-primary" 
              onClick={handleOpenBox} 
              disabled={coins < 10 || chestState === 'opening'}
              style={{ 
                width: '100%', 
                maxWidth: '240px',
                opacity: (coins < 10 || chestState === 'opening') ? 0.5 : 1,
                cursor: (coins < 10 || chestState === 'opening') ? 'not-allowed' : 'pointer'
              }}
            >
              Open Box (🪙 10)
            </button>
          )}

          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'center' }}>
            <button 
              className="glass-panel" 
              onClick={() => addCoins(50)} 
              style={{ 
                padding: '8px 16px', 
                fontSize: '14px', 
                fontWeight: 600,
                color: 'var(--color-text)',
                cursor: 'pointer'
              }}
            >
              + 🪙 50 Gold
            </button>
            <button 
              onClick={resetGame} 
              style={{ 
                fontSize: '12px', 
                color: 'var(--color-text-dim)',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
            >
              Reset Save
            </button>
          </div>
        </div>
      </div>
    </BoundingBox>
  );
}

export default App;
