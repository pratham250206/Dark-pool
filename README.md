# ⬡ Dark Pool Cipher

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-success?style=for-the-badge&logo=vercel&color=0070f3)](https://dark-pool-psi.vercel.app/)

**Dark Pool Cipher** is a premium, high-fidelity, wood-inlay themed Word Search puzzle game. Solve trading-themed cipher ciphers in solo modes or challenge friends in real-time, chaotic multiplayer battle rooms with dynamic sound effects, live floating emoji reactions, and tactical cipher sabotages.

🔗 **Play the Live App here**: [https://dark-pool-psi.vercel.app/](https://dark-pool-psi.vercel.app/)

---

## 🎨 Visual Themes & Aesthetics

The interface is built with premium aesthetics (glassmorphic overlays, harmonic gradients, micro-animations, and custom shadows) and supports **4 Curated Visual Themes** selected in the settings menu:
*   🍯 **Honey Amber (Default)**: Warm wood-plank aesthetics, golden headers, and classic retro typography.
*   🖤 **Charcoal Dark**: Deep, sleek slate surfaces combined with rich champagne-gold accents.
*   ⚡ **Neon Matrix**: Pitch-black grids highlighted by neon green borders, glowing text, and matrix-hacker accents.
*   🌿 **Forest Mint**: Sage-green/moss-oak plates with classic emerald highlights.

---

## 🎮 Game Modes

### 🔍 1. Classic Mode (Solo)
*   Find all 7 hidden trading/finance terms.
*   The word list is visible in the sidebar.
*   Click **Hint** to pulse the first letter of a random unfound word on the board.
*   The board background letters shuffle every 5 seconds, making it a test of speed and focus.

### 🕵️ 2. Hidden Words Mode (Solo)
*   The target word list is masked as dots (`•••••`).
*   Scan the grid to spot potential hidden words.
*   Deciphering a correct word reveals it in the sidebar list.

### ⚔️ 3. Battle Room (Multiplayer)
*   Create a private lobby or join one using a 6-character room code.
*   **Lobby Settings (Host only)**: Toggle game modes (Classic/Hidden), set custom match timers, and toggle Chat, Emojis, or Sabotages independently.
*   **3-Second Countdown**: Match starts with a synchronized visual `3 ➔ 2 ➔ 1 ➔ GO!` overlay.
*   **Ticking Timer**: Header chip counts down critical remaining match time.
*   **Real-time Standings**: Live scoreboard showing opponent word counts in real time.
*   **Timeout & Ties**: If the timer runs out, the player with the highest word count is crowned the winner. Ties are handled automatically.
*   **Offline Bot Support**: If Firebase is not configured, the room automatically populates with simulated AI bots (`CyberSeeker 🤖`, `MatrixCoder 🤖`) that solve words, chat, and launch sabotages at you to enable complete offline validation.

---

## 🏆 Global Leaderboards & Live Timer

*   **Live Gameplay Timer**: Ticks up in `MM:SS` format on the topbar during solo games. On victory, the final time is recorded (e.g. `1m 24s`).
*   **Multi-Tab Leaderboard Modal**: View rankings for **Classic** and **Hidden** modes. Ranks 1, 2, and 3 are highlighted with Gold, Silver, and Bronze badges.
*   **Firebase Realtime Database Sync**: Automatically submits completion scores (Player Name, Completion Time, Timestamp) to the cloud when connected.
*   **Offline Fallback**: Saves and queries personal best times locally (`dp_local_leaderboard` in localStorage) if playing offline.

---

## ⚡ Interactive Additions & Settings

*   **⚙️ General Settings Modal**: Customize visual theme, audio waveform synth tones (Sine, Triangle, Sawtooth, Square), and sound FX volume toggling.
*   **💬 Decoupled Chat & Emojis**: Room settings allow Chat and Emojis to function independently:
    *   *Chat Off / Emojis On*: Chat inputs collapse to display "Chat disabled by host", but the quick emoji bar remains active for floating emojis.
    *   *Chat On / Emojis Off*: Chat messages can be typed normally, but the quick emoji bar is hidden.
*   **🎹 Web Audio Synth**: Synthesizes mechanical ticking, chimes, selection slides, alarm warnings, and recovery cues dynamically inside the browser—no heavy MP3 downloads required.
*   **🎈 Floating Live Emojis**: Synced emoji bubbles that float up across the boards of all players in the room when clicked.
*   **⚠️ Cipher Sabotages**: Deciphering a correct word triggers a random sabotage block targeting opponents:
    *   *Grid Shake*: Violently shakes the opponent's game board.
    *   *Ink Shroud*: Blurs the opponent's letters, making coordinates hard to read.
    *   *Lockout Hack*: Hides the opponent's target list behind a hacking lock warning.

---

## 📱 Mobile Responsiveness

The interface is optimized for phone viewports:
*   **Compact Topbars**: Settings, Leaderboard, and Sign Out text buttons collapse into neat icon-only buttons on phone viewports to clear horizontal space.
*   **Responsive Sidebars**: Sidebar widgets use CSS Grid on mobile, organizing target words as horizontal scrollable pills instead of massive boxes, preventing layout congestion.
*   **Expanded Grid Board**: Game grids scale up to be larger on mobile due to the optimized height of the headers.

---

## 🛠️ Configuration & Setup

### Local Setup
Since the project consists of pure static files, you can run it using any simple local HTTP server:
*   **Python**: `python -m http.server 8080`
*   **Node**: `npx http-server -p 8080`

Open `http://localhost:8080` in your web browser.

### 🔌 Firebase Integration (For Online Multiplayer & Leaderboards)
To connect your own database instead of using the local bot fallback:
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project named `dark-pool-cipher`.
3.  Add a **Web App** project under the dashboard overview.
4.  Copy the credentials configuration object and paste them into `firebase-config.js` under the `FIREBASE_CONFIG` object.
5.  In the left sidebar:
    *   Go to **Build ➔ Authentication** and enable **Email/Password** and **Google** sign-in methods. Add `localhost` (and your production domain) to the Authorized Domains list.
    *   Go to **Build ➔ Realtime Database**, create a database, and configure the rules to allow read/write access (e.g. set `".read": true` and `".write": true` in rules for testing).

---

## 🚀 Deployment

### Deploying to Vercel (Recommended)
1. Sign up on [Vercel](https://vercel.com/) and connect your GitHub account.
2. Click **Add New ➔ Project** and import this repository.
3. Click **Deploy**. Vercel will automatically configure and serve your static files. Every time you run `git push`, the site will redeploy automatically!

### Deploying to GitHub Pages
1. Go to your GitHub repository **Settings** tab.
2. Navigate to **Pages** in the left sidebar.
3. Select **Deploy from a branch** under Source.
4. Choose `main` as the source branch and click **Save**.

---

## 👤 Author
*   Created by **Yash Shrivastava**
