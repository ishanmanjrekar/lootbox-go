# Lootbox Go! - Technical Architecture Document

This document outlines the software architecture, state management design, persistence strategies, offline timing logic, and configuration data schemas for **Lootbox Go!**.

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

  // --- Energy ---
  energy: number; // Current energy count
  lastRechargeTime: number; // Epoch timestamp (ms) of the last energy update

  // --- Collection ---
  unlockedBoxes: string[]; // List of box IDs unlocked by the player
  activeBoxSkin: string; // The ID of the currently equipped box skin

  // --- Onboarding ---
  onboardingStep: number; // 0, 1, 2, 3 (rigged pulls), 4+ (standard game loop)
}
```

### 2.2 Store Actions
```typescript
interface GameActions {
  // --- Game Loop Actions ---
  openBox(): void; // Deducts energy, calculates random drop, awards XP/Skins, updates recharge timestamps
  changeBoxSkin(boxId: string): void; // Changes the currently active box skin

  // --- Energy Management Actions ---
  updateEnergyRecharge(): void; // Evaluates passive energy recovery based on timestamp difference
  watchMockAd(): void; // Increments energy by 1 (simulating watching a satirical advertisement)
  buyEnergyRefill(): void; // Instantly refills energy to max capacity (using mock fake currency flow)

  // --- Developer / Cheat Actions ---
  devCheatRefillEnergy(): void;
  devCheatLevelUp(): void;
  devCheatReset(): void;
  devCheatUnlockAllSkins(): void;
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
  "rechargeIntervalSeconds": 30,
  "costPerOpen": 1,
  "mockAdRechargeAmount": 1,
  "mockBuyCostClownGems": 99
}
```

### 4.3 Drop Tables & Onboarding Setup (`src/config/drop_tables.json`)
Defines rewards, their weights, and the initial rigged user flow.
```json
{
  "onboardingRiggedSequence": [
    {
      "step": 0,
      "dropType": "box_unlock",
      "value": "bronze_deluxe_box",
      "description": "Rigged pull 1: Guaranteed new themed box skin"
    },
    {
      "step": 1,
      "dropType": "box_unlock",
      "value": "neon_cyber_box",
      "description": "Rigged pull 2: Guaranteed rare visual box"
    },
    {
      "step": 2,
      "dropType": "xp_percentage",
      "value": 1.1,
      "description": "Rigged pull 3: Drops 110% of Level 1 XP, guaranteeing instant level up"
    }
  ],
  "standardDropTable": [
    {
      "id": "small_xp",
      "type": "xp_percentage",
      "value": 0.10,
      "variationRange": 0.10,
      "weight": 300,
      "description": "10% of next level's XP, +/- 10% error margin"
    },
    {
      "id": "medium_xp",
      "type": "xp_percentage",
      "value": 0.30,
      "variationRange": 0.10,
      "weight": 100,
      "description": "30% of next level's XP, +/- 10% error margin"
    },
    {
      "id": "large_xp",
      "type": "xp_percentage",
      "value": 0.60,
      "variationRange": 0.10,
      "weight": 20,
      "description": "60% of next level's XP, +/- 10% error margin"
    },
    {
      "id": "skin_unlock",
      "type": "box_unlock",
      "value": "random",
      "weight": 1,
      "description": "Unlocks a random locked box skin"
    }
  ]
}
```

### 4.4 Box Skins Config (`src/config/boxes.json`)
Lists visual themes and metadata.
```json
{
  "boxes": [
    {
      "id": "default_cardboard",
      "name": "Standard Cardboard Box",
      "rarity": "Common",
      "description": "A wet, slightly crushed cardboard box found in the trash. Smells like disappointment."
    },
    {
      "id": "bronze_deluxe_box",
      "name": "Bronze Deluxe Crate",
      "rarity": "Rare",
      "description": "Shiny plastic painted to look like bronze. Guaranteed to contain useless items."
    },
    {
      "id": "neon_cyber_box",
      "name": "Neon Cyber-Vault",
      "rarity": "Epic",
      "description": "Equipped with RGB strip lights that increase energy consumption by 400%."
    },
    {
      "id": "ceo_luxury_safe",
      "name": "CEO Golden Safe",
      "rarity": "Legendary",
      "description": "Dipped in genuine fake gold. Smells of corporate bonuses and player tears."
    }
  ]
}
```
*Note:* The UI will locate visual assets using standard paths matching the ID (e.g., `public/assets/boxes/neon_cyber_box/closed.png` and `open.png`).
