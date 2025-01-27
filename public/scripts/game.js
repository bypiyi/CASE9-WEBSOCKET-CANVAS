// DOM-ELEMENT
const gameCanvas = document.querySelector("#gameCanvas");
const scoreElement = document.querySelector("#score");

const context = gameCanvas.getContext("2d");

// SÄTTET BREDD OCH HÖJD PÅ MIN CANVAS
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 650;
gameCanvas.width = CANVAS_WIDTH;
gameCanvas.height = CANVAS_HEIGHT;

// SPELARENS EGENSKAPER
let playerX = 30;
let playerY = CANVAS_HEIGHT / 2;
const playerWidth = 50;
const playerHeight = 50;
const GRAVITY_FORCE = 9.82;

// MÅLETS EGENSKAPER
let targetX = 400;
let targetY = 400;
const targetSize = 50;
let targetSpeedX = 8; 
let targetSpeedY = 8; 

// VILL ATT SPELAREN SKA VARA EN BILD
const playerImage = new Image();
playerImage.src = './images/arcade1.png';

// VILL ATT MÅLET SKA VARA EN BILD
const targetImage = new Image();
targetImage.src = './images/target.png';

// TANGETTRYCKNINGAR
let keys = {}; 
window.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true; 
});
window.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// POÄNGVARIABEL DÄR 0 ÄR START
let score = 0;

// EN FUNKTION FÖR ATT FLYTTA SPELAREN MED HJÄLP AV WSAD
function movePlayer() {
  if (keys['ArrowUp'] || keys['w']) playerY -= 5; 
  if (keys['ArrowDown'] || keys['s']) playerY += 5; 
  if (keys['ArrowLeft'] || keys['a']) playerX -= 5; 
  if (keys['ArrowRight'] || keys['d']) playerX += 5; 
}

// FUNKTION FÖR ATT FLYTTA MÅLET
function moveTarget() {
  targetX += targetSpeedX;
  targetY += targetSpeedY;

  // OM MÅLET RÖR KANTEN AV CANVAS SÅ BYTS RIKTNING
  if (targetX <= 0 || targetX + targetSize >= CANVAS_WIDTH) {
    targetSpeedX = -targetSpeedX; 
  }
  if (targetY <= 0 || targetY + targetSize >= CANVAS_HEIGHT) {
    targetSpeedY = -targetSpeedY; 
  }
}

// SE OM SPELAREN TRÄFFAR MÅLET
function checkCollision() {
  if (
    playerX < targetX + targetSize &&
    playerX + playerWidth > targetX &&
    playerY < targetY + targetSize &&
    playerY + playerHeight > targetY
  ) {
    // OM SÅ - FLYTTA MÅLET TILL NY POSITION
    targetX = Math.random() * (CANVAS_WIDTH - targetSize);
    targetY = Math.random() * (CANVAS_HEIGHT - targetSize);
    
    // ADDERA POÄNGEN
    score += 1;
  }
}

// RITAR UPP SPELARE OCH MÅLET PÅ CANVAS
function draw() {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Rensa canvasen

  // RITAR SPELAREN SOM EN BILD
  if (playerImage.complete) {
    context.drawImage(playerImage, playerX, playerY, playerWidth, playerHeight); // Rita spelarbilder
  }

  // MÅLET - SOM BILD
  if (targetImage.complete) {
    context.drawImage(targetImage, targetX, targetY, targetSize, targetSize);
  }

  // POÄNGEN SKRIVS UT
  context.fillStyle = 'black';
  context.font = '20px Silkscreen, serif';
  context.fillText('Score: ' + score, 10, 30);
}

// DENNA FUNKTION GÖR SÅ ATT SPELAREN INTE KAN GÅ UTANFÖR CANVASEN
function keepPlayerInsideCanvas() {
  if (playerX < 0) playerX = 0;
  if (playerX + playerWidth > CANVAS_WIDTH) playerX = CANVAS_WIDTH - playerWidth;
  if (playerY < 0) playerY = 0;
  if (playerY + playerHeight > CANVAS_HEIGHT) playerY = CANVAS_HEIGHT - playerHeight;
}

// SPELLOOP
// GAMELOOP() ANROPAS. SPELARENS RÖRELSE UPPDATERAS. MÅLETS RÖRELSE UPPDATERAS. KOLLISIONEN MELLAN SPELAREN OCH MÅLET KONTROLLERAS. SPELAREN HÅLLS INOM CANVASEN.
// SPELET RITAS OM PÅ CANVASEN. REQUESTANIMATIONFRAME() ANROPAS, VILKET GÖR ATT LOOPEN KÖRS OM OCH OM IGEN, VILKET SKAPAR SPELETS ANIMATION.
function gameLoop() {
  movePlayer(); 
  moveTarget(); 
  checkCollision();
  keepPlayerInsideCanvas(); 
  draw(); 
  requestAnimationFrame(gameLoop); 
}

// Starta spelet
gameLoop();
