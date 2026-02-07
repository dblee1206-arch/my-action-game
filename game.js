const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// 플레이어
let player = {
    x: 100,
    y: 400,
    width: 50,
    height: 50,
    speed: 5,
    hp: 100,
    isParrying: false,
    isDodging: false,
    dodgeTimer: 0,
    parryTimer: 0
};

// 적
let enemy = {
    x: 600,
    y: 400,
    width: 50,
    height: 50,
    hp: 100,
    attackTimer: Math.random() * 200 + 100, // 랜덤 공격 타이밍
    isAttacking: false
};

// 입력 처리 (키보드 + 터치)
let keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// 모바일 버튼
document.getElementById('leftBtn').addEventListener('touchstart', () => keys['ArrowLeft'] = true);
document.getElementById('leftBtn').addEventListener('touchend', () => keys['ArrowLeft'] = false);
document.getElementById('rightBtn').addEventListener('touchstart', () => keys['ArrowRight'] = true);
document.getElementById('rightBtn').addEventListener('touchend', () => keys['ArrowRight'] = false);
document.getElementById('attackBtn').addEventListener('touchstart', attack);
document.getElementById('parryBtn').addEventListener('touchstart', parry);
document.getElementById('dodgeBtn').addEventListener('touchstart', dodge);

// 공격 함수
function attack() {
    // 플레이어 공격 로직 (예: 적 HP 깎기)
    if (Math.abs(player.x - enemy.x) < 100) {
        enemy.hp -= 20;
    }
}

// 패링 함수
function parry() {
    player.isParrying = true;
    player.parryTimer = 20; // 20프레임 (약 0.3초) 동안 패링 상태
}

// 회피 함수
function dodge() {
    player.isDodging = true;
    player.dodgeTimer = 30; // 30프레임 동안 회피 (무적 + 대쉬)
    player.x += 100; // 오른쪽 대쉬 (방향 조정 가능)
}

// 게임 루프
function update() {
    // 플레이어 이동
    if (keys['ArrowLeft']) player.x -= player.speed;
    if (keys['ArrowRight']) player.x += player.speed;

    // 적 AI: 랜덤 공격
    enemy.attackTimer--;
    if (enemy.attackTimer <= 0) {
        enemy.isAttacking = true;
        setTimeout(() => {
            if (Math.abs(player.x - enemy.x) < 100) {
                // 패링 체크
                if (player.isParrying) {
                    console.log('패링 성공! 반격');
                    enemy.hp -= 30; // 반격 데미지
                } 
                // 회피 체크
                else if (player.isDodging) {
                    console.log('회피 성공!');
                } 
                else {
                    player.hp -= 20; // 데미지 입음
                }
            }
            enemy.isAttacking = false;
            enemy.attackTimer = Math.random() * 200 + 100;
        }, 200); // 공격 딜레이 0.2초 (타이밍 윈도우)
    }

    // 타이머 감소
    if (player.parryTimer > 0) player.parryTimer--;
    else player.isParrying = false;
    if (player.dodgeTimer > 0) player.dodgeTimer--;
    else player.isDodging = false;

    // 게임 오버 체크
    if (player.hp <= 0 || enemy.hp <= 0) {
        alert('게임 오버!');
        return;
    }

    draw();
    requestAnimationFrame(update);
}

// 그리기
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 플레이어
    ctx.fillStyle = player.isParrying ? '#00FF00' : (player.isDodging ? '#FFFF00' : '#0000FF');
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // 적
    ctx.fillStyle = enemy.isAttacking ? '#FF0000' : '#FF00FF';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    // HP 표시
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Player HP: ${player.hp}`, 10, 30);
    ctx.fillText(`Enemy HP: ${enemy.hp}`, 600, 30);
}

update(); // 게임 시작
