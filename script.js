// script.js

// Image paths and quotes for the reels (ensure all paths are correct)
const reelSymbols = [
  { type: "image", name: "fuck_you_buddy", path: "fuck you buddy.png" },
  { type: "image", name: "weird_shit", path: "weird shit.png" },
  { type: "image", name: "mad", path: "mad.png" },
  { type: "image", name: "dont_be_an_ass", path: "dont be an ass.jpg" },
  { type: "image", name: "frank1", path: "frank1.png" },
  { type: "image", name: "frank2", path: "frank2.png" },
  { type: "image", name: "frank3", path: "frank3.JPG" },
  { type: "image", name: "frank4", path: "frank4.png" },
  { type: "quote", text: "As usual, it’s coming out of my hide." },
  { type: "quote", text: "It’s the height of arrogance." },
  { type: "quote", text: "I’m worn to a frazzle." },
  { type: "quote", text: "Ach du lieber Himmel!" }
  // Removed: { type: "quote", text: "Let’s not make invidious comparisons." }
];

// Initialize score
let score = 100;
document.getElementById("score").textContent = score; // Display starting score

// ---------------------------------------------------------
// VISUAL & AUDIO EFFECTS
// ---------------------------------------------------------

// Big Win Animation
function triggerBigWin() {
  const bigWinContainer = document.createElement('div');
  bigWinContainer.className = 'big-win';
  bigWinContainer.innerHTML = `
    <h1>BIG WIN!</h1>
    <p>+1000 Points</p>
  `;
  document.body.appendChild(bigWinContainer);
  setTimeout(() => bigWinContainer.remove(), 3000);
}

// Confetti explosion for wins
function triggerConfetti() {
  confetti({
    particleCount: 300,
    spread: 100,
    origin: { x: 0.5, y: 0.5 }
  });
}

// Flash when user wins
function triggerFlash() {
  const flash = document.createElement('div');
  flash.className = 'flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);
}

// Red overlay for losses
function triggerLossEffect() {
  const lossOverlay = document.createElement('div');
  lossOverlay.className = 'loss';
  document.body.appendChild(lossOverlay);
  setTimeout(() => lossOverlay.remove(), 500);
}

// Game Over screen with "BUGGER" effect
function triggerBugger() {
  const buggerOverlay = document.createElement('div');
  buggerOverlay.className = 'bugger-over';
  buggerOverlay.innerHTML = `
    <h1>BUGGER!</h1>
    <p>Better luck next time.</p>
    <button id="resetButton">Reset</button>
  `;
  document.body.appendChild(buggerOverlay);

  // Attach event listener to the reset button
  document.getElementById("resetButton").addEventListener("click", resetGame);
}

// Game Over function
function showGameOver() {
  triggerBugger();
  // Optionally, you can add additional elements or sounds here
}

// Reset Game Function
function resetGame() {
  // Restore the score
  score = 100;
  document.getElementById("score").textContent = score;

  // Remove any existing overlays if necessary
  const buggerOverlay = document.querySelector('.bugger-over');
  if (buggerOverlay) {
    buggerOverlay.remove();
  }

  // Re-enable the spin button
  document.getElementById("spinButton").disabled = false;
}

// ---------------------------------------------------------
// BRAND-NEW: Over-the-Top "WOW MAN!!!" Text
// ---------------------------------------------------------
function triggerWowMan() {
  const wowMan = document.createElement('div');
  wowMan.className = 'wow-man';
  wowMan.innerHTML = `<h1>WOW MAN!!!</h1>`;
  document.body.appendChild(wowMan);

  // Remove after ~3 seconds
  setTimeout(() => {
    wowMan.remove();
  }, 3000);
}

