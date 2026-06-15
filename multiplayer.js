'use strict';
/* ═══════════════════════════════════════════════
   multiplayer.js — Real-time & Mock Multiplayer
   ═══════════════════════════════════════════════ */

// ── Shared constants and Dictionary ────────────────
const GRID_COLS     = 12;
const GRID_ROWS     = 12;
const TOTAL_WORDS   = 7;
const SHUFFLE_MS    = 5000;
const WRONG_MS      = 650;
const ALPHABET      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIRS = [
  [0, 1], [0,-1], [1, 0], [-1, 0],
  [1, 1], [-1,-1], [1,-1], [-1, 1]
];
const DICTIONARY = [
  'ACE','AGE','ARC','ARM','ART','AXE','BAY','BIT','BOX','BUD','BUY',
  'ABLE','ARCH','ARMY','BACK','BAKE','BALL','BAND','BANK','BARN',
  'ABOVE','ACUTE','ADULT','AGREE','ALARM','ALBUM','ALERT','ALIEN',
  'ABSENT','ACCEPT','ACTION','ACTIVE','ADJUST','ADMIRE','AFFECT'
];

const randInt = n => Math.floor(Math.random() * n);
const randLetter = () => ALPHABET[randInt(ALPHABET.length)];
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── DOM Refs ────────────────────────────────────────
const $ = id => document.getElementById(id);
const lobbyArea          = $('lobbyArea');
const joinOrCreateCard   = $('joinOrCreateCard');
const waitingLobbyCard   = $('waitingLobbyCard');
const multiGameScreen    = $('multiGameScreen');
const multiWinOverlay    = $('multiWinOverlay');
const createRoomBtn      = $('createRoomBtn');
const joinRoomBtn        = $('joinRoomBtn');
const leaveLobbyBtn      = $('leaveLobbyBtn');
const startGameBtn       = $('startGameBtn');
const copyCodeBtn        = $('copyCodeBtn');
const returnToMenuBtn    = $('returnToMenuBtn');
const exitToMenuBtn      = $('exitToMenuBtn');

const roomCodeInput      = $('roomCodeInput');
const lobbyError         = $('lobbyError');
const roomCodeVal        = $('roomCodeVal');
const playerCountVal     = $('playerCountVal');
const playersList        = $('playersList');
const scoreboardList     = $('scoreboardList');
const foundWordsPill     = $('foundWordsPill');
const multiWordList      = $('multiWordList');
const boardEl            = $('board');
const chatMessages       = $('chatMessages');
const chatForm           = $('chatForm');
const chatInput          = $('chatInput');
const emojiBar           = $('emojiBar');
const winTitle           = $('winTitle');
const winSubText         = $('winSubText');
const rankingsList       = $('rankingsList');
const firebaseIndicator  = $('firebaseIndicator');
const firebaseStatusText = $('firebaseStatusText');

const lobbyGameMode      = $('lobbyGameMode');
const guestGameModeStatus = $('guestGameModeStatus');
const guestGameModeVal   = $('guestGameModeVal');
const lobbyTimerLimit    = $('lobbyTimerLimit');
const guestTimerStatus   = $('guestTimerStatus');
const guestTimerVal      = $('guestTimerVal');
const lobbyChatToggle    = $('lobbyChatToggle');
const guestChatStatus    = $('guestChatStatus');
const guestChatVal       = $('guestChatVal');
const lobbyEmojisToggle  = $('lobbyEmojisToggle');
const guestEmojisStatus  = $('guestEmojisStatus');
const guestEmojisVal     = $('guestEmojisVal');
const lobbySabotagesToggle = $('lobbySabotagesToggle');
const guestSabotagesStatus = $('guestSabotagesStatus');
const guestSabotagesVal   = $('guestSabotagesVal');
const countdownOverlay   = $('countdownOverlay');
const countdownNumber    = $('countdownNumber');
const multiStats         = $('multiStats');
const timeLeftVal        = $('timeLeftVal');
const muteBtn            = $('muteBtn');
const sabotageAlert      = $('sabotageAlert');
const sabotageAlertText  = $('sabotageAlertText');

// ── Game State ──────────────────────────────────────
let myUser = { uid: '', name: '', isHost: false };
let roomCode = '';
let isHost = false;
let isPlaying = false;
let players = {}; // uid -> { name, found, isHost }
let targetWords = [];
let foundWords = new Set();
let grid = [];
let selected = [];
let isDragging = false;
let shuffleTimer = null;
let botTimers = [];
let roomGameMode = 'classic'; // 'classic' | 'hidden'
let roomTimerLimit = 0; // 0 = no limit
let roomSettings = {
  chatEnabled: true,
  emojisEnabled: true,
  sabotagesEnabled: true
};
let gameTimerInterval = null;
let countdownTimer = null;
let gameStartTime = 0;
let activeSabotageTimeout = null;

// ── Web Audio Synth Manager ─────────────────────────
let audioCtx = null;
let soundMuted = localStorage.getItem('dp_sound_muted') === 'true';

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (err) {
    console.error("Web Audio API not supported:", err);
  }
}

function updateMuteBtn() {
  if (muteBtn) {
    muteBtn.textContent = soundMuted ? '🔇' : '🔊';
  }
}

function toggleSound() {
  initAudio();
  soundMuted = !soundMuted;
  localStorage.setItem('dp_sound_muted', soundMuted);
  updateMuteBtn();
  if (!soundMuted) {
    playSynthTone(523.25, 'sine', 0.1, 0.1);
  }
}

function playSynthTone(frequency, type, duration, volume = 0.1, stopDelay = 0.05) {
  if (soundMuted || !audioCtx) return;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    // Customize tone oscillator type based on saved waveform setting
    const savedSynth = localStorage.getItem('dp_synth_type') || 'sine';
    osc.type = (type === 'sine') ? savedSynth : type;
    
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration + stopDelay);
  } catch (e) {
    console.warn("Sound play failed", e);
  }
}

