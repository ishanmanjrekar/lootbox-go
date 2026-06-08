# Lootbox Go! - Testing & QA Specification

This document details the testing framework, debug panels, developer cheat codes, and verification scripts required to test features like rigged onboarding, drop tables, and passive energy regeneration in **Lootbox Go!**.

---

## 1. The Developer Debug Panel

Because lootbox odds are statistical and energy recharge is time-gated, testing manually can be slow. The game includes a secret **Developer Debug Panel** overlaid on the screen for development builds.

### 1.1 Triggering the Panel
- **Trigger:** Triple-tapping the **Level Badge** on the HUD toggles the visibility of the Developer Debug Panel.
- **Visuals:** A semi-transparent overlay that slides out from the right side of the screen with a scrollable list of debug operations.

### 1.2 Debug Actions Available

| Action Button | Store Call / Operation | Test Objective |
| :--- | :--- | :--- |
| **+1 Energy** | `energy = Math.min(maxEnergy, energy + 1)` | Increments energy without waiting or watching an ad. |
| **Empty Energy** | `energy = 0` | Tests state transitions for empty energy (disabling the Open button). |
| **Reset Onboarding** | `onboardingStep = 0` | Resets state so the next 3 pulls are rigged (verifies onboarding sequence). |
| **+1 Level** | Triggers level-up transition & increments level | Tests Level Up transitions, badges, and rewards. |
| **Unlock All Skins** | Adds all box IDs in config to `unlockedBoxes` | Checks UI layout and equips all boxes without roll grinding. |
| **Add 999 Gems** | Mock credits update | Verifies the "Buy Energy" P2W purchase overlay. |
| **Wipe Save State** | Resets `localStorage` and store state | Verifies first-time run configurations. |

---

## 2. Testing Core Systems

QA testers and developers should follow these testing plans to verify game logic:

### 2.1 Rigged Onboarding Verification Plan
1. **Setup:** Open the Developer Debug Panel and click **Wipe Save State**.
2. **Pull 1:** Click the box once. Verify that:
   - Energy drops to 9.
   - The drop card shows a new box skin (e.g., `Bronze Deluxe Crate`).
   - The Collection Screen now shows this skin as unlocked and equipped.
3. **Pull 2:** Click the box a second time. Verify that:
   - Energy drops to 8.
   - The drop card shows a different box skin (e.g., `Neon Cyber-Vault`).
   - The Collection Screen shows this skin as unlocked and equipped.
4. **Pull 3:** Click the box a third time. Verify that:
   - Energy drops to 7.
   - The drop card gives a large XP reward.
   - The game immediately freezes gameplay and launches the full-screen **Level Up Overlay**.
   - After dismissing, the player is Level 2 and the Level Badge reflects the progress.
5. **Standard Loops:** The 4th pull should trigger standard weighted drops. Verifying standard drop outputs can be done via console logging.

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

QA can run this in the browser console (F12) to verify that a standard drop weight configuration matches the expected probabilities:
- `small_xp` $\approx 71.2\%$
- `medium_xp` $\approx 23.7\%$
- `large_xp` $\approx 4.7\%$
- `skin_unlock` $\approx 0.24\%$
(Based on standard weights $300 / 100 / 20 / 1$ respectively).
