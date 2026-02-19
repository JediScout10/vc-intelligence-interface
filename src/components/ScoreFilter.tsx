'use client';

import { useState } from 'react';

interface ScoreFilterProps {
  minScore: number;
  onMinScoreChange: (score: number) => void;
}

export default function ScoreFilter({ minScore, onMinScoreChange }: ScoreFilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onMinScoreChange(Number(e.target.value));
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
      <div className="flex items-center gap-4">
        <label htmlFor="score-filter" className="text-sm font-medium text-white">
          Minimum Match Score
        </label>
        <div className="flex items-center gap-3 flex-1">
          <input
            id="score-filter"
            type="range"
            min="0"
            max="100"
            value={minScore}
            onChange={handleChange}
            className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${minScore}%, #374151 ${minScore}%, #374151 100%)`
            }}
          />
          <span className="text-sm font-medium text-white min-w-[3rem] text-right">
            {minScore}
          </span>
        </div>
      </div>
    </div>
  );
}
