'use client';

import React from 'react';
import Link from 'next/link';
import { Company } from '@/data/companies';
import { ScoreResult } from '@/lib/scoring';
import { useMemo, useState } from 'react';
import ScoreBreakdown from './ScoreBreakdown';

interface CompanyWithScore extends Company {
  scoring: ScoreResult;
}

interface CompanyTableProps {
  companies: CompanyWithScore[];
  sortConfig: {
    key: 'name' | 'stage' | 'location' | 'score';
    direction: 'asc' | 'desc';
  };
  onSort: (key: 'name' | 'stage' | 'location' | 'score') => void;
}

export default function CompanyTable({ companies, sortConfig, onSort }: CompanyTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Memoize score color function to prevent hydration issues
  const getScoreColor = useMemo(() => (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  }, []);

  const toggleRowExpansion = (companyId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedRows(newExpanded);
  };

  const getSortIcon = (column: 'name' | 'stage' | 'location' | 'score') => {
    if (sortConfig.key !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'Seed': 'bg-emerald-900/80 text-emerald-300 border border-emerald-700',
      'Series A': 'bg-blue-900/80 text-blue-300 border border-blue-700',
      'Series B': 'bg-purple-900/80 text-purple-300 border border-purple-700',
      'Series C': 'bg-amber-900/80 text-amber-300 border border-amber-700',
      'Growth': 'bg-rose-900/80 text-rose-300 border border-rose-700',
      'IPO': 'bg-neutral-800 text-neutral-200 border border-neutral-600'
    };
    return colors[stage as keyof typeof colors] || 'bg-neutral-800 text-neutral-200 border border-neutral-600';
  };

  const getTierBgColor = (tier: 'Strong Fit' | 'Moderate Fit' | 'Weak Fit') => {
    switch (tier) {
      case 'Strong Fit': return 'bg-green-900/20 text-green-300 border-green-700';
      case 'Moderate Fit': return 'bg-yellow-900/20 text-yellow-300 border-yellow-700';
      case 'Weak Fit': return 'bg-red-900/20 text-red-300 border-red-700';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-neutral-800 border-b border-neutral-700">
          <tr>
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => onSort('name')}
                className="flex items-center gap-1 text-xs font-medium text-neutral-200 uppercase tracking-wider hover:text-white"
              >
                Name
                {getSortIcon('name')}
              </button>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-200 uppercase tracking-wider">
              Website
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-200 uppercase tracking-wider">
              Industry
            </th>
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => onSort('stage')}
                className="flex items-center gap-1 text-xs font-medium text-neutral-200 uppercase tracking-wider hover:text-white"
              >
                Stage
                {getSortIcon('stage')}
              </button>
            </th>
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => onSort('location')}
                className="flex items-center gap-1 text-xs font-medium text-neutral-200 uppercase tracking-wider hover:text-white"
              >
                Location
                {getSortIcon('location')}
              </button>
            </th>
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => onSort('score')}
                className="flex items-center gap-1 text-xs font-medium text-neutral-200 uppercase tracking-wider hover:text-white"
              >
                Score
                {getSortIcon('score')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="bg-neutral-900 divide-y divide-neutral-700">
          {companies.map((company) => (
            <React.Fragment key={company.id}>
              <tr className="hover:bg-neutral-800/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/companies/${company.id}`}
                      className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {company.name}
                    </Link>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getTierBgColor(company.scoring.tier)}`}>
                      {company.scoring.tier}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {company.website.replace('https://', '').replace('http://', '')}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-200">
                    {company.industry}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(company.stage)}`}>
                    {company.stage}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-neutral-200">
                    {company.location}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <span className={`font-bold ${getScoreColor(company.scoring.score)}`}>
                      {company.scoring.score}
                    </span>
                    <button
                      onClick={() => toggleRowExpansion(company.id)}
                      className="ml-2 text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      {expandedRows.has(company.id) ? 'Hide' : 'Why?'}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedRows.has(company.id) && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 bg-neutral-800/50">
                    <ScoreBreakdown scoring={company.scoring} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      
      {companies.length === 0 && (
        <div className="text-center py-8">
          <p className="text-neutral-400">No companies found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
