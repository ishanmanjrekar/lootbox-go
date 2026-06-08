# UI/UX Specifications: Lootbox Go

This document describes the design specifications, visual language, micro-interactions, layout metrics, and animations governing Lootbox Go.

---

## 1. Visual Theme & Theme Configuration

Lootbox Go features a modern, premium "cyber-fantasy" aesthetic. The color scheme focuses on deep dark grays, glowing neon purples, and golden highlights.

### Color Tokens
* **Base Background**: `linear-gradient(to bottom, #090a0f, #12131c)`
* **Primary (Glow/Accents)**: `#a855f7` (Purple)
* **Secondary**: `#ec4899` (Pink)
* **Success/Refund**: `#10b981` (Green)
* **Warning/Alert**: `#ef4444` (Red)
* **Text Primary**: `#ffffff`
* **Text Secondary**: `rgba(255, 255, 255, 0.6)`

### Glassmorphism
The UI panels use a glassmorphism style sheet to construct a clean depth layout:
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}
```

---

## 2. Layout Structure (Mobile-First Viewport)

To maintain an identical feel across desktop and mobile, the interface uses a strict Aspect Ratio container:

```
+---------------------------------------------+
| HUD Area (Coins & Boxes Opened Counters)    |
| [🪙 100]                          [📦 0]    |
+---------------------------------------------+
|                                             |
|                                             |
|                                             |
|              Main Chest Area                |
|             (Pulsing glow and               |
|              opening animations)            |
|                                             |
|                                             |
|                                             |
+---------------------------------------------+
| Control Panel                               |
| [          Open Box (🪙 10)               ] |
|                                             |
| [ + 🪙 50 Gold ]             [ Reset Save ] |
+---------------------------------------------+
```

* **Desktop Viewport**: Centered inside a `450px x 800px` [BoundingBox](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/src/components/BoundingBox.tsx) frame with dark borders and shadow.
* **Mobile Viewport**: Expands responsively to fill the screen while respecting the safety margins of the Android status bar.

---

## 3. Micro-Interactions & Animation Specs

### A. Chest Interaction Sequence
1. **Idle State**:
   * The closed chest has a floating keyframe cycle (`y: -5px` to `y: +5px` over `2.5s`).
   * A soft radial glow pulsates in the background behind it.
2. **Hover / Contact State**:
   * Scale rises by `5%` (`scale: 1.05`).
   * Minor sparks emit under the mouse pointer.
3. **Opening Shake Sequence**:
   * Shakes rapidly on click using Framer Motion keyframes:
     * Rotates from `-10deg` to `10deg` rapidly.
     * Scales up from `1.0` to `1.2` as the chest prepares to pop open.
4. **Reward Burst (VFX)**:
   * 40 color-graded particles (using purple, pink, blue, gold, and green) burst radially outwards from the center.
   * Gravity pulls particles downward, adding realism to the explosion.

---

## 4. Typography & Copy Guidelines

* **Font Family**: Standard System Sans-Serif (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif`) designed for readability on small displays.
* **Text Sizing**:
  * Currency numbers: `18px` with semi-bold weights (`600`).
  * Item names: `20px` extra-bold (`800`) to highlight rare wins.
  * Secondary indicators (e.g. "YOU UNLOCKED"): `12px` capitalized with letters spaced out (`letter-spacing: 1px`).
