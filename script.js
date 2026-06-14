/* ═══════════════════════════════════════════════
   DARK POOL CIPHER — script.js
   300+ word dictionary · Pointer-drag · All-8-dir
═══════════════════════════════════════════════ */
'use strict';

// ── Auth Check ──────────────────────────────────────
if (FIREBASE_READY) {
  firebase.initializeApp(FIREBASE_CONFIG);
  firebase.auth().onAuthStateChanged(user => {
    if (!user) window.location.href = 'index.html';
  });
} else {
  const stored = JSON.parse(localStorage.getItem('dp_user') || 'null');
  if (!stored) window.location.href = 'index.html';
}

// ── Game Mode Check ─────────────────────────────────
const urlParams = new URLSearchParams(window.location.search);
const gameMode = urlParams.get('mode') || 'classic';
const isHiddenMode = gameMode === 'hidden';


/* ═══════════════════════════════════════════════
   DICTIONARY  (310 unique English words, 3–8 letters)
═══════════════════════════════════════════════ */
const DICTIONARY = [
  /* 3-letter */
  'ACE','AGE','ARC','ARM','ART','AXE','BAY','BIT','BOX','BUD','BUY',
  'CAP','CAR','CUP','DAY','DEW','DEN','EGG','ELK','ELM','ERA',
  'FAN','FIN','FIR','FIT','FIX','FOG','FUN','FUR','GAS','GEM',
  'GIN','GOD','GUM','GUN','GUT','HAM','HAT','HAY','HEN','HIP',
  'HOG','HOP','HOT','HUB','HUG','HUM','HUT','ICE','ION','IVY',
  'JAM','JAR','JET','JOB','JOY','JUG','KEY','KID','KIT','LAB',
  'LAP','LAW','LEG','LID','LOG','MAP','MOB','MOP','MUD','MUG',
  'NET','NUT','OAK','OAR','OAT','OWL','PAD','PAN','PEA','PEG',
  'PEN','PIE','PIG','PIN','POD','POT','PUB','PUN','PUT','RAG',
  'RAM','RAP','RAT','RAY','RIB','RIG','RIM','ROD','ROW','RUG',
  'RUN','SAP','SAW','SEA','SET','SKY','SOB','SON','SUM','TAB',
  'TAN','TAP','TAR','TAX','TEA','TIN','TIP','TOE','TON','TOP',
  'TOY','TUB','TUG','URN','VAN','VAT','VET','VOW','WAR','WAX',
  'WEB','WIG','WIN','WIT','YAK','YAM','YEW','ZAP','ZIP',
  /* 4-letter */
  'ABLE','ARCH','ARMY','BACK','BAKE','BALL','BAND','BANK','BARN',
  'BATH','BEAM','BEAN','BEAT','BELL','BELT','BEND','BIKE','BITE',
  'BLOW','BLUE','BOAT','BOLD','BOLT','BONE','BOOK','BOOM','BOOT',
  'BOSS','BOWL','BUCK','BUFF','BULB','BULL','BURN','BUSH',
  'CAFE','CAGE','CAKE','CALM','CAMP','CANE','CAPE','CARD','CART',
  'CAVE','CELL','CHEF','CHIP','CHOP','CLAM','CLAY','CLIP','CLUB',
  'CLUE','COAT','CODE','COIL','COLD','CONE','COOK','COOL','CORD',
  'CORE','CORK','CORN','COST','CRAB','CROP','CROW','CUBE','CURE',
  'CURL','CUTE','DAMP','DARE','DART','DASH','DAWN','DEAL','DECK',
  'DEEP','DEER','DENT','DESK','DICE','DIET','DIME','DINE','DIRE',
  'DISK','DIVE','DOCK','DOME','DOOR','DOSE','DOVE','DOWN','DRAG',
  'DRAW','DROP','DRUM','DUCK','DUKE','DULL','DUMP','DUNE','DUST',
  'EACH','EARL','EARN','EASE','EDGE','EPIC','FADE','FAIL','FAIR',
  'FAKE','FALL','FAME','FARM','FAST','FATE','FEAT','FEED','FEEL',
  'FELL','FERN','FILL','FILM','FIND','FIRE','FIRM','FISH','FLAG',
  'FLEW','FLIP','FLOW','FOAM','FOLD','FOLK','FONT','FOOD','FOOL',
  'FOOT','FORK','FORM','FORT','FOWL','FREE','FROG','FUEL','FULL',
  'GAME','GATE','GAZE','GEAR','GIFT','GIRL','GLAD','GLOW','GLUE',
  'GOAT','GONE','GOOD','GRAB','GRAM','GRAY','GREW','GRIP','GROW',
  'GULF','HACK','HAIL','HAIR','HALF','HALL','HALT','HAND','HANG',
  'HARD','HARM','HAVE','HAWK','HAZE','HEAD','HEAL','HEAP','HEAT',
  'HEEL','HELM','HELP','HERD','HERO','HIGH','HILL','HINT','HIVE',
  'HOLD','HOLE','HOME','HOOD','HOOK','HOPE','HORN','HOSE','HOST',
  'HOUR','HULL','HUNT','IDLE','IRIS','IRON','JADE','JAIL','JEST',
  'JOIN','JOKE','JOLT','JUST','KEEN','KEEP','KIND','KING','KNOB',
  'KNOT','KNOW','LACE','LACK','LAKE','LAMB','LAMP','LAND','LANE',
  'LARK','LASH','LATE','LAWN','LEAD','LEAF','LEAN','LEAP','LENS',
  'LIFT','LIME','LINE','LINK','LION','LIVE','LOAD','LOCK','LOFT',
  'LONE','LONG','LOOP','LURE','LYNX','MACE','MAIL','MAKE','MALE',
  'MANE','MARK','MASK','MATE','MAZE','MEAN','MEET','MELT','MILD',
  'MILE','MILL','MIND','MINT','MIST','MODE','MOLE','MORE','MOTH',
  'MOVE','MULE','MUSE','MYTH','NAIL','NEST','NEWS','NODE','NORM',
  'NOSE','NOTE','OATH','ONCE','OPEN','OVAL','OVEN','OVER','PACK',
  'PAGE','PAIL','PAIN','PAIR','PALM','PAWN','PEAK','PEAR','PEEL',
  'PEST','PILE','PINE','PIPE','PLAN','PLAY','PLOW','PLUM','POEM',
  'POET','POLE','POND','POOL','PORK','PORT','PREY','PURE','RACE',
  'RAID','RAIL','RAIN','RAKE','RANK','RASH','READ','REEL','RICH',
  'RIDE','RING','RIOT','RISE','RISK','ROAD','ROAM','ROAR','ROBE',
  'ROCK','ROLE','ROLL','ROOF','ROPE','ROSE','RUIN','RULE','RUSH',
  'RUST','SAFE','SAGE','SAIL','SAKE','SALT','SAME','SAND','SANE',
  'SEAL','SEED','SEEK','SELF','SELL','SEND','SHIN','SHIP','SHOE',
  'SHOP','SHOT','SHOW','SICK','SILK','SING','SINK','SIZE','SKIN',
  'SLAB','SLAM','SLIM','SLIP','SLOW','SLUG','SNAP','SOAK','SOAP',
  'SOCK','SOIL','SOLE','SONG','SORE','SORT','SOUL','SOUP','SOUR',
  'SPAN','SPIN','SPIT','SPOT','STAR','STEM','STEP','STEW','STIR',
  'STUN','SURF','SWAN','SWAP','TACK','TAIL','TAME','TANK','TASK',
  'TEAL','TEAR','TELL','TENT','TERM','TEST','TEXT','TILE','TILL',
  'TIME','TOAD','TOLD','TOLL','TOMB','TONE','TOOL','TORN','TOSS',
  'TOUR','TOWN','TRAP','TREE','TREK','TRIM','TRIP','TRUE','TUBE',
  'TUNE','TURF','TURN','TWIN','TYPE','UNIT','VAIN','VALE','VAST',
  'VEIL','VINE','VOID','VOTE','WADE','WAGE','WAKE','WALK','WALL',
  'WARM','WARN','WASH','WAVE','WEAK','WEAR','WEED','WELD','WELL',
  'WEST','WIDE','WILL','WIND','WINE','WING','WIRE','WISE','WOKE',
  'WOOD','WORD','WORK','WREN','YEAR','YELL','YOKE','ZERO','ZEST',
  /* 5-letter */
  'ABOVE','ACUTE','ADULT','AGREE','ALARM','ALBUM','ALERT','ALIEN',
  'ALIGN','ALIVE','ALLEY','ALLOW','ALONE','ALPHA','AMBER','ANGEL',
  'ANGLE','ANGRY','ANKLE','APPLE','ARENA','ARISE','ARROW','ATLAS',
  'AVOID','AWAKE','AWARD','AZURE','BADGE','BASIC','BEACH','BEGIN',
  'BENCH','BLACK','BLADE','BLAME','BLAST','BLAZE','BLEND','BLIND',
  'BLOCK','BLOOD','BLOOM','BOARD','BOOST','BRACE','BRAIN','BRAND',
  'BRAVE','BREAK','BREED','BRICK','BRIEF','BRING','BROOK','BROWN',
  'BRUSH','BUILD','BURST','BUYER','CANDY','CAUSE','CHAIN','CHAIR',
  'CHAMP','CHAOS','CHARM','CHART','CHASE','CHECK','CHEST','CHIEF',
  'CHILD','CHILL','CHORD','CIVIC','CIVIL','CLAIM','CLASS','CLEAN',
  'CLEAR','CLERK','CLICK','CLIMB','CLOCK','CLONE','CLOSE','CLOTH',
  'CLOUD','COAST','COUNT','COURT','COVER','CRACK','CRAFT','CRASH',
  'CRAZY','CREAM','CREEK','CRIME','CROSS','CROWD','CROWN','CRUSH',
  'CURVE','CYCLE','DAILY','DAIRY','DANCE','DEATH','DELTA','DENSE',
  'DEPOT','DEPTH','DEVIL','DIGIT','DODGE','DRAFT','DRAIN','DRAMA',
  'DREAM','DRINK','DRIVE','DROWN','DWARF','EAGLE','EARLY','EARTH',
  'EIGHT','EMPTY','ENEMY','ENTER','EQUAL','ERROR','EVENT','EVERY',
  'EXTRA','FABLE','FAITH','FALSE','FANCY','FATAL','FAULT','FEAST',
  'FIELD','FIFTH','FIGHT','FIRST','FIXED','FLAME','FLASH','FLEET',
  'FLESH','FLOCK','FLOOD','FLOOR','FLOUR','FOCUS','FORCE','FORGE',
  'FOUND','FRAME','FRANK','FRESH','FRONT','FROST','FRUIT','FUNNY',
  'GHOST','GIANT','GLASS','GLOBE','GLOOM','GLORY','GLOVE','GRACE',
  'GRADE','GRAIN','GRAND','GRANT','GRASP','GRASS','GRAVE','GREAT',
  'GREED','GREEN','GRIEF','GRILL','GROAN','GROUP','GROVE','GROWL',
  'GUARD','GUESS','GUIDE','GUILD','GUILT','HAPPY','HARSH','HASTE',
  'HEART','HEAVY','HERBS','HINGE','HONEY','HONOR','HORSE','HOTEL',
  'HOUSE','HUMAN','HUMID','HURRY','IDEAL','IMAGE','INDEX','INPUT',
  'IRONY','ISSUE','IVORY','JEWEL','JOINT','JUDGE','JUICE','JUICY',
  'KNIFE','KNOCK','KNOWN','LABEL','LARGE','LASER','LATER','LAUGH',
  'LAYER','LEARN','LEAST','LEAVE','LEDGE','LEGAL','LEMON','LEVEL',
  'LIGHT','LIMIT','LIVER','LOGIC','LOOSE','LOWER','LOYAL','LUCKY',
  'MAGIC','MAJOR','MAKER','MANOR','MARCH','MARSH','MATCH','MEDIA',
  'MERCY','MERIT','MERRY','METER','MINOR','MIXED','MODEL','MONEY',
  'MONTH','MORAL','MOUSE','MOUTH','MOVIE','MUSIC','NAIVE','NERVE',
  'NIGHT','NINJA','NOBLE','NOISE','NORTH','NOVEL','NURSE','OCCUR',
  'OCEAN','ORBIT','OUTER','OWNER','OZONE','PAINT','PANEL','PAPER',
  'PARTY','PATCH','PAUSE','PEACE','PEARL','PENNY','PHASE','PHONE',
  'PHOTO','PIANO','PIECE','PILOT','PLACE','PLAIN','PLANE','PLANT',
  'PLATE','PLAZA','POINT','POLAR','POWER','PRESS','PRICE','PRIDE',
  'PRIME','PRIZE','PROBE','PROOF','PROUD','PROVE','QUEEN','QUEST',
  'QUICK','QUIET','QUOTA','QUOTE','RADAR','RAISE','RALLY','RANGE',
  'RAPID','RATIO','REACH','REALM','RIDGE','RIGHT','RIVAL','RIVER',
  'ROAST','ROCKY','ROUND','ROYAL','RUGBY','RULER','SADLY','SAINT',
  'SALAD','SAUCE','SCALE','SCARE','SCENE','SCOPE','SCORE','SCOUT',
  'SEIZE','SERVE','SEVEN','SHAFT','SHAKE','SHALL','SHAME','SHAPE',
  'SHARE','SHARK','SHARP','SHIFT','SHINE','SHIRT','SHOCK','SHOOT',
  'SHORT','SHOUT','SIGHT','SIGMA','SINCE','SKILL','SLASH','SLEEP',
  'SLIDE','SLOPE','SMART','SMILE','SMOKE','SOLID','SOLVE','SOUTH',
  'SPACE','SPARK','SPAWN','SPEAK','SPEED','SPEND','SPLIT','SPORT',
  'SPRAY','SQUAD','STACK','STAGE','STAIN','STAKE','STALE','STAND',
  'START','STATE','STEAM','STEEL','STEEP','STERN','STILL','STONE',
  'STORE','STORM','STORY','STRAW','STRIP','STUDY','STYLE','SUGAR',
  'SUPER','SURGE','SWAMP','SWEAR','SWEEP','SWEET','SWIFT','SWORD',
  'TABLE','TASTE','TEACH','TENSE','THEME','THICK','THORN','THREE',
  'THROW','THUMB','TIGER','TIMER','TIRED','TITLE','TOAST','TOKEN',
  'TORCH','TOTAL','TOUCH','TOUGH','TOWER','TRACE','TRACK','TRAIL',
  'TRAIN','TRAIT','TREAD','TREND','TRIAL','TRIBE','TRICK','TROOP',
  'TRULY','TRUNK','TRUST','TRUTH','TWIST','ULTRA','UNDER','UNION',
  'UNITE','UPPER','URBAN','USAGE','VALID','VALUE','VAULT','VERSE',
  'VIGOR','VIRAL','VISIT','VISTA','VITAL','VIVID','VOCAL','VOICE',
  'WASTE','WATCH','WATER','WHEEL','WHITE','WHOLE','WITTY','WORLD',
  'WORRY','WORTH','WRATH','WRITE','YACHT','YOUTH','ZEBRA',
  /* 6-letter */
  'ABSENT','ACCEPT','ACTION','ACTIVE','ADJUST','ADMIRE','AFFECT',
  'AFFORD','AFRAID','AGENCY','AGREED','ALMOST','AMOUNT','ANIMAL',
  'ANSWER','APPEAL','APPEAR','ARTIST','ASSIST','ATTACK','AUTUMN',
  'BATTLE','BEAUTY','BECAME','BEFORE','BELIEF','BETTER','BEYOND',
  'BOTTLE','BOUNCE','BRANCH','BRIDGE','BUDGET','BUTTON','CAMERA',
  'CANCEL','CAREER','CASTLE','CAUGHT','CHANCE','CHANGE','CHARGE',
  'CHOICE','CHOOSE','CLIENT','COFFEE','COLUMN','COMBAT','COMEDY',
  'COMMON','COPPER','CORNER','COURSE','CREATE','CREDIT','CRISIS',
  'CUSTOM','DAMAGE','DANGER','DECIDE','DEFEAT','DEFEND','DEFINE',
  'DEGREE','DEMAND','DEPEND','DESIGN','DETECT','DEVICE','DEVOTE',
  'DIFFER','DIRECT','DIVIDE','DOMAIN','DOUBLE','DRAGON','DRIVEN',
  'EFFECT','EFFORT','ENERGY','ENGAGE','ENGINE','ENSURE','ENTIRE',
  'ESCAPE','EVOLVE','EXCEPT','EXPAND','EXPECT','EXPORT','EXTEND',
  'FAIRLY','FALLEN','FAMOUS','FASTER','FILTER','FINGER','FINISH',
  'FLAVOR','FLYING','FOLLOW','FOREST','FORGET','FORMAL','FREEZE',
  'FRIEND','FROZEN','FUTURE','GARDEN','GENDER','GIVING','GLOBAL',
  'GOVERN','GROUND','GROWTH','HAPPEN','HEALTH','HONEST','HUNTER',
  'IMPORT','INCOME','INFANT','INFORM','INJURY','INSIDE','INVITE',
  'ISLAND','JOYFUL','KEEPER','LAUNCH','LEADER','LEAGUE','LISTEN',
  'LIVELY','LOCATE','LOVING','MANAGE','MANNER','MASTER','MATTER',
  'MEDIUM','MEMBER','MENTAL','METHOD','MIRROR','MISSED','MODERN',
  'MOMENT','MOTION','MUTUAL','NARROW','NATURE','NORMAL','NOTICE',
  'OBTAIN','OLDEST','ONLINE','ORIGIN','OUTPUT','PARENT','PERSON',
  'PHRASE','PLANET','PLEASE','PLENTY','POLICY','PREFER','PROFIT',
  'PROPER','PUBLIC','PURPLE','PURSUE','PUZZLE','RECORD','REDUCE',
  'REMAIN','REMOTE','REMOVE','REPAIR','REPORT','RESCUE','RESULT',
  'REVIEW','REVEAL','REWARD','ROCKET','ROTATE','SAFETY','SAMPLE',
  'SAVING','SEASON','SECRET','SELECT','SERIES','SETTLE','SHADOW',
  'SIMPLE','SINGLE','SISTER','SLOWLY','SMOOTH','SOCIAL','SOURCE',
  'SPIRIT','SPREAD','SPRING','STREAM','STREET','STRONG','SUBMIT',
  'SUBTLE','SUPPLY','SWITCH','SYSTEM','TARGET','TENDER','THEORY',
  'TICKET','TIMBER','TOWARD','TRAVEL','TRIPLE','TROPHY','UNIQUE',
  'UPDATE','USEFUL','VALLEY','VENDOR','VERSUS','VIEWER','VIRTUE',
  'VISION','VOLUME','WEAPON','WEIGHT','WONDER','WORTHY'
].filter((w, i, a) => a.indexOf(w) === i); // remove accidental duplicates

