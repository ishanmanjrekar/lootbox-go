import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import boxesConfig from '../config/boxes.json';
import energyConfig from '../config/energy.json';
import progressionConfig from '../config/progression.json';
import dropTablesConfig from '../config/drop_tables.json';

export interface XPReward {
  type: 'xp';
  amount: number;
  percent: number;
}

export interface SkinReward {
  type: 'skin';
  boxId: string;
}

export type Reward = XPReward | SkinReward;

export const getRequiredXpForLevel = (level: number): number => {
  if (level === 1) return 50;
  const baseXP = progressionConfig.baseXP;
  const exponent = progressionConfig.exponent;
  const multiplier = progressionConfig.multiplier;
  return Math.floor(baseXP * Math.pow(level, exponent) * multiplier);
};

export interface GameState {
  level: number;
  xp: number;
  pinatas: number;
  energy: number;
  lastRechargeTime: number;
  unlockedBoxes: string[];
  activeBoxSkin: string;
  skinPityCount: number;
  onboardingStep: number;
}

export interface GameActions {
  openBox: () => Reward | null;
  changeBoxSkin: (boxId: string) => void;
  updateEnergyRecharge: () => void;
  buyEnergy: (amount: number, cost: number) => boolean;
  claimKoFiPinatas: () => void;
  
  devCheatRefillEnergy: () => void;
  devCheatEmptyEnergy: () => void;
  devCheatLevelUp: () => void;
  devCheatReset: () => void;
  devCheatUnlockAllSkins: () => void;
  devCheatAddPinatas: () => void;
  devCheatWarpTime: () => void;
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      // State
      level: 1,
      xp: 0,
      pinatas: energyConfig.startingPinatas,
      energy: energyConfig.startingEnergy,
      lastRechargeTime: Date.now(),
      unlockedBoxes: ['box-start'],
      activeBoxSkin: 'box-start',
      skinPityCount: 0,
      onboardingStep: 0,

      // Actions
      updateEnergyRecharge: () => {
        const { energy, lastRechargeTime } = get();
        const maxEnergy = energyConfig.maxEnergy;
        const rechargeIntervalMs = energyConfig.rechargeIntervalSeconds * 1000;

        if (energy >= maxEnergy) {
          set({ lastRechargeTime: Date.now() });
          return;
        }

        const now = Date.now();
        const elapsedTime = now - lastRechargeTime;
        if (elapsedTime >= rechargeIntervalMs) {
          const gainedEnergy = Math.floor(elapsedTime / rechargeIntervalMs);
          const newEnergy = Math.min(maxEnergy, energy + gainedEnergy);
          const newRechargeTime = lastRechargeTime + gainedEnergy * rechargeIntervalMs;

          set({
            energy: newEnergy,
            lastRechargeTime: newEnergy >= maxEnergy ? now : newRechargeTime,
          });
        }
      },

