// nasa.js — fetch NEOs + procedural meteors


export const neoCache = [];


export async function fetchNEOs(API_KEY='DEMO_KEY'){
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth()+1).padStart(2,'0');
const dd = String(today.getDate()).padStart(2,'0');
const start = `${yyyy}-${mm}-${dd}`;
const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${start}&api_key=${API_KEY}`;
try{
const res = await fetch(url);
if(!res.ok) throw new Error('API error '+res.status);
const data = await res.json();
const objs = data.near_earth_objects[start] || [];
neoCache.push(...objs);
console.log(`Fetched ${objs.length} NEOs`);
}catch(err){
console.warn('Failed to fetch NEOs, using procedural meteors',err);
}
}


export function spawnMeteorFromNEO(neo, canvas){
const dia = neo.estimated_diameter ? (neo.estimated_diameter.kilometers.estimated_diameter_max*1000) : 50;
const sizePx = Math.min(120, Math.max(18, Math.log(dia+10)*8));
const left = Math.random()*(canvas.width-80)+40;
const speed = Math.min(0.7,0.1 + Math.log(dia+20)*0.002);
return { type:'meteor', name: neo.name || 'NEO', size: sizePx, x:left, y:-sizePx, speed, mass:dia };
}


export function spawnProceduralMeteor(canvas){
const size = Math.random()*68 + 12;
return { type:'meteor', name: 'Meteoro', size, x:Math.random()*(canvas.width-80)+40, y:-size, speed:0.12+Math.random()*0.5, mass:size };
}