/* ═══════════════════════════════════════════════
   GAME CONSTANTS
═══════════════════════════════════════════════ */
const GRID_COLS     = 12;
const GRID_ROWS     = 12;
const TOTAL_WORDS   = 7;
const PTS_PER_WORD  = 10;
const INIT_HINTS    = 3;
const SHUFFLE_MS    = 5000;
const WRONG_MS      = 650;
const ALPHABET      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// All 8 directions: [rowDelta, colDelta]
const DIRS = [
  [0, 1], [0,-1],   // right, left
  [1, 0], [-1, 0],  // down,  up
  [1, 1], [-1,-1],  // diag ↘, diag ↖
  [1,-1], [-1, 1]   // diag ↙, diag ↗
];

/* ═══════════════════════════════════════════════
   DOM REFERENCES
═══════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const introOverlay  = $('introOverlay');
const welcomeCard   = $('welcomeCard');
const instructCard  = $('instructCard');
const gameScreen    = $('gameScreen');
const winOverlay    = $('winOverlay');
const hintPopup     = $('hintPopup');

const goInstructBtn = $('goInstructBtn');
const backBtn       = $('backBtn');
const playBtn       = $('playBtn');
const playAgainBtn  = $('playAgainBtn');
const menuBtn       = $('menuBtn');
const hintBtn       = $('hintBtn');
const closeHintBtn  = $('closeHintBtn');

const boardEl       = $('board');
const wordListEl    = $('wordList');
const progressPill  = $('progressPill');
const attemptsVal   = $('attemptsVal');
const hintsVal      = $('hintsVal');
const pointsVal     = $('pointsVal');
const hintCount     = $('hintCount');
const hintMsg       = $('hintMsg');
const finalPoints   = $('finalPoints');
const finalAttempts = $('finalAttempts');
const finalHints    = $('finalHints');

const gameModeTitle = $('gameModeTitle');
const gameModeLabel = $('gameModeLabel');
const exitToMenuBtn = $('exitToMenuBtn');

if (gameModeTitle) {
  gameModeTitle.textContent = isHiddenMode ? 'Dark Pool — Hidden' : 'Dark Pool — Classic';
}
if (gameModeLabel) {
  gameModeLabel.textContent = isHiddenMode ? 'Dark Pool Cipher: Hidden Words' : 'Dark Pool Cipher: Classic';
}


/* ═══════════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════════ */
let grid           = [];   // 2-D array: { r, c, el, letter, isTarget }
let targetWords    = [];   // words placed this round
let wordPlacements = {};   // word → { r, c }  (first-letter position)
let foundWords     = new Set();
let attempts       = 0;
let hints          = INIT_HINTS;
let hintsUsed      = 0;
let points         = 0;
let isDragging     = false;
let selected    = [];   // currently highlighted cell DOM elements
let shuffleTimer = null;