function playSuccessSound() {
  initAudio();
  playSynthTone(523.25, 'sine', 0.12, 0.12);
  setTimeout(() => playSynthTone(659.25, 'sine', 0.12, 0.12), 100);
  setTimeout(() => playSynthTone(783.99, 'sine', 0.2, 0.15), 200);
}

function playErrorSound() {
  initAudio();
  playSynthTone(130.81, 'triangle', 0.35, 0.25);
  playSynthTone(125.00, 'sawtooth', 0.35, 0.05);
}

function playTickSound() {
  initAudio();
  playSynthTone(880.00, 'sine', 0.04, 0.08);
}

function playGoSound() {
  initAudio();
  playSynthTone(523.25, 'sine', 0.1, 0.15);
  playSynthTone(1046.50, 'sine', 0.4, 0.15);
}

function playGameOverSound() {
  initAudio();
  if (soundMuted || !audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 1.2);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.3);
  } catch(e){}
}

function playDragSound() {
  initAudio();
  playSynthTone(400, 'sine', 0.02, 0.02);
}

function playSabotageSound() {
  initAudio();
  playSynthTone(660, 'sawtooth', 0.25, 0.08);
  setTimeout(() => playSynthTone(880, 'sawtooth', 0.25, 0.08), 200);
  setTimeout(() => playSynthTone(660, 'sawtooth', 0.25, 0.08), 400);
}

// Play restoration sound
function playRestoreSound() {
  initAudio();
  playSynthTone(349.23, 'sine', 0.1, 0.08);
  setTimeout(() => playSynthTone(440.00, 'sine', 0.1, 0.08), 100);
  setTimeout(() => playSynthTone(523.25, 'sine', 0.2, 0.08), 200);
}

// ── Floating Emoji Spawner ──────────────────────────
function triggerEmojiEffectLocally(emoji) {
  const div = document.createElement('div');
  div.className = 'floating-emoji';
  div.textContent = emoji;
  const randX = 15 + Math.random() * 70;
  div.style.left = `${randX}%`;
  div.style.bottom = '10%';
  const swayX = `${-80 + Math.random() * 160}px`;
  const rotDir = `${-25 + Math.random() * 50}deg`;
  div.style.setProperty('--sway-x', swayX);
  div.style.setProperty('--rot-dir', rotDir);
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2600);
}

// ── Sabotage Manager ────────────────────────────────
function triggerOpponentSabotage() {
  if (!roomSettings.sabotagesEnabled) return;
  const sabotages = ['shake', 'shroud', 'hacked'];
  const chosenType = sabotages[randInt(sabotages.length)];
  
  if (FIREBASE_READY && roomRef) {
    const opponentUids = Object.keys(players).filter(uid => uid !== myUser.uid);
    if (opponentUids.length > 0) {
      opponentUids.forEach(async opUid => {
        try {
          await roomRef.child(`players/${opUid}/sabotage`).set({
            type: chosenType,
            senderName: myUser.name,
            ts: Date.now()
          });
        } catch(e){}
      });
    }
  } else {
    // Mock mode announcement
    const botIds = Object.keys(players).filter(id => id !== myUser.uid);
    if (botIds.length > 0) {
      const botName = players[botIds[randInt(botIds.length)]].name;
      const sabotageNames = {
        'shake': 'Grid Shake 📳',
        'shroud': 'Ink Shroud 🌫️',
        'hacked': 'Lockout Hack 🔒'
      };
      sendSystemMessage(`You sabotaged ${botName} with ${sabotageNames[chosenType]}!`);
    }
  }
}

function applySabotageLocally(type, senderName) {
  clearActiveSabotages();
  playSabotageSound();
  
  const sabotageNames = {
    'shake': 'Grid Shake 📳',
    'shroud': 'Ink Shroud 🌫️',
    'hacked': 'Lockout Hack 🔒'
  };
  
  if (sabotageAlert && sabotageAlertText) {
    sabotageAlertText.textContent = `HACKED BY ${senderName.toUpperCase()}! ${sabotageNames[type].toUpperCase()} ACTIVE!`;
    sabotageAlert.classList.remove('hidden');
  }
  
  if (type === 'shake') {
    const boardContainer = document.querySelector('.board-container');
    if (boardContainer) boardContainer.classList.add('sabotage-shake');
  } else if (type === 'shroud') {
    boardEl.classList.add('sabotage-shroud');
  } else if (type === 'hacked') {
    const sidebar = document.querySelector('.multi-sidebar');
    if (sidebar) {
      const lockOverlay = document.createElement('div');
      lockOverlay.className = 'hacked-locked-overlay';
      lockOverlay.id = 'hackedLockedOverlay';
      lockOverlay.innerHTML = `
        <div class="hacked-locked-title">DECRYPTING...</div>
        <div class="hacked-locked-sub">Opponent scrambler block active. Cipher list locked.</div>
      `;
      sidebar.appendChild(lockOverlay);
    }
  }
  
  activeSabotageTimeout = setTimeout(() => {
    clearActiveSabotages();
    playRestoreSound();
  }, 5000);
}

function clearActiveSabotages() {
  if (activeSabotageTimeout) clearTimeout(activeSabotageTimeout);
  if (sabotageAlert) sabotageAlert.classList.add('hidden');
  const boardContainer = document.querySelector('.board-container');
  if (boardContainer) boardContainer.classList.remove('sabotage-shake');
  if (boardEl) boardEl.classList.remove('sabotage-shroud');
  const lockOverlay = $('hackedLockedOverlay');
  if (lockOverlay) lockOverlay.remove();
}

// Realtime Database reference holder
let roomRef = null;

// Initialize indicator
if (FIREBASE_READY) {
  firebase.initializeApp(FIREBASE_CONFIG);
  firebaseStatusText.textContent = "Firebase active. Online multiplayer enabled.";
  firebaseIndicator.classList.remove('mock');
} else {
  firebaseStatusText.textContent = "Firebase inactive. Local simulated room active.";
  firebaseIndicator.classList.add('mock');
}

