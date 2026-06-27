# Lootbox Go! - Economy & Balancing Specification

This document details the mathematical formulas, numerical balances, probability distributions, progression curves, and satirical pricing tiers for **Lootbox Go!**. 

Developers can edit the tables and formulas in this document to align gameplay pacing before updating the corresponding JSON configuration files inside the codebase.

### Related Documents
- [Game Design Document](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/game_design.md) - GDD, onboarding logic, and core mechanics setup.
- [UI & UX Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/ui_ux.md) - Screen elements, Collection grid states, and Store modal layout.
- [Art Direction Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/art_direction.md) - Theme system design tokens and animation rules.
- [Technical Architecture Document](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/architecture.md) - State management specs, action names, and configuration schemas.
- [Testing & QA Specification](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/docs/testing_and_qa.md) - Debug panel settings and verification tasks.

---

## 1. Level Progression & XP Curve

The progression curve determines the pacing of levels. We use an exponential model to slow down level progress gradually, encouraging the player to consider "mock premium refills."

### 1.1 XP Formula
The XP requirement for reaching the next level ($L + 1$) from current level ($L$) is calculated as follows:

*   **For Level 1:** $\text{RequiredXP}(1) = 50$ (Hardcoded exception for rapid onboarding)
*   **For Levels 2+:** 
    $$\text{RequiredXP}(L) = \lfloor \text{BaseXP} \times (L^{\text{exponent}}) \times \text{multiplier} \rfloor$$

**Standard Tuning Parameters:**
- $\text{BaseXP} = 100$
- $\text{exponent} = 1.2$
- $\text{multiplier} = 1.5$

*Example Math for Level 2:*
$$\text{RequiredXP}(2) = \lfloor 100 \times (2^{1.2}) \times 1.5 \rfloor = \lfloor 100 \times 2.2974 \times 1.5 \rfloor = 344\text{ XP}$$

### 1.2 XP Requirement Table (Levels 1 to 20)

Below is the calculated XP curve based on standard parameters. Developers should copy these values when balancing:

| Current Level ($L$) | Target Level ($L+1$) | XP Required to Level Up | Cumulative XP from Level 1 | Est. Standard Pulls to Level* |
| :--- | :--- | :---: | :---: | :---: |
| **1** | 2 | 50 | 0 | 2.0 (Rigged onboarding) |
| **2** | 3 | 344 | 50 | 4.0 (Rigged onboarding) |
| **3** | 4 | 560 | 394 | ~9.3 pulls (Early game skin boost) |
| **4** | 5 | 791 | 954 | ~9.3 pulls (Early game skin boost) |
| **5** | 6 | 1,033 | 1745 | ~9.3 pulls (Early game skin boost) |
| **6** | 7 | 1,286 | 2778 | ~7.8 pulls (Standard loop) |
| **7** | 8 | 1,547 | 4064 | ~7.8 pulls (Standard loop) |
| **8** | 9 | 1,817 | 5611 | ~7.8 pulls (Standard loop) |
| **9** | 10 | 2,093 | 7428 | ~7.8 pulls (Standard loop) |
| **10** | 11 | 2,377 | 9521 | ~7.8 pulls (Standard loop) |
| **11** | 12 | 2,666 | 11898 | ~7.8 pulls (Standard loop) |
| **12** | 13 | 2,961 | 14564 | ~7.8 pulls (Standard loop) |
| **13** | 14 | 3,261 | 17525 | ~7.8 pulls (Standard loop) |
| **14** | 15 | 3,566 | 20786 | ~7.8 pulls (Standard loop) |
| **15** | 16 | 3,875 | 24352 | ~7.8 pulls (Standard loop) |
| **16** | 17 | 4,188 | 28227 | ~7.8 pulls (Standard loop) |
| **17** | 18 | 4,505 | 32415 | ~7.8 pulls (Standard loop) |
| **18** | 19 | 4,826 | 36920 | ~7.8 pulls (Standard loop) |
| **19** | 20 | 5,151 | 41746 | ~7.8 pulls (Standard loop) |
| **20** | 21 | 5,479 | 46897 | ~7.8 pulls (Standard loop) |

*\*Note: Pull estimates are calculated based on the average pull value of standard drop tables relative to the required XP: ~12.855% of required XP for standard mode (Levels 6+), resulting in ~7.78 pulls; and ~10.72% for early game mode (Levels 3-5) due to the higher skin weight, resulting in ~9.33 pulls.*