/* ═══════════════════════════════════════════════
   PURE HELPERS
═══════════════════════════════════════════════ */
const randInt    = n  => Math.floor(Math.random() * n);
const randLetter = () => ALPHABET[randInt(ALPHABET.length)];
const show       = el => el.classList.remove('hidden');
const hide       = el => el.classList.add('hidden');

/** Fisher-Yates shuffle on a copy of arr */
function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pick `count` random words that fit inside the grid */
function pickWords(count) {
  const maxLen = Math.max(GRID_COLS, GRID_ROWS);
  const pool   = DICTIONARY.filter(w => w.length >= 3 && w.length <= maxLen);
  return shuffled(pool).slice(0, count);
}

/** Update all stat chips */
function updateStats() {
  attemptsVal.textContent = attempts;
  hintsVal.textContent    = hints;
  pointsVal.textContent   = points;
  hintCount.textContent   = hints;
  hintBtn.disabled        = hints <= 0;
}

/** Update found-words count pill */
function updateProgress() {
  const n = foundWords.size;
  progressPill.textContent = `${n} / ${TOTAL_WORDS}`;
  progressPill.classList.toggle('complete', n >= TOTAL_WORDS);
}

/* ═══════════════════════════════════════════════
   BOARD BUILDING
═══════════════════════════════════════════════ */
function buildBoard() {
  boardEl.innerHTML = '';
  // Sync CSS custom properties so grid-template-columns/rows are correct
  boardEl.style.setProperty('--gcols', GRID_COLS);
  boardEl.style.setProperty('--grows', GRID_ROWS);
  grid = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    const row = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const el       = document.createElement('div');
      el.className   = 'cell';
      el.textContent = randLetter();
      el.dataset.r   = r;
      el.dataset.c   = c;
      el.setAttribute('role', 'gridcell');
      boardEl.appendChild(el);
      row.push({ r, c, el, letter: el.textContent, isTarget: false });
    }
    grid.push(row);
  }
}

