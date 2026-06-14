// ═══════════════════════════════════════════════════════════════
//  DARK POOL CIPHER — firebase-config.js
//
//  SETUP INSTRUCTIONS (one-time, ~5 minutes):
//  ─────────────────────────────────────────
//  1. Go to https://console.firebase.google.com
//  2. Click "Add project" → name it "dark-pool-cipher" → Continue
//  3. Disable Google Analytics if you want (optional) → Create project
//  4. In the project overview, click the Web icon (</>)
//  5. Register the app → Copy the firebaseConfig object below
//  6. In left sidebar → Build → Authentication → Get started
//       • Enable "Email/Password"
//       • Enable "Google"
//       • Add "localhost" to Authorized domains (Settings tab)
//  7. In left sidebar → Build → Realtime Database → Create database
//       • Start in TEST MODE (for development)
//  8. In left sidebar → Build → Hosting → Get started (follow steps)
//       Run: npm install -g firebase-tools
//            firebase login
//            firebase init (select Hosting + Realtime Database)
//            firebase deploy
//  9. Paste your config values below and save.
// ═══════════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBIf7W4Z0lN0GnnqpNEgiUVR67IUGILyTI",
  authDomain:        "dark-pool-cipher.firebaseapp.com",
  databaseURL:       "https://dark-pool-cipher-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "dark-pool-cipher",
  storageBucket:     "dark-pool-cipher.firebasestorage.app",
  messagingSenderId: "97736933416",
  appId:             "1:97736933416:web:615f58197cb19360e5351d",
  measurementId:     "G-HTDSSDGJ00"
};

// ── Demo / dev mode ──────────────────────────────────────────────
// If Firebase is not yet configured, the app falls back to a
// localStorage-based mock so you can still test the UI locally.
const FIREBASE_READY = !FIREBASE_CONFIG.apiKey.startsWith('PASTE');