// ── Auth Check ──────────────────────────────────────
if (FIREBASE_READY) {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'index.html';
    } else {
      myUser.uid = user.uid;
      myUser.name = user.displayName || user.email.split('@')[0];
      $('userName').textContent = myUser.name;
    }
  });
} else {
  const local = JSON.parse(localStorage.getItem('dp_user') || 'null');
  if (local) {
    myUser.uid = local.uid || 'local_' + Date.now();
    myUser.name = local.name || 'Player';
    $('userName').textContent = myUser.name;
  } else {
    window.location.href = 'index.html';
  }
}

// ── Navigation ──
exitToMenuBtn.addEventListener('click', leaveRoom);
leaveLobbyBtn.addEventListener('click', leaveRoom);
returnToMenuBtn.addEventListener('click', () => { window.location.href = 'menu.html'; });

// ── Mute Button & Audio Init ──
if (muteBtn) {
  muteBtn.addEventListener('click', toggleSound);
  updateMuteBtn();
}
document.body.addEventListener('pointerdown', initAudio, { once: true });

// ── Copy Room Code ──
copyCodeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(roomCode).then(() => {
    copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => { copyCodeBtn.textContent = '📋 Copy'; }, 2000);
  });
});

// ── Lobby Game Mode Settings Change ──
if (lobbyGameMode) {
  lobbyGameMode.addEventListener('change', async () => {
    if (!isHost) return;
    const mode = lobbyGameMode.value;
    roomGameMode = mode;
    
    if (FIREBASE_READY && roomRef) {
      try {
        await roomRef.child('gameMode').set(mode);
        // Post system message
        await roomRef.child('chat').push({
          uid: 'system',
          name: 'System',
          text: `Game mode updated to: ${mode === 'hidden' ? 'Hidden Words' : 'Classic'}`,
          system: true,
          ts: Date.now()
        });
      } catch (err) {
        console.error("Firebase Update Game Mode Error:", err);
      }
    } else {
      // Mock mode setting change
      sendSystemMessage(`Game mode updated to: ${mode === 'hidden' ? 'Hidden Words' : 'Classic'}`);
    }
  });
}

// ── Lobby Timer Limit Settings Change ──
if (lobbyTimerLimit) {
  lobbyTimerLimit.addEventListener('change', async () => {
    if (!isHost) return;
    const limit = parseInt(lobbyTimerLimit.value, 10);
    roomTimerLimit = limit;
    
    const limitText = limit === 0 ? 'No Limit (Race)' : `${limit} Seconds`;
    
    if (FIREBASE_READY && roomRef) {
      try {
        await roomRef.child('timerLimit').set(limit);
        // Post system message
        await roomRef.child('chat').push({
          uid: 'system',
          name: 'System',
          text: `Timer limit updated to: ${limitText}`,
          system: true,
          ts: Date.now()
        });
      } catch (err) {
        console.error("Firebase Update Timer Limit Error:", err);
      }
    } else {
      // Mock mode setting change
      sendSystemMessage(`Timer limit updated to: ${limitText}`);
    }
  });
}

// ── Lobby Chat Toggle Settings Change ──
if (lobbyChatToggle) {
  lobbyChatToggle.addEventListener('change', async () => {
    if (!isHost) return;
    const val = lobbyChatToggle.value === 'true';
    roomSettings.chatEnabled = val;
    if (FIREBASE_READY && roomRef) {
      try {
        await roomRef.child('chatEnabled').set(val);
        await roomRef.child('chat').push({
          uid: 'system',
          name: 'System',
          text: `In-game chat ${val ? 'enabled' : 'disabled'} by host.`,
          system: true,
          ts: Date.now()
        });
      } catch (err) {
        console.error("Firebase Update Chat Error:", err);
      }
    } else {
      sendSystemMessage(`In-game chat ${val ? 'enabled' : 'disabled'} by host.`);
    }
  });
}

// ── Lobby Emojis Toggle Settings Change ──
if (lobbyEmojisToggle) {
  lobbyEmojisToggle.addEventListener('change', async () => {
    if (!isHost) return;
    const val = lobbyEmojisToggle.value === 'true';
    roomSettings.emojisEnabled = val;
    if (FIREBASE_READY && roomRef) {
      try {
        await roomRef.child('emojisEnabled').set(val);
        await roomRef.child('chat').push({
          uid: 'system',
          name: 'System',
          text: `Quick emojis ${val ? 'enabled' : 'disabled'} by host.`,
          system: true,
          ts: Date.now()
        });
      } catch (err) {
        console.error("Firebase Update Emojis Error:", err);
      }
    } else {
      sendSystemMessage(`Quick emojis ${val ? 'enabled' : 'disabled'} by host.`);
    }
  });
}

// ── Lobby Sabotages Toggle Settings Change ──
if (lobbySabotagesToggle) {
  lobbySabotagesToggle.addEventListener('change', async () => {
    if (!isHost) return;
    const val = lobbySabotagesToggle.value === 'true';
    roomSettings.sabotagesEnabled = val;
    if (FIREBASE_READY && roomRef) {
      try {
        await roomRef.child('sabotagesEnabled').set(val);
        await roomRef.child('chat').push({
          uid: 'system',
          name: 'System',
          text: `Sabotage attacks ${val ? 'enabled' : 'disabled'} by host.`,
          system: true,
          ts: Date.now()
        });
      } catch (err) {
        console.error("Firebase Update Sabotages Error:", err);
      }
    } else {
      sendSystemMessage(`Sabotage attacks ${val ? 'enabled' : 'disabled'} by host.`);
    }
  });
}

// ── Room Code Generator ─────────────────────────────
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[randInt(chars.length)];
  }
  return code;
}

