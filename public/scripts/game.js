// DOM-ELEMENT
const gameCanvas = document.querySelector("#gameCanvas");
const context = gameCanvas.getContext("2d");

// SÄTTER BREDD OCH HÖJD PÅ CANVAS
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 650;
gameCanvas.width = CANVAS_WIDTH;
gameCanvas.height = CANVAS_HEIGHT;

// SPELARENS EGENSKAPER
let playerX = 30;
let playerY = CANVAS_HEIGHT / 2;
const playerWidth = 50;
const playerHeight = 50;

// MÅLETS EGENSKAPER
let targetX = 400;
let targetY = 400;
const targetSize = 50;
let targetSpeedX = 8; 
let targetSpeedY = 8; 

// POÄNGVARIABEL
let score = 0;

// BILDER
const backgroundImage = new Image();
backgroundImage.src = './images/canvas.png';

const playerImage = new Image();
playerImage.src = './images/arcade1.png'; 

const targetImage = new Image();
targetImage.src = './images/target.png';

// TANGENTTRYCKNINGAR
let keys = {}; 
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true; 
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// FLYTTA SPELAREN MED WASD OCH PILTANGENTER
function movePlayer() {
  if (keys['arrowup'] || keys['w']) playerY -= 5; 
  if (keys['arrowdown'] || keys['s']) playerY += 5; 
  if (keys['arrowleft'] || keys['a']) playerX -= 5; 
  if (keys['arrowright'] || keys['d']) playerX += 5; 
}

// FLYTTA MÅLET
function moveTarget() {
  targetX += targetSpeedX;
  targetY += targetSpeedY;

  // OM MÅLET RÖR KANTEN, BYT RIKTNING
  if (targetX <= 0 || targetX + targetSize >= CANVAS_WIDTH) {
    targetSpeedX = -targetSpeedX; 
  }
  if (targetY <= 0 || targetY + targetSize >= CANVAS_HEIGHT) {
    targetSpeedY = -targetSpeedY; 
  }
}

// KONTROLLERA OM SPELAREN TRÄFFAR MÅLET
function checkCollision() {
  if (
    playerX < targetX + targetSize &&
    playerX + playerWidth > targetX &&
    playerY < targetY + targetSize &&
    playerY + playerHeight > targetY
  ) {
    // NY POSITION FÖR MÅLET
    targetX = Math.random() * (CANVAS_WIDTH - targetSize);
    targetY = Math.random() * (CANVAS_HEIGHT - targetSize);

    // ÖKA POÄNG
    score += 1;
  }
}

// HÅLL SPELAREN INOM CANVASEN
function keepPlayerInsideCanvas() {
  if (playerX < 0) playerX = 0;
  if (playerX + playerWidth > CANVAS_WIDTH) playerX = CANVAS_WIDTH - playerWidth;
  if (playerY < 0) playerY = 0;
  if (playerY + playerHeight > CANVAS_HEIGHT) playerY = CANVAS_HEIGHT - playerHeight;
}

// RITA BAKGRUND, SPELAREN, MÅLET OCH POÄNG
function draw() {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // BAKGRUNDSBILD
  if (backgroundImage.complete) {
    context.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // SPELARBILD
  if (playerImage.complete) {
    context.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight);
  }

  // MÅLBILD
  if (targetImage.complete) {
    context.drawImage(targetImage, targetX, targetY, targetSize, targetSize);
  }

  // RITA POÄNG
  context.fillStyle = 'black';
  context.font = '20px Silkscreen, serif';
  context.fillText('Score: ' + score, 10, 30);
}

// SPELLOOP
function gameLoop() {
  movePlayer(); 
  moveTarget(); 
  checkCollision();
  keepPlayerInsideCanvas(); 
  draw(); 
  requestAnimationFrame(gameLoop); 
}

// STARTA SPELET
gameLoop();
