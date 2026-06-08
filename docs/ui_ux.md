# Lootbox Go! - UI & UX Specification

This document details the visual style, design system tokens, screen structures, animations (Framer Motion), sound design guidance, and satirical overlays for **Lootbox Go!**.

---

## 1. Visual Identity & Design System

The game utilizes a **"Premium Casino Cyberpunk"** theme—vibrant, high-contrast neon highlights set against clean, sleek dark background materials. The intent is to leverage modern mobile-app styling to make the player feel like they are inside a flashy virtual slot machine.

### 1.1 Color Palette
Vanilla CSS variables will be defined in `src/index.css` for consistent application:

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0b0e;     /* Deep space black */
  --bg-secondary: #13161c;   /* Dark navy card color */
  --bg-tertiary: #1b1f27;    /* Slate border/button background */

  /* Interface Accent Colors */
  --accent-neon-blue: #00d2ff;
  --accent-neon-pink: #ff007f;
  --accent-neon-yellow: #ffe600;
  --energy-yellow: #ffd700;

  /* Rarity Glows & Borders */
  --rarity-common: #8e9297;       /* Standard Gray */
  --rarity-rare: #0070dd;         /* Magic Blue */
  --rarity-epic: #a335ee;         /* Epic Purple */
  --rarity-legendary: #ff8000;    /* Legendary Orange */

  /* Text Colors */
  --text-main: #f0f3f8;
  --text-muted: #8391a5;
  --text-gold: #ffd700;
}
```

### 1.2 Typography
- **Primary Font:** `Inter` or `Outfit` via Google Fonts (clean, geometric sans-serif for UI numbers and button states).
- **Secondary Title Font:** `Orbitron` or `Montserrat` (bold, futuristic caps for big announcements like "LEVEL UP!" and "NEW UNLOCK!").

---

## 2. Layout & Screen Hierarchy

The application consists of a single-page app layout with a sticky HUD at the top, a dynamic central viewport, and a bottom tab navigation panel.

```
┌────────────────────────────────────────────────────────┐
│  [⚡ 8/10 (0:14)]        [⭐ LVL 14]       [||||| 45%]  │ <-- Sticky HUD
├────────────────────────────────────────────────────────┤
│                                                        │
│                                                        │
│                     [ Lootbox ]                        │ <-- Main Viewport
│               (Tapping / Opening Box)                  │ (or Collection View /
│                                                        │  Mock Shop View)
│                                                        │
├────────────────────────────────────────────────────────┤
│     [🎁 Open Box]      [🗃️ Collection]     [🪙 Shop]    │ <-- Bottom Navigation
└────────────────────────────────────────────────────────┘
```

### 2.1 Sticky Top HUD (Heads-Up Display)
- **Energy Meter:**
  - Icon: Pulsing yellow lightning bolt.
  - Count: Large bold text (e.g., `8/10`).
  - Timer: Subtle timer below (e.g., `recharges in 0:14`). Undergoes a flash animation when energy increases.
- **Level Badge:**
  - Displays `LVL X` inside a glowing shield.
  - *Tier Glows:*
    - Levels 1–4: Plain border.
    - Levels 5–9: Pulsing silver border.
    - Levels 10–24: Sparkly gold border.
    - Levels 25+: Animated rainbow/RGB border (using CSS linear-gradient backgrounds and keyframe animations).
- **XP Progress Bar:**
  - A full-width or wide bar tracking progress to the next level.
  - Filled with a glowing purple-to-pink gradient.
  - When XP increases, the bar fills with a smooth spring transition and a particle spark at the leading edge.

### 2.2 Bottom Navigation Bar
Tabs toggle the content of the central viewport:
1. **Lootbox Tab (Default):** The main gameplay dashboard where the active box is displayed and clicked.
2. **Collection Tab:** The grid of unlocked box skins.
3. **Mock Shop Tab:** The satirical store to refill energy.

---

## 3. Screen Views

### 3.1 Main Gameplay View
- **Center Stage:** The active lootbox skin.
  - Implements a subtle idle breathing animation (vertical drift).
  - Tapping the box triggers a spring-based scale-down-and-rebound wobble effect.
- **Open Button:** Large, glowing primary button centered below the box.
  - Disables and turns grayscale when energy is 0.

### 3.2 Collection Screen View
- Displays a grid of cards representing all available boxes defined in the configuration.
- **Card States:**
  - **Locked:** Darkened/silhouetted card with a lock icon.
  - **Unlocked:** Shows full-color box graphics, rarity badge, and name.
  - **Equipped:** Highlights with an active neon border.
- Tapping an unlocked card equips the skin (saves to Zustand and updates the active skin state).

### 3.3 Satirical Mock Shop Screen View
Mocks high-pressure mobile storefronts.
- **Mock Gold Refill Option:** "Clown Gems Refill" banner. Clicking triggers a payment simulation overlay.
- **Satirical Ad Trigger:** "Watch Ad for Free Energy". Clicking launches the mock full-screen video overlay.
- **VIP Mock Sub:** "Get Golden VIP Pass" ($99.99/mo). Promises "infinite appreciation" but does nothing except add a large, shiny, obstructive VIP badge in the corner of the player's screen.

---

## 4. Animation & Interaction Specifications (Framer Motion)

Animations are essential to hook the player's attention.

### 4.1 Box Tap (Pre-Open Wobble)
- **Action:** Clicking/tapping the box on standard input.
- **Motion Spec:**
  ```typescript
  const tapAnimation = {
    scale: 0.95,
    rotate: [0, -3, 3, -3, 0],
    transition: { duration: 0.15 }
  };
  ```

### 4.2 Box Opening Sequence (The Dopamine Hook)
When the user clicks "Open Box":
1. **Deduction:** Energy transitions down `8 -> 7`.
2. **Anticipation:** The box floats upwards, vibrates with increasing speed, and flashes a bright white mask overlay (0.6s).
3. **Explosion:** The box splits open. A shower of radial particle effects (using HTML5 Canvas or CSS particles) blasts outward.
4. **Reveal:** The reward card flips into view from the center of the explosion with a 3D scale-and-rotate transition:
   ```typescript
   const rewardReveal = {
     initial: { scale: 0, rotateY: 180, opacity: 0 },
     animate: { scale: 1, rotateY: 0, opacity: 1 },
     transition: { type: "spring", stiffness: 120, damping: 12 }
   };
   ```
5. **Reward Type Specifics:**
   - **XP Card:** Shows a sparkly purple card displaying the XP value (e.g. `+40 XP`).
   - **New Box Skin Card:** Displays the unlocked box skin card with dynamic gold rays rotating in the background and a "NEW UNLOCK!" badge.

### 4.3 Level Up Sequence
Triggers when accumulated XP overflows the level requirement.
- **Effects:**
  - Standard gameplay halts.
  - An overlay dims the screen.
  - Mass confetti particle showers fall.
  - A giant "LEVEL UP!" title scales up, bounces, and shines with a gold gradient sweep.
  - Displays old level vs. new level (e.g., `Level 14 -> Level 15`).
  - Dismiss button: "Awesome! (Double XP next time?)" which closes the modal.

---

## 5. Satirical Overlay Layouts

### 5.1 The "Watch Mock Ad" Overlay
When a user chooses to watch a mock advertisement to recharge energy:
- A full-screen container overrides all elements.
- A loading circular timer runs for 3 seconds in the top-right corner, displaying a close ("X") button that is initially disabled.
- The center of the screen shows a satirical, mock-playable game advertisement:
  - Example: A poorly drawn character trapped under lava with gold pins. The caption reads: *"Only 1% of geniuses can pull the correct pin!"*
- Clicking anything in the ad triggers a fake browser redirect pop-up reading: *"ERROR: Your device is too powerful to run this low-quality game!"*.
- After 3 seconds, clicking the enabled "X" closes the ad and displays a notification: `+1 Energy Awarded!`.

### 5.2 The "Fake Checkout" Overlay
When buying energy refills using fake currency:
- A loading spinner plays for 1 second saying: *"Securing satirical transaction..."*.
- Shows a mock banking interface with an oversized green button: *"Approve Gullible Transaction"*.
- After clicking, a humorous notification pops up: *"Transaction complete! Your virtual bank account has been depleted. Max Energy restored!"*.
