import { create } from 'zustand';

interface GameState {
  coins: number;
  boxesOpened: number;
  openBox: () => void;
  addCoins: (amount: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  coins: 100,
  boxesOpened: 0,
  openBox: () => set((state) => {
    if (state.coins < 10) return {};
    return {
      coins: state.coins - 10 + Math.floor(Math.random() * 25), // costs 10, gives 0-24 back
      boxesOpened: state.boxesOpened + 1
    };
  }),
  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
  resetGame: () => set({ coins: 100, boxesOpened: 0 })
}));
