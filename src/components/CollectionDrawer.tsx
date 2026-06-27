import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import boxesConfig from '../config/boxes.json';

interface CollectionDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const CollectionDrawer: React.FC<CollectionDrawerProps> = ({ isOpen, onToggle }) => {
  const { unlockedBoxes, activeBoxSkin, changeBoxSkin } = useGameStore();

  const handleCardClick = (boxId: string) => {
    if (unlockedBoxes.includes(boxId)) {
      changeBoxSkin(boxId);
    }
  };

  const lockedIcon = `${import.meta.env.BASE_URL}assets/icons/box_locked.png`;

  return (
    <motion.div
      initial={false}
      animate={{ y: isOpen ? 0 : 'calc(100% - 90px)' }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '83%',
        backgroundColor: '#FFFDF9',
        borderTop: '4px solid #4D3834',
        borderRadius: '24px 24px 0 0',
        zIndex: 50,
        boxShadow: '0 -8px 0 rgba(77, 56, 52, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Drawer Drag Bar / Header Toggle */}
      <div
        onClick={onToggle}
        style={{
          height: '90px',
          minHeight: '90px',
          cursor: 'pointer',
          backgroundColor: '#FFEBF0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '3px solid #4D3834',
          gap: '8px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '9px',
            backgroundColor: '#4D3834',
            borderRadius: '4.5px',
          }}
        />
        <span
          className="title-bubble"
          style={{ fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          {isOpen ? '▼' : '▲'} LOOTBOX COLLECTION {isOpen ? '▼' : '▲'}
        </span>
      </div>

      {/* Selected Box Info Description Card (Fixed below Header) */}
      {isOpen && (
        <div style={{ padding: '16px 16px 8px 16px', backgroundColor: '#FFFDF9' }}>
          <div
            className="kawaii-card"
            style={{
              backgroundColor: '#E8F4F8',
              padding: '12px',
            }}
          >
            {(() => {
              const currentBox = boxesConfig.boxes.find((b) => b.id === activeBoxSkin);
              if (!currentBox) return null;
              return (
                <>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#4D3834' }}>
                    Active: {currentBox.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8E7A75', marginTop: '4px', lineHeight: '1.4' }}>
                    {currentBox.description}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Grid Content (Scrollable) */}
      {isOpen && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 16px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              width: '100%',
            }}
          >
            {boxesConfig.boxes.map((box) => {
              const isUnlocked = unlockedBoxes.includes(box.id);
              const isEquipped = activeBoxSkin === box.id;
              const closedBoxImg = `${import.meta.env.BASE_URL}assets/boxes/${box.id}-closed.png`;

              return (
                <motion.div
                  key={box.id}
                  whileHover={isUnlocked ? { scale: 1.05 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  onClick={() => handleCardClick(box.id)}
                  className="kawaii-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: isUnlocked ? 'pointer' : 'not-allowed',
                    backgroundColor: isEquipped ? '#FFEBF0' : '#FFFDF9',
                    borderColor: isEquipped ? '#06D6A0' : '#4D3834',
                    boxShadow: isEquipped ? '0 4px 0 #06D6A0' : '0 4px 0 #4D3834',
                    padding: '8px',
                    position: 'relative',
                  }}
                >
                  {/* Equipped Stamp */}
                  {isEquipped && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#06D6A0',
                        border: '2px solid #4D3834',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        zIndex: 2,
                        boxShadow: '0 2px 0 #4D3834',
                      }}
                    >
                      EQUIPPED
                    </div>
                  )}

                  {/* Box Thumbnail Image */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderRadius: '12px',
                      backgroundColor: isUnlocked ? 'transparent' : '#dedede',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={isUnlocked ? closedBoxImg : lockedIcon}
                      alt={box.name}
                      style={{
                        width: '90%',
                        height: '90%',
                        objectFit: 'contain',
                        filter: isUnlocked ? 'none' : 'blur(1px) grayscale(0.5)',
                      }}
                    />
                  </div>

                  {/* Box Name */}
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      color: isUnlocked ? '#3D2622' : '#8E7A75',
                      minHeight: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      lineHeight: '1.2',
                    }}
                  >
                    {isUnlocked ? box.name : '???'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapse Button Container (Fixed at Bottom) */}
      {isOpen && (
        <div
          style={{
            padding: '8px 16px 16px 16px',
            backgroundColor: '#FFFDF9',
          }}
        >
          <button
            className="btn-secondary"
            onClick={onToggle}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              justifyContent: 'center',
            }}
          >
            CLOSE
          </button>
        </div>
      )}
    </motion.div>
  );
};
