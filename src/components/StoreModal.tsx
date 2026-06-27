import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import energyConfig from '../config/energy.json';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({ isOpen, onClose }) => {
  const { pinatas, buyEnergy, claimKoFiPinatas } = useGameStore();

  const handleBuyRefill = (amount: number, cost: number) => {
    const success = buyEnergy(amount, cost);
    if (success) {
      alert(`Successfully bought ${amount} Energy! ⚡`);
    } else {
      alert('Not enough Pinatas! 🪅 Click the Ko-fi banner to get more for free!');
    }
  };

  const energyIcon = `${import.meta.env.BASE_URL}assets/icons/energy.png`;
  const pinataIcon = `${import.meta.env.BASE_URL}assets/icons/pinata.png`;
  const kofiIcon = `${import.meta.env.BASE_URL}assets/icons/kofi_logo.png`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(77, 56, 52, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 90,
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            style={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              width: '90%',
              maxHeight: '80%',
              backgroundColor: '#FFFDF9',
              border: '4px solid #4D3834',
              borderRadius: '24px',
              boxShadow: '0 12px 0 #4D3834',
              zIndex: 95,
              padding: '24px 16px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', position: 'relative' }}>
              <h2 className="title-bubble" style={{ fontSize: '36px', margin: 0 }}>
                STORE
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  marginTop: '4px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                <span>Balance:</span>
                <img src={pinataIcon} alt="Pinata" style={{ width: '20px', height: '20px' }} />
                <span>{pinatas} Pinatas</span>
              </div>
            </div>

            {/* Refill Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {energyConfig.refillOptions.map((opt, index) => {
                const flamesCount = opt.energyAmount === 5 ? 1 : opt.energyAmount === 15 ? 2 : 3;
                const isOverflow = opt.energyAmount === 50;

                return (
                  <div
                    key={index}
                    className="kawaii-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: isOverflow ? '#E8F4F8' : '#FFFDF9',
                      borderColor: isOverflow ? '#FF5C8A' : '#4D3834',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '2px',
                          width: '72px',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}
                      >
                        {Array.from({ length: flamesCount }).map((_, i) => (
                          <img
                            key={i}
                            src={energyIcon}
                            alt="Energy"
                            style={{ width: '22px', height: '22px' }}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                          +{opt.energyAmount} Energy
                        </span>
                        {isOverflow && (
                          <span style={{ fontSize: '11px', color: '#FF5C8A', fontWeight: 'bold' }}>
                            👑 BEST DEAL
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="btn-secondary"
                      onClick={() => handleBuyRefill(opt.energyAmount, opt.pinataCost)}
                      style={{
                        padding: '8px 14px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{opt.pinataCost}</span>
                      <img src={pinataIcon} alt="Pinata" style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Tipping Banner */}
            <div
              className="kawaii-card"
              style={{
                backgroundColor: '#4D3834',
                border: '3px solid #FF5C8A',
                boxShadow: '0 6px 0 #3D2622',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'center',
                padding: '16px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src={pinataIcon} alt="Pinata" style={{ width: '28px', height: '28px' }} />
                <span className="title-bubble" style={{ fontSize: '20px', textShadow: 'none', color: '#FFFDF9' }}>
                  NEED MORE PINATAS?
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#FFFDF9', fontWeight: 600 }}>
                Get +100 Pinatas 🪅
              </p>
              <button
                className="btn-primary"
                onClick={claimKoFiPinatas}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  backgroundColor: '#FF5C8A',
                  boxShadow: '0 4px 0 #3D2622',
                }}
              >
                <img
                  src={kofiIcon}
                  alt="Ko-fi"
                  style={{ width: '20px', height: '20px', objectFit: 'contain' }}
                />
                Support me on Ko-fi
              </button>
            </div>

            {/* Close Button */}
            <button
              className="btn-secondary"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#FFD166',
                justifyContent: 'center',
                marginTop: '4px',
              }}
            >
              CLOSE
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