/**
 * Try to place `word` on the grid in a random direction.
 * Only writes if every cell is either empty (not a target) or
 * already has the exact same letter — so words can share letters
 * but cannot overwrite each other.
 * Returns true on success, false if all attempts failed.
 */
function placeWord(word) {
  const dirs = shuffled(DIRS);

  for (let tries = 0; tries < 500; tries++) {
    const dir = dirs[tries % dirs.length];
    const sr  = randInt(GRID_ROWS);
    const sc  = randInt(GRID_COLS);
    const er  = sr + dir[0] * (word.length - 1);
    const ec  = sc + dir[1] * (word.length - 1);

    // Bounds check
    if (er < 0 || er >= GRID_ROWS || ec < 0 || ec >= GRID_COLS) continue;

    // Conflict check: an occupied cell must have the exact same letter
    let ok = true;
    for (let i = 0; i < word.length; i++) {
      const cell = grid[sr + dir[0] * i][sc + dir[1] * i];
      if (cell.isTarget && cell.letter !== word[i]) { ok = false; break; }
    }
    if (!ok) continue;

    // Place letters
    for (let i = 0; i < word.length; i++) {
      const cell          = grid[sr + dir[0] * i][sc + dir[1] * i];
      cell.letter         = word[i];
      cell.el.textContent = word[i];
      cell.isTarget       = true;
    }

    // ── Store the start cell so hints can point to it ──
    wordPlacements[word] = { r: sr, c: sc };
    return true;
  }
  return false; // failed (extremely rare on a 12×12 grid)
}

