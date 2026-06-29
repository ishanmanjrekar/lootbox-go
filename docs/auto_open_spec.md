# Lootbox Go! - Auto-Open Feature Specification

This document details the visual style, interaction rules, and mechanics for the **Auto-Open** feature in **Lootbox Go!**. This feature parodies auto-spin, auto-roll, and auto-play mechanics found in modern mobile games (e.g., *Monopoly GO*).

---

## 1. Feature Overview & Satirical Premise

In typical idle and casual games, players eventually unlock "Auto-Play" options to bypass the repetitive clicking loops that the developers themselves designed. By implementing an **Auto-Open** mechanic, **Lootbox Go!** comments on the irony of players wanting the game to play itself to maximize virtual numbers without any actual engagement.

---

## 2. Activation: Hold-to-Auto

The player initiates the automation by pressing and holding the main **OPEN BOX** button.

### 2.1 Visual Indicator & Text Helper
- Directly under the **OPEN BOX** button, a very light text helper reads: `hold for auto`.
- The text is styled with a subtle, low-contrast color matching `--text-muted` (e.g., `#8E7A75`) and a small font size (e.g., `12px`).

### 2.2 Activation Timing
- The player must press and hold the button for exactly **2 seconds** (2000ms).
- While holding down, the button's background gradient smoothly animates from its current state to a solid green (`--accent-mint` / `#06D6A0`).
- If the player releases the button *before* the 2-second hold completes:
  - The background gradient animation resets immediately back to its original state.
  - Automation is **not** activated.
- Once the hold reaches the 2-second threshold:
  - The background remains green to indicate that **Auto-Mode is ON**.
  - The text helper under the button changes to read: `tap to stop`.
  - Automation starts immediately.

---

## 3. Automated Flow & Timings

Once Auto-Mode is activated, the game automatically handles all box-opening interactions and reward dismissals in a continuous loop.

### 3.1 Delay Intervals
To give the player enough time to view their progress, a visual countdown delay is triggered at each interaction step:
- **Default Action Delay:** **1 second** (1000ms). This applies to:
  - Tapping **OPEN BOX** (when the lootbox is in `idle` state).
  - Tapping **AWESOME! / YAY!** (when a reward card is revealed and the chest is in `open` state).
- **Level Up Overlay Action Delay:** **2 seconds** (2000ms). This applies to:
  - Tapping the dismiss button (e.g., **Awesome! / Yay! / Neat!**) on the Level Up modal.

### 3.2 Automated Button Press Visuals (Stroke Fill)
During the delay interval, the active button (the button that will be pressed next) displays a progress animation:
- **Outline Stroke Animation:** An outline border (stroke) around the active button fills up from the **top-center, wrapping clockwise back to the top-center**.
- **Visual Contrast:** The filling stroke is rendered in a high-contrast color (such as `--accent-strawberry` / `#FF5C8A` or a neon magenta/yellow) to stand out clearly against green and other button colors.
- **Button Press Action:** 
  - Once the stroke animation completes (the line meets back at the top-center), a visual "press" animation plays on the button (scaling down to `0.95` and rebounding back to `1.0`), simulating a manual click.
  - The corresponding button click handler is triggered.

---

## 4. Deactivation & Interruption States

Automation can be cancelled manually by the player or interrupted automatically by specific game events.

### 4.1 Manual Deactivation
- **Button Tap:** Tapping the main button (which reads `tap to stop` underneath) at any point during active Auto-Mode immediately disables it. The button background resets to normal, the helper text reverts to `hold for auto`, and all automated queues are cleared.
- **Menu/UI Navigation:** If the player manually opens the **Lootbox Collection drawer** or the **Store Modal**, Auto-Mode is automatically disabled.

### 4.2 Automated Interruptions
- **New Box Skin Unlock:** 
  - When a box skin is unlocked, the game displays the new skin reveal card.
  - **The automation halts immediately** when the reward card is revealed.
  - The player must manually tap the dismiss button to close the card and resume play. This ensures the player does not miss the dopamine splash of unlocking a rare skin.
- **Running Out of Energy:**
  - If the player's energy drops to `0` and a box opening is attempted:
    - Automation halts immediately and **Auto-Mode is disabled**.
    - The **Store Modal** automatically slides open to present energy purchase options.
    - When the player closes the Store or obtains more energy, Auto-Mode remains **off** until the player manually reactivates it via the 2-second hold.

---

## 5. Technical Implementation Guidance

- **Timer State Management:** Introduce a global/store state `isAutoMode` and `activeAutomationTimer` to track the state of the auto loop.
- **Button Border SVG/Canvas Canvas:** Render a SVG border path overlay on top of automated buttons when active to handle the `stroke-dasharray` and `stroke-dashoffset` circular/rectangular progress wrap.
- **Cleanup on Unmount:** Ensure all intervals/timeouts created by the hold action or click timers are cleanly cleared on component unmount to prevent memory leaks.
