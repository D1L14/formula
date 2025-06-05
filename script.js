const mainMenu = document.getElementById("mainMenu");
const overlayText = document.getElementById("overlayText");
const startSound = document.getElementById("startSound");
const winSound = document.getElementById("winSound");
const gameOverSound = document.getElementById("gameOverSound");

let obstacleIntervalId;
let randomSoundIntervalId;
let trackIntervalId;

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p") {
    togglePause();
  }
});

document.getElementById("btnStart").addEventListener("click", () => {
  mainMenu.style.display = "none";
  showStartLights();
});

document.getElementById("btnControls").addEventListener("click", () => {
  overlayText.innerHTML = "<h3>🎮 Comandi</h3><p>Usa le frecce ← e → per muoverti ed evitare gli ostacoli.</p>";
  overlayText.classList.remove("hidden");
  setTimeout(() => overlayText.classList.add("hidden"), 4000);
});

document.getElementById("btnCredits").addEventListener("click", () => {
  overlayText.innerHTML = "<h3>👨‍💻 Crediti</h3><p>Gioco creato da Dilia Ponce per Luca Simonatti in occasione del suo 26esimo compleanno. Immagini e suoni da fonti gratuite.</p>";
  overlayText.classList.remove("hidden");
  setTimeout(() => overlayText.classList.add("hidden"), 5000);
});

const gameArea = document.getElementById("gameArea");
const car = document.getElementById("car");

let carPosition = 180;
let gameRunning = false;
let obstacleCount = 0;
let currentLevel = 1;
const levelSettings = {
  1: { speed: 7, obstacles: 60 },
  2: { speed: 8, obstacles: 70 },
  3: { speed: 9, obstacles: 80 },
};

let maxObstacles = levelSettings[currentLevel].obstacles;
let obstacleSpeed = levelSettings[currentLevel].speed;

const obstacleImages = ["wheel.png", "wrench.png", "bolt.png"];

document.addEventListener("keydown", handleKeydown);

let startX = 0;

gameArea.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
}, false);

gameArea.addEventListener("touchmove", (e) => {
    const touchX = e.touches[0].clientX;
  const deltaX = touchX - startX;

  const gameAreaRect = gameArea.getBoundingClientRect();
  const carRect = car.getBoundingClientRect();

  let newLeft = car.offsetLeft + deltaX * 5;

  // Limiti di movimento (bordo sinistro e destro)
  const minLeft = 0;
  const maxLeft = gameArea.clientWidth - car.clientWidth;

  // Clamp tra min e max
  newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));

  car.style.left = `${newLeft}px`;

  startX = touchX; // aggiorno per il prossimo movimento
}, false);

function handleSwipe() {
  if (!gameRunning) return;

  const swipeThreshold = 50; // distanza minima per considerare uno swipe

  if (touchEndX < touchStartX - swipeThreshold && carPosition > 0) {
    // Swipe sinistra
    carPosition -= 20;
  } else if (touchEndX > touchStartX + swipeThreshold && carPosition < 360) {
    // Swipe destra
    carPosition += 20;
  }

  car.style.left = carPosition + "px";
}

function handleKeydown(e) {
  if (!gameRunning) return;

  if (e.key === "ArrowLeft" && carPosition > 0) {
    carPosition -= 20;
  } else if (e.key === "ArrowRight" && carPosition < 360) {
    carPosition += 20;
  }
  car.style.left = carPosition + "px";
}

function showStartLights() {
  const oldStartLines = gameArea.querySelectorAll('.start-line');
  oldStartLines.forEach(line => line.remove());

  const lightContainer = document.getElementById("startLights");
  lightContainer.innerHTML = "";
  lightContainer.style.display = "flex";

  let startGrid = document.createElement("div");
  startGrid.classList.add("start-line");
  startGrid.style.top = "460px";
  startGrid.id = "startGridStatic";
  gameArea.appendChild(startGrid);


  for (let i = 0; i < 5; i++) {
    const light = document.createElement("div");
    light.classList.add("light");
    lightContainer.appendChild(light);
  }

  const lights = Array.from(document.querySelectorAll('.light')).reverse();

  startSound.currentTime = 0;
  startSound.play();

  lights.forEach((light, i) => {
    setTimeout(() => {
      light.classList.add('red');
    }, i * 1000);
  });

  setTimeout(() => {
    lightContainer.innerHTML = ""; // Nasconde le luci

    const staticGrid = document.getElementById("startGridStatic");
    if(staticGrid) staticGrid.remove();

    startGame();
  }, 5000);
}

