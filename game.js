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

const dialogOverlay = document.getElementById('dialog-overlay');
const dialogText = document.getElementById('dialog-text');
const dialogInput = document.getElementById('dialog-input');
const dialogChoices = document.getElementById('dialog-choices');
const dialogConfirmBtn = document.getElementById('dialog-confirm-btn');

let dialogOpen = false;
let activeObject = null;

dialogOverlay.classList.add('hidden');  // sorgt dafür, dass es wirklich versteckt ist
dialogOpen = false;


// Spielfigur
let player = { x: 0, y: 0 };

// Objekte mit Positionen
let objects = [
    {x: 2, y: 3, type: "puzzle", solved: false, text: "🧩 Buchstabensalat: SENSLEWL", answer: "WELLNESS", img: 0},
    {x: 7, y: 1, type: "puzzle", puzzleType: "choice", solved: false, text: "🧩 Welche der folgenden Eigenschaften beschreibt am besten einen typischen, trockenen Riesling aus Deutschland?",
    choices: ["A: Schwere, buttrige Noten mit wenig Säure", "B: Leichte, knackige Säure mit Aromen von grünen Äpfeln und Zitrusfrüchten", "C: Dunkle Beerenaromen und Tannine", "D: Süße Süßweinaromen und Rosinen"], correctIndex: 1, img: 1},
    {x: 4, y: 8, type: "puzzle", solved: false, text: "🧩 Ich werde nass, wenn ich trockne - was bin ich?", answer: "HANDTUCH", img: 2},
    {x: 9, y: 6, type: "puzzle", solved: false, text: "🧩 Vervollständige: _ A _ _U _ G", answer: "HAMBURG", img: 3},

     // Dialogobjekte (neue)
    {x: 1, y: 5, type: "info", text: "Hm, das scheint nicht richtig zu sein. Ich muss weitersuchen.",img: 4},
    {x: 6, y: 4, type: "info", text: "Hm, das scheint nicht richtig zu sein. Ich muss weitersuchen.", img: 5}, 
    { x: 4,y: 0,type: "puzzle",puzzleType: "input",locked: true,solved: false,text: "Deine Antworten: Wellness, Handtuch, Hamburg.\n Letzte Frage: Was ist also nun dein Geschenk? _ _ _",answer: "SPA",img: 6},
    {type: "info",locked: true,text: "🚪 Eine Tür ist erschienen...\nVielleicht solltest du dort nachsehen."
}

];

// Sounds
const moveSound = new Audio('sounds/move.wav');
const correctSound = new Audio('sounds/correct.wav');
const wrongSound = new Audio('sounds/wrong.mp3');

// 🎵 Hintergrundmusik
const backgroundMusic = new Audio('sounds/backgroundforrest.wav');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3; // bewusst leiser

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

objectImages.push(new Image());
objectImages[6].src = 'images/object7.png';


// Fortschritt
let solvedCount = 0;

// Visuelles Feedback
let showErrorFlash = false;

let shakeOffset = 0;

let showSuccessFlash = false;


// ---------- Event-Listener ----------
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    closeDialog(); 
    
    drawGame();
        // 🎵 Hintergrundmusik starten
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
});

restartBtn.addEventListener('click', () => {
    location.reload();
});

document.addEventListener('keydown', (e) => {
    if(gameScreen.classList.contains('hidden')) return;
    if (dialogOpen) return;
    switch(e.key) {
        case 'ArrowUp': move(0, -1); break;
        case 'ArrowDown': move(0, 1); break;
        case 'ArrowLeft': move(-1, 0); break;
        case 'ArrowRight': move(1, 0); break;
    }
});

        // Nur bei Input-Rätseln
        if (
            activeObject &&
            activeObject.type === "puzzle" &&
            (!activeObject.puzzleType || activeObject.puzzleType === "input")
        ) {
            dialogConfirmBtn.click();
        }
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

    // Fehlermeldung wenn falsch
    const offset = shakeOffset ? Math.random() * shakeOffset - shakeOffset / 2 : 0;
    ctx.save();
    ctx.translate(offset, 0);


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
    if (obj.locked) return;
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

  // Visuelles Feedback bei Fehler
if (showErrorFlash) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}

    // Visuelles Feedback bei Erfolg
