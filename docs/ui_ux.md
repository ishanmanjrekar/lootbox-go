# Lootbox Go! - UI & UX Specification

This document details the visual style, design system tokens, screen structures, animations (Framer Motion), sound design guidance, and satirical overlays for **Lootbox Go!**.

### Related Documents
- [Game Design Document](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/game_design.md) - Parody GDD, core gameplay loop, and progression systems.
- [Art Direction Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/art_direction.md) - Theme guidelines, color systems, and animation timing rules.
- [Economy & Balancing Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/economy_balancing.md) - Numeric formulas, starting values, and refill economics.
- [Technical Architecture Document](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/architecture.md) - Zustand state stores, actions, and persistent storage schemas.
- [Testing & QA Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/testing_and_qa.md) - secret debug badge trigger, checklists, and simulation tools.
- [Auto-Open Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/auto_open_spec.md) - Details hold-to-activate automated box opening, button progress strokes, and stop conditions.

---

## 1. Visual Identity & Design System

The game utilizes a **"Cute Kawaii Pinata Party"** theme—soft, sugary pastel highlights set against clean, warm cream background materials. The intent is to leverage cute, bubbly app styling to make the player feel like they are inside a cozy candy box.

### 1.1 Color Palette
Vanilla CSS variables will be defined in `src/index.css` for consistent application:

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

### 1.2 Typography
- **Primary Font:** `Fredoka` or `Quicksand` via Google Fonts (rounded, friendly geometric sans-serif for UI numbers and body text).
- **Secondary Title Font:** `Lilita One` or `DynaPuff` (bold, bubbly, organic letters for big announcements like "LEVEL UP!" and "NEW UNLOCK!").

---

## 2. Layout & Screen Hierarchy

The application consists of a single-page app layout with a sticky HUD at the top, a dynamic central viewport, and a bottom drawer panel that slides up to view the collection.

```
┌────────────────────────────────────────────────────────┐
│  [🔥 energy 10/10]         [🛒]        [🪅 pinatas 100]│ <-- Sticky HUD
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │ [XP]                  500/1000                   │  │ <-- XP Progress Bar
│  └──────────────────────────────────────────────────┘  │
│                        LEVEL 9                         │ <-- Level text
├────────────────────────────────────────────────────────┤
│                                                        │
│              Sparkles, sweets, and...                  │ <-- Description banner
│                                                        │
│                       .---.                            │
│                      /     \  (Wings & Heart)          │ <-- Lootbox active skin
│                     |  o L o|                          │ (vertical breathing)
│                     `-------'                          │
│                                                        │
│                   ┌───────────────┐                    │
│                   │   OPEN BOX    │                    │ <-- Main interaction button
│                   │    [🔥 x1]    │                    │
│                   └───────────────┘                    │
├────────────────────────────────────────────────────────┤
│             ▼  LOOTBOX COLLECTION  ▲                   │ <-- Slide-up drawer
└────────────────────────────────────────────────────────┘
```

### 2.1 Sticky Top HUD (Heads-Up Display)
- **Energy Panel (Left):**
  - Dark background box with red/orange border.
  - Displays a yellow-orange fire icon and current/max energy (e.g., `energy 10/10` or `energy 09/10`).
- **Store Button (Center):**
  - Yellow background button with chocolate-brown border and a blue shopping cart icon. Clicking this opens the Store overlay.
- **Pinatas Panel (Right):**
  - Dark background box with pink/red border.
  - Displays a colorful pinata icon and current pinatas count (e.g., `pinatas 100` or `pinatas 0`).
- **XP Progress Bar (Below Badges):**
  - Full-width rounded green bar with yellow border tracking progress.
  - Features a bubble-gum pink crown "XP" badge on the left, and centered text showing absolute values (`500/1000`).
  - Fill state utilizes squishy spring transitions when XP is added.
- **Level Text (Centered):**
  - Centered text below the XP bar: `LEVEL X`.

### 2.2 Navigation Panel (Bottom Drawer)
- Toggling the collection is handled by a slide-up drawer labeled **LOOTBOX COLLECTION**.
- Clicking or dragging the drawer pulls it up over the main viewport to show the collection grid.

---

## 3. Screen Views

### 3.1 Main Gameplay View
- **Center Stage:** The active lootbox skin.
  - Implements a subtle idle breathing animation (vertical drift).
  - Tapping the box triggers a spring-based scale-down-and-rebound wobble effect.
- **Description Banner:** Displays a randomly selected kawaii-themed one-liner above the lootbox in teal and pink. A large pool of short, vague, cute one-liners is defined in code (e.g., *"Sparkles, sweets, and happy thoughts... that's what my day is made of! ✨🍰"*, *"Something wonderful is inside. Probably. 🌸"*, *"Every box is a mystery. This one smells like cotton candy. 🍬"*). A new one is selected randomly each time the main screen loads or the player changes their active skin. Lines may repeat.
- **Open Button:** Large green button centered below the box.
  - Text: `OPEN BOX` in pink comic font.
  - Icon: Yellow-orange fire icon with the text `x1` representing the energy cost.
  - Disables and turns grayscale when energy is 0.
  - **Auto-Open Interaction Elements:**
    - Displays a low-contrast helper text directly underneath. Reverts from `hold for auto` to `tap to stop` when automated loop is active.
    - Press-and-hold (2s) animates background gradient to a solid mint green (`#06D6A0`).
    - During automated countdowns, a high-contrast border stroke outline animates wrapping around the button's boundary.