// ── Create Room ─────────────────────────────────────
createRoomBtn.addEventListener('click', async () => {
  roomCode = generateRoomCode();
  isHost = true;
  myUser.isHost = true;
  lobbyError.classList.add('hidden'); // Clear previous errors
  
  if (FIREBASE_READY) {
    try {
      roomRef = firebase.database().ref('rooms/' + roomCode);
      const words = shuffled(DICTIONARY).slice(0, TOTAL_WORDS);
      
      // Generate grid letters
      const letters = [];
      for(let r=0; r<GRID_ROWS; r++) {
        const row = [];
        for(let c=0; c<GRID_COLS; c++) {
          row.push(randLetter());
        }
        letters.push(row);
      }
      
      const initialRoomState = {
        status: 'waiting',
        code: roomCode,
        hostUid: myUser.uid,
        gameMode: lobbyGameMode.value,
        timerLimit: parseInt(lobbyTimerLimit.value, 10) || 0,
        chatEnabled: lobbyChatToggle.value === 'true',
        emojisEnabled: lobbyEmojisToggle.value === 'true',
        sabotagesEnabled: lobbySabotagesToggle.value === 'true',
        words: words,
        gridLetters: letters,
        players: {
          [myUser.uid]: { name: myUser.name, found: 0, isHost: true }
        }
      };
      
      await roomRef.set(initialRoomState);
      setupFirebaseListeners();
    } catch (err) {
      console.error("Firebase Create Room Error:", err);
      let errorMsg = "Failed to create room. ";
      if (err.code === "PERMISSION_DENIED" || (err.message && err.message.toLowerCase().includes("permission_denied"))) {
        errorMsg += "Firebase database permission denied. Please check your Realtime Database Rules. They must allow reads and writes (e.g. set Rules to '.read': true and '.write': true).";
      } else {
        errorMsg += err.message || err;
      }
      showLobbyError(errorMsg);
    }
  } else {
    // Mock Mode Setup
    players = {
      [myUser.uid]: { name: myUser.name, found: 0, isHost: true },
      'bot_1': { name: 'CyberSeeker 🤖', found: 0, isHost: false },
      'bot_2': { name: 'MatrixCoder 🤖', found: 0, isHost: false }
    };
    targetWords = shuffled(DICTIONARY).slice(0, TOTAL_WORDS);
    renderLobbyPlayers();
    showWaitingLobby();
  }
});

// ── Join Room ───────────────────────────────────────
joinRoomBtn.addEventListener('click', async () => {
  const code = roomCodeInput.value.trim().toUpperCase();
  if (code.length !== 6) {
    showLobbyError('Room code must be 6 characters.');
    return;
  }
  roomCode = code;
  isHost = false;
  myUser.isHost = false;
  lobbyError.classList.add('hidden'); // Clear previous errors
  
  if (FIREBASE_READY) {
    try {
      roomRef = firebase.database().ref('rooms/' + roomCode);
      const snap = await roomRef.once('value');
      if (!snap.exists()) {
        showLobbyError('Room not found. Check the code.');
        return;
      }
      
      const roomInfo = snap.val();
      if (roomInfo.status !== 'waiting') {
        showLobbyError('This game has already started.');
        return;
      }
      
      // Join as player
      await roomRef.child('players/' + myUser.uid).set({
        name: myUser.name,
        found: 0,
        isHost: false
      });
      
      setupFirebaseListeners();
    } catch (err) {
      console.error("Firebase Join Room Error:", err);
      let errorMsg = "Failed to join room. ";
      if (err.code === "PERMISSION_DENIED" || (err.message && err.message.toLowerCase().includes("permission_denied"))) {
        errorMsg += "Firebase database permission denied. Please verify your Realtime Database Rules.";
      } else {
        errorMsg += err.message || err;
      }
      showLobbyError(errorMsg);
    }
  } else {
    // Mock mode join
    if (code === 'MOCK12' || code === 'DEMO77' || code.startsWith('M')) {
      roomCode = code;
      players = {
        'host_bot': { name: 'HostMaster 👑', found: 0, isHost: true },
        [myUser.uid]: { name: myUser.name, found: 0, isHost: false },
        'bot_2': { name: 'MatrixCoder 🤖', found: 0, isHost: false }
      };
      targetWords = shuffled(DICTIONARY).slice(0, TOTAL_WORDS);
      renderLobbyPlayers();
      showWaitingLobby();
      // Auto start after 5 seconds in mock joining mode
      setTimeout(() => {
        sendSystemMessage("HostMaster 👑 started the game!");
        startCountdownFlow();
      }, 4000);
    } else {
      showLobbyError('Room not found. In mock mode, enter any code starting with M (e.g. MOCK12).');
    }
  }
});

function showLobbyError(msg) {
  lobbyError.textContent = msg;
  lobbyError.classList.remove('hidden');
}

// ── Leave Room ──────────────────────────────────────
async function leaveRoom() {
  clearInterval(shuffleTimer);
  botTimers.forEach(clearInterval);
  if (gameTimerInterval) clearInterval(gameTimerInterval);
  if (countdownTimer) clearInterval(countdownTimer);
  if (FIREBASE_READY && roomRef) {
    await roomRef.child('players/' + myUser.uid).remove();
    // If room is empty or host left, optionally clean up
    if (isHost) {
      await roomRef.remove();
    }
  }
  window.location.href = 'menu.html';
}

// ── Show Waiting Lobby UI ───────────────────────────
function applyLobbySettingsUI() {
  if (isHost) {
    if (lobbyChatToggle) lobbyChatToggle.value = roomSettings.chatEnabled.toString();
    if (lobbyEmojisToggle) lobbyEmojisToggle.value = roomSettings.emojisEnabled.toString();
    if (lobbySabotagesToggle) lobbySabotagesToggle.value = roomSettings.sabotagesEnabled.toString();
  } else {
    if (guestChatVal) guestChatVal.textContent = roomSettings.chatEnabled ? 'Enabled' : 'Disabled';
    if (guestEmojisVal) guestEmojisVal.textContent = roomSettings.emojisEnabled ? 'Enabled' : 'Disabled';
    if (guestSabotagesVal) guestSabotagesVal.textContent = roomSettings.sabotagesEnabled ? 'Enabled' : 'Disabled';
  }
}

