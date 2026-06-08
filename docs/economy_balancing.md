# Lootbox Go! - Economy & Balancing Specification

This document details the mathematical formulas, numerical balances, probability distributions, progression curves, and satirical pricing tiers for **Lootbox Go!**. 

Developers can edit the tables and formulas in this document to align gameplay pacing before updating the corresponding JSON configuration files inside the codebase.

---

## 1. Level Progression & XP Curve

The progression curve determines the pacing of levels. We use an exponential model to slow down level progress gradually, encouraging the player to consider "mock premium refills."

### 1.1 XP Formula
The XP requirement for reaching the next level ($L + 1$) from current level ($L$) is calculated as follows:

$$\text{RequiredXP}(L) = \lfloor \text{BaseXP} \times (L^{\text{exponent}}) \times \text{multiplier} \rfloor$$

**Standard Tuning Parameters:**
- $\text{BaseXP} = 100$
- $\text{exponent} = 1.2$
- $\text{multiplier} = 1.5$

### 1.2 XP Requirement Table (Levels 1 to 20)

Below is the calculated XP curve based on standard parameters. Developers should copy these values when balancing:

| Current Level ($L$) | Target Level ($L+1$) | XP Required to Level Up | Cumulative XP from Level 1 | Est. Standard Pulls to Level* |
| :--- | :--- | :---: | :---: | :---: |
| **1** | 2 | 150 | 0 | 1.0 (Rigged onboarding) |
| **2** | 3 | 344 | 150 | ~10 pulls |
| **3** | 4 | 560 | 494 | ~16 pulls |
| **4** | 5 | 791 | 1054 | ~22 pulls |
| **5** | 6 | 1,033 | 1845 | ~29 pulls |
| **6** | 7 | 1,286 | 2878 | ~36 pulls |
| **7** | 8 | 1,547 | 4164 | ~43 pulls |
| **8** | 9 | 1,817 | 5711 | ~51 pulls |
| **9** | 10 | 2,093 | 7528 | ~59 pulls |
| **10** | 11 | 2,377 | 9621 | ~67 pulls |
| **11** | 12 | 2,666 | 11998 | ~75 pulls |
| **12** | 13 | 2,961 | 14664 | ~83 pulls |
| **13** | 14 | 3,261 | 17625 | ~91 pulls |
| **14** | 15 | 3,566 | 20886 | ~100 pulls |
| **15** | 16 | 3,875 | 24452 | ~109 pulls |
| **16** | 17 | 4,188 | 28327 | ~117 pulls |
| **17** | 18 | 4,505 | 32515 | ~126 pulls |
| **18** | 19 | 4,826 | 37020 | ~135 pulls |
| **19** | 20 | 5,151 | 41846 | ~144 pulls |
| **20** | 21 | 5,479 | 46997 | ~153 pulls |

*\*Note: Pull estimates are calculated using the average pull value of standard drop tables ($\approx 18\%$ of the level's XP requirement).*

---

## 2. Energy System Balance

To block user interaction and simulate friction, the energy values are balanced as follows:

| Parameter | Default Value | Unit | Satirical Purpose |
| :--- | :---: | :---: | :--- |
| **Max Energy Capacity** | 10 | Energy | Limits session length. |
| **Energy Cost per Pull** | 1 | Energy | Immediate cost for visual rewards. |
| **Passive Recharge Rate** | 30 | Seconds | High-frequency gate to check app. |
| **Time to Full Recharge** | 300 (5 mins) | Seconds | Short enough to wait, long enough to annoy. |
| **Mock Ad Recharge** | 1 | Energy | Negligible recharge to encourage Gem spend. |
| **Mock Buy Gem Cost** | 99 | Gems | Depletes starter wallet quickly. |
| **Mock Refill Refill Amount** | 10 (Full) | Energy | Instant gratification. |

---

## 3. Drop Probability Distribution

Lootbox rolls resolve based on integer weight distributions.

### 3.1 Drop Probabilities (Standard Mode)
Standard weights are defined out of a total sum of **421**:

| Drop ID | Reward Type | Base Value | Random Variation | Weight | Probability | Purpose |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `small_xp` | XP Percentage | 10% | $\pm 10\%$ error | 300 | **71.26%** | Tiny incremental feedback. |
| `medium_xp` | XP Percentage | 30% | $\pm 10\%$ error | 100 | **23.75%** | Moderate progression step. |
| `large_xp` | XP Percentage | 60% | $\pm 10\%$ error | 20 | **4.75%** | Highly visible progress jumps. |
| `skin_unlock`| Box Unlock | 1 Skin | N/A (Locks duplicate) | 1 | **0.24%** | Ultra-rare cosmetic jackpot. |

*XP Percentage value calculation:*
$$\text{XPReward} = \text{RequiredXP}(L) \times (\text{BaseValue} + \text{RandomVariation})$$
*Example:* A Level 2 player rolling `small_xp`:
$$\text{XP} = 344 \times (0.10 + \text{random}(-0.01, 0.01)) \approx 31\text{ to }38\text{ XP}$$

---

## 4. Onboarding Rigging Sequence

To lock in user engagement before switching to raw mathematical statistics, the first three pulls are deterministic:

- **Pull 1:** Drops `skin_unlock` for `bronze_deluxe_box`.
- **Pull 2:** Drops `skin_unlock` for `neon_cyber_box`.
- **Pull 3:** Drops custom `xp_percentage` value of **110%** ($1.1$) of Level 1 XP ($150 \text{ XP} \times 1.1 = 165 \text{ XP}$). This guarantees a Level Up on pull 3.

---

## 5. Satirical Shop & Economy Pricing

The shop utilizes fake pricing models to mock actual free-to-play tier pricing layouts.

### 5.1 Currency Details
- **Premium Currency Name:** Clown Gems 💎 (or Gullible Gold 🪙)
- **Starting Wallet Balance:** 200 Gems (allows exactly 2 instant energy refills before wallet depletion, forcing players to see the mock storefront).

### 5.2 Store Tiers & Mock Purchasing

| Store Item | Fake Gem Value | Real-World Satire Cost | Satirical Tagline / Label |
| :--- | :---: | :---: | :--- |
| **Refill Energy** | 10 Energy | 99 Gems | "Best Value Refill!" |
| **A Fistful of Gems** | 100 Gems | $1.99 | "Perfect to get you started!" |
| **A Sack of Gems** | 550 Gems | $9.99 | "Double Value! (50 Gems FREE!)" |
| **A Vault of Gems** | 6,000 Gems | $99.99 | "Whale Tier (Highly Recommended!)" |
| **The Kraken Pack** | 100,000 Gems | $999.99 | "Buy this and the CEO gets a yacht!" |
| **Mock VIP Club Pass**| N/A | $99.99 / Month | "Gives an obnoxious VIP badge. Does nothing else." |
