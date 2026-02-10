const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const prologue = document.getElementById('prologue');
const controls = document.getElementById('controls');
const attackBtn = document.getElementById('attackBtn');
const parryBtn = document.getElementById('parryBtn');
const dashBtn = document.getElementById('dashBtn');

let gameRunning = false;
let player = { x: 100, y: 300, width: 50, height: 50, hp: 100, state: 'idle' };
let ai = { x: 600, y: 300, width: 50, height: 50, hp: 100, state: 'idle', attackTimer: 0 };
let attackTimingWindow = 200; // ms for parry/dash timing

function startGame() {
    prologue.style.display = 'none';
    controls.style.display = 'flex';
    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawAI() {
    ctx.fillStyle = 'red';
    ctx.fillRect(ai.x, ai.y, ai.width, ai.height);
}

function updateAI() {
    ai.attackTimer++;
    if (ai.attackTimer > 100 && ai.state === 'idle') {
        ai.state = 'attacking';
        setTimeout(() => {
            if (ai.state === 'attacking') {
                // Player takes damage if not parried or dashed
                if (player.state !== 'parrying' && player.state !== 'dashing') {
                    player.hp -= 10;
                }
                ai.state = 'idle';
            }
        }, 500); // Attack duration
    } else if (ai.attackTimer > 200) {
        ai.attackTimer = 0;
    }
}

function checkTiming(button) {
    if (ai.state === 'attacking') {
        const timing = Math.abs(ai.attackTimer - 150); // Optimal timing at 150
        if (timing < attackTimingWindow / 2) {
            if (button === 'parry') {
                ai.hp -= 20; // Successful parry damage to AI
                player.state = 'parrying';
            } else if (button === 'dash') {
                player.state = 'dashing';
                player.x += 50; // Dash move
            }
            setTimeout(() => { player.state = 'idle'; }, 300);
        }
    }
}

attackBtn.addEventListener('click', () => {
    if (player.state === 'idle') {
        player.state = 'attacking';
        ai.hp -= 10;
        setTimeout(() => { player.state = 'idle'; }, 300);
    }
});

parryBtn.addEventListener('click', () => checkTiming('parry'));
dashBtn.addEventListener('click', () => checkTiming('dash'));

// Touch support for mobile
attackBtn.addEventListener('touchstart', () => attackBtn.click());
parryBtn.addEventListener('touchstart', () => parryBtn.click());
dashBtn.addEventListener('touchstart', () => dashBtn.click());

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawAI();
    updateAI();

    // HP display
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Player HP: ${player.hp}`, 10, 30);
    ctx.fillText(`AI HP: ${ai.hp}`, 700, 30);

    if (player.hp <= 0 || ai.hp <= 0) {
        gameRunning = false;
        alert(player.hp <= 0 ? '너 졌어!' : '너 이겼어!');
    }

    requestAnimationFrame(gameLoop);
}