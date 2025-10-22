// player.js — free 2D movement
export function createPlayer(canvas){
  const p = {
    x: canvas.width/2,
    y: canvas.height*0.8,
    vx: 0,
    vy: 0,
    speed: 0.5,
    size: 20,
    color: '#fff'
  };

  const keys = {};
  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);

  p.update = (t) => {
    // movimento horizontal
    if(keys['ArrowLeft']) p.vx = -p.speed;
    else if(keys['ArrowRight']) p.vx = p.speed;
    else p.vx = 0;

    // movimento vertical controlado pelo jogador
    if(keys['ArrowUp']) p.vy = -p.speed;
    else if(keys['ArrowDown']) p.vy = p.speed;
    else p.vy = 0;

    // aplica velocidades
    p.x += p.vx;
    p.y += p.vy;

    // limites da tela
    p.x = Math.max(p.size, Math.min(canvas.width - p.size, p.x));
    p.y = Math.max(p.size, Math.min(canvas.height - p.size, p.y));
  };

  p.draw = (ctx) => {
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
  };

  return p;
}
