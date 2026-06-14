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
