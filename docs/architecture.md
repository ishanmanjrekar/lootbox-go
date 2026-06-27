# Lootbox Go! - Technical Architecture Document

This document outlines the software architecture, state management design, persistence strategies, offline timing logic, and configuration data schemas for **Lootbox Go!**.

### Related Documents
- [Game Design Document](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/game_design.md) - Gameplay loop GDD, progression rules, and energy constraints.
- [UI & UX Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/ui_ux.md) - HUD badges, Collection drawer grid, and Store modal layouts.
- [Art Direction Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/art_direction.md) - Sweet cream theme values, font imports, and Framer Motion squish specs.
- [Economy & Balancing Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/economy_balancing.md) - XP growth tables, drop weight lists, and refill economics details.
- [Testing & QA Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/testing_and_qa.md) - Secret panel debugging interface, test procedures, and simulator script.

---

## 1. System Architecture Overview

Lootbox Go! is designed as a client-side decoupled single-page application wrapped in a native mobile shell (Capacitor).

```
   ┌────────────────────────────────────────────────────────┐
   │                       React UI                         │
   │   (App.tsx, Components, Collection Screen, HUD)        │
   └──────────────────────────┬─────────────────────────────┘
                              │ Uses State / Dispatches
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │                  Zustand Game Store                    │
   │           (State, Actions, Persistence Middleware)     │
   └──────────────────────────┬─────────────────────────────┘
                              │ Autosaves To
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │            Web Storage / localStorage                  │
   │  (Synchronized by Capacitor on native mobile wrapper)  │
   └────────────────────────────────────────────────────────┘
                              ▲
                              │ Configures
   ┌────────────────────────────────────────────────────────┐
   │                Static JSON Configuration               │
   │  (energy.json, progression.json, drop_tables.json,     │
   │   boxes.json)                                          │
   └────────────────────────────────────────────────────────┘
```

- **UI Layer:** React components for visual layout, framer-motion animations, and particle effects.
- **State Store:** Zustand managing all mutable game state in memory.
- **Persistence:** LocalStorage integration via Zustand `persist` middleware, ensuring user progress is retained across restarts/app suspends.
- **Configuration (JSON):** Static data definitions loaded at runtime to drive energy mechanics, drop weights, progression rules, and box skins.

---

## 2. State Management (Zustand Store)

The game features a single unified store (`gameStore`) implementing the following interface:

### 2.1 State Structure
```typescript
interface GameState {
  // --- Progression ---
  level: number;
  xp: number; // Current XP in the current level

  // --- Wallet / Currency ---
  pinatas: number; // Current Pinatas 🪅 count (configurable starting balance)

  // --- Energy ---
  energy: number; // Current energy count (can overflow maximum capacity)
  lastRechargeTime: number; // Epoch timestamp (ms) of the last energy update

  // --- Collection ---
  unlockedBoxes: string[]; // List of box IDs unlocked by the player
  activeBoxSkin: string; // The ID of the currently equipped box skin

  // --- Pity System ---
  skinPityCount: number; // Number of consecutive non-skin rolls since the last skin unlock

  // --- Onboarding ---
  onboardingStep: number; // 0 to 5 (rigged rolls 1 to 6), 6+ (standard game loop)
}
```

### 2.2 Store Actions
```typescript
interface GameActions {
  // --- Game Loop Actions ---
  openBox(): void; // Deducts energy, calculates random drop, awards XP/Skins, updates recharge timestamps
  changeBoxSkin(boxId: string): void; // Changes the currently active box skin

  // --- Store & Currency Actions ---
  updateEnergyRecharge(): void; // Evaluates passive energy recovery based on timestamp difference (halts if energy >= maxEnergy)
  buyEnergy(amount: number, cost: number): void; // Spends Pinatas to buy energy (allows energy overflow)
  claimKoFiPinatas(): void; // Opens external Ko-fi URL and immediately credits player +100 Pinatas

  // --- Developer / Cheat Actions ---
  devCheatRefillEnergy(): void;
  devCheatEmptyEnergy(): void;
  devCheatLevelUp(): void;
  devCheatReset(): void;
  devCheatUnlockAllSkins(): void;
  devCheatAddPinatas(): void; // Grants 999 Pinatas for testing the Store
  devCheatWarpTime(): void; // Subtracts 300,000ms from lastRechargeTime to simulate 5 minutes of offline time, then immediately triggers updateEnergyRecharge()
}
```