---

## 2. Energy System Balance

To block user interaction and simulate friction, the energy values are balanced as follows:

| Parameter | Default Value | Unit | Satirical Purpose / Config Key |
| :--- | :---: | :---: | :--- |
| **Max Energy Capacity** | 10 | Energy | Limits standard passive recharge cap. (`maxEnergy`) |
| **Energy Cost per Pull** | 1 | Energy | Immediate cost for rolls. (`costPerOpen`) |
| **Passive Recharge Rate** | 30 | Seconds | High-frequency timer to check app. (`rechargeIntervalSeconds`) |
| **Time to Full Recharge** | 300 (5 mins) | Seconds | Time to recharge to capacity of 10 from empty. |
| **5 Energy Refill Cost** | 10 | Pinatas 🪅 | Cost of the small refill tier. (`refillOptions[0]`) |
| **15 Energy Refill Cost** | 20 | Pinatas 🪅 | Cost of the medium refill tier. (`refillOptions[1]`) |
| **50 Energy Refill Cost** | 30 | Pinatas 🪅 | Cost of the large overflow refill tier. (`refillOptions[2]`) |
| **Ko-fi Link Reward** | 100 | Pinatas 🪅 | Awarded instantly upon clicking the tip link. (`koFiTipPinatas`) |

---

## 3. Drop Probability Distribution

Lootbox rolls resolve based on integer weight distributions. The probability of rolling a particular reward is its weight divided by the total sum of all weights in the active table.

### 3.1 Drop Probabilities (Standard Mode - Level 6+)
Standard weights are defined out of a total base sum of **1000**:

| Drop ID | Reward Type | Base XP % Value | Random Variation | Weight | Probability (Base) | Satirical Purpose |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `skin_unlock` | Box Skin | N/A | N/A | 1 | **0.10%** | Ultra-rare cosmetic jackpot. |
| `xp_45` | XP Percentage | 45% | $\pm 5\%$ (additive) | 19 | **1.90%** | Massive lucky roll. |
| `xp_30` | XP Percentage | 30% | $\pm 5\%$ (additive) | 30 | **3.00%** | Large progress leap. |
| `xp_20` | XP Percentage | 20% | $\pm 5\%$ (additive) | 50 | **5.00%** | Standard high-tier reward. |
| `xp_18` | XP Percentage | 18% | $\pm 5\%$ (additive) | 100 | **10.00%** | Common solid progression. |
| `xp_15` | XP Percentage | 15% | $\pm 5\%$ (additive) | 100 | **10.00%** | Standard progression. |
| `xp_12` | XP Percentage | 12% | $\pm 5\%$ (additive) | 200 | **20.00%** | Minor progress drip. |
| `xp_10` | XP Percentage | 10% | $\pm 5\%$ (additive) | 200 | **20.00%** | Minor progress drip. |
| `xp_8` | XP Percentage | 8% | $\pm 5\%$ (additive) | 300 | **30.00%** | Bread-and-butter common filler. |

*XP Reward value calculation:*
$$\text{XPReward} = \text{RequiredXP}(L) \times (\text{BaseValue} + \text{RandomVariation})$$

### 3.2 Drop Probabilities (Early Game Boost Mode - Levels 1 to 5)
To ensure high engagement and reward early adopters, the base weight of `skin_unlock` is set to **200** until the player levels up to Level 6. The total base sum is **1199**:

| Drop ID | Reward Type | Base XP % Value | Random Variation | Weight | Probability (Base) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `skin_unlock` | Box Skin | N/A | N/A | 200 | **16.68%** |
| `xp_45` to `xp_8`| (Same as above) | (Same as above) | $\pm 5\%$ | 999 | **83.32%** |

### 3.3 Dynamic Skin Pity System
Every roll that fails to drop a box skin increases the `skin_unlock` weight by **`+3`** for the next roll. Let $N$ represent the number of rolls since the last skin unlock:

$$\text{ActiveSkinWeight}(N) = \text{BaseSkinWeight} + (3 \times N)$$
$$\text{ActiveTotalWeight}(N) = \text{XPWeightsSum} + \text{ActiveSkinWeight}(N) = 999 + \text{BaseSkinWeight} + 3N$$

