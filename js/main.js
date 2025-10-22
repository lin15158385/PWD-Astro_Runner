// main.js — entry point
import { initGame } from './game.js';
import { fetchNEOs } from './nasa.js';


// full-window canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');


function resize() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();


// fetch NEOs from NASA and store globally
window.neoCache = [];
fetchNEOs().then(neos => {
  window.neoCache = neos;   // guardar o array retornado
  console.log('NEOs fetched and cached:', window.neoCache.length);
});

// boot
initGame({ canvas, ctx });