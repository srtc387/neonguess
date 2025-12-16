import React from 'react';
import { INITIAL_SCORE } from '../types';

interface ScoreBoardProps {
  playerScore: number;
  computerScore: number;
  playerName: string;
  stars: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ playerScore, computerScore, playerName, stars }) => {
  // Calculate percentage for health bars
  const playerPercent = Math.max(0, (playerScore / INITIAL_SCORE) * 100);
  const cpuPercent = Math.max(0, (computerScore / INITIAL_SCORE) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto flex justify-between items-start mb-8 px-4">
      {/* Player Side */}
      <div className="flex flex-col w-5/12">
        <div className="flex justify-between items-end mb-2 text-[#00f3ff]">
          <div className="flex flex-col md:flex-row md:items-end gap-2">
            <span className="font-arcade text-lg md:text-xl truncate max-w-[150px]">{playerName}</span>
            {stars > 0 && (
              <span className="text-[#ffcc00] text-sm font-arcade drop-shadow-[0_0_5px_rgba(255,204,0,0.8)]">
                {'★'.repeat(Math.min(stars, 5))}
                {stars > 5 && <span className="text-xs ml-1">x{stars}</span>}
              </span>
            )}
          </div>
          <span className="font-mono text-xl md:text-3xl font-bold">{Math.floor(playerScore)}</span>
        </div>
        <div className="w-full h-4 border-2 border-[#00f3ff] p-0.5 relative">
          <div 
            className="h-full bg-[#00f3ff] shadow-[0_0_10px_#00f3ff] transition-all duration-500" 
            style={{ width: `${playerPercent}%` }}
          />
        </div>
      </div>

      {/* VS Badge */}
      <div className="w-2/12 flex justify-center pt-2">
        <span className="font-arcade text-[#ff0055] text-2xl animate-pulse">VS</span>
      </div>

      {/* CPU Side */}
      <div className="flex flex-col w-5/12">
        <div className="flex justify-between items-end mb-2 text-[#ff0055]">
          <span className="font-mono text-xl md:text-3xl font-bold">{Math.floor(computerScore)}</span>
          <span className="font-arcade text-lg md:text-2xl">CPU</span>
        </div>
        <div className="w-full h-4 border-2 border-[#ff0055] p-0.5">
          <div 
            className="h-full bg-[#ff0055] shadow-[0_0_10px_#ff0055] transition-all duration-500 ml-auto" 
            style={{ width: `${cpuPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};