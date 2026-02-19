'use client';

import { useMemo } from 'react';
import companies from '@/data/companies';
import { ThesisState } from '@/types/thesis';
import { getThesisSummary } from '@/lib/scoring';

interface ThesisSummaryProps {
  thesis: ThesisState | null;
}

export default function ThesisSummary({ thesis }: ThesisSummaryProps) {
  const summary = useMemo(() => {
    return getThesisSummary(companies, thesis?.text || '');
  }, [thesis]);

  if (!thesis?.text) {
    return null;
  }

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Thesis Fit Summary
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{summary.strong}</div>
          <div className="text-sm text-neutral-400">Strong Matches</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{summary.moderate}</div>
          <div className="text-sm text-neutral-400">Moderate Matches</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{summary.weak}</div>
          <div className="text-sm text-neutral-400">Weak Matches</div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-neutral-500">
        Based on current thesis across {companies.length} companies
      </div>
    </div>
  );
}