      openBox: () => {
        // Synchronize energy recharge state first
        get().updateEnergyRecharge();

        const { energy, level, xp, onboardingStep, skinPityCount, unlockedBoxes } = get();
        const cost = energyConfig.costPerOpen;
        const maxEnergy = energyConfig.maxEnergy;

        if (energy < cost) {
          return null;
        }

        // Deduct energy & handle recharge start timestamp
        const newEnergy = energy - cost;
        let nextRechargeTime = get().lastRechargeTime;
        if (energy >= maxEnergy && newEnergy < maxEnergy) {
          nextRechargeTime = Date.now();
        }

        let reward: Reward;
        let nextOnboardingStep = onboardingStep;
        let nextSkinPityCount = skinPityCount;
        let nextUnlockedBoxes = [...unlockedBoxes];
        let nextActiveBoxSkin = get().activeBoxSkin;
        let newXp = xp;
        let newLevel = level;

        const allRegisteredBoxes = boxesConfig.boxes.map((b) => b.id);
        const lockedBoxes = allRegisteredBoxes.filter((id) => !nextUnlockedBoxes.includes(id));
        const allOwned = lockedBoxes.length === 0;

        // Check if onboarding sequence is active
        if (onboardingStep < dropTablesConfig.onboardingRiggedSequence.length) {
          const riggedStep = dropTablesConfig.onboardingRiggedSequence[onboardingStep];
          nextOnboardingStep = onboardingStep + 1;

          if (riggedStep.dropType === 'xp_percentage') {
            const val = riggedStep.value as number;
            const range = (riggedStep.variationRange ?? 0) as number;
            const variance = (Math.random() * 2 - 1) * range;
            const finalPercent = val + variance;
            const requiredXp = getRequiredXpForLevel(newLevel);
            let xpAmt = Math.max(1, Math.floor(requiredXp * finalPercent));

            if (riggedStep.forceLevelUp) {
              xpAmt = Math.max(xpAmt, requiredXp - newXp);
            }

            newXp += xpAmt;
            reward = { type: 'xp', amount: xpAmt, percent: finalPercent };
          } else {
            // box_unlock
            if (!allOwned) {
              const randomIndex = Math.floor(Math.random() * lockedBoxes.length);
              const unlockedBoxId = lockedBoxes[randomIndex];
              nextUnlockedBoxes.push(unlockedBoxId);
              nextActiveBoxSkin = unlockedBoxId;
              reward = { type: 'skin', boxId: unlockedBoxId };
              nextSkinPityCount = 0;
            } else {
              const requiredXp = getRequiredXpForLevel(newLevel);
              const xpAmt = Math.floor(requiredXp * 0.20);
              newXp += xpAmt;
              reward = { type: 'xp', amount: xpAmt, percent: 0.20 };
            }
          }
        } else {
          // Standard rolling
          let skinWeight = 0;
          if (!allOwned) {
            const baseSkinWeight = newLevel <= dropTablesConfig.pitySystem.earlyGameMaxLevel
              ? dropTablesConfig.pitySystem.earlyGameBaseWeight
              : dropTablesConfig.pitySystem.baseWeight;
            skinWeight = baseSkinWeight + dropTablesConfig.pitySystem.weightIncrementPerMiss * skinPityCount;
          }

          const xpDrops = dropTablesConfig.standardDropTable.filter((d) => d.id !== 'skin_unlock');
          const xpWeightsSum = xpDrops.reduce((acc, curr) => acc + curr.weight, 0);
          const totalWeight = xpWeightsSum + skinWeight;

          const roll = Math.random() * totalWeight;

          if (roll < skinWeight && !allOwned) {
            const randomIndex = Math.floor(Math.random() * lockedBoxes.length);
            const unlockedBoxId = lockedBoxes[randomIndex];
            nextUnlockedBoxes.push(unlockedBoxId);
            nextActiveBoxSkin = unlockedBoxId;
            reward = { type: 'skin', boxId: unlockedBoxId };
            nextSkinPityCount = 0;
          } else {
            nextSkinPityCount += 1;

            let runningSum = skinWeight;
            let rolledXpDrop = xpDrops[xpDrops.length - 1];
            for (const drop of xpDrops) {
              if (roll >= runningSum && roll < runningSum + drop.weight) {
                rolledXpDrop = drop;
                break;
              }
              runningSum += drop.weight;
            }

            const basePercent = rolledXpDrop.value as number;
            const range = (rolledXpDrop.variationRange ?? 0) as number;
            const variance = (Math.random() * 2 - 1) * range;
            const finalPercent = basePercent + variance;
            const requiredXp = getRequiredXpForLevel(newLevel);
            const xpAmt = Math.max(1, Math.floor(requiredXp * finalPercent));

            newXp += xpAmt;
            reward = { type: 'xp', amount: xpAmt, percent: finalPercent };
          }
        }

        // Apply level up calculations
        while (newXp >= getRequiredXpForLevel(newLevel)) {
          newXp -= getRequiredXpForLevel(newLevel);
          newLevel++;
        }

        set({
          energy: newEnergy,
          lastRechargeTime: nextRechargeTime,
          unlockedBoxes: nextUnlockedBoxes,
          activeBoxSkin: nextActiveBoxSkin,
          skinPityCount: nextSkinPityCount,
          onboardingStep: nextOnboardingStep,
          xp: newXp,
          level: newLevel,
        });

        return reward;
      },

