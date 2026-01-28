// ---------- Spielvariablen ----------
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const progressEl = document.getElementById('progress');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

const tileSize = 50;
const gridSize = 10;

// Spielfigur
let player = {
    x: 0,
    y: 0,
    state: 'idle',      // 'idle' | 'walk'
    frame: 0,
    frameTimer: 0
};

// Objekte mit Positionen
let objects = [
    {x: 2, y: 3, solved: false, text: "Finde das Wort: E _ N _ E", answer: "ENTE", img: 0},
    {x: 7, y: 1, solved: false, text: "Buchstabensalat: A P P L E", answer: "APPLE", img: 1},
    {x: 4, y: 8, solved: false, text: "Was ist 5 + 3?", answer: "8", img: 2},
    {x: 9, y: 6, solved: false, text: "Welches Tier miaut?", answer: "KATZE", img: 3}
];

// Sounds
const moveSound = new Audio('sounds/move.wav');
const correctSound = new Audio('sounds/correct.wav');
const wrongSound = new Audio('sounds/wrong.mp3');

// Bilder

const playerImage = new Image();
playerImage.src = 'images/player.png';

const objectImages = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

objectImages[0].src = 'images/object1.png';
objectImages[1].src = 'images/object2.png';
objectImages[2].src = 'images/object3.png';
objectImages[3].src = 'images/object4.png';

// ---------- Animation ----------
const spriteSize = 64;          // Größe eines Frames im PNG
const animationSpeed = 10;      // je höher, desto langsamer

// Fortschritt
let solvedCount = 0;

// ---------- Event-Listener ----------
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    drawGame();
});

restartBtn.addEventListener('click', () => {
    location.reload();
});

document.addEventListener('keydown', (e) => {
    if(gameScreen.classList.contains('hidden')) return;

    switch(e.key) {
        case 'ArrowUp': move(0, -1); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
    }
});

// Touch-Buttons
document.querySelectorAll('#touch-controls button').forEach(btn => {
    btn.addEventListener('click', () => {
        const dir = btn.dataset.dir;
        switch(dir) {
            case 'up': move(0, -1); break;
            case 'down': move(0, 1); break;
            case 'left': move(-1, 0); break;
            case 'right': move(1, 0); break;
        }
    });
});

// ---------- Spiellogik ----------
function move(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    if(newX >=0 && newX < gridSize && newY >=0 && newY < gridSize){
        player.x = newX;
        player.y = newY;
        player.state = 'walk';
        moveSound.play();
        drawGame();
        checkObject();
    }
}

function drawGame() {
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // Raster
    ctx.strokeStyle = "#ccc";
    for(let i=0;i<=gridSize;i++){
        ctx.beginPath();
        ctx.moveTo(i*tileSize,0);
        ctx.lineTo(i*tileSize,gridSize*tileSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0,i*tileSize);
        ctx.lineTo(gridSize*tileSize,i*tileSize);
        ctx.stroke();
    }

   // Objekte (mit Bildern)
objects.forEach(obj => {
    if (!obj.solved) {
        const img = objectImages[obj.img];
        ctx.drawImage(
            img,
            obj.x * tileSize,
            obj.y * tileSize,
            tileSize,
            tileSize
        );
    }
});

// Spielfigur (animiert)
ctx.drawImage(
    playerImage,
    player.frame * spriteSize, // X im Sprite
    0,                          // Y im Sprite (erste Reihe)
    spriteSize,
    spriteSize,
    player.x * tileSize,
    player.y * tileSize,
    tileSize,
    tileSize
);
    
    // Fortschritt
    progressEl.textContent = `Rätsel ${solvedCount}/${objects.length} geschafft`;
}

function checkObject() {
    const obj = objects.find(o => !o.solved && o.x === player.x && o.y === player.y);
    if(obj){
        const userAnswer = prompt(obj.text); // Eingabe nur bei Dialog
        if(userAnswer && userAnswer.trim().toUpperCase() === obj.answer.toUpperCase()){
            correctSound.play();
            obj.solved = true;
            solvedCount++;
            drawGame();
            if(solvedCount === objects.length){
                gameScreen.classList.add('hidden');
                endScreen.classList.remove('hidden');
            }
        } else {
            wrongSound.play();
        }
    }
}
setInterval(() => {
    if (player.state === 'walk') {
        player.frameTimer++;
        if (player.frameTimer >= animationSpeed) {
            player.frame = (player.frame + 1) % 4; // 4 Walking-Frames
            player.frameTimer = 0;
        }
    } else {
        player.frame = 0; // Idle-Frame
    }

    player.state = 'idle';
    drawGame();
}, 100);

