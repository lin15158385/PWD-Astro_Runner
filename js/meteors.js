// meteors.js — meteor generation, update, collision
import { spawnMeteorFromNEO, spawnProceduralMeteor } from './nasa.js';

export function createMeteorManager(canvas, player) {
  const objects = [];
  let lastSpawn = 0;
  let spawnInterval = 900;

  function maybeSpawn(t, altitude) {
    if (t - lastSpawn > spawnInterval) {
      lastSpawn = t;

      let meteor;
      if (window.neoCache && window.neoCache.length > 0) {
        const neo = window.neoCache[Math.floor(Math.random() * window.neoCache.length)];
        meteor = spawnMeteorFromNEO(neo, canvas);
      } else {
        meteor = spawnProceduralMeteor(canvas);
      }

      objects.push(meteor);

      spawnInterval = 900 - Math.min(500, altitude * 0.6);
    }
  }

  function update(dt, altitude) {
    const gravityBase = 0.12;
    const altNorm = Math.min(1000, altitude) / 1000;
    let gravity = gravityBase * (1 - 0.6 * Math.exp(-altNorm * 6) + altNorm * 1.2);
    gravity = Math.max(0.04, Math.min(0.36, gravity));

    for (let i = objects.length - 1; i >= 0; i--) {
      const o = objects[i];
      o.y += (o.speed * 100 * gravity) * (dt / 16);

      const dx = Math.abs(o.x - player.x);
      const dy = Math.abs(o.y - player.y);

      if (dx < (o.size / 2 + player.size) && dy < (o.size / 2 + player.size)) {
        if (o.type === 'meteor') player.lives -= 1;
        objects.splice(i, 1);
      } else if (o.y > canvas.height + 120) {
        objects.splice(i, 1);
      }
    }
  }

  function draw(ctx) {
    for (const o of objects) {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = o.color || '#6a3a2a';
      ctx.ellipse(o.x, o.y, o.size / 2, o.size / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  return { objects, maybeSpawn, update, draw };
}