### 3.2 Collection Screen View
- Accessed by sliding up the bottom drawer.
- Shows a 3-column scrollable grid of cards representing all available boxes defined in the configuration.
- **Card States:**
  - **Locked:** Darkened/blurred card containing a placeholder package/box graphic.
  - **Unlocked:** Shows full-color box graphic and name. No rarity badge is displayed.
  - **Equipped:** Indicated by a bright green border.
- Tapping an unlocked card equips the skin (saves to Zustand and updates the active skin state).
- **Close Button:** A peach-orange button labeled `CLOSE` at the bottom of the drawer collapses the drawer back to its sticky bottom position.

### 3.3 Store Modal Screen View
- Accessed by tapping the shopping cart button in the Top HUD. It opens a modal dialog that dims the background main viewport.
- **Title:** `STORE` in pink comic font with a black outline.
- **Energy Refill Cards:** Displays three packages (which are configurable via JSON in `energy.json`):
  - **5 ENERGY:** Displays 1 flame icon. Costs `10 Pinatas`.
  - **15 ENERGY:** Displays 3 flame icons. Costs `20 Pinatas`.
  - **50 ENERGY:** Displays a ring of flame icons. Costs `30 Pinatas`. **Note:** Since the standard energy cap is 10, purchasing this package will overflow the player's energy capacity (e.g., `50/10`), adding to the satirical parody.
- **Pinata Tipping Banner:** A banner reading `"GET 100x [Pinata]"` with a green button labeled `"TIP ME HERE Ko-fi"`.
  - Clicking this button opens the external link: `https://ko-fi.com/ishanmanjrekar/tip` in a new window.
  - The game does not verify payment. Clicking this link immediately and silently awards the player `+100 Pinatas` in-game.
- **Close Button:** A peach-orange button labeled `CLOSE` at the bottom of the modal closes the store overlay.

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
1. **Deduction:** Energy transitions down by 1 (e.g. `10 -> 9`), allowing overflow state to decrement.
2. **Anticipation:** The box stretches, vibrates with squishy movements, and flashes a soft pink overlay (0.6s).
3. **Explosion:** The box splits open. A shower of candy, hearts, and star sprinkles blasts outward.
4. **Reveal:** The reward card flips into view from the center of the explosion with a 3D scale-and-rotate transition:
   ```typescript
   const rewardReveal = {
     initial: { scale: 0, rotateY: 180, opacity: 0 },
     animate: { scale: 1, rotateY: 0, opacity: 1 },
     transition: { type: "spring", stiffness: 120, damping: 12 }
   };
   ```
5. **Reward Type Specifics:**
   - **XP Card:** Shows a bubbly, soft-colored card displaying the XP value (e.g. `+50 XP`) with sparkling stars and a pink "XP" crown badge.
   - **New Box Skin Card:** Displays the unlocked box skin card with rotating pastel rainbow rays in the background and a cute "NEW UNLOCK!" badge. This card only appears when the player does not yet own the rolled skin. If all registered skins are already owned, `skin_unlock` has a weight of 0 and this card will never appear until new skins are added to the config.

### 4.3 Level Up Sequence
Triggers when accumulated XP overflows the level requirement.
- **Effects:**
  - Standard gameplay halts.
  - An overlay dims the screen.
  - Mass confetti particle showers fall.
  - A giant "LEVEL UP!" title scales up, bounces, and shines with a gold gradient sweep.
  - Displays old level vs. new level.
  - Dismiss button: "Awesome! (Double XP next time?)" which closes the modal.

### 4.4 Auto-Open Hold & Fill Animations
- **Hold-to-Activate Background Fill:** Pressing and holding the "OPEN BOX" button fills its background with a solid mint green over exactly 2 seconds.
- **Button Stroke Countdown:** 
  - An SVG border outline progress animation wrapping around the active button (1-second duration, or 2-second duration on the Level Up dismiss button).
  - Uses `stroke-dasharray` and `stroke-dashoffset` to wrap clockwise from the top-center back to top-center.
  - A visual scale click (`scale: [1, 0.95, 1]`) plays when the stroke finishes, immediately firing the button action.

---

## 5. Satirical monetization Flow

The game parodies aggressive microtransactions by using Ko-fi tipping as the only way to acquire Pinatas.
- **No Payment Wall:** Tapping the Ko-fi link does not verify payment. Merely initiating the action awards the currency, playing into the satirical nature of the app where the economy is "broken by design."
- **Energy Overflow:** The store parodies "whale tiers" by offering 50 Energy (exceeding the standard limit of 10) for 30 Pinatas. Purchasing this package successfully overflows the energy capacity value shown in the HUD.

