import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Game state refs to avoid dependency issues in requestAnimationFrame
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 0, y: -1 });
  const nextDirectionRef = useRef<Point>({ x: 0, y: -1 });
  const foodRef = useRef<Point>({ x: 15, y: 5 });
  const lastUpdateRef = useRef<number>(0);
  const speedRef = useRef<number>(INITIAL_SPEED);
  const requestRef = useRef<number>();

  const generateFood = useCallback((): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      isOccupied = snakeRef.current.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }
    return newFood!;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 10, y: 10 }];
    directionRef.current = { x: 0, y: -1 };
    nextDirectionRef.current = { x: 0, y: -1 };
    foodRef.current = generateFood();
    speedRef.current = INITIAL_SPEED;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setHasStarted(true);
    lastUpdateRef.current = performance.now();
  }, [generateFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (subtle)
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw Food (Neon Pink)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ec4899';
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(
      foodRef.current.x * CELL_SIZE + CELL_SIZE / 2,
      foodRef.current.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Snake (Neon Cyan)
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#22d3ee';
    
    snakeRef.current.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = '#67e8f9';
      } else {
        // Body
        ctx.fillStyle = '#22d3ee';
      }
      
      // Slightly smaller than cell to show gaps
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Reset shadow
    ctx.shadowBlur = 0;
  }, []);

  const update = useCallback((time: number) => {
    if (gameOver || isPaused || !hasStarted) {
      draw();
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    if (time - lastUpdateRef.current > speedRef.current) {
      directionRef.current = nextDirectionRef.current;
      const head = snakeRef.current[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
        return;
      }

      // Check self collision
      if (
        snakeRef.current.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y
        )
      ) {
        setGameOver(true);
        setHighScore((prev) => Math.max(prev, score));
        return;
      }

      const newSnake = [newHead, ...snakeRef.current];

      // Check food collision
      if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
        setScore((s) => {
          const newScore = s + 10;
          // Increase speed slightly every 50 points
          if (newScore % 50 === 0) {
            speedRef.current = Math.max(50, speedRef.current - 10);
          }
          return newScore;
        });
        foodRef.current = generateFood();
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;
      lastUpdateRef.current = time;
    }

    draw();
    requestRef.current = requestAnimationFrame(update);
  }, [gameOver, isPaused, hasStarted, draw, generateFood, score]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && hasStarted && !gameOver) {
        setIsPaused((p) => !p);
        return;
      }

      if (gameOver && e.key === 'Enter') {
        resetGame();
        return;
      }

      if (!hasStarted && e.key === 'Enter') {
        resetGame();
        return;
      }

      if (isPaused || !hasStarted) return;

      const dir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir.y !== 1) nextDirectionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir.y !== -1) nextDirectionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir.x !== 1) nextDirectionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir.x !== -1) nextDirectionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, hasStarted, resetGame]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full max-w-[400px] mb-4 px-2">
        <div className="text-cyan-400 font-mono text-xl font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
          SCORE: {score.toString().padStart(4, '0')}
        </div>
        <div className="text-pink-400 font-mono text-xl font-bold drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
          HIGH: {highScore.toString().padStart(4, '0')}
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="bg-[#050505] border-2 border-cyan-500/50 rounded-lg shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        />

        {!hasStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg">
            <h2 className="text-4xl font-bold text-cyan-400 mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] tracking-widest">
              NEON SNAKE
            </h2>
            <p className="text-pink-400 font-mono mb-6 animate-pulse">Press ENTER to Start</p>
            <div className="text-gray-400 font-mono text-sm text-center">
              Use ARROW KEYS or WASD to move<br/>
              SPACE to pause
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg border border-pink-500/50">
            <h2 className="text-4xl font-bold text-pink-500 mb-2 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]">
              SYSTEM FAILURE
            </h2>
            <p className="text-cyan-400 font-mono text-xl mb-6">FINAL SCORE: {score}</p>
            <button 
              onClick={resetGame}
              className="px-6 py-2 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold font-mono hover:bg-cyan-400 hover:text-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(34,211,238,0.8)]"
            >
              REBOOT (ENTER)
            </button>
          </div>
        )}

        {isPaused && hasStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg">
            <h2 className="text-3xl font-bold text-cyan-400 tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
              PAUSED
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}
