# 🪅 Lootbox Go!

> A satirical idle clicker game mocking modern mobile free-to-play mechanics, energy timers, and rigged gacha onboarding loops.

**Lootbox Go!** is a portrait mobile/web idle clicker game where players experience the thrilling highs and manipulative lows of free-to-play mobile game onboarding loops. The core objective is to tap the lootbox, level up, unlock rare cosmetic box skins, and navigate a deliberately rigged economy.

This project was built as a satirical exploration of modern microtransaction design patterns and engagement loops.

## 🕹️ How to Play

*   **Open Boxes:** Tap the central box or click **OPEN BOX** to open loot boxes and earn XP.
*   **Manage Energy:** Every box open costs Energy. Watch your energy meter recharge over time or overflow it with shop packs!
*   **Collect Skins:** Roll the gacha to unlock rare box skins and equip them directly from your slide-up collection drawer.
*   **Level Up:** Accumulate enough XP to trigger massive level-up celebrations (and pretend your double XP is right around the corner).
*   **Rigged Economy:** Spend Pinatas in the store to refill your energy, or tap the Ko-fi link to instantly get free Pinatas without any actual verification.
*   **Debug & Cheat:** Tap the secret developer badge or panels to access instant cheats (warp time, add pinatas, unlock all skins, etc.) for testing purposes.

## ✨ Features

*   **Manipulative Core Loop:** Bubbly animations, sound guides, and confetti showers designed to trigger artificial excitement.
*   **Rigged Onboarding Sequence:** A pre-programmed sequence of rigged rolls designed to give players a false sense of fortune right after starting.
*   **Progressive Pity System:** A dynamic pity tracker that increases the weight of skin unlocks with every failed roll, guaranteeing you won't stay skin-less forever.
*   **Kawaii Aesthetic Design:** "Cute Kawaii Pinata Party" theme featuring soft pastel cream colors, marshmallow outlines, and playful typography.
*   **Energy Overflow Mechanic:** Allows purchasing massive energy packs (e.g., 50 energy) that exceed the standard cap of 10, showing the ridiculousness of "whale tiers".
*   **Secret Debug Console:** Access full developer options to test the game mechanics, change levels, add currencies, and warp time.

## 🛠️ Technical Stack

*   **Framework:** [React](https://react.dev/) (19.x)
*   **Build Tool:** [Vite](https://vite.dev/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Mobile Platform:** [Capacitor](https://capacitorjs.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm

### Installation
```bash
npm install
```

### Running the Game
To start the development server:
```bash
npm run dev
```

## 📦 Available Scripts

- `npm run dev`: Launch the main game in development mode.
- `npm run build`: Compile TypeScript and build the project for production.
- `npm run build:web`: Build the web version for production.
- `npm run build:itch`: Create a production build optimized for itch.io (includes zipping to `dump/game-upload.zip`).
- `npm run build:mobile`: Build the project and sync files with Capacitor for mobile deployment.
- `npm run lint`: Run ESLint to check for code quality issues.
- `npm run preview`: Preview the production build locally.

## ⚖️ License

The source code in this repository is licensed under the [GNU General Public License v3.0 (GPLv3)](LICENSE).

> [!IMPORTANT]
> The **GPLv3 license applies ONLY to the source code** (scripts, components, and logic). 
> It **does not** apply to the graphical assets, UI elements, and icons found in this repository. These remain subject to their original creators' licenses.

## 🎨 Credits & Assets

This project was developed with the assistance of AI tools (Google Antigravity).

**External Assets & UI Specifications:**
*   **Icon Specifications:** Sourced and configured according to the [Icons & UI Assets Spec](public/assets/icons/README.md).
*   **UI/UX Concept:** Bubbly cartoon buttons and panels configured under the [UI & UX Specification](docs/ui_ux.md).

## ☕ Support / Follow
*   **Support:** [Buy me a coffee on Ko-fi!](https://ko-fi.com/ishanmanjrekar/tip)
*   **Blog/Follow:** [Read my Game Design Bites on Substack](https://gamedesignbites.substack.com/)

---
*For detailed game design specifications, refer to the [docs/](docs/) directory.*
