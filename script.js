let words = [];
let target = "";
let currentGuess = "";
let guesses = [];
let maxAttempts = 6;

const todayKey = new Date().toISOString().slice(0,10);

fetch("words.txt")
  .then(res => res.text())
  .then(text => {
    words = text.split("\n")
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 0 && !w.includes(" "));

    target = getDailyWord();
    loadGame();
    createGrid();
    createKeyboard();
  });

function getDailyWord() {
  const dateNumber = Math.floor(new Date(todayKey).getTime() / 86400000);
  return words[dateNumber % words.length];
}

function createGrid() {
  const game = document.getElementById("game");
  game.innerHTML = "";
  game.style.gridTemplateRows = `repeat(${maxAttempts}, auto)`;

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

  render();
}

function createKeyboard() {
  const letters = [
    "qwertzuiopőú",
    "asdfghjkléáű",
    "enter yxcvbnmöüó ⌫"
  ];

  const keyboard = document.getElementById("keyboard");

  letters.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "keyrow";

    row.split(" ").join("").split("").forEach(char => {
      const key = document.createElement("div");
      key.className = "key";
      key.textContent = char;

      if (char === "e") return;

      key.onclick = () => handleKey(char);
      rowDiv.appendChild(key);
    });

    keyboard.appendChild(rowDiv);
  });
}

function handleKey(key) {
  if (key === "⌫") {
    currentGuess = currentGuess.slice(0,-1);
  } else if (key === "e") {
    submitGuess();
  } else {
    currentGuess += key;
  }
  render();
}

function submitGuess() {
  if (currentGuess.length !== target.length) return;

  guesses.push(currentGuess);
  saveGame();

  if (currentGuess === target) {
    alert("Nyertél!");
  }

  if (guesses.length >= maxAttempts) {
    alert("A szó: " + target);
  }

  currentGuess = "";
  render();
}

function render() {
  const rows = document.querySelectorAll(".row");

  rows.forEach((row, i) => {
    const cells = row.children;

    for (let j = 0; j < target.length; j++) {
      cells[j].textContent = "";

      if (guesses[i]) {
        const result = checkGuess(guesses[i]);
        cells[j].textContent = guesses[i][j];
        cells[j].className = "cell " + result[j];
      } else if (i === guesses.length) {
        cells[j].textContent = currentGuess[j] || "";
      }
    }
  });
}

function checkGuess(guess) {
  let result = Array(target.length).fill("absent");
  let targetArr = target.split("");

  // First pass: correct
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === targetArr[i]) {
      result[i] = "correct";
      targetArr[i] = null;
    }
  }

  // Second pass: present
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

function saveGame() {
  localStorage.setItem("magyarWordle-" + todayKey, JSON.stringify(guesses));
}

function loadGame() {
  const saved = localStorage.getItem("magyarWordle-" + todayKey);
  if (saved) {
    guesses = JSON.parse(saved);
  }
}