/** Re-randomise only the filler (non-target) cells */
function shuffleFiller() {
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = grid[r][c];
      if (!cell.isTarget) {
        cell.letter        = randLetter();
        cell.el.textContent = cell.letter;
      }
    }
  }
}

/* ═══════════════════════════════════════════════
   WORD LIST (SIDEBAR PANEL)
═══════════════════════════════════════════════ */
function buildWordList() {
  wordListEl.innerHTML = '';
  targetWords.forEach(word => {
    const li = document.createElement('li');
    li.className    = 'word-item';
    li.dataset.word = word;

    const check = document.createElement('span');
    check.className = 'word-check';

    const label = document.createElement('span');
    label.className = 'word-label';
    // Hide word if in Hidden mode, otherwise show it
    label.textContent = isHiddenMode ? '•'.repeat(word.length) : word;

    li.appendChild(check);
    li.appendChild(label);
    wordListEl.appendChild(li);
  });
  updateProgress();
}

/** Mark a word as found in the sidebar */
function markWordFound(word) {
  const item = wordListEl.querySelector(`[data-word="${word}"]`);
  if (!item) return;
  item.classList.add('found');
  item.querySelector('.word-check').textContent = '✓';
  item.querySelector('.word-label').textContent = word; // Reveal the word
  updateProgress();
}

