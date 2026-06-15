'use strict';
/* ═══════════════════════════════════════════════
   menu.js — Main menu flow & routing
   ═══════════════════════════════════════════════ */

// ── Firebase Init ──────────────────────────────────
if (FIREBASE_READY) {
  firebase.initializeApp(FIREBASE_CONFIG);
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'index.html';
    } else {
      setupUserDisplay(user.displayName || user.email || 'Player', user.email);
    }
  });
} else {
  // Mock auth check
  const stored = JSON.parse(localStorage.getItem('dp_user') || 'null');
  if (!stored) {
    window.location.href = 'index.html';
  } else {
    setupUserDisplay(stored.name || stored.email || 'Player', stored.email);
  }
}

function setupUserDisplay(name, email) {
  const userNameEl = document.getElementById('userName');
  const userAvatarEl = document.getElementById('userAvatar');
  if (userNameEl) userNameEl.textContent = name;
  if (userAvatarEl) {
    userAvatarEl.textContent = name.substring(0, 1).toUpperCase();
  }
}

// ── Sign out ──
const signoutBtn = document.getElementById('signoutBtn');
if (signoutBtn) {
  signoutBtn.addEventListener('click', async () => {
    if (FIREBASE_READY) {
      try {
        await firebase.auth().signOut();
        window.location.href = 'index.html';
      } catch (err) {
        console.error('Signout failed:', err);
      }
    } else {
      localStorage.removeItem('dp_user');
      window.location.href = 'index.html';
    }
  });
}

// ── Cards navigation ──
const modeClassic = document.getElementById('modeClassic');
const modeHidden = document.getElementById('modeHidden');
const modeMulti = document.getElementById('modeMulti');

if (modeClassic) {
  modeClassic.addEventListener('click', () => {
    window.location.href = 'game.html?mode=classic';
  });
}
if (modeHidden) {
  modeHidden.addEventListener('click', () => {
    window.location.href = 'game.html?mode=hidden';
  });
}
if (modeMulti) {
  modeMulti.addEventListener('click', () => {
    window.location.href = 'multiplayer.html';
  });
}

// ── General Settings Handling ──
const menuSettingsBtn = document.getElementById('menuSettingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingTheme = document.getElementById('settingTheme');
const settingSynthType = document.getElementById('settingSynthType');
const settingSoundToggle = document.getElementById('settingSoundToggle');

// Load audio contexts for preview sound
let synthAudioCtx = null;
function playSettingsPreviewSound(waveform) {
  try {
    if (!synthAudioCtx) {
      synthAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (synthAudioCtx.state === 'suspended') {
      synthAudioCtx.resume();
    }
    const osc = synthAudioCtx.createOscillator();
    const gain = synthAudioCtx.createGain();
    osc.type = waveform;
    osc.frequency.setValueAtTime(440, synthAudioCtx.currentTime); // A4 note
    gain.gain.setValueAtTime(0.08, synthAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, synthAudioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(synthAudioCtx.destination);
    osc.start();
    osc.stop(synthAudioCtx.currentTime + 0.4);
  } catch(e) {}
}

if (menuSettingsBtn && settingsOverlay && closeSettingsBtn) {
  menuSettingsBtn.addEventListener('click', () => {
    // Load current values
    settingTheme.value = localStorage.getItem('dp_theme') || 'amber';
    settingSynthType.value = localStorage.getItem('dp_synth_type') || 'sine';
    settingSoundToggle.value = (localStorage.getItem('dp_sound_muted') === 'true') ? 'muted' : 'enabled';
    
    settingsOverlay.classList.remove('hidden');
  });

  closeSettingsBtn.addEventListener('click', () => {
    const theme = settingTheme.value;
    const synth = settingSynthType.value;
    const soundMuted = settingSoundToggle.value === 'muted';

    // Save values
    localStorage.setItem('dp_theme', theme);
    localStorage.setItem('dp_synth_type', synth);
    localStorage.setItem('dp_sound_muted', soundMuted.toString());

    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', theme);

    // Play test preview tone if sound enabled
    if (!soundMuted) {
      playSettingsPreviewSound(synth);
    }

    settingsOverlay.classList.add('hidden');
  });
}
