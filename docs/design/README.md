# Handoff: Pocket Pet Companion

## Overview
A browser-based virtual pet game in the Tamagotchi lineage. The player adopts a cat, names it, cares for it via micro-interactions, and watches it evolve through 3 life stages. The design targets mobile-first (max-width 430px) but is responsive. Core loop: stats decay over time → player takes actions → pet levels up.

---

## About the Design Files
The files in this bundle are **high-fidelity HTML/JSX prototypes** — design references showing intended look, feel, and behaviour. They are **not production code to copy directly**.

Your task is to **recreate these designs in your target codebase** using its established stack (React Native, Flutter, SwiftUI, React web, etc.) and its existing patterns, libraries, and design system. If no environment exists yet, React (web) or React Native are the natural fit given the component structure used here.

---

## Fidelity
**High-fidelity.** Every screen has final:
- Colours (exact hex values listed below)
- Typography (Nunito, weights 700/800/900)
- Spacing, border-radius, shadows
- Animations and transitions
- Interactive states (press, disabled, toast feedback)

Recreate pixel-faithfully. The only exception is the `tweaks-panel.jsx` helper — that is a design tool and should **not** ship in production.

---

## File Map

| File | Purpose |
|---|---|
| `Pocket Pet Companion.html` | Main app shell + game engine (state, persistence, routing) |
| `pet-sprite.jsx` | `CatSprite` SVG component, `StatBar`, `ActionBtn` |
| `game-screens.jsx` | All screen components: Welcome, Select, Main, MiniGame, Evolution, Settings |
| `tweaks-panel.jsx` | Design-only tweak controls — **exclude from production** |

---

## Design Tokens

### Colour Palette
```
bg:        #0d0c15   — page/app background
surface:   #161428   — card / panel background
elevated:  #1e1b32   — raised elements, inputs
border:    #2a2640   — all dividers and borders
text:      #ede9f8   — primary text
sub:       #7b72a8   — secondary / muted text

lavender:  #a78bfa   — primary accent (XP bar, buttons, highlights)
cyan:      #22d3ee   — secondary accent (XP gradient end, mini-game)
hunger:    #fb923c   — Hunger stat bar
sleep:     #818cf8   — Sleep stat bar
happy:     #34d399   — Happiness stat bar
hygiene:   #22d3ee   — Hygiene stat bar
pink:      #f472b6   — Medicine action
yellow:    #facc15   — Study action
red:       #ef4444   — Critical state, reset CTA
```

### Typography
- **Font family:** Nunito (Google Fonts), weights 700 / 800 / 900
- **Screen titles:** 22–28px, weight 900, color `#ede9f8`
- **Hero titles:** 40px, weight 900, gradient text (`#a78bfa` → `#22d3ee`)
- **Labels / caps:** 10px, weight 700, letter-spacing 3–4px, uppercase, color `#7b72a8`
- **Body / stat values:** 12–14px, weight 700
- **Action button labels:** 11px, weight 700

### Spacing
- Page padding: `24px` horizontal, `48–52px` top (safe area)
- Card padding: `16–20px`
- Gap between actions: `7px`
- Card border-radius: `20px` (panels), `14–18px` (buttons/inputs), `8–12px` (small chips)

### Shadows / Glows
- Stat bar glow: `box-shadow: 0 0 6px <barColor>60`
- Ambient pet glow: `radial-gradient(circle, #a78bfa14 0%, transparent 70%)`
- Toast: `box-shadow: 0 4px 20px #00000060`

---

## Screens & Components

### 1. Welcome Screen
**Purpose:** Entry point. New game or continue save.

**Layout:** Full viewport, flex column, centred, `radial-gradient(ellipse at 50% 38%, #1e1040 0%, #0d0c15 68%)` background.

