import React, { useRef, useState, useEffect } from 'react';
import { createPlayer } from './player.js';
import { createMeteorManager } from './meteors.js';
import { createBuffManager } from './buffs.js';
import { createParticles } from './particles.js';
import { fetchNEOs } from '../game/nasa.js';
import { supabase } from '../game/supabase.js';

function getHighscores() {
  return JSON.parse(localStorage.getItem('astroRunnerHighscores')) || [];
}

function saveHighscore(name, score) {
  let scores = getHighscores();
  scores.push({ name, score });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('astroRunnerHighscores', JSON.stringify(scores.slice(0, 7)));

  saveHighscoreSupabase(name, score);
}

async function saveHighscoreSupabase(name, score) {
  const { error } = await supabase
    .from('highscores')
    .insert([{
      name: String(name),
      score: Math.floor(Number(score)) // garante que seja um inteiro
    }]);

  if (error) {
    console.error('Supabase error:', error);
  } else {
    console.log('Highscore salvo com sucesso!');
  }
}

async function fetchGlobalHighscores() {
  try {
    const { data, error } = await supabase
      .from('highscores')      // tabela no Supabase
      .select('*')
      .order('score', { ascending: false })
      .limit(7);
      console.log('Highscore fetch com sucesso!');
    if (error) throw error;
    return data; // array com { name, score }
  } catch (err) {
    console.warn('Erro ao buscar ranking global:', err.message);
    return null;
  }
}