const randomSounds = [
  new Audio("audio/sound1.mp3"),
  new Audio("audio/sound2.mp3"),
  new Audio("audio/sound3.mp3"),
  new Audio("audio/sound4.mp3")
];

function playRandomSound() {
  if (isSoundPlaying) return;
  if (!gameRunning) return;

  // Evita se stanno suonando i suoni principali
  if (!winSound.paused || !gameOverSound.paused) return;

  const sound = randomSounds[Math.floor(Math.random() * randomSounds.length)];
  isSoundPlaying = true;
  sound.currentTime = 0;
  sound.play();
  sound.onended = () => {
    isSoundPlaying = false;
  };
}

let isSoundPlaying = false;

function startGame() {
  document.querySelector('.track-wall.left')?.classList.add('scrolling');
  document.querySelector('.track-wall.right')?.classList.add('scrolling');

  const oldStartLines = gameArea.querySelectorAll('.start-line');
  oldStartLines.forEach(line => line.remove());

  // Ricrea la linea di partenza
  const startLine = document.createElement("div");
  startLine.classList.add("start-line");
  startLine.style.top = "460px";
  gameArea.appendChild(startLine);

  gameRunning = true;

  animateStartLine(startLine);  // animazione

  animateTrackLines();

  obstacleIntervalId = setInterval(() => {
    if (gameRunning && obstacleCount < maxObstacles) {
      createObstacle();
    } else {
      clearInterval(obstacleInterval);
    }
  }, 1000);
  randomSoundIntervalId = setInterval(() => {
  if (gameRunning && !isSoundPlaying) {
    playRandomSound();
  } else if (!gameRunning) {
    clearInterval(randomSoundInterval);  // ferma quando il gioco si ferma
  }
  }, 8000); // ogni 8 secondi

}


function animateStartLine(startLine) {
  let pos = 400;
  console.log("animazione startline iniziata");
  const interval = setInterval(() => {
    if (pos >= 600) {
      startLine.remove();
      clearInterval(interval);
        console.log("animazione startline iniziata");
    } else {
      pos += 5;
      startLine.style.top = pos + "px";
    }
  }, 30);
}


function animateTrackLines() {
  if (trackIntervalId) clearInterval(trackIntervalId);

  function createLine(side) {
    const line = document.createElement("div");
    line.classList.add("track-line", side);
    line.style.top = "0px";
    gameArea.appendChild(line);

    let top = 0;
    const interval = setInterval(() => {
      if (!gameRunning) {
        line.remove();
        clearInterval(interval);
        return;
      }

      top += 5;
      line.style.top = top + "px";

      if (top > 600) {
        line.remove();
        clearInterval(interval);
      }
    }, 30);
  }

  trackIntervalId = setInterval(() => {
    if (gameRunning) {
      createLine("left");
      createLine("right");
    }
  }, 500);
}

function createObstacle() {
  if (!gameRunning || obstacleCount >= maxObstacles) return;

  obstacleCount++;

  const obstacle = document.createElement("div");
  obstacle.classList.add("obstacle");

  const img = document.createElement("img");
  img.src = `img/${obstacleImages[Math.floor(Math.random() * obstacleImages.length)]}`;
  img.classList.add("obstacle-img");
  obstacle.appendChild(img);

  obstacle.style.left = Math.floor(Math.random() * 360) + "px";
  obstacle.style.top = "0px";
  gameArea.appendChild(obstacle);

  moveElementDown(obstacle, false);

  if (obstacleCount === maxObstacles) {
    setTimeout(createFinishLine, 1000);
  }
}

function createFinishLine() {
  const finish = document.createElement("div");
  finish.classList.add("finish-line");
  finish.style.top = "600px";
  gameArea.appendChild(finish);

  moveElementDown(finish, true);
}