**Elements:**
- Eyebrow label: `"your tiny companion awaits"` — 10px, letter-spacing 4, uppercase, `#7b72a8`
- Hero title: `"Pocket Pet\nCompanion"` — 40px / 900 weight, gradient `#a78bfa → #22d3ee`, `WebkitBackgroundClip: text`
- Egg illustration: 🥚 emoji at 76px with `filter: drop-shadow(0 4px 16px #a78bfa50)`, `eggBounce` animation (2.4s ease-in-out infinite: gentle rock + scale)
- Ambient glow disc: 200×200 radial `#a78bfa20`, `glow` animation (scale 1→1.25, 3s)
- **"✨ New Adventure"** — primary CTA, gradient button (`#a78bfa → #818cf8`), full width, 15px padding, 16px/800 font, 16px radius
- **"💾 Continue Journey"** — outline button (only if `localStorage` save exists), `2px solid #22d3ee`, color `#22d3ee`
- Footer: `"Adopt · Nurture · Evolve"` — 11px, `#7b72a8`, opacity 0.4

**Animations:** `fadeInUp` on title (0.6s) and buttons (0.7s, 0.15s delay).

---

### 2. Select Screen
**Purpose:** Choose pet species + enter name.

**Layout:** Full viewport, flex column, 52px top padding, `radial-gradient(ellipse at 50% 0%, #1e1040 0%, #0d0c15 55%)`.

**Elements:**
- Step label: `"Step 1"` — 10px, letter-spacing 3.5, uppercase, `#7b72a8`
- Title: `"Choose a companion"` — 26px / 900
- **Pet grid:** 2×2, gap 10px. Each card: `border-radius: 18px`, border `1.5px solid`. Active (Cat): bg `#a78bfa12`, border `#a78bfa`, checkmark `✓` top-right. Locked: bg `#161428`, border `#2a2640`, opacity 0.38, `"soon"` chip (9px, bg `#1e1b32`). Emoji 38px, name 13px/800.
- **Name input:** full width, padding `14px 16px`, bg `#1e1b32`, radius 14, border `1.5px solid #2a2640` (active: `#a78bfa`), 16px/700, placeholder color `#2e2a48`
- **Adopt CTA:** same primary gradient button. Label dynamically shows entered name: `"🐾 Adopt Luna!"`. Pinned to bottom via `marginTop: auto`.

---

### 3. Main Screen
**Purpose:** Core gameplay — view pet, monitor stats, trigger actions.

**Layout:** Full viewport, flex column, bg `#0d0c15`. Top bar → XP strip → pet area (flex: 1) → stats panel → action bar → mini-game CTA.

**Header (padding 20px, top 48px):**
- Left: pet name (22px/900) + subtitle `"Baby · 3h old"` (12px, stage in `#a78bfa`/700)
- Right: XP value (16px/900, `#a78bfa`) + ⚙️ settings button (40×40, bg `#1e1b32`, radius 12)

**XP Progress Strip:**
- Track: bg `#1e1b32`, height 4px, radius 4
- Fill: gradient `#a78bfa → #22d3ee`, glow `0 0 8px #a78bfa60`, animated width
- Caption: `"60 XP to evolve"` right-aligned, 10px, `#7b72a8`

**Pet Area (flex: 1, min-height 180px):**
- Ambient glow disc (200×200, `#a78bfa14`) always centred
- Cat SVG: `float` animation (translateY 0 → -10px, 3.5s ease-in-out infinite)
- Toast: centred bottom, bg `#1e1b32`, radius 20, padding `7px 18px`, `toastIn` animation (0.2s)
- Critical warning banner (when `alive === false`): bg `#ef444418`, border `#ef444450`, 14px radius, red text

**Stats Panel** (margin `0 12px`, bg `#161428`, radius `20px 20px 0 0`, border `#2a2640`):
- 4 × `StatBar`: label + percentage right-aligned, track bg `#0f0d1e` height 8px, fill animated, glow on bar
- Bar turns `#ef4444` below 20%, `#f59e0b` below 40%

