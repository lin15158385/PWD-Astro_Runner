export function createBuffManager(canvas, player){
  const objects = [];
  let lastSpawn = 0;

  function spawn(){
    const r = Math.random();
    let type;

    if(r < 0.15) type = 'shield';
    else if(r < 0.25) type = 'doubleScore';
    else if(r < 0.35) type = 'slowTime';
    else if(r < 0.45) type = 'boost';
    else if(r < 0.55) type = 'scorePlus';
    else if(r < 0.65) type = 'scoreMinus';
    else return;

    objects.push({
      type,
      x: Math.random() * (canvas.width - 60) + 30,
      y: -30,
      size: 14,
      speed: 1
    });
  }

  function maybeSpawn(t){
    if(t - lastSpawn > 2500){
      lastSpawn = t;
      spawn();
    }
  }

  function update(dt){
    for(let i = objects.length-1; i >= 0; i--){
      const o = objects[i];
      o.y += o.speed * (dt/16);

      const dx = Math.abs(o.x - player.x);
      const dy = Math.abs(o.y - player.y);

      if(dx < o.size + player.size && dy < o.size + player.size){
        apply(o.type);
        objects.splice(i,1);
      } else if(o.y > canvas.height+40){
        objects.splice(i,1);
      }
    }
  }

  function apply(type){
    switch(type){
      case 'shield':
        player.buffs.shield = { active:true, time:5000 };
        break;
      case 'doubleScore':
        player.buffs.doubleScore = { active:true, time:6000 };
        break;
      case 'slowTime':
        player.buffs.slowTime = { active:true, time:5000 };
        break;
      case 'boost':
        player.buffs.boost = { active:true, time:4000 };
        player.speed = player.baseSpeed * 1.7;
        break;
      case 'scorePlus':
        player.score += 100;
        break;
      case 'scoreMinus':
        player.score = Math.max(0, player.score - 100);
        break;
    }
  }

  function updateBuffTimers(dt){
    for(const b in player.buffs){
      const buff = player.buffs[b];
      if(buff.active){
        buff.time -= dt;
        if(buff.time <= 0){
          buff.active = false;
          if(b === 'boost') player.speed = player.baseSpeed;
        }
      }
    }
  }

  function draw(ctx){
    for(const o of objects){
      ctx.fillStyle =
        o.type === 'shield' ? '#00ccff' :
        o.type === 'doubleScore' ? '#ffd700' :
        o.type === 'slowTime' ? '#66f' :
        o.type === 'boost' ? '#0f0' :
        o.type === 'scorePlus' ? '#0f0' :
        '#f00';

      ctx.beginPath();
      ctx.arc(o.x, o.y, o.size, 0, Math.PI*2);
      ctx.fill();
    }
  }

  return { objects, maybeSpawn, update, updateBuffTimers, draw };
}
