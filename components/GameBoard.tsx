import React from 'react';

interface Position {
  x: number;
  y: number;
}

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

export const GameBoard: React.FC<GameBoardProps> = ({ snake, food, gridSize, direction }) => {
  return (
    <div
      className="relative bg-[#020502] border-2 border-[#1a3a1a] rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)]"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        width: '500px',
        height: '500px',
      }}
    >
      <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(#1a3a1a 1px, transparent 1px), linear-gradient(90deg, #1a3a1a 1px, transparent 1px)', backgroundSize: '5% 5%'}}></div>
      {/* 渲染食物 */}
      <div
        className="absolute flex items-center justify-center text-xl animate-pulse"
        style={{
          left: `${(food.x / gridSize) * 100}%`,
          top: `${(food.y / gridSize) * 100}%`,
          width: `${100 / gridSize}%`,
          height: `${100 / gridSize}%`,
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <div className="w-full h-full bg-[#facc15] rounded-full shadow-[0_0_20px_rgba(250,204,21,0.8)] flex items-center justify-center animate-bounce">
            <div className="w-1 h-2 bg-green-800 rounded-full -mt-2"></div>
        </div>
      </div>

      {/* 渲染蛇 */}
      {snake.map((segment, index) => {
        const isHead = index === 0;
        const isTail = index === snake.length - 1;

        // 計算蛇頭吐信方向
        let tongueRotation = 'rotate-0';
        if (direction === 'UP') tongueRotation = '-rotate-90';
        if (direction === 'DOWN') tongueRotation = 'rotate-90';
        if (direction === 'LEFT') tongueRotation = 'rotate-180';

        return (
          <div
            key={index}
            className="absolute flex items-center justify-center"
            style={{
              left: `${(segment.x / gridSize) * 100}%`,
              top: `${(segment.y / gridSize) * 100}%`,
              width: `${100 / gridSize}%`,
              height: `${100 / gridSize}%`,
            }}
          >
            {isHead ? (
              <div className="w-[90%] h-[90%] bg-[#4ade80] rounded-full shadow-[0_0_10px_rgba(74,222,128,0.8)] relative">
                <div className={`absolute top-1/2 left-1/2 w-4 h-2 bg-red-500 rounded-full animate-pulse ${tongueRotation} origin-left`}></div>
              </div>
            ) : (
              <div className={`bg-[#22c55e] w-[95%] h-[95%] ${isTail ? 'rounded-b-full scale-75' : 'rounded-lg'}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
};
