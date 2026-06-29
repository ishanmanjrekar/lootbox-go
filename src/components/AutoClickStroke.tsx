import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AutoClickStrokeProps {
  duration: number;
  onComplete: () => void;
  strokeColor?: string;
}

export const AutoClickStroke: React.FC<AutoClickStrokeProps> = ({ duration, onComplete, strokeColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Measure parent element dimensions
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        setDimensions({
          width: parent.offsetWidth,
          height: parent.offsetHeight,
        });
      }
    }
  }, []);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return <div ref={containerRef} style={{ display: 'none' }} />;
  }

  const { width, height } = dimensions;
  const r = 16; // Border radius matches .btn-primary and .btn-secondary
  const xMid = width / 2;

  // Precise SVG Path tracing the rounded rectangle clockwise starting from top-middle:
  // - Start at (width / 2, 0)
  // - Draw line to top-right corner before curve: (width - r, 0)
  // - Arc to (width, r)
  // - Draw line down to bottom-right corner before curve: (width, height - r)
  // - Arc to (width - r, height)
  // - Draw line left to bottom-left corner before curve: (r, height)
  // - Arc to (0, height - r)
  // - Draw line up to top-left corner before curve: (0, r)
  // - Arc to (r, 0)
  // - Line back to starting point (width / 2, 0)
  const d = `
    M ${xMid} 0
    L ${width - r} 0
    A ${r} ${r} 0 0 1 ${width} ${r}
    L ${width} ${height - r}
    A ${r} ${r} 0 0 1 ${width - r} ${height}
    L ${r} ${height}
    A ${r} ${r} 0 0 1 0 ${height - r}
    L 0 ${r}
    A ${r} ${r} 0 0 1 ${r} 0
    Z
  `;

  // Perimeter calculation:
  // Horizontal segments: 2 * (width - 2r)
  // Vertical segments: 2 * (height - 2r)
  // Circular corners: 2 * PI * r
  const perimeter = 2 * (width - 2 * r) + 2 * (height - 2 * r) + 2 * Math.PI * r;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '-6px', // Centered shift for 8px stroke over a 3px border
        left: '-6px',
        width: `${width + 12}px`,
        height: `${height + 12}px`,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      <svg
        width={width + 12}
        height={height + 12}
        viewBox={`-6 -6 ${width + 12} ${height + 12}`}
        style={{ overflow: 'visible', width: '100%', height: '100%' }}
      >
        <motion.path
          d={d}
          fill="none"
          stroke={strokeColor || "#FF5C8A"} // High-contrast primary strawberry/magenta color or customizable strokeColor
          strokeWidth="8" // Increased stroke size by 100% (was 4)
          strokeLinecap="round"
          initial={{ strokeDasharray: perimeter, strokeDashoffset: perimeter }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration, ease: 'linear' }}
          onAnimationComplete={onComplete}
        />
      </svg>
    </div>
  );
};
