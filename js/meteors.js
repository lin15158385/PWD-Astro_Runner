import { spawnMeteorFromNEO, spawnProceduralMeteor } from './nasa.js';

export function createMeteorManager(canvas, player){
  const objects = [];
  let lastSpawn = 0;
  let spawnInterval = 900;

  function maybeSpawn(t, altitude){
    if(t - lastSpawn > spawnInterval){
      lastSpawn = t;
      const altFactor = Math.min(1, altitude/400);
      const r = Math.random();
      if(r < 0.6){
        if(window.neoCache && window.neoCache.length>0){
          const neo = window.neoCache[Math.floor(Math.random()*window.neoCache.length)];
          const m = spawnMeteorFromNEO(neo, canvas);
          m.color = `hsl(${Math.random()*30+10}, 40%, ${Math.random()*30+30}%)`;
          objects.push(m);
        } else {
          objects.push(spawnProceduralMeteor(canvas));
        }
      }
      spawnInterval = 900 - Math.min(500, altitude*0.6);
    }
  }

  function update(dt, altitude){
    const gravityBase = 0.12;
    const altNorm = Math.min(1000, altitude)/1000;
    let gravity = gravityBase * (1 - 0.6*Math.exp(-altNorm*6) + altNorm*1.2);
    gravity = Math.max(0.04, Math.min(0.36, gravity));
    if(player.buffs.slowTime.active) gravity *= 0.4;
    
    for(let i=objects.length-1;i>=0;i--){
      const o = objects[i];
      o.y += (o.speed * 100 * gravity) * (dt/16);
      const dx = Math.abs(o.x - player.x);
      const dy = Math.abs(o.y - player.y);
      if(dx < (o.size/2 + player.size) && dy < (o.size/2 + player.size)){
        if(o.type==='meteor' && !player.buffs.shield.active){
        player.lives -= 1;
        } 
        objects.splice(i,1);
      } else if(o.y>canvas.height+120){
        objects.splice(i,1);
      }
    }
  }

  function draw(ctx){
    for(const o of objects){
      const gradient = ctx.createRadialGradient(o.x, o.y, o.size*0.2, o.x, o.y, o.size);
      gradient.addColorStop(0, '#f5deb3');
      gradient.addColorStop(0.4, o.color || '#964B00');
      gradient.addColorStop(1, '#000');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.ellipse(o.x, o.y, o.size/2, o.size/2, 0, 0, Math.PI*2);
      ctx.fill();

      // pontos de textura
      for(let j=0;j<4;j++){
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        const angle = Math.random()*Math.PI*2;
        const r = o.size*0.3*Math.random();
        ctx.beginPath();
        ctx.arc(o.x + Math.cos(angle)*r, o.y + Math.sin(angle)*r, o.size*0.05, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }

  return { objects, maybeSpawn, update, draw };
}