      changeBoxSkin: (boxId: string) => {
        const { unlockedBoxes } = get();
        if (unlockedBoxes.includes(boxId)) {
          set({ activeBoxSkin: boxId });
        }
      },

      buyEnergy: (amount: number, cost: number) => {
        const { pinatas, energy } = get();
        if (pinatas < cost) {
          return false;
        }
        set({
          pinatas: pinatas - cost,
          energy: energy + amount,
        });
        return true;
      },

      claimKoFiPinatas: () => {
        window.open(energyConfig.koFiTipUrl, '_blank');
        set((state) => ({
          pinatas: state.pinatas + energyConfig.koFiTipPinatas,
        }));
      },

      devCheatRefillEnergy: () => {
        set({ energy: energyConfig.maxEnergy, lastRechargeTime: Date.now() });
      },

      devCheatEmptyEnergy: () => {
        set({ energy: 0, lastRechargeTime: Date.now() });
      },

      devCheatLevelUp: () => {
        set((state) => ({
          level: state.level + 1,
          xp: 0,
        }));
      },

      devCheatReset: () => {
        set({
          level: 1,
          xp: 0,
          pinatas: energyConfig.startingPinatas,
          energy: energyConfig.startingEnergy,
          lastRechargeTime: Date.now(),
          unlockedBoxes: ['box-start'],
          activeBoxSkin: 'box-start',
          skinPityCount: 0,
          onboardingStep: 0,
        });
      },

      devCheatUnlockAllSkins: () => {
        const allBoxIds = boxesConfig.boxes.map((b) => b.id);
        set({
          unlockedBoxes: allBoxIds,
        });
      },

      devCheatAddPinatas: () => {
        set((state) => ({ pinatas: state.pinatas + 999 }));
      },

      devCheatWarpTime: () => {
        set((state) => ({
          lastRechargeTime: state.lastRechargeTime - 300000,
        }));
        get().updateEnergyRecharge();
      },
    }),
    {
      name: 'lootbox-go-save',
    }
  )
);

// Expose simulation helper on window for QA testing
const simulateWeightedDrop = (simulatedPity: { count: number }) => {
  const baseSkinWeight = 1;
  const activeSkinWeight = baseSkinWeight + 3 * simulatedPity.count;

  const xpDrops = dropTablesConfig.standardDropTable.filter((d) => d.id !== 'skin_unlock');
  const xpWeightsSum = xpDrops.reduce((acc, curr) => acc + curr.weight, 0);
  const totalWeight = xpWeightsSum + activeSkinWeight;

  const roll = Math.random() * totalWeight;
  if (roll < activeSkinWeight) {
    simulatedPity.count = 0;
    return { id: 'skin_unlock' };
  } else {
    simulatedPity.count += 1;
    let runningSum = activeSkinWeight;
    for (const drop of xpDrops) {
      if (roll >= runningSum && roll < runningSum + drop.weight) {
        return drop;
      }
      runningSum += drop.weight;
    }
    return xpDrops[xpDrops.length - 1];
  }
};

if (typeof window !== 'undefined') {
  (window as any).runDropRateSimulation = (pullsCount = 1000) => {
    const results: Record<string, number> = {};
    const simulatedPity = { count: 0 };
    for (let i = 0; i < pullsCount; i++) {
      const drop = simulateWeightedDrop(simulatedPity);
      results[drop.id] = (results[drop.id] || 0) + 1;
    }
    console.log(`--- Simulation Results for ${pullsCount} Pulls ---`);
    console.table(
      Object.entries(results).map(([id, count]) => ({
        Outcome: id,
        Pulls: count,
        Percentage: `${((count / pullsCount) * 100).toFixed(2)}%`,
      }))
    );
  };
}