// ── Show Waiting Lobby UI ───────────────────────────
function showWaitingLobby() {
  joinOrCreateCard.classList.add('hidden');
  waitingLobbyCard.classList.remove('hidden');
  roomCodeVal.textContent = roomCode;
  
  if (isHost) {
    startGameBtn.classList.remove('hidden');
    startGameBtn.disabled = Object.keys(players).length < 2 && !FIREBASE_READY; // allow solo testing only in firebase
    
    lobbyGameMode.classList.remove('hidden');
    guestGameModeStatus.classList.add('hidden');
    
    lobbyTimerLimit.classList.remove('hidden');
    guestTimerStatus.classList.add('hidden');

    lobbyChatToggle.classList.remove('hidden');
    guestChatStatus.classList.add('hidden');

    lobbyEmojisToggle.classList.remove('hidden');
    guestEmojisStatus.classList.add('hidden');

    lobbySabotagesToggle.classList.remove('hidden');
    guestSabotagesStatus.classList.add('hidden');
  } else {
    startGameBtn.classList.add('hidden');
    $('hostOnlyNote').classList.remove('hidden');
    
    lobbyGameMode.classList.add('hidden');
    guestGameModeStatus.classList.remove('hidden');
    guestGameModeVal.textContent = roomGameMode === 'hidden' ? 'Hidden Words' : 'Classic';
    
    lobbyTimerLimit.classList.add('hidden');
    guestTimerStatus.classList.remove('hidden');
    guestTimerVal.textContent = roomTimerLimit === 0 ? 'No Limit' : `${roomTimerLimit} Seconds`;

    lobbyChatToggle.classList.add('hidden');
    guestChatStatus.classList.remove('hidden');
    guestChatVal.textContent = roomSettings.chatEnabled ? 'Enabled' : 'Disabled';

    lobbyEmojisToggle.classList.add('hidden');
    guestEmojisStatus.classList.remove('hidden');
    guestEmojisVal.textContent = roomSettings.emojisEnabled ? 'Enabled' : 'Disabled';

    lobbySabotagesToggle.classList.add('hidden');
    guestSabotagesStatus.classList.remove('hidden');
    guestSabotagesVal.textContent = roomSettings.sabotagesEnabled ? 'Enabled' : 'Disabled';
  }
}

function renderLobbyPlayers() {
  playersList.innerHTML = '';
  const uids = Object.keys(players);
  playerCountVal.textContent = uids.length;
  
  uids.forEach(uid => {
    const p = players[uid];
    const li = document.createElement('li');
    li.className = 'player-item' + (uid === myUser.uid ? ' is-me' : '');
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = p.name;
    
    const badge = document.createElement('span');
    badge.className = 'player-status-badge ' + (p.isHost ? 'host' : 'waiting');
    badge.textContent = p.isHost ? 'HOST' : 'READY';
    
    li.appendChild(nameSpan);
    li.appendChild(badge);
    playersList.appendChild(li);
  });
  
  if (isHost && uids.length >= 2) {
    startGameBtn.disabled = false;
  }
}

// ── Firebase Listeners Setup ────────────────────────
function setupFirebaseListeners() {
  // Listen for players updates
  roomRef.child('players').on('value', snap => {
    players = snap.val() || {};
    renderLobbyPlayers();
    updateScoreboard();
    
    // Check if anyone finished (win check)
    if (isPlaying) {
      Object.keys(players).forEach(uid => {
        if (players[uid].found >= TOTAL_WORDS) {
          triggerMultiGameOver(players[uid].name);
        }
      });
    }
  });
  
  // Listen for special effects (floating emojis)
  roomRef.child('effects').on('child_added', snap => {
    const data = snap.val();
    if (data && data.ts > Date.now() - 5000) {
      triggerEmojiEffectLocally(data.emoji);
    }
  });

  // Listen for incoming sabotages on our own player node
  roomRef.child(`players/${myUser.uid}/sabotage`).on('value', snap => {
    const data = snap.val();
    if (data && data.ts > Date.now() - 5000) {
      applySabotageLocally(data.type, data.senderName);
      // Clear sabotage node in db so we don't trigger it repeatedly
      roomRef.child(`players/${myUser.uid}/sabotage`).remove();
    }
  });
  
  // Listen for room status
  roomRef.child('status').on('value', snap => {
    const status = snap.val();
    if (status === 'countdown') {
      startCountdownFlow();
    } else if (status === 'playing' && !isPlaying) {
      countdownOverlay.classList.add('hidden');
      startMultiplay();
    } else if (status === 'finished' && isPlaying) {
      handleGameTimeout();
    }
  });
  
  // Listen for chat messages
  roomRef.child('chat').on('child_added', snap => {
    const msg = snap.val();
    appendChatMessage(msg.name, msg.text, msg.uid === myUser.uid, msg.system);
  });
  
  // Listen for game mode selection updates
  roomRef.child('gameMode').on('value', snap => {
    const mode = snap.val() || 'classic';
    roomGameMode = mode;
    if (isHost) {
      lobbyGameMode.value = mode;
    } else {
      guestGameModeVal.textContent = mode === 'hidden' ? 'Hidden Words' : 'Classic';
    }
  });
  
  // Listen for timer limit selection updates
  roomRef.child('timerLimit').on('value', snap => {
    const limit = snap.val() || 0;
    roomTimerLimit = limit;
    if (isHost) {
      lobbyTimerLimit.value = limit;
    } else {
      guestTimerVal.textContent = limit === 0 ? 'No Limit' : `${limit} Seconds`;
    }
  });

  // Listen for chat setting
  roomRef.child('chatEnabled').on('value', snap => {
    const enabled = snap.val() !== false;
    roomSettings.chatEnabled = enabled;
    applyLobbySettingsUI();
  });
  
  // Listen for emojis setting
  roomRef.child('emojisEnabled').on('value', snap => {
    const enabled = snap.val() !== false;
    roomSettings.emojisEnabled = enabled;
    applyLobbySettingsUI();
  });

  // Listen for sabotages setting
  roomRef.child('sabotagesEnabled').on('value', snap => {
    const enabled = snap.val() !== false;
    roomSettings.sabotagesEnabled = enabled;
    applyLobbySettingsUI();
  });
  
  showWaitingLobby();
}

