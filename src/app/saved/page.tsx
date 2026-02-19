'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import companies from '@/data/companies';
import { ThesisState } from '@/types/thesis';
import { computeScoredCompanies, ScoreResult } from '@/lib/scoring';
import Link from 'next/link';

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    industry?: string;
    stage?: string;
    minScore?: number;
    keyword?: string;
  };
  createdAt: string;
}

interface SearchMetrics {
  total: number;
  strongFit: number;
  moderateFit: number;
  weakFit: number;
  averageScore: number;
}

export default function SavedPage() {
  const [mounted, setMounted] = useState(false);
  const [savedSearches, setSavedSearches] = useLocalStorage<SavedSearch[]>('vc-saved-searches', []);
  const [scoredCompanies, setScoredCompanies] = useState<any[]>([]);
  const [thesis] = useLocalStorage<ThesisState | null>('investment-thesis', null);

  // Client-side mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute scores client-side only
  useEffect(() => {
    if (!mounted) return;
    
    if (thesis?.text) {
      const scored = computeScoredCompanies(companies, thesis.text);
      setScoredCompanies(scored);
    } else {
      const defaultScored = companies.map(company => ({
        ...company,
        scoring: {
          score: 10,
          breakdown: {
            industry: 0,
            stage: 0,
            keywords: 0,
            signals: 0,
            total: 10
          },
          tier: 'Weak Fit' as const,
          matchedKeywords: [],
          matchedSignals: []
        } as ScoreResult
      }));
      setScoredCompanies(defaultScored);
    }
  }, [mounted, thesis?.text]);

  // Calculate metrics for a saved search
  const calculateSearchMetrics = (search: SavedSearch): SearchMetrics => {
    if (!mounted || scoredCompanies.length === 0) {
      return { total: 0, strongFit: 0, moderateFit: 0, weakFit: 0, averageScore: 0 };
    }

    const filtered = scoredCompanies.filter(company => {
      // Industry filter
      if (search.filters.industry && search.filters.industry !== 'all' && company.industry !== search.filters.industry) {
        return false;
      }
      
      // Stage filter
      if (search.filters.stage && search.filters.stage !== 'all' && company.stage !== search.filters.stage) {
        return false;
      }
      
      // Minimum score filter
      if (search.filters.minScore && company.scoring.score < search.filters.minScore) {
        return false;
      }
      
      // Keyword filter
      if (search.filters.keyword && search.filters.keyword.trim()) {
        const keyword = search.filters.keyword.toLowerCase();
        const matchesName = company.name.toLowerCase().includes(keyword);
        const matchesIndustry = company.industry.toLowerCase().includes(keyword);
        const matchesKeywords = company.scoring.matchedKeywords.some((k: string) => k.toLowerCase().includes(keyword));
        if (!matchesName && !matchesIndustry && !matchesKeywords) {
          return false;
        }
      }
      
      return true;
    });

    const strongFit = filtered.filter(c => c.scoring.score >= 70).length;
    const moderateFit = filtered.filter(c => c.scoring.score >= 40 && c.scoring.score < 70).length;
    const weakFit = filtered.filter(c => c.scoring.score < 40).length;
    
    const averageScore = filtered.length > 0 
      ? Math.round(filtered.reduce((sum, c) => sum + c.scoring.score, 0) / filtered.length)
      : 0;

    return {
      total: filtered.length,
      strongFit,
      moderateFit,
      weakFit,
      averageScore
    };
  };

  // Calculate metrics for all saved searches
  const searchMetrics = useMemo(() => {
    if (!mounted) return {};
    
    const metrics: Record<string, SearchMetrics> = {};
    savedSearches.forEach(search => {
      metrics[search.id] = calculateSearchMetrics(search);
    });
    return metrics;
  }, [mounted, savedSearches, scoredCompanies]);

  // Delete saved search
  const handleDeleteSearch = (searchId: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== searchId));
  };

  // Duplicate saved search
  const handleDuplicateSearch = (search: SavedSearch) => {
    const newSearch: SavedSearch = {
      ...search,
      id: Date.now().toString(),
      name: `${search.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setSavedSearches(prev => [...prev, newSearch]);
  };

  // Run search - navigate to companies page with filters
  const handleRunSearch = (search: SavedSearch) => {
    const params = new URLSearchParams();
    
    if (search.filters.industry && search.filters.industry !== 'all') {
      params.set('industry', search.filters.industry);
    }
    
    if (search.filters.stage && search.filters.stage !== 'all') {
      params.set('stage', search.filters.stage);
    }
    
    if (search.filters.minScore && search.filters.minScore > 0) {
      params.set('minScore', search.filters.minScore.toString());
    }
    
    if (search.filters.keyword && search.filters.keyword.trim()) {
      params.set('keyword', search.filters.keyword);
    }
    
    const queryString = params.toString();
    const url = `/companies${queryString ? `?${queryString}` : ''}`;
    
    // Navigate to companies page
    window.location.href = url;
  };

  // Format filter summary
  const formatFilterSummary = (search: SavedSearch): string => {
    const parts: string[] = [];
    
    if (search.filters.industry && search.filters.industry !== 'all') {
      parts.push(search.filters.industry);
    }
    
    if (search.filters.stage && search.filters.stage !== 'all') {
      parts.push(search.filters.stage);
    }
    
    if (search.filters.minScore && search.filters.minScore > 0) {
      parts.push(`Score ≥ ${search.filters.minScore}`);
    }
    
    if (search.filters.keyword && search.filters.keyword.trim()) {
      parts.push(`"${search.filters.keyword}"`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'All companies';
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Saved Searches
          </h1>
          <p className="text-gray-600">
            Monitor investment themes and track company alignment with your thesis.
          </p>
        </div>

        {savedSearches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No saved searches yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first monitoring search from the Companies page.
              </p>
              <Link
                href="/companies"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Go to Companies
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSearches.map((search) => {
              const metrics = searchMetrics[search.id];
              
              return (
                <div key={search.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {search.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatFilterSummary(search)}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">{metrics.total}</div>
                        <div className="text-gray-500">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{metrics.averageScore}</div>
                        <div className="text-gray-500">Avg Score</div>
                      </div>
                    </div>
                    
                    {/* Fit Distribution */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600">Strong Fit</span>
                        <span className="font-medium">{metrics.strongFit}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-yellow-600">Moderate Fit</span>
                        <span className="font-medium">{metrics.moderateFit}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-600">Weak Fit</span>
                        <span className="font-medium">{metrics.weakFit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunSearch(search)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                    >
                      Run Search
                    </button>
                    <button
                      onClick={() => handleDuplicateSearch(search)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => handleDeleteSearch(search.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Created {new Date(search.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