export default function Game() {
  const canvasRef = useRef(null);
  const [state, setState] = useState({
    screen: 'menu',
    infoPage: 0
  });
  
  console.log("initGame rodando!");

  const shipIdleOffset = useRef(0);
  const shake = useRef(0);
  const altitude = useRef(0);

  // Refs para manter os valores atuais de screen e infoPage dentro do useEffect
  const screenRef = useRef(state.screen);
  const infoPageRef = useRef(state.infoPage);

  let bgMusic = null;
  let musicPlaying = false;

  useEffect(() => {
  console.log("App.jsx rodando");
  const canvas = canvasRef.current;

  // tamanho inicial
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // resize
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', resize);

  // NASA → GLOBAL (como o jogo espera)
  fetchNEOs().then(neos => {
     window.neoCache = neos;
  });

  return () => {
    window.removeEventListener('resize', resize);
  };
  }, []);

  const [globalHighscores, setGlobalHighscores] = useState([]);


  useEffect(() => {
  async function loadScores() {
    const scores = await fetchGlobalHighscores();
    if (scores) {
      setGlobalHighscores(scores);
    }
  }
  loadScores();
}, []);

const globalHighscoresRef = useRef([]);
useEffect(() => {
  globalHighscoresRef.current = globalHighscores;
}, [globalHighscores]);

  useEffect(() => { screenRef.current = state.screen; }, [state.screen]);
  useEffect(() => { infoPageRef.current = state.infoPage; }, [state.infoPage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Estado do mouse
    const mouse = { x: 0, y: 0 };
    // Captura o movimento do mouse no canvas
    const handleMouseMove = e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Sons do jogo
    const bgMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.2;
    const buffSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    buffSound.volume = 0.8;
    const hitSound = new Audio('https://actions.google.com/sounds/v1/cartoon/metal_twang.ogg');
    hitSound.volume = 0.8;

    // Criando objetos do jogo uma única vez
    const particles = createParticles();
    // Cria estrelas aleatórias para o fundo (com porcentagem)
    const stars = Array.from({ length: 140 }, () => ({
      xPercent: Math.random(),  // posição relativa (0 a 1)
      yPercent: Math.random(),
      size: Math.random() * 1.5,
      alpha: Math.random(),
      delta: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? -1 : 1)
    }));

    const player = createPlayer(canvas);
    const meteorManager = createMeteorManager(canvas, player);
    const buffManager = createBuffManager(canvas, player);
    player.lives = 3;
    player.score = 0;

    // Desenha as estrelas do fundo com efeito de cintilação
    function drawStars() {
  for (const s of stars) {
    s.alpha += s.delta;
    if (s.alpha <= 0 || s.alpha >= 1) s.delta *= -1;

    const x = s.xPercent * canvas.width;
    const y = s.yPercent * canvas.height;

    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}


  
    // Desenha o menu inicial (título, instruções, placar)
    function drawMenu() {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.font = '42px Arial';
      ctx.fillText('Astro Runner', canvas.width / 2, 120);
      ctx.font = '22px Arial';
      ctx.fillText('ENTER — Iniciar', canvas.width / 2, 170);
      ctx.fillText('I — Informações', canvas.width / 2, 200);

      // Highscores esquerda
      ctx.textAlign = 'left';
      ctx.font = '18px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText('Highscores', 20, 30);
      getHighscores().forEach((s, i) => {
        ctx.fillText(`${i + 1}. ${s.name} — ${Math.floor(s.score)}`, 20, 50 + i * 18);
      });

      // --- Highscores globais (direita) ---
      ctx.textAlign = 'right';
      ctx.fillStyle = '#66ff66';
      ctx.fillText('Global Ranking', canvas.width - 20, 30);
      const globalScores = globalHighscoresRef.current;
      

      if (globalScores.length > 0) {
        globalScores.forEach((s, i) => {
          ctx.fillText(`${i + 1}. ${s.name} — ${Math.floor(s.score)}`, canvas.width - 20, 50 + i * 18);
        });
      } else {
        ctx.fillText('Loading...', canvas.width - 20, 50);
      }

      // Nave flutuante
      shipIdleOffset.current = Math.sin(Date.now() * 0.002) * 10;
      player.y = canvas.height * 0.8 + shipIdleOffset.current;
      player.draw(ctx);
      drawStars();
    }


    // Desenha um meteorito de pré-visualização (no painel de informação)
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

    // Desenha a tela de informações (lista de meteoritos)
    function drawInfo() {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.font = '18px Arial';
      ctx.fillText('Meteoritos Reais (NASA)', canvas.width / 2, 80);

      const list = window.neoCache || [];
      const perPage = 6;
      const start = infoPageRef.current * perPage;
      const visible = list.slice(start, start + perPage);
      let yStart = 150;

      visible.forEach((m, i) => {
        const diameter = m.estimated_diameter?.kilometers?.estimated_diameter_max * 1000 || 50;
        const radius = Math.min(45, Math.log(diameter + 10) * 6);
        const x = canvas.width / 2 - 140;
        const y = yStart + i * 80;
        const dx = mouse.x - x;
        const dy = mouse.y - y;
        const hover = Math.sqrt(dx * dx + dy * dy) < radius;

        drawMeteorPreview(x, y, radius, hover);
        ctx.fillStyle = hover ? 'yellow' : 'white';
        ctx.textAlign = 'left';
        
        // Apenas nome e tamanho
        ctx.fillText(`Name: ${m.name}`, x + radius + 80, y);
        ctx.fillText(`Size: ${m.size || Math.round(diameter)}m`, x + radius + 80, y + 20);
      });

      // Instruções de navegação
      ctx.font = '18px Arial';
      ctx.fillStyle = '#66ccff';
      ctx.textAlign = 'center';
      ctx.fillText('Previsões de meteoritos:', canvas.width / 2, 130 + visible.length * 80);
      const totalPages = Math.ceil(list.length / perPage);

      ctx.fillText(`Página ${infoPageRef.current + 1} de ${totalPages}`, canvas.width / 2,canvas.height - 80);
      ctx.fillText('← Página Anterior   → Próxima Página', canvas.width / 2, canvas.height - 60);
      ctx.fillText('ESC — Voltar ao Menu', canvas.width / 2, canvas.height - 20);
    }

    // Atualiza a lógica do jogo a cada frame
    function update(t) {
      // Tela de menu: animação da nave
      if (screenRef.current === 'menu') {
        shipIdleOffset.current = Math.sin(Date.now() * 0.002) * 10;
        player.y = canvas.height * 0.8 + shipIdleOffset.current;
      }
      if (screenRef.current !== 'game') {
        // Se não estiver no modo de jogo, não atualiza a lógica de jogo
        return;
      }
      // Lógica do jogo
      player.update(t);
      buffManager.maybeSpawn(t);
      buffManager.update(16);
      buffManager.updateBuffTimers(16);

      const gain = player.buffs.doubleScore.active ? 0.1 : 0.05;
      player.score += gain;
      altitude.current += gain;

      const prevLives = player.lives;
      const currentAltitude = altitude.current;
      meteorManager.maybeSpawn(t, currentAltitude);
      meteorManager.update(16, currentAltitude);

      // Se perdeu vida, toca som e treme a tela
      if (player.lives < prevLives) {
        hitSound.currentTime = 0;
        hitSound.play().catch(() => {});
        shake.current = 15;
      }
      // Partículas na cauda da nave
      particles.spawn(player.x, player.y + player.size, 'cyan', 2);
      particles.update();

      // Fim de jogo
      if (player.lives <= 0) {
        
      if (bgMusic && musicPlaying) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        musicPlaying = false;
      }

        const name = prompt('Game Over! Name:', 'Player') || 'Player';
        saveHighscore(name, player.score);
        // Reinicia o jogo
        setState(prev => ({ ...prev, screen: 'menu' }));
        screenRef.current = 'menu';
        player.lives = 3;
        player.score = 0;
        meteorManager.objects.length = 0;
        altitude.current = 0;

      }
    }

    // Desenha tudo no canvas a cada frame
    function render() {
      // Telas estáticas
      if (screenRef.current === 'menu') {
        drawMenu();
        return;
      }
      if (screenRef.current === 'info') {
        drawInfo();
        return;
      }

      // Tela de jogo
      ctx.save();
      if (shake.current > 0) {
        ctx.translate(
          (Math.random() - 0.5) * shake.current,
          (Math.random() - 0.5) * shake.current
        );
        shake.current -= 1;
      }
      ctx.fillStyle = 'rgb(30,30,50)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawStars();
      particles.draw(ctx);
      meteorManager.draw(ctx);
      buffManager.draw(ctx);
      player.draw(ctx);
      ctx.restore();

      // Informações de hover nos meteoritos
      for (const m of meteorManager.objects) {
        const dx = mouse.x - m.x;
        const dy = mouse.y - m.y;
        if (Math.sqrt(dx * dx + dy * dy) < m.size / 2) {
          ctx.fillStyle = 'yellow';
          ctx.textAlign = 'center';
          ctx.fillText(`${m.name} — ${Math.floor(m.mass || m.size)}m`, m.x, m.y - m.size);
        }
      }

      // HUD: altitude, vidas e pontuação
      const fontScale = canvas.width / 800;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.font = `${8 * fontScale}px Arial`;
      ctx.fillText(`Altitude: ${Math.floor(altitude.current)}`, 20, 30);
      ctx.fillText(`Lives: ${player.lives}`, 20, 50);
      ctx.fillText(`Score: ${Math.floor(player.score)}`, 20, 70);
    }

    // Loop principal com requestAnimationFrame
    let animationFrameId;
    function loop(t) {
      update(t);
      render();
      animationFrameId = requestAnimationFrame(loop);
    }
    // Inicia no menu
    drawMenu();
    animationFrameId = requestAnimationFrame(loop);

    // Cleanup: remove event listeners e para a animação
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handler de teclado (fora do useEffect principal para usar setState)
  const handleKeyDown = e => {
    // Iniciar jogo
    if (
  (e.key === 'Enter' || e.code === 'NumpadEnter' || e.code === 'KeyE') &&
  screenRef.current === 'menu'
) {
  setState(prev => ({ ...prev, screen: 'game' }));
  screenRef.current = 'game';

  if (!bgMusic) {
    bgMusic = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.2;
  }

  if (musicPlaying== false) {
    bgMusic.currentTime = 0;
    bgMusic.play().catch(() => {});
    musicPlaying = true;
  }

  }
    // Ir para informações
    if (e.key.toLowerCase() === 'i' && screenRef.current === 'menu') {
      setState(prev => ({ ...prev, screen: 'info' }));
      screenRef.current = 'info';
    }
    // Voltar ao menu
    if (e.key === 'Escape') {
    setState(prev => ({ ...prev, screen: 'menu' }));
    screenRef.current = 'menu';

    if (bgMusic && musicPlaying) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      musicPlaying = false;
    }
}
    // Navegar páginas de info
    if (screenRef.current === 'info') {
      const maxPage = Math.floor(((window.neoCache?.length || 1) - 1) / 6);
      if (e.code === 'ArrowRight') {
        const newPage = Math.min(infoPageRef.current + 1, maxPage);
        setState(prev => ({ ...prev, infoPage: newPage }));
        infoPageRef.current = newPage;
      }
      if (e.code === 'ArrowLeft') {
        const newPage = Math.max(infoPageRef.current - 1, 0);
        setState(prev => ({ ...prev, infoPage: newPage }));
        infoPageRef.current = newPage;
      }
    }
  };


  // Adiciona listener de teclado (mount/unmount)
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
}
