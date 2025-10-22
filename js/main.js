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
fetchNEOs().then(() => {
window.neoCache = window.neoCache;
console.log('NEOs fetched and cached');
});


// boot
initGame({ canvas, ctx });