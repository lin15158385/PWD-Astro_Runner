// game.js — main game loop with menu, hover NEO names
import { createPlayer } from './player.js';
import { createMeteorManager } from './meteors.js';

export function initGame({ canvas, ctx }) {
  const player = createPlayer(canvas);
  player.lives = 3;
  player.score = 0;

  const meteorManager = createMeteorManager(canvas, player);

  const state = {
    running: false,
    altitude: 0
  };

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
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Astro Runner', canvas.width / 2, canvas.height / 2 - 40);
    ctx.font = '24px Arial';
    ctx.fillText('Press ENTER to Start', canvas.width / 2, canvas.height / 2 + 10);
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
    state.altitude += 0.05; // aumenta altitude com pontuação
    player.score += 0.05;

    const prevLives = player.lives;
    meteorManager.maybeSpawn(t, state.altitude);
    meteorManager.update(16, state.altitude);

    if (player.lives < prevLives) collisionSound.play();

    if (player.lives <= 0) {
      state.running = false;
      bgMusic.pause();
      setTimeout(() => alert(`Game Over! Score: ${Math.floor(player.score)}`), 50);
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

    player.draw(ctx);
    meteorManager.draw(ctx);

    // hover NEO names
    for (const m of meteorManager.objects) {
      const dx = mouse.x - m.x;
      const dy = mouse.y - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < m.size / 2) {
        ctx.fillStyle = 'yellow';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${m.name} (${Math.floor(m.size)} px)`, m.x, m.y - m.size);
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
