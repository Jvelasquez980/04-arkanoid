const W = 800, H = 600;
const BALL_SPEED = 300;      // px/s, constante
const PADDLE_SPEED = 500;    // px/s, teclado
const POINTS_PER_BLOCK = 10;
const INITIAL_LIVES = 3;
const ROW_COLORS = ['red', 'yellow', 'cyan', 'green', 'magenta', 'hotpink'];
const MAX_DT = 0.05;
const EXPLOSION_FRAME_COUNT = 4;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  state: 'ready',   // 'ready' | 'playing' | 'won' | 'lost'
  score: 0,
  lives: INITIAL_LIVES,
  paddle: { x: (W - 162) / 2, y: 560, w: 162, h: 14 },
  ball: { x: 0, y: 0, w: 16, h: 16, vx: 0, vy: 0 },
  blocks: [],
  explosions: [],   // { x, y, w, h, color, elapsed } elapsed en ms
};

function stickBallToPaddle() {
  const { paddle, ball } = game;
  ball.x = paddle.x + (paddle.w - ball.w) / 2;
  ball.y = paddle.y - ball.h;
}

const keys = { left: false, right: false };
let lastInput = 'mouse';   // 'mouse' | 'keyboard'; gana el último usado

function clampPaddle() {
  const { paddle } = game;
  paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));
}

function keyToDir(code) {
  if (code === 'ArrowLeft' || code === 'KeyA') return 'left';
  if (code === 'ArrowRight' || code === 'KeyD') return 'right';
  return null;
}

function resetGame() {
  game.score = 0;
  game.lives = INITIAL_LIVES;
  game.blocks = createBlocks();
  game.explosions = [];
  game.ball.vx = 0;
  game.ball.vy = 0;
  game.state = 'ready';
  stickBallToPaddle();
}

// Espacio o clic: lanza la bola en `ready`, reinicia en `won`/`lost`
function primaryAction() {
  if (game.state === 'won' || game.state === 'lost') resetGame();
  else launchBall();
}

function launchBall() {
  if (game.state !== 'ready') return;
  // Hacia arriba, con desviación aleatoria de ±15° respecto a la vertical
  const angle = (Math.random() * 2 - 1) * (Math.PI / 12);
  game.ball.vx = BALL_SPEED * Math.sin(angle);
  game.ball.vy = -BALL_SPEED * Math.cos(angle);
  game.state = 'playing';
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (!e.repeat) primaryAction();
    return;
  }
  const dir = keyToDir(e.code);
  if (!dir) return;
  e.preventDefault();
  keys[dir] = true;
  lastInput = 'keyboard';
});

window.addEventListener('keyup', (e) => {
  const dir = keyToDir(e.code);
  if (dir) keys[dir] = false;
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  game.paddle.x = mx - game.paddle.w / 2;
  clampPaddle();
  lastInput = 'mouse';
});

canvas.addEventListener('mousedown', () => primaryAction());

function updateBall(dt) {
  const { ball } = game;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x < 0) {
    ball.x = 0;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x + ball.w > W) {
    ball.x = W - ball.w;
    ball.vx = -Math.abs(ball.vx);
  }
  if (ball.y < 0) {
    ball.y = 0;
    ball.vy = Math.abs(ball.vy);
  }

  const { paddle } = game;
  if (
    ball.vy > 0 &&
    ball.x + ball.w > paddle.x && ball.x < paddle.x + paddle.w &&
    ball.y + ball.h > paddle.y && ball.y < paddle.y + paddle.h
  ) {
    ball.y = paddle.y - ball.h;
    ball.vy = -Math.abs(ball.vy);
  }

  collideBlocks();
  if (game.blocks.every((b) => !b.alive)) {
    game.state = 'won';
    ball.vx = 0;
    ball.vy = 0;
    return;
  }

  if (ball.y > H) loseLife();
}

function createBlocks() {
  const BLOCK_W = 64, BLOCK_H = 32, COLS = 10, TOP = 60;
  const left = (W - COLS * BLOCK_W) / 2;
  const blocks = [];
  ROW_COLORS.forEach((color, row) => {
    for (let col = 0; col < COLS; col++) {
      blocks.push({
        x: left + col * BLOCK_W,
        y: TOP + row * BLOCK_H,
        w: BLOCK_W,
        h: BLOCK_H,
        color,
        alive: true,
      });
    }
  });
  return blocks;
}

function collideBlocks() {
  const { ball } = game;
  for (const b of game.blocks) {
    if (!b.alive) continue;
    const overlapX = Math.min(ball.x + ball.w, b.x + b.w) - Math.max(ball.x, b.x);
    const overlapY = Math.min(ball.y + ball.h, b.y + b.h) - Math.max(ball.y, b.y);
    if (overlapX <= 0 || overlapY <= 0) continue;

    // Reflejo según el eje de menor penetración
    const ballCx = ball.x + ball.w / 2, ballCy = ball.y + ball.h / 2;
    if (overlapX < overlapY) {
      const fromLeft = ballCx < b.x + b.w / 2;
      ball.x += fromLeft ? -overlapX : overlapX;
      ball.vx = fromLeft ? -Math.abs(ball.vx) : Math.abs(ball.vx);
    } else {
      const fromTop = ballCy < b.y + b.h / 2;
      ball.y += fromTop ? -overlapY : overlapY;
      ball.vy = fromTop ? -Math.abs(ball.vy) : Math.abs(ball.vy);
    }
    b.alive = false;
    game.explosions.push({ x: b.x, y: b.y, w: b.w, h: b.h, color: b.color, elapsed: 0 });
    game.score += POINTS_PER_BLOCK;
    break;   // un bloque por frame
  }
}

function loseLife() {
  const { ball } = game;
  game.lives--;
  ball.vx = 0;
  ball.vy = 0;
  if (game.lives <= 0) {
    game.state = 'lost';
  } else {
    game.state = 'ready';
    stickBallToPaddle();
  }
}

function updateExplosions(dt) {
  for (const e of game.explosions) e.elapsed += dt * 1000;
  game.explosions = game.explosions.filter((e) => e.elapsed < EXPLOSION_DURATION);
}

function update(dt) {
  updateExplosions(dt);
  if (lastInput === 'keyboard') {
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    game.paddle.x += dir * PADDLE_SPEED * dt;
    clampPaddle();
  }
  if (game.state === 'ready') stickBallToPaddle();
  else if (game.state === 'playing') updateBall(dt);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  const { paddle, ball } = game;
  for (const b of game.blocks) {
    if (b.alive) drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.w, b.h);
  }
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x, ball.y, ball.w, ball.h);
  drawHud();
  if (game.state === 'won') drawOverlay('¡Victoria!');
  else if (game.state === 'lost') drawOverlay('Game Over');
}

function drawHud() {
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + game.score, 16, 16);
  const size = 20, gap = 6;
  for (let i = 0; i < game.lives; i++) {
    drawSprite(ctx, 'ball', W - 16 - (i + 1) * size - i * gap, 16, size, size);
  }
}

function drawOverlay(title) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 56px monospace';
  ctx.fillText(title, W / 2, H / 2 - 30);
  ctx.font = '22px monospace';
  ctx.fillText('Score: ' + game.score, W / 2, H / 2 + 20);
  ctx.fillText('Espacio o clic para reiniciar', W / 2, H / 2 + 60);
}

let lastTime = 0;
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, MAX_DT);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

loadSpritesheet(() => {
  game.blocks = createBlocks();
  stickBallToPaddle();
  requestAnimationFrame((now) => {
    lastTime = now;
    loop(now);
  });
});
