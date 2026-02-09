const prompts = [
  "Learning to type with accuracy builds confidence and makes every assignment easier.",
  "Great developers move carefully, checking their work and celebrating steady progress.",
  "Daily practice turns typing speed into a superpower for research and creative writing.",
  "Focus on rhythm, breathe, and keep your eyes on the prompt as the timer counts down.",
  "Consistency today means stronger skills tomorrow, one sentence at a time."
];

const studentNameInput = document.querySelector("#studentName");
const durationSelect = document.querySelector("#durationSelect");
const startBtn = document.querySelector("#startBtn");
const resetBtn = document.querySelector("#resetBtn");
const promptText = document.querySelector("#promptText");
const typingInput = document.querySelector("#typingInput");
const timeLeftEl = document.querySelector("#timeLeft");
const wpmEl = document.querySelector("#wpm");
const accuracyEl = document.querySelector("#accuracy");
const messageEl = document.querySelector("#message");
const todayLabel = document.querySelector("#todayLabel");
const promptLengthEl = document.querySelector("#promptLength");
const durationLabel = document.querySelector("#durationLabel");
const scoreDateInput = document.querySelector("#scoreDate");
const scoreRows = document.querySelector("#scoreRows");
const clearScoresBtn = document.querySelector("#clearScores");

let activePrompt = "";
let timerId = null;
let timeLeft = 60;
let roundActive = false;

const SCORE_KEY = "typingGameScores";

const getToday = () => new Date().toISOString().slice(0, 10);

const getScores = () => {
  const raw = localStorage.getItem(SCORE_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveScores = (scores) => {
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
};

const setPrompt = () => {
  activePrompt = prompts[Math.floor(Math.random() * prompts.length)];
  promptText.textContent = activePrompt;
  promptLengthEl.textContent = `${activePrompt.split(" ").length} words`;
};

const updateHero = () => {
  todayLabel.textContent = getToday();
  durationLabel.textContent = `${durationSelect.value}s`;
};

const resetRound = () => {
  roundActive = false;
  clearInterval(timerId);
  timerId = null;
  typingInput.value = "";
  typingInput.disabled = true;
  wpmEl.textContent = "0";
  accuracyEl.textContent = "0%";
  timeLeft = Number(durationSelect.value);
  timeLeftEl.textContent = `${timeLeft}s`;
  messageEl.textContent = "";
  setPrompt();
  updateHero();
};

const calculateStats = () => {
  const typed = typingInput.value;
  const minutes = Number(durationSelect.value) / 60;
  const wpm = Math.max(0, Math.round((typed.length / 5) / minutes));
  let correct = 0;
  for (let i = 0; i < typed.length; i += 1) {
    if (typed[i] === activePrompt[i]) {
      correct += 1;
    }
  }
  const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 0;
  return { wpm, accuracy };
};

const updateStats = () => {
  const { wpm, accuracy } = calculateStats();
  wpmEl.textContent = wpm;
  accuracyEl.textContent = `${accuracy}%`;
};

const finishRound = () => {
  if (!roundActive) {
    return;
  }
  roundActive = false;
  clearInterval(timerId);
  typingInput.disabled = true;
  const { wpm, accuracy } = calculateStats();
  messageEl.textContent = `Round complete! ${wpm} WPM at ${accuracy}% accuracy.`;
  logScore({ wpm, accuracy });
};

const logScore = ({ wpm, accuracy }) => {
  const name = studentNameInput.value.trim();
  if (!name) {
    messageEl.textContent = "Add a student name to save the score.";
    return;
  }
  const scores = getScores();
  scores.push({
    date: getToday(),
    name,
    wpm,
    accuracy,
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });
  saveScores(scores);
  renderScores();
};

const renderScores = () => {
  const scores = getScores();
  const selectedDate = scoreDateInput.value || getToday();
  const todaysScores = scores
    .filter((score) => score.date === selectedDate)
    .sort((a, b) => b.wpm - a.wpm);

  scoreRows.innerHTML = "";

  if (!todaysScores.length) {
    const empty = document.createElement("div");
    empty.className = "table-empty";
    empty.textContent = "No scores yet for this date.";
    scoreRows.appendChild(empty);
    return;
  }

  todaysScores.forEach((score) => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.innerHTML = `
      <span>${score.time}</span>
      <span>${score.name}</span>
      <span>${score.wpm}</span>
      <span>${score.accuracy}%</span>
    `;
    scoreRows.appendChild(row);
  });
};

startBtn.addEventListener("click", () => {
  if (roundActive) {
    return;
  }
  if (!studentNameInput.value.trim()) {
    messageEl.textContent = "Please enter a student name to start.";
    return;
  }
  roundActive = true;
  timeLeft = Number(durationSelect.value);
  timeLeftEl.textContent = `${timeLeft}s`;
  typingInput.disabled = false;
  typingInput.focus();
  messageEl.textContent = "Go! Type the prompt as accurately as you can.";

  timerId = setInterval(() => {
    timeLeft -= 1;
    timeLeftEl.textContent = `${timeLeft}s`;
    updateStats();
    if (timeLeft <= 0) {
      finishRound();
    }
  }, 1000);
});

resetBtn.addEventListener("click", resetRound);

typingInput.addEventListener("input", () => {
  if (!roundActive) {
    return;
  }
  updateStats();
  if (typingInput.value.length >= activePrompt.length) {
    finishRound();
  }
});

durationSelect.addEventListener("change", () => {
  if (!roundActive) {
    resetRound();
  }
});

scoreDateInput.addEventListener("change", renderScores);

clearScoresBtn.addEventListener("click", () => {
  const selectedDate = scoreDateInput.value || getToday();
  const scores = getScores().filter((score) => score.date !== selectedDate);
  saveScores(scores);
  renderScores();
});

scoreDateInput.value = getToday();
setPrompt();
updateHero();
resetRound();
renderScores();
