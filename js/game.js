// game.js — main game loop with menu, highscores, particles, buffs

import { createPlayer } from './player.js';
import { createMeteorManager } from './meteors.js';
import { createBuffManager } from './buffs.js';
import { createParticles } from './particles.js';

function getHighscores() {
  return JSON.parse(localStorage.getItem('astroRunnerHighscores')) || [];
}

function saveHighscore(name, score) {
  let scores = getHighscores();
  scores.push({ name, score });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('astroRunnerHighscores', JSON.stringify(scores.slice(0, 7)));
}

export function initGame({ canvas, ctx }) {
  const particles = createParticles();

  const stars = Array.from({ length: 140 }, () => ({
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
  const buffManager = createBuffManager(canvas, player);

  const state = { running: false, altitude: 0 };

  player.lives = 3;
  player.score = 0;

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

    ctx.font = '18px Arial';
    ctx.fillText('Highscores', canvas.width / 2, 210);
    getHighscores().forEach((s, i) => {
      ctx.fillText(`${i + 1}. ${s.name} — ${Math.floor(s.score)}`, canvas.width / 2, 240 + i * 22);
    });
  }

  function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height * 0.8;
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
  });

  function update(t) {
    if (!state.running) return;

    player.update(t);

    buffManager.maybeSpawn(t);
    buffManager.update(16);
    buffManager.updateBuffTimers(16);

    const gain = player.buffs.doubleScore?.active ? 0.1 : 0.05;
    player.score += gain;
    state.altitude += gain;

    meteorManager.maybeSpawn(t, state.altitude);
    meteorManager.update(16, state.altitude);

    particles.spawn(player.x, player.y + player.size, 'cyan', 2);
    particles.update();

    if (player.lives <= 0) {
      state.running = false;
      bgMusic.pause();
      const name = prompt('Game Over! Name:', 'Player') || 'Player';
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

    ctx.fillStyle = `rgb(30,30,50)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawStars();
    particles.draw(ctx);
    player.draw(ctx);
    meteorManager.draw(ctx);
    buffManager.draw(ctx);

    ctx.fillStyle = 'white';
    ctx.fillText(`Altitude: ${Math.floor(state.altitude)}`, 20, 30);
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
