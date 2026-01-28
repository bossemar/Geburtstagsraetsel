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
let player = { x: 0, y: 0 };

// Objekte mit Positionen
let objects = [
    {x: 2, y: 3, type: "puzzle", solved: false, text: "Finde das Wort: E _ N _ E", answer: "ENTE", img: 0},
    {x: 7, y: 1, type: "puzzle",solved: false, text: "Buchstabensalat: A P P L E", answer: "APPLE", img: 1},
    {x: 4, y: 8, type: "puzzle",solved: false, text: "Was ist 5 + 3?", answer: "8", img: 2},
    {x: 9, y: 6, type: "puzzle",solved: false, text: "Welches Tier miaut?", answer: "KATZE", img: 3}

     // Dialogobjekte (neue)
    {
        x: 1,
        y: 5,
        type: "info",
        text: "Hm, das scheint nicht richtig zu sein. Ich muss weitersuchen.",
        img: 4
    },
    {
        x: 6,
        y: 4,
        type: "info",
        text: "Hm, das scheint nicht richtig zu sein. Ich muss weitersuchen.",
        img: 5
    }
];

// Sounds
const moveSound = new Audio('sounds/move.wav');
const correctSound = new Audio('sounds/correct.wav');
const wrongSound = new Audio('sounds/wrong.mp3');

// Bilder

const playerImage = new Image();
playerImage.src = 'images/player.png';

const mapImage = new Image();
mapImage.src = 'images/map.png';

const objectImages = [
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image(),
    new Image()
];

objectImages[0].src = 'images/object1.png';
objectImages[1].src = 'images/object2.png';
objectImages[2].src = 'images/object3.png';
objectImages[3].src = 'images/object4.png';
objectImages[4].src = 'images/object5.png';
objectImages[5].src = 'images/object6.png';

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
        moveSound.play();
        drawGame();
        checkObject();
    }
}

function drawGame() {
    // ctx.clearRect(0,0,canvas.width, canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

// Hintergrund (Map)
ctx.drawImage(
    mapImage,
    0,
    0,
    canvas.width,
    canvas.height
);


   // Objekte (mit Bildern)
    
objects.forEach(obj => {
    if (obj.type === "puzzle" && obj.solved) return;

    const img = objectImages[obj.img];
    ctx.drawImage(
        img,
        obj.x * tileSize,
        obj.y * tileSize,
        tileSize,
        tileSize
    );
});


// Spielfigur 
ctx.drawImage(
    playerImage,
    player.x * tileSize,
    player.y * tileSize,
    tileSize,
    tileSize
);
    
    // Fortschritt
 const totalPuzzles = objects.filter(o => o.type === "puzzle").length;
progressEl.textContent = `Rätsel ${solvedCount}/${totalPuzzles} geschafft`;

}

function checkObject() {
    const obj = objects.find(o => o.x === player.x && o.y === player.y);
    if (!obj) return;

    // Dialogobjekt (kein Rätsel)
    if (obj.type === "info") {
        alert(obj.text);
        return;
    }

    // Rätselobjekt
    if (obj.type === "puzzle" && !obj.solved) {
        const userAnswer = prompt(obj.text);
        if (
            userAnswer &&
            userAnswer.trim().toUpperCase() === obj.answer.toUpperCase()
        ) {
            correctSound.play();
            obj.solved = true;
            solvedCount++;
            drawGame();

            if (solvedCount === objects.filter(o => o.type === "puzzle").length) {
                gameScreen.classList.add('hidden');
                endScreen.classList.remove('hidden');
            }
        } else {
            wrongSound.play();
        }
    }
}