// ── Start Game Trigger ──────────────────────────────
startGameBtn.addEventListener('click', async () => {
  if (FIREBASE_READY) {
    await roomRef.child('status').set('countdown');
  } else {
    startCountdownFlow();
  }
});

// ── Start Countdown Flow ────────────────────────────
function startCountdownFlow() {
  if (countdownTimer) clearInterval(countdownTimer);
  
  countdownOverlay.classList.remove('hidden');
  countdownNumber.textContent = '3';
  playTickSound();
  
  let count = 3;
  
  countdownTimer = setInterval(() => {
    count--;
    if (count === 0) {
      countdownNumber.textContent = 'GO!';
      playGoSound();
    } else if (count < 0) {
      clearInterval(countdownTimer);
      countdownOverlay.classList.add('hidden');
      
      // Transition to play state if host or mock mode
      if (!FIREBASE_READY || isHost) {
        if (FIREBASE_READY && roomRef) {
          roomRef.child('status').set('playing');
          roomRef.child('gameStart').set(firebase.database.ServerValue.TIMESTAMP);
        } else {
          startMultiplay();
        }
      }
    } else {
      countdownNumber.textContent = count;
      playTickSound();
    }
  }, 1000);
}

// ── Setup Ticking Timer ─────────────────────────────
function setupTickingTimer(startTimestamp) {
  if (gameTimerInterval) clearInterval(gameTimerInterval);
  
  if (roomTimerLimit <= 0) {
    multiStats.classList.add('hidden');
    return;
  }
  
  multiStats.classList.remove('hidden');
  
  let lastLoggedRemaining = -1;
  const updateTimerDisplay = () => {
    const elapsed = (Date.now() - startTimestamp) / 1000;
    const remaining = Math.max(0, Math.ceil(roomTimerLimit - elapsed));
    
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    timeLeftVal.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    // Play warning tick for last 5 seconds
    if (remaining <= 5 && remaining > 0 && remaining !== lastLoggedRemaining) {
      lastLoggedRemaining = remaining;
      playTickSound();
    }
    
    if (remaining <= 0) {
      clearInterval(gameTimerInterval);
      
      // If time is up, trigger timeout end logic
      if (!FIREBASE_READY || isHost) {
        if (FIREBASE_READY && roomRef) {
          roomRef.child('status').set('finished');
        } else {
          handleGameTimeout();
        }
      }
    }
  };
  
  updateTimerDisplay();
  gameTimerInterval = setInterval(updateTimerDisplay, 500);
}

// ── Handle Game Timeout ─────────────────────────────
function handleGameTimeout() {
  isPlaying = false;
  clearInterval(shuffleTimer);
  botTimers.forEach(clearInterval);
  if (gameTimerInterval) clearInterval(gameTimerInterval);
  
  // Collect scores
  const sorted = Object.keys(players).map(uid => ({
    uid,
    name: players[uid].name,
    found: players[uid].found || 0
  })).sort((a, b) => b.found - a.found);
  
  if (sorted.length === 0) {
    triggerMultiGameOver("Nobody");
    return;
  }
  
  const maxScore = sorted[0].found;
  const winners = sorted.filter(p => p.found === maxScore);
  
  if (winners.length > 1) {
    // It's a tie
    const names = winners.map(w => w.name).join(', ');
    triggerMultiGameOver(`Tie: ${names}`);
  } else {
    // Single winner
    triggerMultiGameOver(winners[0].name);
  }
}

// ── Setup Multiplayer Gameplay ──────────────────────
async function startMultiplay() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownOverlay.classList.add('hidden');
  
  isPlaying = true;
  lobbyArea.classList.add('hidden');
  multiGameScreen.classList.remove('hidden');
  
  let startTimestamp = Date.now();
  
  if (FIREBASE_READY) {
    const snap = await roomRef.once('value');
    const data = snap.val();
    targetWords = data.words;
    roomGameMode = data.gameMode || 'classic';
    roomTimerLimit = data.timerLimit || 0;
    roomSettings.chatEnabled = data.chatEnabled !== false;
    roomSettings.emojisEnabled = data.emojisEnabled !== false;
    roomSettings.sabotagesEnabled = data.sabotagesEnabled !== false;
    startTimestamp = data.gameStart || Date.now();
    buildBoardFromGrid(data.gridLetters);
  } else {
    // Mock Mode Setup
    roomTimerLimit = parseInt(lobbyTimerLimit.value, 10) || 0;
    roomSettings.chatEnabled = lobbyChatToggle.value === 'true';
    roomSettings.emojisEnabled = lobbyEmojisToggle.value === 'true';
    roomSettings.sabotagesEnabled = lobbySabotagesToggle.value === 'true';
    startTimestamp = Date.now();
    buildLocalGrid();
  }

  // Toggle in-game Chat visibility
  const chatSidebar = document.querySelector('.chat-sidebar');
  if (chatSidebar) {
    if (roomSettings.chatEnabled) {
      chatSidebar.classList.remove('hidden');
    } else {
      chatSidebar.classList.add('hidden');
    }
  }

  // Toggle quick emojis bar visibility
  if (emojiBar) {
    if (roomSettings.emojisEnabled) {
      emojiBar.classList.remove('hidden');
    } else {
      emojiBar.classList.add('hidden');
    }
  }
  
  // Setup ticking timer
  setupTickingTimer(startTimestamp);
  
  buildWordList();
  updateScoreboard();
  
  // Start filler shuffling
  shuffleTimer = setInterval(shuffleFiller, SHUFFLE_MS);
  
  // Start Simulated Bots logic if in Mock mode
  if (!FIREBASE_READY) {
    startBotSimulations();
  }
}

