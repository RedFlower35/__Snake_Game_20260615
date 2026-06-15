'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameBoard } from './GameBoard';
import { ScoreBoard } from './ScoreBoard';

const GRID_SIZE = 20;
const INITIAL_SPEED = 200;

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  const playEatSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 優化 bite 聲音：使用 square 波形更銳利，並縮短持續時間
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  };

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 5, y: 5 });
    setDirection('RIGHT');
    if (score > highScore) setHighScore(score);
    setScore(0);
    setIsGameOver(false);
  }, [score, highScore]);

  const moveSnake = useCallback(() => {
    if (isGameOver) return;

    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // 1. 牆壁碰撞偵測
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setIsGameOver(true);
        return prevSnake;
      }

      // 2. 身體碰撞偵測 (修正：檢查碰撞時不包含即將移動的尾巴)
      const willEat = (head.x === food.x && head.y === food.y);
      const bodyToCheck = willEat ? prevSnake : prevSnake.slice(0, -1);
      if (bodyToCheck.some(segment => segment.x === head.x && segment.y === head.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      // 建立新的蛇身
      const newSnake = [head, ...prevSnake];

      if (!willEat) {
        newSnake.pop();
      } else {
        setScore(s => s + 10);
        playEatSound();
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        });
      }

      return newSnake;
    });
  }, [direction, food, isGameOver]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    if (!isGameOver) {
      gameInterval.current = setInterval(moveSnake, INITIAL_SPEED);
      return () => {
        if (gameInterval.current) clearInterval(gameInterval.current);
      };
    }
  }, [moveSnake, isGameOver]);

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#050c05] text-[#e0f0e0] font-sans">
      <header className="w-full h-20 bg-[#0a1f0a] border-b border-[#1a3a1a] flex items-center justify-between px-8 shadow-2xl">
        <h1 className="text-2xl font-bold tracking-widest uppercase text-[#4ade80]">Neon Snake</h1>
        <div className="flex space-x-12">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-tighter opacity-60">Score</p>
            <p className="text-xl font-mono font-bold text-[#facc15]">{score.toString().padStart(5, '0')}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-tighter opacity-60">High</p>
            <p className="text-xl font-mono font-bold text-white">{highScore.toString().padStart(5, '0')}</p>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-8 gap-8 w-full bg-[radial-gradient(circle_at_50%_50%,#0a1f0a_0%,#050c05_100%)]">
        <GameBoard snake={snake} food={food} gridSize={GRID_SIZE} direction={direction} />
        {isGameOver && <div className="text-[#facc15] font-bold mt-4 text-2xl font-mono tracking-widest animate-pulse">GAME OVER</div>}
        <button
          onClick={resetGame}
          className="mt-6 px-8 py-3 bg-[#4ade80] text-[#050c05] font-bold rounded-lg uppercase tracking-widest text-sm active:scale-95 transition-transform"
        >
          Restart Game
        </button>
      </main>
    </div>
  );
};
