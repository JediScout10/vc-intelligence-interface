'use client';

import { useState } from 'react';
import { ScoreResult } from '@/lib/scoring';

interface ScoreBreakdownProps {
  scoring: ScoreResult;
}

export default function ScoreBreakdown({ scoring }: ScoreBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs text-blue-400 hover:text-blue-300 underline"
      >
        {isExpanded ? 'Hide' : 'Why this score?'}
      </button>
      
      {isExpanded && (
        <div className="mt-2 p-2 bg-neutral-800 rounded text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-neutral-400">Industry:</span>
              <span className="text-white">+{scoring.breakdown.industry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Stage:</span>
              <span className="text-white">+{scoring.breakdown.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Keywords:</span>
              <span className="text-white">+{scoring.breakdown.keywords}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Signals:</span>
              <span className="text-white">+{scoring.breakdown.signals}</span>
            </div>
            <div className="border-t border-neutral-700 pt-1 flex justify-between font-semibold">
              <span className="text-white">Total:</span>
              <span className="text-white">{scoring.breakdown.total}</span>
            </div>
          </div>
          
          {scoring.matchedKeywords.length > 0 && (
            <div className="mt-2 pt-2 border-t border-neutral-700">
              <div className="text-neutral-400 mb-1">Matched keywords:</div>
              <div className="flex flex-wrap gap-1">
                {scoring.matchedKeywords.map((keyword, index) => (
                  <span key={index} className="px-1 py-0.5 bg-blue-900/30 text-blue-300 rounded">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {scoring.matchedSignals.length > 0 && (
            <div className="mt-2 pt-2 border-t border-neutral-700">
              <div className="text-neutral-400 mb-1">Matched signals:</div>
              <div className="flex flex-wrap gap-1">
                {scoring.matchedSignals.map((signal, index) => (
                  <span key={index} className="px-1 py-0.5 bg-green-900/30 text-green-300 rounded">
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
