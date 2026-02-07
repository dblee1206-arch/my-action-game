const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; // 가로 넓게
canvas.height = 400; // 세로 좁게

// 플레이어
let player = {
    x: 100,
    y: 300, // 바닥 조정
    width: 50,
    height: 50,
    speed: 5,
    hp: 100,
    isParrying: false,
    isDodging: false,
    dodgeTimer: 0,
    parryTimer: 0,
    attackCount: 0 // AI가 분석할 플레이어 공격 횟수
};

// 적 (AI)
let enemy = {
    x: 600,
    y: 300,
    width: 50,
    height: 50,
    speed: 3, // 느리게 따라감
    hp: 100,
    attackTimer: 100,
    isAttacking: false,
    isDodging: false,
    dodgeTimer: 0,
    aggression: 1 // 플레이어 동작에 따라 증가 (공격적)
};

// 입력 처리
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
    if (Math.abs(player.x - enemy.x) < 100) {
        enemy.hp -= 20;
        player.attackCount++; // AI가 이걸 분석
    }
}

// 패링 함수
function parry() {
    player.isParrying = true;
    player.parryTimer = 15; // 0.25초 윈도우
}

// 회피 함수
function dodge() {
    player.isDodging = true;
    player.dodgeTimer = 20; // 0.3초 무적 + 대쉬
    player.x += keys['ArrowRight'] ? 100 : (keys['ArrowLeft'] ? -100 : 100); // 방향에 따라 대쉬
}

// AI 로직: 플레이어 동작 분석
function enemyAI() {
    // 플레이어 따라 이동
    if (player.x < enemy.x - 50) {
        enemy.x -= enemy.speed;
    } else if (player.x > enemy.x + 50) {
        enemy.x += enemy.speed;
    }

    // 플레이어 공격 횟수 많으면 AI 더 공격적 (aggression 증가)
    if (player.attackCount > 5) enemy.aggression = 1.5;

    // 공격 타이밍: 거리 가까우면 자주 공격
    enemy.attackTimer -= enemy.aggression;
    if (enemy.attackTimer <= 0) {
        enemy.isAttacking = true;
        setTimeout(() => {
            if (Math.abs(player.x - enemy.x) < 100) {
                if (player.isParrying) {
                    console.log('패링 성공! 반격');
                    enemy.hp -= 30;
                } else if (player.isDodging) {
                    console.log('회피 성공!');
                } else {
                    player.hp -= 20;
                }
            }
            enemy.isAttacking = false;
            enemy.attackTimer = Math.random() * 100 + 50 / enemy.aggression; // aggression에 따라 빨라짐
        }, 150); // 공격 윈도우 0.15초
    }

    // AI 회피: 플레이어가 공격하면 랜덤 회피 (플레이어 패턴 분석 시뮬)
    if (player.attackCount > 3 && Math.random() < 0.3) { // 30% 확률로 회피
        enemy.isDodging = true;
        enemy.dodgeTimer = 20;
        enemy.x -= 100; // 왼쪽으로 도망
    }
}

// 게임 루프
function update() {
    // 플레이어 이동
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    enemyAI(); // AI 호출

    // 타이머 감소
    if (player.parryTimer > 0) player.parryTimer--; else player.isParrying = false;
    if (player.dodgeTimer > 0) player.dodgeTimer--; else player.isDodging = false;
    if (enemy.dodgeTimer > 0) enemy.dodgeTimer--; else enemy.isDodging = false;

    // 게임 오버
    if (player.hp <= 0 || enemy.hp <= 0) {
        alert(player.hp <= 0 ? '패배!' : '승리!');
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
    ctx.fillStyle = enemy.isAttacking ? '#FF0000' : (enemy.isDodging ? '#FFFF00' : '#FF00FF');
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    // HP
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(`Player HP: ${player.hp}`, 10, 30);
    ctx.fillText(`Enemy HP: ${enemy.hp}`, canvas.width - 150, 30);
}

update();