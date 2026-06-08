# Lootbox Go! - Assets Specification

This document details the guidelines, naming conventions, file configurations, and technical integration patterns for importing visual and audio assets in **Lootbox Go!**.

It is specifically structured to support a highly scalable, file-based architecture where new lootbox themes can be added without modifying React components directly.

---

## 1. Directory Structure for Assets

To make adding lootbox skins straightforward, the game uses a structured folder layout inside the `public/` directory:

```
public/
  └── assets/
      ├── audio/
      │     ├── ui_click.mp3
      │     ├── box_wobble.mp3
      │     ├── box_open.mp3
      │     ├── reward_reveal.mp3
      │     └── level_up.mp3
      └── boxes/
            ├── default_cardboard/
            │     ├── closed.png
            │     └── open.png
            ├── bronze_deluxe_box/
            │     ├── closed.png
            │     └── open.png
            └── [box-id]/
                  ├── closed.png
                  └── open.png
```

- **Audio folder:** Static audio feedback files used across the interface.
- **Boxes folder:** Each box must have its own sub-directory matching the unique ID defined in the configuration JSON.

---

## 2. Visual Box Asset Requirements

All lootbox skin textures must follow these guidelines to ensure consistency, correct placement, and smooth animation alignment:

### 2.1 File Formats & Transparency
- **Format:** Portable Network Graphics (`.png`).
- **Transparency:** Alpha channel enabled (`RGBA`). Images must be fully masked out with no background bounding boxes.

### 2.2 Sizing & Aspect Ratio
- **Resolution:** $512 \times 512$ pixels.
- **Aspect Ratio:** $1:1$ square layout.
- **Padding:** Maintain a padding of roughly 32-48px on all borders to prevent clipping during tilt/shake animations.

### 2.3 Registration & Alignment
- The horizontal center of gravity of the box (closed and open) must sit precisely in the center of the canvas ($X = 256\text{px}$).
- The bottom base of the box must sit at a uniform vertical baseline (e.g., $Y = 400\text{px}$) for both the `closed.png` and `open.png` assets. This prevents the box from shifting positions or floating erratically when it transitions from the closed state to the open state.

```
       512px Width
 ┌───────────────────────┐
 │                       │
 │        ┌─────┐        │
 │        │     │        │ 512px Height
 │        └─────┘        │
 │   -----------------   │ <-- Y Baseline (400px)
 │                       │
 └───────────────────────┘
          X Center (256px)
```

---

## 3. Dynamic Asset Resolution in React (Vite)

Because boxes are loaded dynamically based on values in `src/config/boxes.json`, assets cannot be statically imported. The client code resolves paths dynamically.

### 3.1 Resolving Image Paths
Since box assets are placed in the `public/` directory, they are served as static files. The path resolving utility resolves them like this:

```typescript
/**
 * Helper to get box asset URLs based on state and ID.
 * Since files are placed in public/, they map to absolute root paths.
 */
export const getBoxAssetUrl = (boxId: string, state: 'closed' | 'open'): string => {
  return `/assets/boxes/${boxId}/${state}.png`;
};
```

---

## 4. Registering a New Box Skin (Step-by-Step)

To add a new themed skin to the game, developers should follow this checklist:

1. **Create Images:**
   - Draw or generate `closed.png` and `open.png` matching the visual specifications.
   - Save them into `public/assets/boxes/[new-box-id]/`.
2. **Register in Configuration:**
   - Open `src/config/boxes.json`.
   - Add a new object inside the `boxes` array:
     ```json
     {
       "id": "new-box-id",
       "name": "Fanciful Box Name",
       "rarity": "Legendary",
       "description": "A satirical description that pokes fun at mobile game FOMO."
     }
     ```
3. **Verify:**
   - Relaunch the application dev server.
   - Open the Developer Console / Cheats panel and click "Unlock All Skins".
   - Go to the Collection tab and verify that the skin loads correctly, aligns cleanly, and changes skin correctly when equipped.
