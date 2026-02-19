'use client';

import { useMemo } from 'react';
import companies from '@/data/companies';
import { ThesisState } from '@/types/thesis';
import { computeScoredCompanies, getTierColor, getTierBgColor } from '@/lib/scoring';
import ScoreBreakdown from './ScoreBreakdown';

interface TopMatch {
  company: typeof companies[0];
  score: number;
  tier: 'Strong Fit' | 'Moderate Fit' | 'Weak Fit';
  breakdown: any;
  matchedKeywords: string[];
  matchedSignals: string[];
}

export default function TopMatches({ thesis }: { thesis: ThesisState | null }) {
  const topMatches = useMemo(() => {
    // Always score all companies, even without thesis
    const scoredCompanies = thesis?.text ? 
      computeScoredCompanies(companies, thesis.text) :
      companies.map(company => ({
        ...company,
        scoring: {
          score: 10,
          breakdown: { industry: 0, stage: 0, keywords: 0, signals: 0, total: 10 },
          tier: 'Weak Fit' as const,
          matchedKeywords: [],
          matchedSignals: []
        }
      }));

    return scoredCompanies
      .map(company => ({
        company,
        score: company.scoring.score,
        tier: company.scoring.tier,
        breakdown: company.scoring.breakdown,
        matchedKeywords: company.scoring.matchedKeywords,
        matchedSignals: company.scoring.matchedSignals
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [thesis]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Top Companies {thesis?.text ? 'Based on Current Thesis' : '(Default Ranking)'}
      </h3>
      
      <div className="space-y-3">
        {topMatches.map((match, index) => (
          <div key={match.company.id} className="p-3 bg-neutral-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{match.company.name}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTierBgColor(match.tier)}`}>
                    {match.tier}
                  </span>
                </div>
                <div className="text-sm text-neutral-400 mt-1">
                  {match.company.industry}
                  {match.company.stage && ` • ${match.company.stage}`}
                </div>
                <ScoreBreakdown scoring={match as any} />
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getScoreColor(match.score)}`}>
                  {match.score}
                </div>
                <div className="text-xs text-neutral-500">Score</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!thesis?.text && (
        <div className="mt-4 text-xs text-neutral-500">
          Set your investment thesis to see personalized scoring
        </div>
      )}
    </div>
  );
}
