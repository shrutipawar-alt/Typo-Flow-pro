const paragraphDisplay = document.getElementById("paragraphDisplay");
const inputField = document.getElementById("inputField");

const timeElement = document.getElementById("time");
const wpmElement = document.getElementById("wpm");
const accuracyElement = document.getElementById("accuracy");
const errorsElement = document.getElementById("errors");
const typedCharsElement = document.getElementById("typedChars");

const difficultySelect = document.getElementById("difficulty");
const timeSelect = document.getElementById("timeSelect");

const restartBtn = document.getElementById("restartBtn");
const newTextBtn = document.getElementById("newTextBtn");

const resultModal = document.getElementById("resultModal");
const closeModal = document.getElementById("closeModal");

const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalErrors = document.getElementById("finalErrors");
const finalTyped = document.getElementById("finalTyped");

const historyList = document.getElementById("historyList");

const progressCircle =
  document.getElementById("progressCircle");

const circleLength = 471;

let timer = null;
let timeLeft = 60;
let totalTime = 60;
let started = false;

let mistakes = 0;
let correctChars = 0;

function loadParagraph() {
  const level = difficultySelect.value;

  const random =
    paragraphs[level][
      Math.floor(
        Math.random() *
          paragraphs[level].length
      )
    ];

  paragraphDisplay.innerHTML = "";

  random.split("").forEach(char => {
    const span = document.createElement("span");
    span.innerText = char;
    paragraphDisplay.appendChild(span);
  });

  paragraphDisplay
    .querySelector("span")
    .classList.add("current");
}

function resetGame() {
  clearInterval(timer);

  started = false;

  totalTime =
    parseInt(timeSelect.value);

  timeLeft = totalTime;

  mistakes = 0;
  correctChars = 0;

  inputField.value = "";
  inputField.disabled = false;

  timeElement.textContent = timeLeft;
  wpmElement.textContent = 0;
  accuracyElement.textContent = "0%";
  errorsElement.textContent = 0;
  typedCharsElement.textContent = 0;

  progressCircle.style.strokeDashoffset = 0;

  loadParagraph();
}

function startTimer() {
  timer = setInterval(() => {

    timeLeft--;

    timeElement.textContent = timeLeft;

    const progress =
      ((totalTime - timeLeft) /
        totalTime) *
      circleLength;

    progressCircle.style.strokeDashoffset =
      progress;

    if (timeLeft <= 0) {
      clearInterval(timer);
      finishTest();
    }

  }, 1000);
}

function updateTyping() {

  const chars =
    paragraphDisplay.querySelectorAll("span");

  const typed =
    inputField.value.split("");

  mistakes = 0;
  correctChars = 0;

  chars.forEach((char, index) => {

    char.classList.remove(
      "correct",
      "incorrect",
      "current"
    );

    if (typed[index] == null) {

      if (index === typed.length) {
        char.classList.add("current");
      }

    }

    else if (
      typed[index] ===
      char.innerText
    ) {

      char.classList.add("correct");
      correctChars++;

    }

    else {

      char.classList.add("incorrect");
      mistakes++;

    }

  });

  const typedCount =
    inputField.value.length;

  typedCharsElement.textContent =
    typedCount;

  errorsElement.textContent =
    mistakes;

  let accuracy = 0;

  if (typedCount > 0) {

    accuracy = Math.round(
      (correctChars /
        typedCount) *
        100
    );

  }

  accuracyElement.textContent =
    accuracy + "%";

  const minutes =
    (totalTime - timeLeft) / 60;

  let wpm = 0;

  if (minutes > 0) {

    wpm = Math.round(
      (correctChars / 5) /
        minutes
    );

  }

  wpmElement.textContent = wpm;

  if (
    typedCount === chars.length &&
    mistakes === 0
  ) {
    clearInterval(timer);
    finishTest();
  }
}

function finishTest() {

  inputField.disabled = true;

  finalWpm.textContent =
    wpmElement.textContent;

  finalAccuracy.textContent =
    accuracyElement.textContent;

  finalErrors.textContent =
    errorsElement.textContent;

  finalTyped.textContent =
    typedCharsElement.textContent;

  resultModal.classList.remove(
    "hidden"
  );

  saveResult();
}

function saveResult() {

  const record = {
    wpm: wpmElement.textContent,
    accuracy:
      accuracyElement.textContent,
    date:
      new Date().toLocaleDateString()
  };

  let history =
    JSON.parse(
      localStorage.getItem(
        "typeflow-history"
      )
    ) || [];

  history.unshift(record);

  history = history.slice(0, 10);

  localStorage.setItem(
    "typeflow-history",
    JSON.stringify(history)
  );

  loadLeaderboard();
}

function loadLeaderboard() {

  let history =
    JSON.parse(
      localStorage.getItem(
        "typeflow-history"
      )
    ) || [];

  historyList.innerHTML = "";

  if (history.length === 0) {

    historyList.innerHTML =
      "<li>No Records Yet</li>";

    return;
  }

  history.forEach((item, index) => {

    const li =
      document.createElement("li");

    li.innerHTML = `
      🏆 #${index + 1}
      &nbsp;
      <strong>${item.wpm} WPM</strong>
      &nbsp; | &nbsp;
      ${item.accuracy}
      <br>
      <small>${item.date}</small>
    `;

    historyList.appendChild(li);

  });

}

inputField.addEventListener(
  "input",
  () => {

    if (!started) {

      started = true;
      startTimer();

    }

    updateTyping();

  }
);

restartBtn.addEventListener(
  "click",
  resetGame
);

newTextBtn.addEventListener(
  "click",
  resetGame
);

difficultySelect.addEventListener(
  "change",
  resetGame
);

timeSelect.addEventListener(
  "change",
  resetGame
);

closeModal.addEventListener(
  "click",
  () => {

    resultModal.classList.add(
      "hidden"
    );

  }
);

window.addEventListener(
  "load",
  () => {

    progressCircle.style.strokeDasharray =
      circleLength;

    progressCircle.style.strokeDashoffset =
      0;

    loadLeaderboard();
    resetGame();

  }
);