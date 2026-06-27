# Lootbox Go! - Testing & QA Specification

This document details the testing framework, debug panels, developer cheat codes, and verification scripts required to test features like rigged onboarding, drop tables, and passive energy regeneration in **Lootbox Go!**.

### Related Documents
- [Game Design Document](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/game_design.md) - Play loop rules, onboarding structures, and monetization mechanics.
- [UI & UX Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/ui_ux.md) - HUD styling, bottom collection slide-out, and Store overlays.
- [Art Direction Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/art_direction.md) - Cute visuals guides, font configurations, and animation settings.
- [Economy & Balancing Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/economy_balancing.md) - Mathematical progressions, drop probabilities, and pricing lists.
- [Technical Architecture Document](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/architecture.md) - State management files, persistent data, and sleep timers.

---

## 1. The Developer Debug Panel

Because lootbox odds are statistical and energy recharge is time-gated, testing manually can be slow. The game includes a secret **Developer Debug Panel** overlaid on the screen for development builds.

### 1.1 Triggering the Panel
- **Trigger:** Triple-tapping the **Level Badge** on the HUD toggles the visibility of the Developer Debug Panel.
- **Visuals:** A semi-transparent overlay that slides out from the right side of the screen with a scrollable list of debug operations.

### 1.2 Debug Actions Available

| Action Button | Store Call / Operation | Test Objective |
| :--- | :--- | :--- |
| **+1 Energy** | `energy = Math.min(maxEnergy, energy + 1)` | Increments energy without waiting. |
| **Empty Energy** | `energy = 0` | Tests state transitions for empty energy (disabling the Open button). |
| **Reset Onboarding** | `onboardingStep = 0` | Resets state so the next 6 pulls are rigged (verifies onboarding sequence). |
| **+1 Level** | Triggers level-up transition & increments level | Tests Level Up transitions, badges, and rewards. |
| **Unlock All Skins** | Adds all box IDs in config to `unlockedBoxes` | Checks UI layout and equips all boxes without roll grinding. |
| **Add 999 Pinatas 🪅** | Mock credits update | Verifies the "Buy Energy" purchase overlay. |
| **Wipe Save State** | Resets `localStorage` and store state | Verifies first-time run configurations. |
| **Warp +5 Minutes** | `lastRechargeTime -= 300_000`, then calls `updateEnergyRecharge()` | Simulates 5 minutes of offline time to verify energy tick-up without waiting. |

---

## 2. Testing Core Systems

QA testers and developers should follow these testing plans to verify game logic:

### 2.1 Rigged Onboarding Verification Plan
1. **Setup:** Open the Developer Debug Panel and click **Wipe Save State**.
2. **Pull 1 (Level 1):** Click the box once. Verify that:
   - Energy drops to 9.
   - The drop card shows a large XP boost (~40 XP, 80% progress).
3. **Pull 2 (Level 1):** Click the box a second time. Verify that:
   - Energy drops to 8.
   - The drop card shows a small XP reward (~10 XP).
   - The game immediately displays the celebratory **Level Up Overlay** to Level 2.
4. **Pull 3 (Level 2):** Click the box a third time. Verify that:
   - Energy drops to 7.
   - The drop card gives ~103 XP (30% progress).
5. **Pull 4 (Level 2):** Click the box a fourth time. Verify that:
   - Energy drops to 6.
   - The drop card shows a new box skin (guaranteed unlock).
   - The Collection Screen shows this skin as unlocked and equipped.
6. **Pull 5 (Level 2):** Click the box a fifth time. Verify that:
   - Energy drops to 5.
   - The drop card gives ~120 XP (35% progress).
7. **Pull 6 (Level 2):** Click the box a sixth time. Verify that:
   - Energy drops to 4.
   - The drop card gives ~120 XP (35% progress).
   - The game triggers a **Level Up Overlay** to Level 3.
8. **Standard Loops:** The 7th pull should trigger standard weighted drops. Verifying standard drop outputs can be done via console logging.

### 2.2 Offline Energy Recharge Verification Plan
1. **Setup:** Consume energy until it is at `5/10`. Note the current time.
2. **Simulate Exit:** Close the browser tab or lock the mobile screen wrapper.
3. **Wait time:** Wait 60 seconds (with a recharge rate of 1 energy per 30 seconds, this should yield exactly 2 energy).
4. **Simulate Resume:** Re-open the tab.
5. **Evaluation:** Verify that the energy instantly updates to `7/10` and the recharge timer recalculates its remainder cleanly.
6. **Time Warp Simulation:** In the Debug Panel, clicking "Warp +5 Minutes" should artificially deduct $300,000\text{ms}$ from `lastRechargeTime` and force an immediate recharge update.

---

## 3. Drop Table Weight Validator Script

To verify that the random generator matches the drop rates in `drop_tables.json` without manually clicking the box a thousand times, we implement a statistical test utility.

### 3.1 Script Execution
A utility script or console-executable function is exposed at `window.runDropRateSimulation(pullsCount)`:

```typescript
/**
 * Run a dry simulation of the drop rates to verify statistical alignment.
 * Outputs results as a table in the browser developer console.
 */
window.runDropRateSimulation = (pullsCount = 1000) => {
  const results: Record<string, number> = {};
  
  // Wipe onboarding step to simulate pure standard drops
  for (let i = 0; i < pullsCount; i++) {
    const drop = simulateWeightedDrop(); // Internal helper from drop generator
    results[drop.id] = (results[drop.id] || 0) + 1;
  }
  
  console.log(`--- Simulation Results for ${pullsCount} Pulls ---`);
  console.table(
    Object.entries(results).map(([id, count]) => ({
      Outcome: id,
      Pulls: count,
      Percentage: `${((count / pullsCount) * 100).toFixed(2)}%`
    }))
  );
};
```

QA can run this in the browser console (F12) to verify that a standard drop weight configuration (Level 6+) matches the expected probabilities from `economy_balancing.md`:

| Drop ID | Expected Probability (Standard Mode, Level 6+) |
| :--- | :---: |
| `xp_8` | **30.00%** |
| `xp_10` | **20.00%** |
| `xp_12` | **20.00%** |
| `xp_15` | **10.00%** |
| `xp_18` | **10.00%** |
| `xp_20` | **5.00%** |
| `xp_30` | **3.00%** |
| `xp_45` | **1.90%** |
| `skin_unlock` | **0.10%** (base; grows +3 per miss via pity; resets to 0 if all boxes owned) |

*Total base weight: 1000. For early game (Level 1–5), `skin_unlock` base weight is 200 and total is 1199, giving ~16.68% skin probability.*
