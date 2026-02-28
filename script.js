let words = [];
let target = "";
let currentGuess = "";
let guesses = [];
let maxAttempts = 6;
let finished = false;

const todayKey = new Date().toISOString().slice(0,10);
const storageKey = "betudle-" + todayKey;

fetch("magyar-szavak.txt")
  .then(res => res.text())
  .then(text => {
    words = text.split("\n")
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0 && !w.includes(" "));

    target = getDailyWord();
    loadGame();
    createGrid();
    createKeyboard();
    render();
    updateStats();
  });

function getDailyWord() {
  const dateNumber = Math.floor(new Date(todayKey).getTime() / 86400000);
  return words[dateNumber % words.length];
}

function createGrid() {
  const game = document.getElementById("game");
  game.innerHTML = "";

  for (let i = 0; i < maxAttempts; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < target.length; j++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      row.appendChild(cell);
    }
    game.appendChild(row);
  }
}

function createKeyboard() {
  const layout = [
    "qwertzuiopőú",
    "asdfghjkléáű",
    "yxcvbnmöüó"
  ];

  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = "";

  layout.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyrow";

    row.split("").forEach(char => {
      const key = document.createElement("div");
      key.className = "key";
      key.id = "key-" + char;
      key.textContent = char;
      key.onclick = () => handleLetter(char);
      rowDiv.appendChild(key);
    });

    keyboard.appendChild(rowDiv);
  });

  const controlRow = document.createElement("div");
  controlRow.className = "keyrow";

  const enter = document.createElement("div");
  enter.className = "key wide";
  enter.textContent = "ENTER";
  enter.onclick = submitGuess;

  const back = document.createElement("div");
  back.className = "key wide";
  back.textContent = "⌫";
  back.onclick = deleteLetter;

  controlRow.appendChild(enter);
  controlRow.appendChild(back);
  keyboard.appendChild(controlRow);
}

function handleLetter(letter) {
  if (finished) return;
  if (currentGuess.length < target.length) {
    currentGuess += letter;
    render();
  }
}

function deleteLetter() {
  if (finished) return;
  currentGuess = currentGuess.slice(0,-1);
  render();
}

function submitGuess() {
  if (finished) return;
  if (currentGuess.length !== target.length) return;

  console.log("submitting guess", currentGuess, "target", target);
  guesses.push(currentGuess);
  console.log("guesses array now", guesses);
  saveGame();

  if (currentGuess === target) {
    finished = true;
    updateStreak(true);
    document.getElementById("shareBtn").style.display = "inline-block";
  }

  if (guesses.length >= maxAttempts && currentGuess !== target) {
    finished = true;
    updateStreak(false);
    alert("A szó: " + target);
    document.getElementById("shareBtn").style.display = "inline-block";
  }

  currentGuess = "";
  render();
  console.log("after render, guesses", guesses);
}

function render() {
  const rows = document.querySelectorAll(".row");

  rows.forEach((row, i) => {
    const cells = row.children;

    for (let j = 0; j < target.length; j++) {
      cells[j].textContent = "";
      cells[j].className = "cell";

      if (guesses[i]) {
        const result = checkGuess(guesses[i]);
        cells[j].textContent = guesses[i][j];
        cells[j].classList.add(result[j]);
        colorKey(guesses[i][j], result[j]);
      } else if (i === guesses.length) {
        cells[j].textContent = currentGuess[j] || "";
      }
    }
  });
}

function checkGuess(guess) {
  let result = Array(target.length).fill("absent");
  let targetArr = target.split("");

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === targetArr[i]) {
      result[i] = "correct";
      targetArr[i] = null;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] === "correct") continue;
    const index = targetArr.indexOf(guess[i]);
    if (index !== -1) {
      result[i] = "present";
      targetArr[index] = null;
    }
  }

  return result;
}

function colorKey(letter, status) {
  const key = document.getElementById("key-" + letter);
  if (!key) return;

  if (status === "correct") key.style.background = "#538d4e";
  else if (status === "present" && key.style.background !== "rgb(83, 141, 78)")
    key.style.background = "#b59f3b";
  else if (status === "absent")
    key.style.background = "#3a3a3c";
}

function saveGame() {
  localStorage.setItem(storageKey, JSON.stringify({guesses}));
}

function loadGame() {
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    guesses = JSON.parse(saved).guesses;
  }
}

function updateStreak(win) {
  let streak = parseInt(localStorage.getItem("betudle-streak") || "0");
  if (win) streak++;
  else streak = 0;
  localStorage.setItem("betudle-streak", streak);
}

function updateStats() {
  let streak = localStorage.getItem("betudle-streak") || 0;
  document.getElementById("stats").innerText = "Streak: " + streak;
}

function shareResult() {
  let text = "Betűdle " + todayKey + "\n\n";
  guesses.forEach(g => {
    const r = checkGuess(g);
    r.forEach(c => {
      if (c === "correct") text += "🟩";
      else if (c === "present") text += "🟨";
      else text += "⬛";
    });
    text += "\n";
  });

  navigator.clipboard.writeText(text);
  alert("Eredmény másolva!");
}
// reset the game state and pick a new word (randomly) so the player can start over
function restartGame() {
  if (words.length === 0) {
    alert("Szavak még nem töltöttek be!");
    return;
  }

  // clear any saved progress for today
  localStorage.removeItem(storageKey);

  // choose a new word at random (not tied to the daily index)
  target = words[Math.floor(Math.random() * words.length)];

  // reset all game state
  currentGuess = "";
  guesses = [];
  finished = false;

  // rebuild the board and keyboard, hide share button
  createGrid();
  createKeyboard();
  render();
  updateStats();
  document.getElementById("shareBtn").style.display = "none";

  // blur any focused element (e.g. the restart button) so Enter won't trigger it
  if (document.activeElement) document.activeElement.blur();
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitGuess();
  else if (e.key === "Backspace") deleteLetter();
  else {
    const letter = e.key.toLowerCase();
    if (/^[a-záéíóöőúüű]$/.test(letter)) {
      handleLetter(letter);
    }
  }
});