**Action Bar** (same card, radius `0 0 20px 20px`, flex row, gap 7px):
- 5 × `ActionBtn`: flex column, icon 21px, label 11px/700, radius 14, border `1.5px solid <color>60`, bg `<color>10`. Press: scale 0.9, bg `<color>28`. Disabled: bg `#13111e`, border `#22203a`, color `#2e2a48`.
- Actions: Feed `#fb923c`, Sleep `#818cf8`, Bathe `#22d3ee`, Meds `#f472b6`, Study `#facc15`

**Mini-game CTA:** full-width gradient button, gradient `#34d399cc → #0ea5e9cc`, 14px font.

---

### 4. Mini-Game Screen
**Purpose:** Tap-the-fish reflex game. Rewards happiness + XP.

**3 phases — intro / playing / result:**

**Intro:** Centred, 🎮 72px, title `"Catch the Fish!"` 28px/900, description 14px, `"🐟 Let's Go!"` primary button, back link.

**Playing:**
- Header: caught count (38px/900) left + timer (38px/900, colour shifts: `#22d3ee` → `#facc15` → `#ef4444`) right
- Game field: `flex: 1`, min-height 300px, radius 20, bg `radial-gradient(ellipse, #102030 0%, #161428 100%)`, border `#2a2640`. Subtle dot grid (1px `#22d3ee`, 24px spacing, 6% opacity).
- Fish: 🐟 34px absolute-positioned buttons, `fishAppear` animation (0.18s scale 0.4→1), auto-remove after 1.5s. Glow `drop-shadow(0 0 8px #22d3ee80)`.

**Result:** Trophy/star/fish emoji based on score, score number 64px/900, reward breakdown card (bg `#161428`, happiness `+score×2` in `#34d399`, XP `+score` in `#a78bfa`), `"🎉 Claim Reward"` button.

---

### 5. Evolution Screen
**Purpose:** Full-screen celebration when pet levels up.

**Layout:** Full viewport, centred flex column, bg `radial-gradient(ellipse at 50% 50%, #28105c 0%, #0d0c15 68%)`.

**Elements:**
- `"✨ Evolution!"` — 11px, letter-spacing 4, `#a78bfa`, uppercase
- 3 concentric spinning rings (absolute, inset 0/18/36, border `1.5px solid`, lavender/cyan/lavender at decreasing opacity, `spin` animation 2.5–4.1s, alternating direction)
- Cat SVG inside rings, `float` animation
- Stage name: 44px/900, gradient `#a78bfa → #22d3ee`
- `"🎊 Incredible!"` gradient CTA

---

### 6. Settings Screen
**Purpose:** Pet info + reset game.

**Layout:** Full viewport, flex column, 52px top, bg `#0d0c15`.

**Elements:**
- Back button (40×40, `←`, bg `#1e1b32`) + title `"Settings"` 22px/900
- Info card (bg `#161428`, radius 20): rows for Name / Stage / Age / XP — label `#7b72a8` left, value `#ede9f8`/700 right, separated by `1px solid #2a2640`
- Save notice card: bg `#34d39910`, border `#34d39930`, green text. `"✅ Auto-saved to device"` + explanation
- Reset button: transparent bg, border `1.5px solid #ef444450`, red text. Two-step confirm: shows warning with Cancel + confirm buttons

---

## Game Engine (State Model)

### Pet State Object
```js
{
  name:      string,         // player-entered
  type:      'cat',
  stage:     0 | 1 | 2,     // Baby / Teen / Adult
  xp:        number,         // cumulative
  hunger:    0–100,          // decays 2.5/tick
  sleep:     0–100,          // decays 2.0/tick
  happiness: 0–100,          // decays 1.5/tick
  hygiene:   0–100,          // decays 1.0/tick
  age:       number,         // days (float)
  born:      timestamp,
  lastTick:  timestamp,      // used for offline catch-up
  alive:     boolean,        // false when hunger+sleep both 0 & happiness < 5
}
```

### Persistence
- Key: `ppc_v2` in `localStorage`
- On load: calculate elapsed ticks since `lastTick`, apply decay catch-up, update `age`
- Save after every state mutation (action, tick)

