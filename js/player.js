export function createPlayer(canvas){
  const p = {
    x:canvas.width/2,
    y:canvas.height*0.8,
    vx:0,vy:0,
    speed:4,
    size:18,
    color:'#fff'
  };

  const keys={};
  window.addEventListener('keydown',e=>keys[e.code]=true);
  window.addEventListener('keyup',e=>keys[e.code]=false);

  p.update = (t) => {
    if(keys['ArrowLeft']) p.vx=-p.speed;
    else if(keys['ArrowRight']) p.vx=p.speed;
    else p.vx=0;

    if(keys['ArrowUp']) p.vy=-p.speed;
    else if(keys['ArrowDown']) p.vy=p.speed;
    else p.vy=0;

    p.x += p.vx;
    p.y += p.vy;
    p.x = Math.max(p.size, Math.min(canvas.width - p.size, p.x));
    p.y = Math.max(p.size, Math.min(canvas.height - p.size, p.y));
  };

  p.draw = (ctx) => {
    // chama do motor (propulsão)
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

    // corpo da nave
    const grad = ctx.createLinearGradient(p.x - p.size, p.y - p.size, p.x + p.size, p.y + p.size);
    grad.addColorStop(0, '#ddd');
    grad.addColorStop(1, '#fff');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - p.size);
    ctx.lineTo(p.x - p.size/2, p.y + p.size);
    ctx.lineTo(p.x + p.size/2, p.y + p.size);
    ctx.closePath();
    ctx.fill();
  };

  return p;
}