function buildBoardFromGrid(letters) {
  boardEl.innerHTML = '';
  boardEl.style.setProperty('--gcols', GRID_COLS);
  boardEl.style.setProperty('--grows', GRID_ROWS);
  grid = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const el = document.createElement('div');
      el.className = 'cell';
      el.textContent = letters[r][c];
      el.dataset.r = r;
      el.dataset.c = c;
      boardEl.appendChild(el);
      row.push({ r, c, el, letter: el.textContent, isTarget: false });
    }
    grid.push(row);
  }
  
  // Place target words on the letters grid
  for (const word of targetWords) {
    placeWordLocally(word);
  }
}

function buildLocalGrid() {
  const letters = [];
  for(let r=0; r<GRID_ROWS; r++) {
    const row = [];
    for(let c=0; c<GRID_COLS; c++) {
      row.push(randLetter());
    }
    letters.push(row);
  }
  buildBoardFromGrid(letters);
}

function placeWordLocally(word) {
  const dirs = shuffled(DIRS);
  for (let tries = 0; tries < 500; tries++) {
    const dir = dirs[tries % dirs.length];
    const sr = randInt(GRID_ROWS);
    const sc = randInt(GRID_COLS);
    const er = sr + dir[0] * (word.length - 1);
    const ec = sc + dir[1] * (word.length - 1);
    
    if (er < 0 || er >= GRID_ROWS || ec < 0 || ec >= GRID_COLS) continue;
    
    let ok = true;
    for (let i = 0; i < word.length; i++) {
      const cell = grid[sr + dir[0] * i][sc + dir[1] * i];
      if (cell.isTarget && cell.letter !== word[i]) { ok = false; break; }
    }
    if (!ok) continue;
    
    for (let i = 0; i < word.length; i++) {
      const cell = grid[sr + dir[0] * i][sc + dir[1] * i];
      cell.letter = word[i];
      cell.el.textContent = word[i];
      cell.isTarget = true;
    }
    return true;
  }
  return false;
}

function shuffleFiller() {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = grid[r][c];
      if (!cell.isTarget) {
        cell.letter = randLetter();
        cell.el.textContent = cell.letter;
      }
    }
  }
}

// ── Word list display ──
function buildWordList() {
  multiWordList.innerHTML = '';
  targetWords.forEach(word => {
    const li = document.createElement('li');
    li.className = 'word-item';
    li.dataset.word = word;
    
    const check = document.createElement('span');
    check.className = 'word-check';
    
    const label = document.createElement('span');
    label.className = 'word-label';
    // Display actual word in Classic mode, bullet placeholders in Hidden mode
    label.textContent = roomGameMode === 'hidden' ? '•'.repeat(word.length) : word;
    
    li.appendChild(check);
    li.appendChild(label);
    multiWordList.appendChild(li);
  });
  foundWordsPill.textContent = `0 / ${TOTAL_WORDS}`;
}

function markWordFound(word) {
  const item = multiWordList.querySelector(`[data-word="${word}"]`);
  if (!item) return;
  item.classList.add('found');
  item.querySelector('.word-check').textContent = '✓';
  item.querySelector('.word-label').textContent = word;
  
  foundWordsPill.textContent = `${foundWords.size} / ${TOTAL_WORDS}`;
}

// ── Update Scoreboard ──
function updateScoreboard() {
  scoreboardList.innerHTML = '';
  const sorted = Object.keys(players).map(uid => ({
    uid,
    name: players[uid].name,
    found: players[uid].found || 0
  })).sort((a, b) => b.found - a.found);
  
  sorted.forEach(p => {
    const li = document.createElement('li');
    li.className = 'scoreboard-item' + (p.uid === myUser.uid ? ' is-me' : '');
    
    const nameSpan = document.createElement('span');
    nameSpan.className = 'scoreboard-name';
    nameSpan.textContent = p.name;
    
    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'scoreboard-score';
    scoreSpan.textContent = `${p.found} / ${TOTAL_WORDS}`;
    
    li.appendChild(nameSpan);
    li.appendChild(scoreSpan);
    scoreboardList.appendChild(li);
  });
}

// ── Drag board selection ──
boardEl.addEventListener('pointerdown', e => {
  const cell = e.target.closest('.cell');
  if (!cell || !isPlaying) return;
  e.preventDefault();
  boardEl.setPointerCapture(e.pointerId);
  
  playDragSound();
  
  isDragging = true;
  selected = [cell];
  cell.classList.add('selected');
});

boardEl.addEventListener('pointermove', e => {
  if (!isDragging) return;
  const underEl = document.elementFromPoint(e.clientX, e.clientY);
  if (underEl && underEl.classList.contains('cell') && !selected.includes(underEl)) {
    selected.push(underEl);
    underEl.classList.add('selected');
  }
});

boardEl.addEventListener('pointerup', e => {
  if (!isDragging) return;
  isDragging = false;
  
  const typed = selected.map(c => c.textContent).join('');
  const reversed = [...typed].reverse().join('');
  const matched = targetWords.find(w => (w === typed || w === reversed) && !foundWords.has(w));
  
  if (matched) {
    foundWords.add(matched);
    selected.forEach(c => {
      c.classList.remove('selected');
      c.classList.add('correct');
    });
    markWordFound(matched);
    selected = [];
    
    // Sync points in database/local
    incrementMyScore();
  } else {
    selected.forEach(c => c.classList.add('wrong'));
    playErrorSound();
    const snap = [...selected];
    setTimeout(() => {
      snap.forEach(c => c.classList.remove('selected', 'wrong'));
      selected = [];
    }, WRONG_MS);
  }
});

boardEl.addEventListener('pointercancel', () => {
  isDragging = false;
  selected.forEach(c => c.classList.remove('selected', 'wrong'));
  selected = [];
});

async function incrementMyScore() {
  const newCount = foundWords.size;
  players[myUser.uid].found = newCount;
  updateScoreboard();
  
  playSuccessSound();
  triggerOpponentSabotage();
  
  if (FIREBASE_READY) {
    await roomRef.child(`players/${myUser.uid}/found`).set(newCount);
  } else {
    // Check local win
    if (newCount >= TOTAL_WORDS) {
      triggerMultiGameOver(myUser.name);
    }
  }
}