---

## 3. Energy Timer & Offline Progression

Since energy is capped and recovers over time, the architecture must calculate energy recovery during offline time or when the application is suspended.

### 3.1 Passive Recharge Interval Logic
Every time the game store updates, or at a regular interval (every 1 second when active), the store evaluates:
1. If `energy >= maxEnergy`, set `lastRechargeTime = Date.now()` and return.
2. If `energy < maxEnergy`, compute the duration since the last recharge:
   $$\text{elapsedTime} = \text{Date.now()} - \text{lastRechargeTime}$$
3. If `elapsedTime >= rechargeIntervalMs`:
   - Calculate how many energy units to recharge:
     $$\text{gainedEnergy} = \lfloor \frac{\text{elapsedTime}}{\text{rechargeIntervalMs}} \rfloor$$
   - Update energy:
     $$\text{energy} = \min(\text{maxEnergy}, \text{energy} + \text{gainedEnergy})$$
   - Update `lastRechargeTime`:
     $$\text{lastRechargeTime} = \text{lastRechargeTime} + (\text{gainedEnergy} \times \text{rechargeIntervalMs})$$

### 3.2 Application Sleep/Resume Handling
When mobile devices suspend the app or the player closes the browser tab, timers stop executing. To ensure offline progress works perfectly:
- **On Startup / Focus:** When the React app mounts, or when the browser triggers the `visibilitychange` event (going from `hidden` to `visible`), a call to `updateEnergyRecharge()` is immediately executed to process the timestamp difference.

---

## 4. Configuration Schemas (JSON Setup)

To facilitate balancing adjustments without rebuilding the source code, all formulas and weights are defined in JSON configurations.

### 4.1 Progression Configuration (`src/config/progression.json`)
Controls the experience curve calculations.
```json
{
  "baseXP": 100,
  "multiplier": 1.5,
  "exponent": 1.2,
  "formulaType": "exponential",
  "levelVisuals": [
    { "level": 1, "tier": "Bronze", "badgeColor": "#cd7f32", "glow": "none" },
    { "level": 5, "tier": "Silver", "badgeColor": "#c0c0c0", "glow": "silver-pulse" },
    { "level": 10, "tier": "Gold", "badgeColor": "#ffd700", "glow": "gold-sparkle" },
    { "level": 25, "tier": "Diamond", "badgeColor": "#b9f2ff", "glow": "rainbow-shimmer" }
  ]
}
```
*Formula used:* $\text{RequiredXP}(\text{Level}) = \lfloor \text{baseXP} \times (\text{Level}^{\text{exponent}}) \times \text{multiplier} \rfloor$

### 4.2 Energy Configuration (`src/config/energy.json`)
Controls constraints around play sessions.
```json
{
  "maxEnergy": 10,
  "startingEnergy": 10,
  "rechargeIntervalSeconds": 30,
  "costPerOpen": 1,
  "startingPinatas": 100,
  "refillOptions": [
    { "energyAmount": 5, "pinataCost": 10 },
    { "energyAmount": 15, "pinataCost": 20 },
    { "energyAmount": 50, "pinataCost": 30 }
  ],
  "koFiTipPinatas": 100,
  "koFiTipUrl": "https://ko-fi.com/ishanmanjrekar/tip"
}
```
*Note:* `startingEnergy` defaults to `maxEnergy` (full energy on first launch). It is a separate field to allow quick tuning without changing the cap.