### Decay
- Tick interval: 18 000ms (normal) / 36 000ms (relaxed) / 5 000ms (fast)
- Per tick: hunger −2.5, sleep −2.0, happiness −1.5, hygiene −1.0

### Actions & Effects
| Action | Hunger | Sleep | Happiness | Hygiene | XP |
|---|---|---|---|---|---|
| Feed | +22 | — | +5 | — | +5 |
| Sleep | — | +30 | +5 | — | +5 |
| Bathe | — | — | +5 | +30 | +5 |
| Medicine | +15 | +15 | +20 | +15 | +8 · revives |
| Study | — | −8 | −5 | — | +15 |
| Mini-game (score S) | — | — | +S×2 | — | +S |

### Evolution Thresholds
- Baby → Teen: 60 XP
- Teen → Adult: 180 XP (cumulative)

### Emotion Logic (in priority order)
1. `alive === false` → `sick`
2. `sleep < 20` → `sleepy`
3. `hunger < 20` → `hungry`
4. `happiness < 20` → `sad`
5. `happiness > 70` → `happy`
6. default → `normal`

### Tab Title Updates
- Critical: `"😢 {name} needs help!"` / `"🍎 {name} is hungry!"` / `"💤 {name} is sleepy!"`
- Normal: `"🐱 {name} · Pocket Pet"`

---

## Animations

| Name | Description | Usage |
|---|---|---|
| `fadeInUp` | opacity 0→1, translateY 16→0, 0.5–0.7s ease | Screen entry elements |
| `float` | translateY 0↔−10px, 3.5s ease-in-out infinite | Pet on main screen |
| `glow` | scale 1→1.25, opacity 0.6→1, 3–4s infinite | Ambient disc |
| `eggBounce` | rotate ±7deg + scale 1→1.06, 2.4s ease-in-out infinite | Welcome egg |
| `pulse` | opacity 1→0.35, 1.4–2s infinite | Zzz / drool |
| `toastIn` | opacity + scale 0.92→1, 0.2s ease | Action toast |
| `fishAppear` | scale 0.4→1, 0.18s ease | Fish in mini-game |
| `spin` | rotate 0→360deg, 2.5–4.1s linear infinite | Evolution rings |
| Cat blink | eyeRy 7→1.2, 140ms, every ~3.5s random interval | CatSprite |

---

## Cat SVG Anatomy
The cat is a pure SVG drawn programmatically. Key elements:
- **Tail:** cubic path, `stroke-width 11`, body colour
- **Body:** ellipse `rx33 ry24`
- **Belly:** inner ellipse, ear-inner colour, 32% opacity
- **Head:** circle `r33`
- **Ears:** polygon triangles (outer body colour, inner `#f7aac8`)
- **Eyes:** ellipses `rx8`, `ry` varies by emotion (7 normal, 2.8 sleepy, 5 sad, 1.2 blink). Shine circles when not blinking.
- **Sick eyes:** `×` text characters
- **Nose:** small ellipse `#f7aac8`
- **Mouth:** SVG path — upward curve (happy), downward curve (sad/hungry), neutral
- **Whiskers:** 4 lines, `#b8a8c8`, 45% opacity
- **Stage scale:** Baby 0.76×, Teen 0.88×, Adult 1.0×
- **Body colour:** Baby `#f0dcc8`, Teen `#dbbf96`, Adult `#c8a87a`

---

## Assets
No external image assets. All visuals are:
- SVG (cat sprite, drawn in code)
- Emoji (egg 🥚, fish 🐟, action icons)
- CSS gradients and box-shadows

Font: [Nunito via Google Fonts](https://fonts.google.com/specimen/Nunito) — weights 700, 800, 900.

---

## Screens Not Yet Implemented (Roadmap)
- **Egg hatch intro** — animated crack sequence before Select screen
- **Dragon / Alien / Bear** species — grid shown as "coming soon"
- **Cosmetics / accessories** — hats, colours, unlockables
- **Cloud sync** — account + cross-device
- **Social sharing** — pet snapshot URL
- **Sound effects** — per-action audio feedback
