// game.js — main game loop with menu, highscores, hover NEO names
import { createPlayer } from './player.js';
import { createMeteorManager } from './meteors.js';

function getHighscores() {
  return JSON.parse(localStorage.getItem('astroRunnerHighscores')) || [];
}

function saveHighscore(name, score) {
  let scores = getHighscores();
  scores.push({ name, score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 7);
  localStorage.setItem('astroRunnerHighscores', JSON.stringify(scores));
}

export function initGame({ canvas, ctx }) {

  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.5,
    alpha: Math.random(),
    delta: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? -1 : 1)
  }));

  function drawStars() {
    for (const s of stars) {
      s.alpha += s.delta;
      if (s.alpha <= 0 || s.alpha >= 1) s.delta *= -1;
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const player = createPlayer(canvas);
  const meteorManager = createMeteorManager(canvas, player);

  const state = {
    running: false,
    altitude: 0
  };

  player.lives = 3;
  player.score = 0;

  const mouse = { x: 0, y: 0 };
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  const collisionSound = new Audio('https://www.soundjay.com/mechanical/sounds/metal-hit-1.mp3');
  collisionSound.volume = 0.4;

  const bgMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.2;

  function drawMenu() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    ctx.font = '40px Arial';
    ctx.fillText('Astro Runner', canvas.width / 2, 120);

    ctx.font = '22px Arial';
    ctx.fillText('Press ENTER to Start', canvas.width / 2, 160);

    const scores = getHighscores();
    ctx.font = '18px Arial';
    ctx.fillText('Highscores', canvas.width / 2, 210);

    scores.forEach((s, i) => {
      ctx.fillText(
        `${i + 1}. ${s.name} — ${Math.floor(s.score)}`,
        canvas.width / 2,
        240 + i * 22
      );
    });
  }

  function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height * 0.8;
    player.vx = 0;
    player.vy = 0;
    player.lives = 3;
    player.score = 0;

    state.altitude = 0;
    meteorManager.objects.length = 0;
  }

  window.addEventListener('keydown', e => {
    if (e.code === 'Enter' && !state.running) {
      state.running = true;
      bgMusic.play().catch(() => {});
    }
    if (e.code === 'Escape' && state.running) {
      state.running = false;
      bgMusic.pause();
      drawMenu();
    }
  });

  function update(t) {
    if (!state.running) return;

    player.update(t);

    // progressão
    player.score += 0.05;
    state.altitude += 0.05;

    const prevLives = player.lives;

    meteorManager.maybeSpawn(t, state.altitude);
    meteorManager.update(16, state.altitude);

    if (player.lives < prevLives) collisionSound.play();

    if (player.lives <= 0) {
      state.running = false;
      bgMusic.pause();

      const name = prompt('Game Over! Enter your name:', 'Player') || 'Player';
      saveHighscore(name, player.score);

      resetGame();
      drawMenu();
    }
  }

  function render() {
    if (!state.running) {
      drawMenu();
      return;
    }

    const skyTop = Math.min(34 + state.altitude * 0.02, 150);
    const skyBottom = Math.min(26 + state.altitude * 0.015, 120);
    ctx.fillStyle = `rgb(${skyTop}, ${skyBottom}, 23)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();

    player.draw(ctx);
    meteorManager.draw(ctx);

    // Hover meteoritos (nome real + tamanho)
    for (const m of meteorManager.objects) {
      const dx = mouse.x - m.x;
      const dy = mouse.y - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < m.size / 2) {
        ctx.fillStyle = 'yellow';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        const label = m.mass
          ? `${m.name} — ${Math.floor(m.mass)} m`
          : m.name;
        ctx.fillText(label, m.x, m.y - m.size);
      }
    }

    ctx.fillStyle = '#dff7ff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Altitude: ${Math.floor(state.altitude)} m`, 20, 30);
    ctx.fillText(`Lives: ${player.lives}`, 20, 50);
    ctx.fillText(`Score: ${Math.floor(player.score)}`, 20, 70);
  }

  function loop(t) {
    update(t);
    render();
    requestAnimationFrame(loop);
  }

  drawMenu();
  requestAnimationFrame(loop);
}