/* ═══════════════════════════════════════════════
   GAME FLOW
═══════════════════════════════════════════════ */
function startGame() {
  // Reset state
  attempts       = 0;
  hints          = INIT_HINTS;
  hintsUsed      = 0;
  points         = 0;
  wordPlacements = {};
  foundWords.clear();
  isDragging = false;
  selected   = [];
  clearInterval(shuffleTimer);

  updateStats();
  hide(introOverlay);
  hide(winOverlay);
  hide(hintPopup);
  show(gameScreen);

  // Build grid & place words
  buildBoard();
  targetWords = pickWords(TOTAL_WORDS);
  for (const w of targetWords) placeWord(w);

  // Populate sidebar
  buildWordList();

  // Kick off background shuffle
  shuffleTimer = setInterval(shuffleFiller, SHUFFLE_MS);
}

function endGame() {
  clearInterval(shuffleTimer);
  finalPoints.textContent   = `${points} pts`;
  finalAttempts.textContent = attempts;
  finalHints.textContent    = `${hintsUsed} / ${INIT_HINTS}`;
  show(winOverlay);
}

/** Pulse the first-letter cell of a random unfound word for 3 seconds */
function useHint() {
  if (hints <= 0) return;

  const remaining = targetWords.filter(w => !foundWords.has(w));
  if (!remaining.length) return;

  hints--;
  hintsUsed++;
  updateStats();

  // Pick a random unfound word
  const word      = remaining[randInt(remaining.length)];
  const placement = wordPlacements[word];

  // Flash the first letter on the grid
  if (placement) {
    const firstCell = grid[placement.r][placement.c];
    firstCell.el.classList.add('hint-flash');
    // Remove after animation ends (3 s)
    setTimeout(() => firstCell.el.classList.remove('hint-flash'), 3000);
  }

  // Minimal popup — word is already visible in the list
  hintMsg.textContent =
    `The word "${word}" starts with the letter "${word[0]}" — it's glowing on the grid!`;
  show(hintPopup);
}