function moveElementDown(element, isFinishLine = false) {
  let positionY = 0;

  const interval = setInterval(() => {
    if (!gameRunning) return;

    positionY += obstacleSpeed;
    element.style.top = positionY + "px";

    if (positionY > 600) {
      element.remove();
      clearInterval(interval);
      return;
    }

    const carRect = car.getBoundingClientRect();
    const elRect = isFinishLine
      ? element.getBoundingClientRect()
      : element.querySelector("img").getBoundingClientRect();

    if (
      carRect.left < elRect.right &&
      carRect.right > elRect.left &&
      carRect.top < elRect.bottom &&
      carRect.bottom > elRect.top
    ) {
      if (isFinishLine) {
        gameRunning = false;
        clearInterval(interval);
        animateCarVictory();
      } else {
        const gameOverSound = document.getElementById("gameOverSound");
        gameOverSound.currentTime = 0;
        gameOverSound.play();

        alert("💥 Problemi! Problemi! Problemi! Game Over!");
        gameRunning = false;
        clearInterval(interval);
        window.location.reload();
      }
    }
  }, 30);
}

function animateCarVictory() {
  let top = car.offsetTop;

  document.removeEventListener("keydown", handleKeydown);

  document.querySelector('.track-wall.left')?.classList.remove('scrolling');
  document.querySelector('.track-wall.right')?.classList.remove('scrolling');

  const winSound = document.getElementById("winSound");
  winSound.currentTime = 0;
  winSound.play();

  const moveUp = setInterval(() => {
    if (top <= -80) {
      clearInterval(moveUp);
      car.style.display = "none";

      const flag = document.getElementById("flagWin");
      if (flag) flag.classList.add("visible");

      setTimeout(() => {
        flag.classList.remove("visible");

        if (levelSettings[currentLevel + 1]) {
          currentLevel++;
          startNextLevel();
        } else {
          alert("🏆 Hai completato tutti i livelli! Complimenti!");
          window.location.reload();
        }
      }, 1000);

    } else {
      top -= 15;
      car.style.top = top + "px";
    }
  }, 30);
}

function startNextLevel() {
  const oldStartLines = gameArea.querySelectorAll('.start-line');
  const oldFinishLines = gameArea.querySelectorAll('.finish-line');
  oldStartLines.forEach(line => line.remove());
  oldFinishLines.forEach(line => line.remove());

  overlayText.innerHTML = `<h3>🚦 Livello ${currentLevel}</h3><p>Velocità aumentata! Più ostacoli in arrivo...</p>`;
  overlayText.classList.remove("hidden");

  setTimeout(() => {
    overlayText.classList.add("hidden");
  }, 3000);

  carPosition = 180;
  car.style.top = "460px";
  car.style.left = carPosition + "px";
  car.style.display = "block";

  document.addEventListener("keydown", handleKeydown);

  obstacleCount = 0;
  maxObstacles = levelSettings[currentLevel].obstacles;
  obstacleSpeed = levelSettings[currentLevel].speed;

  showStartLights();
}

let isPaused = false;

function togglePause() {
  if (!gameRunning && !isPaused) return; // se il gioco non è partito o in corso, non fare niente

  if (!isPaused) {
  // pausa
  isPaused = true;
  gameRunning = false;

  document.querySelector('.track-wall.left')?.classList.remove('scrolling');
  document.querySelector('.track-wall.right')?.classList.remove('scrolling');

  // Stoppa intervalli
  clearInterval(obstacleIntervalId);
  clearInterval(randomSoundIntervalId);
  clearInterval(trackIntervalId);

  overlayText.innerHTML = "<h3>⏸️ Gioco in pausa. Premi 'P' per riprendere.</h3>";
  overlayText.classList.remove("hidden");

} else {
  // Riprendi gioco
  isPaused = false;
  gameRunning = true;

  document.addEventListener("keydown", handleKeydown);

  document.querySelector('.track-wall.left')?.classList.add('scrolling');
  document.querySelector('.track-wall.right')?.classList.add('scrolling');

  // Riavvia intervalli
  obstacleIntervalId = setInterval(() => {
    if (gameRunning && obstacleCount < maxObstacles) {
      createObstacle();
    } else {
      clearInterval(obstacleIntervalId);
    }
  }, 1000);

  randomSoundIntervalId = setInterval(() => {
    if (gameRunning && !isSoundPlaying) {
      playRandomSound();
    } else if (!gameRunning) {
      clearInterval(randomSoundIntervalId);
    }
  }, 8000);

  animateTrackLines();

  overlayText.classList.add("hidden");
}
}
