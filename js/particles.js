// particles.js — simple particle system

export function createParticles() {
  const particles = [];

  function spawn(x, y, color = 'white', count = 6) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.5 + 0.5,
        life: 40 + Math.random() * 20,
        size: Math.random() * 2 + 1,
        color
      });
    }
  }

  function update() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03;
      p.life--;

      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function draw(ctx) {
    for (const p of particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / 60);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  return { spawn, update, draw };
}