**All Boxes Owned:** If the player has unlocked every box listed in `src/config/boxes.json`, the `skin_unlock` weight is forced to **0** and the pity counter freezes. The weight is restored to its level-appropriate base value and the pity counter resumes as soon as a new box is added to the config. There is no duplicate conversion flow.

*Standard Mode (Level 6+) Dynamic Probability Example:*
- **$N = 0$ (Just Reset):** Weight = 1. Probability = $1 / 1000 = \mathbf{0.1\%}$
- **$N = 10$ (10 Misses):** Weight = 31. Probability = $31 / 1030 \approx \mathbf{3.01\%}$
- **$N = 50$ (50 Misses):** Weight = 151. Probability = $151 / 1150 \approx \mathbf{13.13\%}$
- **$N = 100$ (100 Misses):** Weight = 301. Probability = $301 / 1300 \approx \mathbf{23.15\%}$

---

## 4. Onboarding Rigging Sequence

To hook first-time users, the first 6 rolls are strictly scripted:

1.  **Roll 1 (Level 1, Target 50 XP):** Drops `xp_80` (80% of Level 1 XP baseline = 40 XP, with $\pm 10\%$ variation giving **35 to 45 XP**).
2.  **Roll 2 (Level 1, Target 50 XP):** Drops `xp_20` (20% of Level 1 XP baseline = 10 XP, with $\pm 10\%$ variation giving **5 to 15 XP**).
    *   *Rigged Correction:* If the sum of Roll 1 and 2 is $< 50\text{ XP}$ due to variation, the Roll 2 reward is corrected to ensure the player hits exactly 50 XP and levels up to Level 2.
3.  **Roll 3 (Level 2, Target 344 XP):** Drops `xp_30` (30% of Level 2 XP baseline, with $\pm 10\%$ variation giving **69 to 137 XP**).
4.  **Roll 4 (Level 2, Target 344 XP):** Guaranteed `skin_unlock` (unlocks a new random box skin from `boxes.json`). Pity weight resets.
5.  **Roll 5 (Level 2, Target 344 XP):** Drops `xp_35` (35% of Level 2 XP baseline, with $\pm 5\%$ variation giving **103 to 137 XP**).
6.  **Roll 6 (Level 2, Target 344 XP):** Drops `xp_35` (35% of Level 2 XP baseline, with $\pm 5\%$ variation giving **103 to 137 XP**).
    *   *Rigged Correction:* If the sum of Rolls 3, 5, and 6 is $< 344\text{ XP}$ due to negative variation, Roll 6 is corrected to guarantee a Level Up to Level 3.

From **Roll 7 onward**, standard rolling begins (utilizing the Level $\le 5$ boosted skin weight of 200).

## 5. Satirical Shop & Economy Pricing

The shop utilizes fake pricing models to mock actual free-to-play tier pricing layouts.

### 5.1 Currency Details
- **Premium Currency Name:** Party Pinatas 🪅 (referred to as Pinatas 🪅)
- **Starting Wallet Balance:** Default is **100 Pinatas 🪅** to align with the visual HUD starter state. This starting wallet balance is fully configurable inside the JSON files (e.g. `src/config/progression.json` or `src/config/energy.json`) to allow quick balancing adjustments.

### 5.2 Store Tiers & Purchasing

The store features three energy packages and one Pinata acquisition method. All pricing, energy values, and tipping URL configurations are driven by `src/config/energy.json` to allow easy balance tuning:

| Store Item | Energy Value | Pinata Cost / Action | Satirical Tagline & JSON Schema Mapping |
| :--- | :---: | :---: | :--- |
| **5 Energy Package** | 5 Energy | 10 Pinatas 🪅 | Base starter refill. Maps to config `refillOptions` list. |
| **15 Energy Package** | 15 Energy | 20 Pinatas 🪅 | Moderate value boost. Maps to config `refillOptions` list. |
| **50 Energy Package** | 50 Energy | 30 Pinatas 🪅 | **Overflows Cap:** Refills energy to 50+ beyond the cap of 10. Best value. |
| **Get 100x Pinatas** | N/A | Tip on Ko-fi | Tapping redirects to `https://ko-fi.com/ishanmanjrekar/tip` and rewards 100 Pinatas. |
