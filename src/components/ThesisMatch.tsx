'use client';

import { ScoreResult } from '@/lib/scoring';
import { useMemo } from 'react';

interface ThesisMatchProps {
  score: ScoreResult | null;
}

export default function ThesisMatch({ score }: ThesisMatchProps) {
  // Memoize functions to prevent hydration issues
  const getScoreColor = useMemo(() => (score: number) => {
    if (score >= 70) return 'bg-green-600';
    if (score >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  }, []);

  const getScoreLabel = useMemo(() => (tier: 'Strong Fit' | 'Moderate Fit' | 'Weak Fit') => {
    return tier;
  }, []);

  if (!score) {
    return (
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Thesis Match</h3>
        <div className="text-sm text-neutral-500 italic">
          No thesis match available. Set your investment thesis and enrich company data to see matches.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Thesis Match</h3>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm text-white rounded ${getScoreColor(score.score)}`}>
            {score.score}/100
          </span>
          <span className="text-sm text-neutral-400">
            {getScoreLabel(score.tier)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Matched Keywords */}
        {score.matchedKeywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-neutral-200 mb-2">Matched Keywords</h4>
            <div className="flex flex-wrap gap-1">
              {score.matchedKeywords.map((keyword, index: number) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-blue-900/50 text-blue-300 rounded border border-blue-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Matched Signals */}
        {score.matchedSignals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-neutral-200 mb-2">Matched Signals</h4>
            <div className="flex flex-wrap gap-1">
              {score.matchedSignals.map((signal, index: number) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-green-900/50 text-green-300 rounded border border-green-700"
                >
                  {signal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Score Breakdown */}
        <div>
          <h4 className="text-sm font-medium text-neutral-200 mb-2">Score Breakdown</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Industry:</span>
              <span className="text-white">+{score.breakdown.industry}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Stage:</span>
              <span className="text-white">+{score.breakdown.stage}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Keywords:</span>
              <span className="text-white">+{score.breakdown.keywords}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Signals:</span>
              <span className="text-white">+{score.breakdown.signals}</span>
            </div>
            <div className="border-t border-neutral-700 pt-1 flex justify-between text-sm font-semibold">
              <span className="text-white">Total:</span>
              <span className="text-white">{score.breakdown.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