// ---------------------------------------------------------
// HELPER: Spin One Reel (returns a Promise)
// ---------------------------------------------------------
function spinOneReel(reel, finalSymbol, spinDuration) {
  return new Promise((resolve) => {
    reel.style.opacity = 1;

    let elapsedTime = 0;
    const cycleInterval = 100; 
    reel.parentElement.classList.add('reel-spinning');

    const spinning = setInterval(() => {
      // Random symbol for the spinning effect
      const randomTempSymbol = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
      reel.innerHTML = (randomTempSymbol.type === "image")
        ? `<img src="${randomTempSymbol.path}" alt="${randomTempSymbol.name || ''}">`
        : `<p>${randomTempSymbol.text}</p>`;
      elapsedTime += cycleInterval;

      // Once spinDuration is reached, set final symbol and stop
      if (elapsedTime >= spinDuration) {
        clearInterval(spinning);
        reel.innerHTML = (finalSymbol.type === "image")
          ? `<img src="${finalSymbol.path}" alt="${finalSymbol.name || ''}">`
          : `<p>${finalSymbol.text}</p>`;
        reel.parentElement.classList.remove('reel-spinning');
        resolve(); // reel is done spinning
      }
    }, cycleInterval);
  });
}

// ---------------------------------------------------------
// MAIN: Spin Reels (Sequential, old-school style)
// ---------------------------------------------------------
function spinReels() {
  // Disable the spin button during the spin
  const spinButton = document.getElementById("spinButton");
  spinButton.disabled = true;

  const reels = [
    document.getElementById("reel1"),
    document.getElementById("reel2"),
    document.getElementById("reel3"),
  ];

  const spinSound = document.getElementById("spinSound");
  const winSound = document.getElementById("winSound");
  const gameOverSound = document.getElementById("gameOverSound");

  // 0.5s delay, then start the spin sound
  setTimeout(() => {
    spinSound.play();
  }, 500);

  // 30% chance of forcing a win
  const forceWin = Math.random() < 0.3;

  // Determine final symbols for each reel using a for loop
  const finalSymbols = [];
  for (let i = 0; i < reels.length; i++) {
    if (forceWin && i === 0) {
      // pick a random "winning" symbol
      const sym = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
      finalSymbols.push(sym);
    } else if (forceWin && i > 0) {
      // match the first reel if forcing a win
      finalSymbols.push(finalSymbols[0]);
    } else {
      // random symbol for normal spin
      const sym = reelSymbols[Math.floor(Math.random() * reelSymbols.length)];
      finalSymbols.push(sym);
    }
  }

  // Spin them in sequence: total ~3.5s
  // Example durations: 800 + 1000 + 1700 = 3500ms
  spinOneReel(reels[0], finalSymbols[0], 800)
    .then(() => spinOneReel(reels[1], finalSymbols[1], 1000))
    .then(() => spinOneReel(reels[2], finalSymbols[2], 1700))
    .then(() => {
      // All reels have landed; check win/loss
      const standardizedSymbols = reels.map(reel => {
        const img = reel.querySelector("img");
        return img ? img.src : reel.textContent.trim();
      });

      let resultType = "";
      if (standardizedSymbols.every(src => src.includes("fuck you buddy.png"))) {
        // BIG WIN if all are "fuck you buddy.png"
        score += 1000;
        resultType = "BIG_WIN";
        triggerBigWin();
        triggerConfetti();
      }
      else if (
        standardizedSymbols[0] === standardizedSymbols[1] &&
        standardizedSymbols[1] === standardizedSymbols[2]
      ) {
        // normal 3-of-a-kind
        score += 100;
        resultType = "NORMAL_WIN";
        triggerConfetti();
        triggerFlash();
      }
      else {
        // loss
        score -= 25;
        resultType = "LOSS";
        triggerLossEffect();
      }

      // Update the score on screen
      document.getElementById("score").textContent = score;

      // If result is a WIN, show the "WOW MAN!!!"
      if (resultType === "BIG_WIN" || resultType === "NORMAL_WIN") {
        triggerWowMan();
      }

      // Delay the winning or losing sound by 0.5s
      setTimeout(() => {
        if (resultType === "BIG_WIN" || resultType === "NORMAL_WIN") {
          winSound.play();
        } else if (resultType === "LOSS") {
          gameOverSound.play();
        }
      }, 500);

      // Check if the user ran out of points
      if (score <= 0) {
        showGameOver();
      } else {
        // If not game over, re-enable spin
        spinButton.disabled = false;
      }
    })
    .catch((error) => {
      console.error("Error during spin:", error);
      // Re-enable the spin button in case of unexpected errors
      spinButton.disabled = false;
    });
}

// Attach event listener to spin button
document.getElementById("spinButton").addEventListener("click", spinReels);