### 4.3 Drop Tables & Onboarding Setup (`src/config/drop_tables.json`)
Defines rewards, their weights, and the initial rigged user flow.
```json
{
  "pitySystem": {
    "baseWeight": 1,
    "weightIncrementPerMiss": 3,
    "earlyGameBaseWeight": 200,
    "earlyGameMaxLevel": 5
  },
  "onboardingRiggedSequence": [
    {
      "step": 0,
      "dropType": "xp_percentage",
      "value": 0.80,
      "variationRange": 0.10,
      "description": "Rigged pull 1: 80% XP to level up"
    },
    {
      "step": 1,
      "dropType": "xp_percentage",
      "value": 0.20,
      "variationRange": 0.10,
      "forceLevelUp": true,
      "description": "Rigged pull 2: 20% XP, forcing level up to Lvl 2"
    },
    {
      "step": 2,
      "dropType": "xp_percentage",
      "value": 0.30,
      "variationRange": 0.10,
      "description": "Rigged pull 3: 30% XP of Level 2 requirement"
    },
    {
      "step": 3,
      "dropType": "box_unlock",
      "value": "random",
      "description": "Rigged pull 4: Guaranteed new random box skin"
    },
    {
      "step": 4,
      "dropType": "xp_percentage",
      "value": 0.35,
      "variationRange": 0.05,
      "description": "Rigged pull 5: 35% XP of Level 2 requirement"
    },
    {
      "step": 5,
      "dropType": "xp_percentage",
      "value": 0.35,
      "variationRange": 0.05,
      "forceLevelUp": true,
      "description": "Rigged pull 6: 35% XP, forcing level up to Lvl 3"
    }
  ],
  "standardDropTable": [
    {
      "id": "skin_unlock",
      "type": "box_unlock",
      "value": "random",
      "weight": 1,
      "description": "Base weight 1, becomes 200 if Level <= 5, grows by +3 on consecutive misses"
    },
    {
      "id": "xp_45",
      "type": "xp_percentage",
      "value": 0.45,
      "variationRange": 0.05,
      "weight": 19,
      "description": "45% of next level's XP"
    },
    {
      "id": "xp_30",
      "type": "xp_percentage",
      "value": 0.30,
      "variationRange": 0.05,
      "weight": 30,
      "description": "30% of next level's XP"
    },
    {
      "id": "xp_20",
      "type": "xp_percentage",
      "value": 0.20,
      "variationRange": 0.05,
      "weight": 50,
      "description": "20% of next level's XP"
    },
    {
      "id": "xp_18",
      "type": "xp_percentage",
      "value": 0.18,
      "variationRange": 0.05,
      "weight": 100,
      "description": "18% of next level's XP"
    },
    {
      "id": "xp_15",
      "type": "xp_percentage",
      "value": 0.15,
      "variationRange": 0.05,
      "weight": 100,
      "description": "15% of next level's XP"
    },
    {
      "id": "xp_12",
      "type": "xp_percentage",
      "value": 0.12,
      "variationRange": 0.05,
      "weight": 200,
      "description": "12% of next level's XP"
    },
    {
      "id": "xp_10",
      "type": "xp_percentage",
      "value": 0.10,
      "variationRange": 0.05,
      "weight": 200,
      "description": "10% of next level's XP"
    },
    {
      "id": "xp_8",
      "type": "xp_percentage",
      "value": 0.08,
      "variationRange": 0.05,
      "weight": 300,
      "description": "8% of next level's XP"
    }
  ]
}
```

### 4.4 Box Skins Config (`src/config/boxes.json`)
Lists visual themes and metadata. There is **no rarity field** — the visual quality of each box is determined purely by its image assets, not by a tier label.
```json
{
  "boxes": [
    {
      "id": "box-start",
      "name": "Default Starter Box",
      "description": "The first box given to you for free. Smells of fresh paper and minor expectation."
    },
    {
      "id": "box-1",
      "name": "Bronze Deluxe Crate",
      "description": "Shiny plastic painted to look like bronze. Guaranteed to contain useless items."
    },
    {
      "id": "box-2",
      "name": "Neon Cyber-Vault",
      "description": "Equipped with RGB strip lights that increase energy consumption by 400%."
    },
    {
      "id": "box-3",
      "name": "CEO Golden Safe",
      "description": "Dipped in genuine fake gold. Smells of corporate bonuses and player tears."
    }
  ]
}
```
*Note:* The UI locates visual assets dynamically using the pattern `box-[box-id]-[state].png` inside `public/assets/boxes/`. For example, box `box-1` maps to `public/assets/boxes/box-1-closed.png` and `box-1-open.png`. To add a new skin, place the two PNG files in that folder and add a matching entry in this config.
