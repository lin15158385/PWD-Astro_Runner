import React from 'react';
import Game from '../game/game.jsx';
import { fetchNEOs } from '../game/nasa.js';

export default function App() {
  /*const canvasRef = React.useRef(null);

  React.useEffect(() => {
    console.log("App.jsx rodando");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

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
  */
    return (
    <Game />
  );
}
