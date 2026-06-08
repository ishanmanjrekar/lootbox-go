# Getting Started: Development Guide

This guide describes how to run, modify, and build the Lootbox Go game codebase.

---

## 1. Local Development Setup

To get the web version running on your local machine:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   * The web application will launch locally at `http://localhost:5173`.

---

## 2. Codebase Organization

* If you want to customize **game state**, modify [gameStore.ts](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/src/store/gameStore.ts).
* If you want to modify **animations, particle colors, or reward titles**, edit [App.tsx](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/src/App.tsx).
* To adjust **design tokens** or add global styling, modify [index.css](file:///c:/Users/ishan/Documents/GitHub/lootbox-go/src/index.css).

---

## 3. Native Android Development (Capacitor)

The codebase has built-in mobile capabilities using Capacitor.

### Prerequisites
1. [Android Studio](https://developer.android.com/studio) installed.
2. Android SDK Command-line Tools and Build-Tools configured.

### Environment Setup Script
We provide a PowerShell script to check and setup environment configurations (e.g. `ANDROID_HOME` environment variables):
```powershell
./scripts/setup-mobile-env.ps1
```

### Syncing Web Assets to Android
Whenever you modify files in the `src/` folder and want to preview them on an Android Emulator or device:
1. **Compile web production files**:
   ```bash
   npm run build
   ```
2. **Sync files to Capacitor**:
   ```bash
   npx cap sync android
   ```
3. **Open in Android Studio** to deploy or test:
   ```bash
   npx cap open android
   ```

### Building APK via script
To build a debug Android Package (`.apk`) file directly from your terminal:
```powershell
./scripts/build-apk.ps1
```
* The compiled APK will be generated inside: `android/app/build/outputs/apk/debug/app-debug.apk`.
