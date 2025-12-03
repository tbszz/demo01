const size = 4;
const boardEl = document.getElementById('board');
const moveCountEl = document.getElementById('moveCount');
const timerEl = document.getElementById('timer');
const bestTimeEl = document.getElementById('bestTime');
const statusEl = document.getElementById('status');
const newGameBtn = document.getElementById('newGame');
const reshuffleBtn = document.getElementById('reshuffle');

const BEST_TIME_KEY = 'serenity-best-time';

let tiles = [];
let moveCount = 0;
let timerInterval = null;
let startTime = null;

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateBestTimeDisplay() {
  const stored = localStorage.getItem(BEST_TIME_KEY);
  bestTimeEl.textContent = stored ? formatTime(Number(stored)) : '--';
}

function isSolvable(arr) {
  let inversions = 0;
  const filtered = arr.filter((n) => n !== 0);
  for (let i = 0; i < filtered.length - 1; i += 1) {
    for (let j = i + 1; j < filtered.length; j += 1) {
      if (filtered[i] > filtered[j]) {
        inversions += 1;
      }
    }
  }

  const emptyIndex = arr.indexOf(0);
  const emptyRowFromBottom = size - Math.floor(emptyIndex / size);
  if (size % 2 === 0) {
    return (emptyRowFromBottom % 2 === 0) === (inversions % 2 === 1);
  }
  return inversions % 2 === 0;
}

function generateSolvableLayout() {
  const arr = Array.from({ length: size * size }, (_, i) => i);
  let attempt = 0;
  do {
    attempt += 1;
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!isSolvable(arr) || isSolved(arr));
  return arr;
}

function isSolved(arr) {
  return arr.every((value, index) => (index === arr.length - 1 ? value === 0 : value === index + 1));
}

function renderBoard() {
  boardEl.innerHTML = '';
  tiles.forEach((value, index) => {
    const tile = document.createElement('button');
    tile.classList.add('tile');
    tile.setAttribute('role', 'gridcell');
    tile.setAttribute('aria-label', value === 0 ? '空白' : `数字 ${value}`);
    tile.dataset.index = index;
    if (value === 0) {
      tile.classList.add('empty');
      tile.setAttribute('tabindex', '-1');
    } else {
      tile.innerHTML = `<span class="label">${value}</span>`;
      tile.classList.add('accent');
      tile.addEventListener('click', () => handleMove(index));
    }
    boardEl.appendChild(tile);
  });
}

function swap(idxA, idxB) {
  [tiles[idxA], tiles[idxB]] = [tiles[idxB], tiles[idxA]];
}

function neighbors(index) {
  const row = Math.floor(index / size);
  const col = index % size;
  const positions = [];
  if (row > 0) positions.push(index - size);
  if (row < size - 1) positions.push(index + size);
  if (col > 0) positions.push(index - 1);
  if (col < size - 1) positions.push(index + 1);
  return positions;
}

function handleMove(index) {
  const emptyIndex = tiles.indexOf(0);
  if (!neighbors(index).includes(emptyIndex)) return;

  swap(index, emptyIndex);
  moveCount += 1;
  moveCountEl.textContent = moveCount;

  if (!startTime) {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      timerEl.textContent = formatTime(Date.now() - startTime);
    }, 200);
  }

  renderBoard();
  checkWin();
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimerDisplay() {
  timerEl.textContent = '00:00';
}

function setStatus(text) {
  statusEl.textContent = text;
}

function checkWin() {
  if (!isSolved(tiles)) return;
  stopTimer();
  const timeUsed = startTime ? Date.now() - startTime : 0;
  setStatus('恭喜完成！再来一局？');

  const stored = localStorage.getItem(BEST_TIME_KEY);
  if (!stored || timeUsed < Number(stored)) {
    localStorage.setItem(BEST_TIME_KEY, String(timeUsed));
    updateBestTimeDisplay();
  }
}

function initGame() {
  tiles = generateSolvableLayout();
  moveCount = 0;
  moveCountEl.textContent = '0';
  setStatus('准备开局');
  resetTimerDisplay();
  stopTimer();
  startTime = null;
  renderBoard();
}

newGameBtn.addEventListener('click', initGame);
reshuffleBtn.addEventListener('click', () => {
  tiles = generateSolvableLayout();
  moveCount = 0;
  moveCountEl.textContent = '0';
  setStatus('已重排，可随时开始');
  resetTimerDisplay();
  stopTimer();
  startTime = null;
  renderBoard();
});

document.addEventListener('keydown', (event) => {
  const emptyIndex = tiles.indexOf(0);
  let targetIndex = null;
  if (event.key === 'ArrowUp') targetIndex = emptyIndex + size;
  if (event.key === 'ArrowDown') targetIndex = emptyIndex - size;
  if (event.key === 'ArrowLeft') targetIndex = emptyIndex + 1;
  if (event.key === 'ArrowRight') targetIndex = emptyIndex - 1;
  if (targetIndex !== null && targetIndex >= 0 && targetIndex < tiles.length) {
    handleMove(targetIndex);
  }
});

updateBestTimeDisplay();
initGame();