// ── Game Over Trigger ──────────────────────────────
function triggerMultiGameOver(winnerName) {
  isPlaying = false;
  clearInterval(shuffleTimer);
  botTimers.forEach(clearInterval);
  if (gameTimerInterval) clearInterval(gameTimerInterval);
  
  playGameOverSound();
  
  const isTie = winnerName.startsWith("Tie:");
  const isMe = winnerName === myUser.name;
  
  if (isTie) {
    winTitle.textContent = "🤝 It's a Tie!";
    const tiePlayers = winnerName.replace("Tie:", "").trim();
    winSubText.textContent = `Tied between: ${tiePlayers}`;
  } else {
    winTitle.textContent = isMe ? "🏆 Victory!" : "💀 Defeat!";
    winSubText.textContent = `${winnerName} decrypted the matrix!`;
  }
  
  rankingsList.innerHTML = '';
  const sorted = Object.keys(players).map(uid => ({
    name: players[uid].name,
    found: players[uid].found || 0
  })).sort((a, b) => b.found - a.found);
  
  sorted.forEach((p, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `Rank #${idx+1}: <strong>${p.name}</strong> — found ${p.found}/${TOTAL_WORDS} words`;
    rankingsList.appendChild(li);
  });
  
  multiWinOverlay.classList.remove('hidden');
}

// ── In-room Chat logic ──────────────────────────────
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  if (!roomSettings.chatEnabled) return;
  const text = chatInput.value.trim();
  if (!text) return;
  
  sendChatMessage(text);
  chatInput.value = '';
});

// Quick emojis
emojiBar.addEventListener('click', e => {
  if (!roomSettings.emojisEnabled) return;
  const btn = e.target.closest('.emoji-btn');
  if (!btn) return;
  sendChatMessage(btn.dataset.emoji);
  sendEmojiEffect(btn.dataset.emoji);
});

async function sendEmojiEffect(emoji) {
  if (!roomSettings.emojisEnabled) return;
  if (FIREBASE_READY && roomRef) {
    try {
      await roomRef.child('effects').push({
        type: 'emoji',
        emoji: emoji,
        senderUid: myUser.uid,
        ts: Date.now()
      });
    } catch(e){}
  } else {
    triggerEmojiEffectLocally(emoji);
  }
}

async function sendChatMessage(text) {
  if (FIREBASE_READY) {
    await roomRef.child('chat').push({
      uid: myUser.uid,
      name: myUser.name,
      text: text,
      ts: Date.now()
    });
  } else {
    // Send local chat
    appendChatMessage(myUser.name, text, true);
    // Let bots reply randomly
    scheduleBotChatResponse();
  }
}

function sendSystemMessage(text) {
  appendChatMessage("System", text, false, true);
}

function appendChatMessage(sender, text, isMe, isSystem = false) {
  const msg = document.createElement('div');
  msg.className = 'chat-msg';
  if (isMe) msg.classList.add('is-me');
  if (isSystem) msg.classList.add('is-system');
  
  if (isSystem) {
    msg.innerHTML = `<span class="msg-text">${text}</span>`;
  } else {
    msg.innerHTML = `
      <div class="msg-meta">
        <span class="msg-sender">${sender}</span>
        <span class="msg-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
      </div>
      <span class="msg-text">${text}</span>
    `;
  }
  
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ── Bot Simulators Engine (Offline Mode fallback) ──
function startBotSimulations() {
  sendSystemMessage("Game started! Find the words quickly.");
  
  const botIds = Object.keys(players).filter(id => id !== myUser.uid);
  botIds.forEach(botId => {
    // Each bot finds a word at random intervals (e.g. 12-25 seconds)
    const interval = 12000 + randInt(13000);
    const timer = setInterval(() => {
      if (!isPlaying) return;
      const bot = players[botId];
      if (bot.found < TOTAL_WORDS) {
        bot.found++;
        updateScoreboard();
        
        // Bot announces they found one
        if (roomSettings.chatEnabled) {
          const botName = bot.name.split(' ')[0];
          const emotes = ["🔥", "Aha!", "Found one! 🎉", "Yes!", "Got another one!"];
          appendChatMessage(bot.name, emotes[randInt(emotes.length)], false);
        }
        
        // Trigger floating emoji from bot
        if (roomSettings.emojisEnabled && Math.random() < 0.6) {
          const emojis = ["🔥", "😂", "👍", "🎉", "😮", "💀", "🏆"];
          triggerEmojiEffectLocally(emojis[randInt(emojis.length)]);
        }
        
        // Bot sabotages the user!
        if (roomSettings.sabotagesEnabled && Math.random() < 0.7) {
          const sabotages = ['shake', 'shroud', 'hacked'];
          const chosenType = sabotages[randInt(sabotages.length)];
          applySabotageLocally(chosenType, bot.name);
        }
        
        if (bot.found >= TOTAL_WORDS) {
          triggerMultiGameOver(bot.name);
        }
      }
    }, interval);
    botTimers.push(timer);
  });
}

function scheduleBotChatResponse() {
  if (!roomSettings.chatEnabled) return;
  const botMessages = [
    "This is tough! 😂",
    "Where are all these words hiding? 🕵️",
    "No hints here, this is hard!",
    "Ah! Let's go! 🔥",
    "👍",
    "Almost got it!",
    "Who is winning? 😮",
    "Matrix room decrypted yet? 💀"
  ];
  
  const botNames = Object.keys(players)
    .filter(id => id !== myUser.uid)
    .map(id => players[id].name);
    
  if (botNames.length === 0) return;
  
  // Reply after 1-3 seconds
  setTimeout(() => {
    if (!isPlaying) return;
    const name = botNames[randInt(botNames.length)];
    const text = botMessages[randInt(botMessages.length)];
    appendChatMessage(name, text, false);
  }, 1000 + randInt(2000));
}
