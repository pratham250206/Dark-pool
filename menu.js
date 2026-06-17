'use strict';
/* ═══════════════════════════════════════════════
   menu.js — Main menu flow & routing
   ═══════════════════════════════════════════════ */

// ── Firebase Init ──────────────────────────────────
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const hasGuestSession = localStorage.getItem('dp_user') !== null;

if (FIREBASE_READY && !(isLocal && hasGuestSession)) {
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

  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  if (settingsCloseBtn) {
    settingsCloseBtn.addEventListener('click', () => {
      settingsOverlay.classList.add('hidden');
    });
  }
}

// ── Leaderboards Overlay Handling ──
const menuLeaderboardBtn = document.getElementById('menuLeaderboardBtn');
const leaderboardOverlay = document.getElementById('leaderboardOverlay');
const closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
const tabClassicLeaderboard = document.getElementById('tabClassicLeaderboard');
const tabHiddenLeaderboard = document.getElementById('tabHiddenLeaderboard');
const leaderboardEntries = document.getElementById('leaderboardEntries');
const leaderboardLoading = document.getElementById('leaderboardLoading');
const leaderboardNoEntries = document.getElementById('leaderboardNoEntries');

let activeLeaderboardTab = 'classic'; // 'classic' or 'hidden'

function formatSeconds(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

function loadLeaderboards(mode) {
  activeLeaderboardTab = mode;
  
  // Update UI Tabs active state
  if (mode === 'classic') {
    tabClassicLeaderboard.classList.add('active');
    tabClassicLeaderboard.setAttribute('aria-selected', 'true');
    tabHiddenLeaderboard.classList.remove('active');
    tabHiddenLeaderboard.setAttribute('aria-selected', 'false');
  } else {
    tabHiddenLeaderboard.classList.add('active');
    tabHiddenLeaderboard.setAttribute('aria-selected', 'true');
    tabClassicLeaderboard.classList.remove('active');
    tabClassicLeaderboard.setAttribute('aria-selected', 'false');
  }

  leaderboardEntries.innerHTML = '';
  leaderboardLoading.classList.remove('hidden');
  leaderboardNoEntries.classList.add('hidden');

  let resolved = false;
  const firebaseTimeout = setTimeout(() => {
    if (!resolved) {
      resolved = true;
      console.warn("Firebase database load timed out. Using local fallback.");
      loadLocalLeaderboard(mode);
    }
  }, 3000);

  try {
    if (FIREBASE_READY) {
      // Fetch from Firebase
      firebase.database().ref('leaderboards/' + mode)
        .once('value')
        .then(snapshot => {
          if (resolved) return;
          resolved = true;
          clearTimeout(firebaseTimeout);
          const val = snapshot.val();
          let scores = [];
          if (val) {
            scores = Object.values(val);
          }
          
          // Sort ascending by time
          scores.sort((a, b) => a.time - b.time);
          
          // Take top 10
          scores = scores.slice(0, 10);
          
          renderScoresList(scores);
        })
        .catch(err => {
          if (resolved) return;
          resolved = true;
          clearTimeout(firebaseTimeout);
          console.error("Firebase leaderboard fetch error, using local fallback:", err);
          loadLocalLeaderboard(mode);
        });
    } else {
      resolved = true;
      clearTimeout(firebaseTimeout);
      loadLocalLeaderboard(mode);
    }
  } catch (err) {
    if (!resolved) {
      resolved = true;
      clearTimeout(firebaseTimeout);
      console.error("Firebase query initiation error, using local fallback:", err);
      loadLocalLeaderboard(mode);
    }
  }
}

function loadLocalLeaderboard(mode) {
  try {
    const localLeaderboard = JSON.parse(localStorage.getItem('dp_local_leaderboard') || '{}');
    let scores = localLeaderboard[mode] || [];
    scores.sort((a, b) => a.time - b.time);
    scores = scores.slice(0, 10);
    renderScoresList(scores);
  } catch (e) {
    console.error("Local leaderboard fetch error:", e);
    renderScoresList([]);
  }
}

function renderScoresList(scores) {
  leaderboardLoading.classList.add('hidden');
  if (scores.length === 0) {
    leaderboardNoEntries.classList.remove('hidden');
    return;
  }
  
  scores.forEach((entry, index) => {
    const rank = index + 1;
    const row = document.createElement('tr');
    row.className = `leaderboard-row-${rank <= 3 ? rank : 'other'}`;
    
    // Create rank cell with badge
    const rankTd = document.createElement('td');
    rankTd.style.padding = '10px 8px';
    const badge = document.createElement('span');
    badge.className = 'leaderboard-rank-badge';
    badge.textContent = rank;
    rankTd.appendChild(badge);
    
    // Name cell
    const nameTd = document.createElement('td');
    nameTd.style.padding = '10px 8px';
    nameTd.textContent = entry.name || 'Anonymous';
    
    // Time cell
    const timeTd = document.createElement('td');
    timeTd.style.padding = '10px 8px';
    timeTd.style.textAlign = 'right';
    timeTd.textContent = formatSeconds(entry.time);
    
    row.appendChild(rankTd);
    row.appendChild(nameTd);
    row.appendChild(timeTd);
    
    leaderboardEntries.appendChild(row);
  });
}

// Bind events
if (menuLeaderboardBtn && leaderboardOverlay && closeLeaderboardBtn) {
  menuLeaderboardBtn.addEventListener('click', () => {
    leaderboardOverlay.classList.remove('hidden');
    loadLeaderboards('classic');
  });

  closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardOverlay.classList.add('hidden');
  });

  const leaderboardCloseBtn = document.getElementById('leaderboardCloseBtn');
  if (leaderboardCloseBtn) {
    leaderboardCloseBtn.addEventListener('click', () => {
      leaderboardOverlay.classList.add('hidden');
    });
  }

  tabClassicLeaderboard.addEventListener('click', () => {
    if (activeLeaderboardTab !== 'classic') {
      loadLeaderboards('classic');
    }
  });

  tabHiddenLeaderboard.addEventListener('click', () => {
    if (activeLeaderboardTab !== 'hidden') {
      loadLeaderboards('hidden');
    }
  });
}

// Check if showLeaderboard=true in query params to open instantly
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('showLeaderboard') === 'true') {
    if (leaderboardOverlay) {
      leaderboardOverlay.classList.remove('hidden');
      loadLeaderboards('classic');
    }
  }
});
