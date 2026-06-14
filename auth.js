'use strict';
/* ═══════════════════════════════════════════════
   auth.js — Login / Sign-up / Google OAuth
   Falls back to localStorage mock if Firebase
   is not yet configured (FIREBASE_READY === false)
═══════════════════════════════════════════════ */

// ── Firebase init (only if configured) ──────────
if (FIREBASE_READY) {
  firebase.initializeApp(FIREBASE_CONFIG);
  // Redirect if already logged in
  firebase.auth().onAuthStateChanged(user => {
    if (user) window.location.href = 'menu.html';
  });
}

// ── DOM refs ────────────────────────────────────
const tabLogin    = document.getElementById('tabLogin');
const tabSignup   = document.getElementById('tabSignup');
const loginForm   = document.getElementById('loginForm');
const signupForm  = document.getElementById('signupForm');
const loginBtn    = document.getElementById('loginBtn');
const signupBtn   = document.getElementById('signupBtn');
const googleBtn   = document.getElementById('googleBtn');
const authError   = document.getElementById('authError');
const loginSpinner  = document.getElementById('loginSpinner');
const signupSpinner = document.getElementById('signupSpinner');

// ── Tab switching ────────────────────────────────
[tabLogin, tabSignup].forEach(tab => {
  tab.addEventListener('click', () => {
    const isLogin = tab.dataset.tab === 'login';
    tabLogin.classList.toggle('active', isLogin);
    tabSignup.classList.toggle('active', !isLogin);
    loginForm.classList.toggle('hidden', !isLogin);
    signupForm.classList.toggle('hidden', isLogin);
    clearError();
  });
});

// ── Helpers ──────────────────────────────────────
function showError(msg) {
  authError.textContent = msg;
  authError.classList.remove('hidden');
}

function clearError() {
  authError.classList.add('hidden');
  authError.textContent = '';
}

function setLoading(btn, spinner, on) {
  btn.disabled = on;
  spinner.classList.toggle('hidden', !on);
  btn.querySelector('.btn-label').style.opacity = on ? '.5' : '1';
}

function saveMockUser(name, email) {
  localStorage.setItem('dp_user', JSON.stringify({ name, email, uid: 'local_' + Date.now() }));
}

function goToMenu() { window.location.href = 'menu.html'; }

// ── Login ────────────────────────────────────────
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearError();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;

  if (!email || !password) return showError('Please fill in all fields.');
  setLoading(loginBtn, loginSpinner, true);

  if (!FIREBASE_READY) {
    // Mock auth — just check localStorage
    const stored = JSON.parse(localStorage.getItem('dp_user') || 'null');
    if (stored && stored.email === email) { goToMenu(); }
    else { showError('Account not found. Sign up first.'); setLoading(loginBtn, loginSpinner, false); }
    return;
  }

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    goToMenu();
  } catch (err) {
    console.error("Firebase Login Error:", err);
    showError(friendlyError(err));
    setLoading(loginBtn, loginSpinner, false);
  }
});

// ── Sign-up ──────────────────────────────────────
signupForm.addEventListener('submit', async e => {
  e.preventDefault();
  clearError();
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPass').value;

  if (!name || !email || !password) return showError('Please fill in all fields.');
  if (password.length < 6) return showError('Password must be at least 6 characters.');
  setLoading(signupBtn, signupSpinner, true);

  if (!FIREBASE_READY) {
    saveMockUser(name, email);
    goToMenu();
    return;
  }

  try {
    const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    goToMenu();
  } catch (err) {
    console.error("Firebase Sign-up Error:", err);
    showError(friendlyError(err));
    setLoading(signupBtn, signupSpinner, false);
  }
});

// ── Google OAuth ─────────────────────────────────
const originalGoogleBtnHTML = googleBtn.innerHTML;
googleBtn.addEventListener('click', async () => {
  clearError();
  if (!FIREBASE_READY) {
    saveMockUser('Google User', 'google@example.com');
    goToMenu();
    return;
  }
  try {
    googleBtn.disabled = true;
    googleBtn.textContent = 'Connecting to Google...';
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
    goToMenu();
  } catch (err) {
    console.error("Firebase Google Auth Error:", err);
    showError(friendlyError(err));
    googleBtn.disabled = false;
    googleBtn.innerHTML = originalGoogleBtnHTML;
  }
});

// ── Friendly error messages ───────────────────────
function friendlyError(err) {
  if (!err) return 'An unknown error occurred.';
  const code = err.code;
  const map = {
    'auth/user-not-found':        'No account found with that email.',
    'auth/wrong-password':        'Incorrect password. Try again.',
    'auth/email-already-in-use':  'That email is already registered. Log in instead.',
    'auth/invalid-email':         'Please enter a valid email address.',
    'auth/weak-password':         'Password is too weak (min 6 characters).',
    'auth/popup-closed-by-user':  'Google sign-in was cancelled.',
    'auth/network-request-failed':'Network error. Check your connection.',
    'auth/operation-not-allowed': 'Sign-in method is disabled. Please enable "Email/Password" and "Google" in the Sign-in method tab of your Firebase Authentication console.',
    'auth/invalid-credential':    'Invalid email or password credentials.',
    'auth/popup-blocked':         'Sign-in popup was blocked by your browser. Please allow popups for this site.',
    'auth/unauthorized-domain':   'This domain is not authorized for OAuth operations. Add localhost or your domain to the Authorized Domains list in Firebase Auth settings.',
    'auth/too-many-requests':     'Too many failed login attempts. Access to this account has been temporarily disabled.',
  };
  return map[code] || err.message || 'Something went wrong. Please check your developer console or Firebase setup and try again.';
}
