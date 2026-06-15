import React from 'react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  isGameOver: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, highScore, onRestart, isGameOver }) => {
  return null; // The scoreboard is now part of the main Header in SnakeGame.tsx
};
