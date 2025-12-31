export function createPlayer(canvas){
  const p = {
    x: canvas.width/2,
    y: canvas.height*0.8,
    vx: 0, vy: 0,
    speed: 4,
    baseSpeed: 4,
    size: 18,
    color: '#fff',

    buffs: {
      shield: { active:false, time:0 },
      slowTime: { active:false, time:0 },
      doubleScore: { active:false, time:0 },
      magnet: { active:false, time:0 },
      boost: { active:false, time:0 }
    }
  };

  const keys = {};
  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);

  p.update = (t) => {
    if(keys['ArrowLeft']) p.vx = -p.speed;
    else if(keys['ArrowRight']) p.vx = p.speed;
    else p.vx = 0;

    if(keys['ArrowUp']) p.vy = -p.speed;
    else if(keys['ArrowDown']) p.vy = p.speed;
    else p.vy = 0;

    p.x += p.vx;
    p.y += p.vy;

    p.x = Math.max(p.size, Math.min(canvas.width - p.size, p.x));
    p.y = Math.max(p.size, Math.min(canvas.height - p.size, p.y));
  };

  p.draw = (ctx) => {
    // aura do shield
    if(p.buffs.shield.active){
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0,200,255,0.8)';
      ctx.lineWidth = 3;
      ctx.arc(p.x, p.y, p.size+6, 0, Math.PI*2);
      ctx.stroke();
    }

    // chama do motor
    const flame = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.size*2);
    flame.addColorStop(0, 'rgba(0,200,255,0.8)');
    flame.addColorStop(1, 'rgba(0,50,255,0)');
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + p.size);
    ctx.lineTo(p.x - p.size/3, p.y + p.size*2);
    ctx.lineTo(p.x + p.size/3, p.y + p.size*2);
    ctx.closePath();
    ctx.fill();

    // glow
    const glow = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*2);
    glow.addColorStop(0,'rgba(0,180,255,0.4)');
    glow.addColorStop(1,'rgba(0,180,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size*2,0,Math.PI*2);
    ctx.fill();

    // corpo
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - p.size);
    ctx.lineTo(p.x - p.size/2, p.y + p.size);
    ctx.lineTo(p.x + p.size/2, p.y + p.size);
    ctx.closePath();
    ctx.fill();
  };

  return p;
}
