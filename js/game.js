// game.js — main game loop with menu, info screen, previews, camera shake

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

  /* ===================== INPUT ===================== */
  const mouse = { x: 0, y: 0 };
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });

  /* ===================== VISUAIS ===================== */
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

  /* ===================== JOGO ===================== */
  const player = createPlayer(canvas);
  const meteorManager = createMeteorManager(canvas, player);
  const buffManager = createBuffManager(canvas, player);

  const state = {
    screen: 'menu', // menu | game | info
    altitude: 0,
    buffMessage: '',
    buffMessageTime: 0,
    shake: 0,
    infoPage: 0
  };

  player.lives = 3;
  player.score = 0;

  /* ===================== SONS ===================== */
  const bgMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
  bgMusic.loop = true;
  bgMusic.volume = 0.2;

  const buffSound = new Audio('https://www.soundjay.com/button/sounds/button-10.mp3');
  const hitSound = new Audio('https://www.soundjay.com/mechanical/sounds/metal-hit-1.mp3');

  /* ===================== MENU ===================== */
  function drawMenu() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    ctx.font = '42px Arial';
    ctx.fillText('Astro Runner', canvas.width/2, 120);

    ctx.font = '22px Arial';
    ctx.fillText('ENTER — Start', canvas.width/2, 170);
    ctx.fillText('I — Info', canvas.width/2, 200);

    ctx.font = '18px Arial';
    ctx.fillText('Highscores', canvas.width/2, 250);
    getHighscores().forEach((s,i)=>{
      ctx.fillText(`${i+1}. ${s.name} — ${Math.floor(s.score)}`, canvas.width/2, 280+i*22);
    });
  }

  /* ===================== INFO ===================== */
  function drawMeteorPreview(x, y, radius, hover) {
  const g = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
  g.addColorStop(0, '#f5deb3');
  g.addColorStop(0.5, hover ? '#ffcc66' : '#964B00');
  g.addColorStop(1, '#000');

  if (hover) {
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 20;
  } else {
    ctx.shadowBlur = 0;
  }

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}
  function drawInfo() { 
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';

  ctx.font = '36px Arial';
  ctx.fillText('Meteoritos Reais (NASA)', canvas.width / 2, 80);

  //este aqui determine maximo de meteoritos
  const list = window.neoCache || [];
  const perPage = 6;
  const start = state.infoPage * perPage;
  const visible = list.slice(start, start + perPage);

  let yStart = 150;

  visible.forEach((m, i) => {
    const diameter =
      m.estimated_diameter?.kilometers?.estimated_diameter_max * 1000 || 50;

    const radius = Math.min(45, Math.log(diameter + 10) * 6);

    const x = canvas.width / 2 - 140;
    const y = yStart + i * 80;

    const dx = mouse.x - x;
    const dy = mouse.y - y;
    const hover = Math.sqrt(dx * dx + dy * dy) < radius;

    drawMeteorPreview(x, y, radius, hover);

    ctx.textAlign = 'left';
    ctx.font = '18px Arial';
    ctx.fillStyle = hover ? '#ffd700' : '#ffffff';
    ctx.fillText(m.name, x + 80, y + 6);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`${Math.floor(diameter)} metros`, x + 80, y + 26);

    if (hover) {
      ctx.textAlign = 'center';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffcc66';
      ctx.fillText('NEO real registado pela NASA', canvas.width / 2, canvas.height - 80);
    }
  });

  ctx.font = '14px Arial';
ctx.fillStyle = '#888';
ctx.fillText(
  `Página ${state.infoPage + 1} / ${Math.ceil(list.length / 6)}`,
  canvas.width / 2,
  canvas.height - 65
);

  ctx.textAlign = 'center';
  ctx.font = '16px Arial';
  ctx.fillStyle = '#66ccff';
  ctx.fillText('ESC — Voltar ao Menu', canvas.width / 2, canvas.height - 40);
}


  /* ===================== INPUT ===================== */
  window.addEventListener('keydown', e=>{
    if(e.code==='Enter' && state.screen==='menu'){
      state.screen='game';
      bgMusic.currentTime=0;
      bgMusic.play().catch(()=>{});
    }
    if(e.code==='KeyI' && state.screen==='menu'){
      state.screen='info';
    }
    if(e.code==='Escape'){
      state.screen='menu';
      bgMusic.pause();
    }
    if (state.screen === 'info') {
    if (e.code === 'ArrowRight') {
      const maxPage = Math.floor(((window.neoCache?.length || 1) - 1) / 6);
      state.infoPage = Math.min(maxPage, state.infoPage + 1);
    }

    if (e.code === 'ArrowLeft') {
      state.infoPage = Math.max(0, state.infoPage - 1);
    }
  }
  });

  /* ===================== UPDATE ===================== */
  function update(t){
    if(state.screen!=='game') return;

    player.update(t);

    buffManager.maybeSpawn(t);
    buffManager.update(16);
    buffManager.updateBuffTimers(16);

    const gain = player.buffs.doubleScore.active ? 0.1 : 0.05;
    player.score += gain;
    state.altitude += gain;

    const prevLives = player.lives;
    meteorManager.maybeSpawn(t, state.altitude);
    meteorManager.update(16, state.altitude);

    if(player.lives < prevLives){
      hitSound.currentTime=0;
      hitSound.play().catch(()=>{});
      state.shake = 15;
    }

    particles.spawn(player.x, player.y+player.size, 'cyan', 2);
    particles.update();

    if(player.lives<=0){
      bgMusic.pause();
      const name = prompt('Game Over! Name:', 'Player') || 'Player';
      saveHighscore(name, player.score);
      state.screen='menu';
      player.lives=3;
      player.score=0;
      meteorManager.objects.length=0;
    }
  }

  /* ===================== RENDER ===================== */
  function render(){
    if(state.screen==='menu'){ drawMenu(); return; }
    if(state.screen==='info'){ drawInfo(); return; }

    ctx.save();
    if(state.shake>0){
      ctx.translate((Math.random()-0.5)*state.shake,(Math.random()-0.5)*state.shake);
      state.shake--;
    }

    ctx.fillStyle='rgb(30,30,50)';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    drawStars();
    particles.draw(ctx);
    meteorManager.draw(ctx);
    buffManager.draw(ctx);
    player.draw(ctx);

    ctx.restore();

    // hover meteoritos
    for(const m of meteorManager.objects){
      const dx=mouse.x-m.x, dy=mouse.y-m.y;
      if(Math.sqrt(dx*dx+dy*dy)<m.size/2){
        ctx.fillStyle='yellow';
        ctx.textAlign='center';
        ctx.fillText(`${m.name} — ${Math.floor(m.mass||m.size)}m`, m.x, m.y-m.size);
      }
    }

    ctx.fillStyle='white';
    ctx.fillText(`Altitude: ${Math.floor(state.altitude)}`,20,30);
    ctx.fillText(`Lives: ${player.lives}`,20,50);
    ctx.fillText(`Score: ${Math.floor(player.score)}`,20,70);
  }

  function loop(t){
    update(t);
    render();
    requestAnimationFrame(loop);
  }

  drawMenu();
  requestAnimationFrame(loop);
}