/* ═══════════════════════════════════════════════
   DRAG SELECTION
   Uses Pointer Events (works for mouse + touch + stylus).
   elementFromPoint() during pointermove catches fast drags
   that mouseover would miss.
═══════════════════════════════════════════════ */
boardEl.addEventListener('pointerdown', e => {
  const cell = e.target.closest('.cell');
  if (!cell) return;
  e.preventDefault();
  // Capture so pointermove keeps firing even if pointer leaves board
  boardEl.setPointerCapture(e.pointerId);
  isDragging = true;
  selected   = [cell];
  cell.classList.add('selected');
});

boardEl.addEventListener('pointermove', e => {
  if (!isDragging) return;
  // elementFromPoint gives accurate cell even at high drag speed
  const underEl = document.elementFromPoint(e.clientX, e.clientY);
  if (underEl && underEl.classList.contains('cell') && !selected.includes(underEl)) {
    selected.push(underEl);
    underEl.classList.add('selected');
  }
});

boardEl.addEventListener('pointerup', e => {
  if (!isDragging) return;
  isDragging = false;

  const typed    = selected.map(c => c.textContent).join('');
  const reversed = [...typed].reverse().join('');

  // Check typed AND reversed — covers words placed in any direction
  const matched = targetWords.find(
    w => (w === typed || w === reversed) && !foundWords.has(w)
  );

  attempts++;
  updateStats();

  if (matched) {
    // Correct!
    foundWords.add(matched);
    points += PTS_PER_WORD;
    updateStats();

    selected.forEach(c => {
      c.classList.remove('selected');
      c.classList.add('correct');
    });
    markWordFound(matched);
    selected = [];

    if (foundWords.size >= TOTAL_WORDS) {
      setTimeout(endGame, 900);
    }
  } else {
    // Wrong
    selected.forEach(c => c.classList.add('wrong'));
    const snap = [...selected]; // preserve ref before timeout clears it
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

/* ═══════════════════════════════════════════════
   NAVIGATION LISTENERS
═══════════════════════════════════════════════ */
goInstructBtn.addEventListener('click', () => {
  hide(welcomeCard);
  show(instructCard);
});

backBtn.addEventListener('click', () => {
  hide(instructCard);
  show(welcomeCard);
});

playBtn.addEventListener('click', startGame);

playAgainBtn.addEventListener('click', startGame);

menuBtn.addEventListener('click', () => {
  window.location.href = 'menu.html';
});

if (exitToMenuBtn) {
  exitToMenuBtn.addEventListener('click', () => {
    clearInterval(shuffleTimer);
    window.location.href = 'menu.html';
  });
}

hintBtn.addEventListener('click', useHint);

closeHintBtn.addEventListener('click', () => hide(hintPopup));
