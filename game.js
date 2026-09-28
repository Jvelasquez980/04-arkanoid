const W = 800, H = 600;
const BALL_SPEED = 300;      // px/s, constante
const PADDLE_SPEED = 500;    // px/s, teclado
const POINTS_PER_BLOCK = 10;
const INITIAL_LIVES = 3;
const ROW_COLORS = ['red', 'yellow', 'cyan', 'green', 'magenta', 'hotpink'];
const MAX_DT = 0.05;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  state: 'ready',   // 'ready' | 'playing' | 'won' | 'lost'
  score: 0,
  lives: INITIAL_LIVES,
  paddle: { x: (W - 162) / 2, y: 560, w: 162, h: 14 },
  ball: { x: 0, y: 0, w: 16, h: 16, vx: 0, vy: 0 },
  blocks: [],
};

function stickBallToPaddle() {
  const { paddle, ball } = game;
  ball.x = paddle.x + (paddle.w - ball.w) / 2;
  ball.y = paddle.y - ball.h;
}

function update(dt) {
  if (game.state === 'ready') stickBallToPaddle();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  const { paddle, ball } = game;
  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x, ball.y, ball.w, ball.h);
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
  stickBallToPaddle();
  requestAnimationFrame((now) => {
    lastTime = now;
    loop(now);
  });
});
