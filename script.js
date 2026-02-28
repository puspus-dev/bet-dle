let words = [];
let target = "";
let attempts = 6;

fetch("magyar-szavak.txt")
  .then(response => response.text())
  .then(text => {
    words = text
      .split("\n")
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length === 5 && !w.includes(" "));
    
    target = words[Math.floor(Math.random() * words.length)];
    console.log("Cél szó:", target);
  });

function submitGuess() {
  if (!target) {
    alert("A szótár még töltődik...");
    return;
  }

  const input = document.getElementById("guessInput");
  const guess = input.value.toLowerCase();

  if (guess.length !== 5) {
    alert("5 betűs szó kell!");
    return;
  }

  const row = document.createElement("div");
  row.className = "row";

  for (let i = 0; i < 5; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = guess[i];

    if (guess[i] === target[i]) {
      cell.classList.add("correct");
    } else if (target.includes(guess[i])) {
      cell.classList.add("present");
    } else {
      cell.classList.add("absent");
    }

    row.appendChild(cell);
  }

  document.getElementById("game").appendChild(row);

  if (guess === target) {
    alert("Nyertél!");
  }

  attempts--;
  if (attempts === 0 && guess !== target) {
    alert("Vesztettél! A szó: " + target);
  }

  input.value = "";
}