import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose }) => {
  const {
    energy,
    level,
    xp,
    pinatas,
    onboardingStep,
    skinPityCount,
    unlockedBoxes,
    devCheatRefillEnergy,
    devCheatEmptyEnergy,
    devCheatLevelUp,
    devCheatReset,
    devCheatUnlockAllSkins,
    devCheatAddPinatas,
    devCheatWarpTime,
  } = useGameStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
              zIndex: 99,
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '280px',
              height: '100%',
              backgroundColor: '#FFFDF9',
              borderLeft: '4px solid #4D3834',
              zIndex: 100,
              padding: '20px 16px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
            }}
          >
            {/* Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="title-bubble" style={{ fontSize: '24px' }}>
                DEBUG PANEL
              </span>
              <button
                className="btn-secondary"
                onClick={onClose}
                style={{ padding: '4px 10px', fontSize: '14px', borderRadius: '8px' }}
              >
                X
              </button>
            </div>

            {/* Current Stats */}
            <div
              className="kawaii-card"
              style={{
                fontSize: '12px',
                lineHeight: '1.4',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: '#FFEBF0',
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#4D3834', borderBottom: '1px solid #4D3834', paddingBottom: '4px', marginBottom: '4px' }}>
                STATE INSPECTION
              </div>
              <div>Level: <strong>{level}</strong></div>
              <div>XP: <strong>{xp}</strong></div>
              <div>Energy: <strong>{energy} / 10</strong></div>
              <div>Pinatas: <strong>{pinatas}</strong></div>
              <div>Onboarding Step: <strong>{onboardingStep} / 6</strong></div>
              <div>Skin Pity Count: <strong>{skinPityCount}</strong></div>
              <div>Skins Unlocked: <strong>{unlockedBoxes.length}</strong></div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="btn-secondary"
                onClick={devCheatRefillEnergy}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                ⚡ Refill Energy (Cap)
              </button>

              <button
                className="btn-secondary"
                onClick={devCheatEmptyEnergy}
                style={{ width: '100%', justifyContent: 'center', background: '#FFC6FF' }}
              >
                🚫 Empty Energy
              </button>

              <button
                className="btn-secondary"
                onClick={devCheatWarpTime}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                ⏰ Warp +5 Minutes
              </button>

              <button
                className="btn-secondary"
                onClick={devCheatLevelUp}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                👑 +1 Level (Cheat)
              </button>

              <button
                className="btn-secondary"
                onClick={devCheatUnlockAllSkins}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                🎁 Unlock All Skins
              </button>

              <button
                className="btn-secondary"
                onClick={devCheatAddPinatas}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                🪅 Add 999 Pinatas
              </button>

              <button
                className="btn-secondary"
                onClick={() => {
                  devCheatReset();
                  alert('Save wiped!');
                }}
                style={{ width: '100%', justifyContent: 'center', backgroundColor: '#FF5C8A', color: 'white' }}
              >
                🔥 Wipe Save State
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
