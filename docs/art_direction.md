# Lootbox Go! - Art Direction Specification

This document details the visual guidelines, color systems, typography, animation rules, and asset design standards for **Lootbox Go!**. The game's theme is a **"Cute Kawaii Pinata Party"**—satirizing aggressive free-to-play mechanics by masking them under an excessively sweet, soft, and adorable sugary aesthetic.

### Related Documents
- [Game Design Document](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/game_design.md) - GDD gameplay mechanics and energy constraints.
- [UI & UX Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/ui_ux.md) - Visual layouts, navigation styles, and Store mock overlays.
- [Economy & Balancing Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/economy_balancing.md) - XP level requirements tables and drop distributions.
- [Technical Architecture Document](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/architecture.md) - Store actions, state schemas, and static file architectures.
- [Testing & QA Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/testing_and_qa.md) - QA procedures and the секрет badge developer panel.

---

## 1. Visual Theme: "Cute Kawaii Pinata Party"

The core aesthetic is designed to feel warm, squishy, and high-gratification. Every UI component should look like a soft marshmallow, a candy wrapper, or a toy.

### 1.1 Styling Pillars
1.  **Chubby & Rounded:** No sharp edges. Buttons, dialog modals, progress bars, and container borders should use high border-radius values (typically `16px` to `32px` or `9999px` for pill shapes).
2.  **Soft Charcoal Outlines:** Instead of harsh black borders, all illustrations and major UI elements use soft, dark charcoal or warm chocolate-brown outlines (`#2b201d`) to maintain a cozy hand-drawn feel.
3.  **Blushing Cheeks:** Almost everything (including the lootboxes themselves and UI badges) has tiny blushing pink cheeks (`#FF8C94`) and expressive eyes to induce immediate emotional connection.
4.  **Sugary Explosions:** Celebration events drop candies, star-shaped sprinkles, heart particles, and sparkling pastel dust instead of high-tech sparks or casino lightbeams.

---

## 2. Color System & Design Tokens

Vanilla CSS color variables to be implemented in `src/index.css` for the Kawaii Pastel palette:

```css
:root {
  /* Soft Backgrounds */
  --bg-primary: #FFFDF9;      /* Warm sweet cream */
  --bg-secondary: #FFEBF0;    /* Soft cotton-candy pink */
  --bg-tertiary: #E8F4F8;     /* Milky sky blue */
  --border-color: #4D3834;    /* Warm milk-chocolate brown for outlines */

  /* Interface Accent Colors */
  --accent-strawberry: #FF5C8A; /* Primary brand pink */
  --accent-sky: #4EA8DE;        /* Playful action blue */
  --accent-honey: #FFD166;      /* Bright gold / star yellow */
  --accent-mint: #06D6A0;       /* Success green / energy indicator */
  
  /* Rarity Colors (Kawaii/Pastel Palette) */
  --rarity-common: #D1CFC7;      /* Soft clay gray */
  --rarity-rare: #A2D2FF;        /* Fluffy cloud blue */
  --rarity-epic: #D8B4F8;        /* Sweet lavender purple */
  --rarity-legendary: #FFC6FF;   /* Magical rainbow pink */

  /* Text Colors */
  --text-main: #3D2622;          /* Rich chocolate brown for high readability */
  --text-muted: #8E7A75;         /* Soft caramel brown for descriptions */
  --text-white: #FFFFFF;
}
```

---

## 3. Typography & Hierarchy

To match the bubbly visual style, geometric or rounded fonts must be imported from Google Fonts.

### 3.1 Font Choices
*   **Header / Celebration Font:** `Lilita One` or `DynaPuff`
    *   *Usage:* "LEVEL UP!", "NEW SKIN UNLOCKED!", numbers, and large buttons.
    *   *Characteristics:* Playful, thick, hand-drawn letterforms that look organic and fun.
*   **Body / UI Font:** `Fredoka` or `Quicksand` (with `font-weight: 500` or higher)
    *   *Usage:* Explanatory text, stats, timers, and list elements.
    *   *Characteristics:* Perfectly rounded geometric sans-serifs that retain readability while looking soft.

### 3.2 Text Effects (CSS)
Important text values (like Level numbers or button actions) should leverage text shadows to stand out:
```css
.bubbly-text-shadow {
  text-shadow: 2px 2px 0px var(--border-color);
  color: var(--text-white);
  -webkit-text-stroke: 1px var(--border-color);
}
```

---

## 4. Lootbox Visual Style Guides (Optional Guidelines)

Skins are loaded dynamically from file presence (`<box-id>-closed.png` and `<box-id>-open.png`). Developers may implement any theme or style. Below is an optional visual redesign guide for standard skins to match the Cute Kawaii aesthetic.

```
      Default Starter         Bronze Deluxe Crate       Neon Cyber-Vault          CEO Golden Safe
          .---.                     .---.                     .---.                    .-"-.
         /     \  (Tape details)   /  ^  \  (Bear Ears)      / (o) \  (LED Whisker)   /  o  \ (Crown)
        |  o L o| <--(Blush)      | (o.o) |                 | > o < |                | ( - ) |
        `-------'                 `-------'                 `-------'                `-------'
```

### 4.1 Skin Specifications (Examples)
1.  **Default Starter Box (`box-start`)**
    *   *Assets:* `box-start-closed.png` (closed state) and `box-start-open.png` (open state).
    *   *Visual suggestion:* A simple kraft-paper cardboard box with cute round eyes, tape, blushing cheeks, and a band-aid sticker.
2.  **Bronze Deluxe Crate (`box-1`)**
    *   *Visuals:* Chocolate-bronze crate adorned with fluffy teddy bear ears on top and a cute pink ribbon bow.
    *   *Aesthetics:* Soft warm bronze (`#CA8A04`), baby pink ribbons (`#FFB7B2`).
3.  **Neon Cyber-Vault (`box-2`)**
    *   *Visuals:* A gaming console box styled like a cat, with glowing pink LED whiskers, neon triangular cat ears, and pixelated anime eyes.
    *   *Aesthetics:* Pastel violet (`#BDB2FF`), neon cyan (`#9BF6FF`).
4.  **CEO Golden Safe (`box-3`)**
    *   *Visuals:* A round golden safe/piggy bank safe wearing a royal crown, clutching a golden key.
    *   *Aesthetics:* Soft pastel gold (`#FFE3A8`), red crown details.

---

## 5. Animation & Particle Guidelines

High-gratification visual feedback is achieved using squishy spring animations via Framer Motion.

### 5.1 Click Mechanics (Squishy Physics)
*   **On Press:** The box should scale down on the Y-axis and expand slightly on the X-axis (simulating squishing under a finger).
    ```typescript
    const tapSquish = {
      scaleY: 0.85,
      scaleX: 1.15,
      transition: { type: "spring", stiffness: 400, damping: 10 }
    };
    ```
*   **On Release:** The box springs back, overshooting its original size before settling.

### 5.2 Opening Sequence (The Pinata Burst)
1.  **Wobble Phase (0.5s):** The box floats up, shakes left-to-right rapidly, and shoots tiny candy wrappers or star sparkles from its seams.
2.  **Explosion:** The box splits in half vertically, throwing its cute top/ears upwards.
3.  **Candy Shower:** A custom HTML5 Canvas or CSS particle burst spawns at the box center, spraying:
    *   Lollipops and wrapped hard candies.
    *   Confetti stars and pastel heart particles.
    *   Puff clouds (`#FFFFFF`) that expand and fade.
4.  **Reward Slide:** The reward card slides up, bouncing gently, with rotating pastel rays behind it.