if (showSuccessFlash) {
    ctx.fillStyle = 'rgba(0, 200, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

   // Fortschritt
 const totalPuzzles = objects.filter(o => o.type === "puzzle").length;
progressEl.textContent = `🎯 ${solvedCount}/${totalPuzzles} geschafft`;
    
// Falsche Antwort 
ctx.restore();

}

function checkObject() {
    const obj = objects.find(o => o.x === player.x && o.y === player.y);
    if (!obj || dialogOpen) return;

    // ✅ GELÖSTE PUZZLES IGNORIEREN
    if (obj.type === "puzzle" && obj.solved) return;

    (obj);
}


function solvePuzzle(obj) {
    triggerSuccessFeedback();
    obj.solved = true;
    solvedCount++;
    drawGame();

const totalPuzzles = objects.filter(o => o.type === "puzzle" && !o.locked).length;
const door = objects.find(o => o.locked === true && o.img === 6);
const infoDialog = objects.find(o => o.type === "info" && o.locked === true);

if (solvedCount === 4 && door) {
    door.locked = false;

    if (infoDialog) {
        infoDialog.locked = false;
        (infoDialog);
    }

    drawGame();
    return;
}


if (solvedCount === totalPuzzles) {
    backgroundMusic.pause();        // stoppen
    backgroundMusic.currentTime = 0;
    
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

}

function triggerErrorFeedback() {
    wrongSound.play();
    showErrorFlash = true;
    drawGame();

    setTimeout(() => {
        showErrorFlash = false;
        drawGame();
    }, 300);
    shakeOffset = 10;

setTimeout(() => {
    shakeOffset = 0;
}, 300);

}

function triggerSuccessFeedback() {
    correctSound.play();
    showSuccessFlash = true;
    drawGame();

    setTimeout(() => {
        showSuccessFlash = false;
        drawGame();
    }, 300);
}

function openDialog(obj) {
    if (!obj) return;

    dialogOpen = true;
    activeObject = obj;

    dialogText.textContent = obj.text;
    dialogOverlay.classList.remove('hidden');

    // Grundzustand
    dialogInput.classList.add('hidden');
    dialogChoices.classList.add('hidden');
    dialogChoices.innerHTML = '';
    dialogConfirmBtn.style.display = 'inline-block';

    // Event-Handler vorher entfernen
    dialogConfirmBtn.onclick = null;

    if (obj.type === "info") {
        dialogConfirmBtn.onclick = closeDialog;
    }

    if (obj.type === "puzzle") {
        if (!obj.puzzleType || obj.puzzleType === "input") {
            dialogInput.focus();          // Cursor sofort aktiv
            dialogInput.value = '';
            dialogInput.classList.remove('hidden');
        const submitAnswer = () => {
            const value = dialogInput.value.trim().toUpperCase();
            if (value === obj.answer.toUpperCase()) {
            solvePuzzle(obj);
            closeDialog();
            } else {
                triggerErrorFeedback();
            }
        };

dialogConfirmBtn.onclick = submitAnswer;

dialogInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitAnswer();
    }
};

        }

        if (obj.puzzleType === "choice") {
            dialogChoices.classList.remove('hidden');
            dialogConfirmBtn.style.display = 'none'; // Button ausblenden

            obj.choices.forEach((choice, index) => {
                const btn = document.createElement('button');
                btn.textContent = choice;
                btn.onclick = () => {
                    if (index === obj.correctIndex) {
                        solvePuzzle(obj);
                        closeDialog();
                    } else {
                        triggerErrorFeedback();
                    }
                };
                dialogChoices.appendChild(btn);
            });
        }
    }
}


function closeDialog() {

    // 🔹 zuerst noch mit activeObject arbeiten
    if (activeObject && activeObject.type === "info") {
        activeObject.solved = true;
        activeObject.locked = true; // Info-Dialog nur einmal
    }

    dialogOverlay.classList.add('hidden');
    dialogText.textContent = '';
    dialogInput.value = '';
    dialogInput.classList.add('hidden');
    dialogChoices.innerHTML = '';
    dialogChoices.classList.add('hidden');

    dialogConfirmBtn.onclick = null;
    dialogConfirmBtn.style.display = 'inline-block';

    dialogOpen = false;
    activeObject = null; // 🔹 GANZ ZUM SCHLUSS
}








