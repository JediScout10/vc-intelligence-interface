'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import companies from '@/data/companies';
import CompanyTable from '@/components/CompanyTable';
import SearchAndFilter from '@/components/SearchAndFilter';
import ScoreFilter from '@/components/ScoreFilter';
import { ThesisState } from '@/types/thesis';
import { computeScoredCompanies, ScoreResult } from '@/lib/scoring';
import { useLocalStorage } from '@/hooks/useLocalStorage';

function CompaniesPageContent() {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [sortConfig, setSortConfig] = useState<{
    key: 'name' | 'stage' | 'location' | 'score';
    direction: 'asc' | 'desc';
  }>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [minScore, setMinScore] = useState(0);
  const [scoredCompanies, setScoredCompanies] = useState<any[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  const [thesis] = useLocalStorage<ThesisState | null>('investment-thesis', null);
  const [savedSearches, setSavedSearches] = useLocalStorage<any[]>('vc-saved-searches', []);
  const searchParams = useSearchParams();

  const itemsPerPage = 5;

  // Apply URL parameters when component mounts
  useEffect(() => {
    if (!mounted) return;
    
    const keyword = searchParams.get('keyword');
    const industry = searchParams.get('industry');
    const minScoreParam = searchParams.get('minScore');
    
    if (keyword) {
      setSearchTerm(keyword);
    }
    
    if (industry) {
      setSelectedIndustry(industry);
    }
    
    if (minScoreParam) {
      const score = parseInt(minScoreParam, 10);
      if (!isNaN(score) && score >= 0) {
        setMinScore(score);
      }
    }
    
    // Reset to page 1 when URL parameters are applied
    setCurrentPage(1);
  }, [mounted, searchParams]);

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
      // Default scoring without thesis
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

  // Get unique industries for filter
  const industries = useMemo(() => {
    const uniqueIndustries = Array.from(new Set(companies.map(c => c.industry)));
    return uniqueIndustries.sort();
  }, []);

  // Filter and sort companies with global scoring
  const filteredAndSortedCompanies = useMemo(() => {
    if (!mounted || scoredCompanies.length === 0) return [];
    
    // Clone array to prevent mutation
    let filtered = [...scoredCompanies].filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = selectedIndustry === 'all' || company.industry === selectedIndustry;
      const matchesScore = company.scoring.score >= minScore;
      
      return matchesSearch && matchesIndustry && matchesScore;
    });

    // Sort with global scoring - clone to prevent mutation
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortConfig.key === 'score') {
        aValue = a.scoring.score;
        bValue = b.scoring.score;
      } else {
        aValue = a[sortConfig.key as keyof typeof a];
        bValue = b[sortConfig.key as keyof typeof b];
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [mounted, scoredCompanies, searchTerm, selectedIndustry, sortConfig, minScore]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredAndSortedCompanies.slice(startIndex, startIndex + itemsPerPage);

  // Check if any filters are active
  const hasActiveFilters = searchTerm.trim() || 
    selectedIndustry !== 'all' || 
    minScore > 0;

  // Save current search
  const handleSaveSearch = () => {
    if (!saveSearchName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    const newSearch = {
      id: Date.now().toString(),
      name: saveSearchName.trim(),
      filters: {
        keyword: searchTerm.trim() || undefined,
        industry: selectedIndustry !== 'all' ? selectedIndustry : undefined,
        minScore: minScore > 0 ? minScore : undefined
      },
      createdAt: new Date().toISOString()
    };

    setSavedSearches(prev => [...prev, newSearch]);
    setShowSaveModal(false);
    setSaveSearchName('');
    
    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    successMessage.textContent = `Search "${newSearch.name}" saved successfully!`;
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 3000);
  };

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleIndustryChange = (value: string) => {
    setSelectedIndustry(value);
    setCurrentPage(1);
  };

  const handleSort = (key: 'name' | 'stage' | 'location' | 'score') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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
            Companies
          </h1>
          <p className="text-gray-600">
            Browse and search through venture capital portfolio companies
          </p>
          
          {/* Save Search Button */}
          {hasActiveFilters && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Save This Search
              </button>
            </div>
          )}
        </div>

        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          selectedIndustry={selectedIndustry}
          onIndustryChange={handleIndustryChange}
          industries={industries}
          sortConfig={sortConfig}
          onSortChange={setSortConfig}
        />

        {/* Score Filter */}
        <ScoreFilter
          minScore={minScore}
          onMinScoreChange={setMinScore}
        />

        <div className="bg-white rounded-lg border border-gray-200">
          <CompanyTable
            companies={paginatedCompanies}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedCompanies.length)} of{' '}
              {filteredAndSortedCompanies.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Save This Search
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Name
              </label>
              <input
                type="text"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                placeholder="e.g., AI Infrastructure - Series A"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            
            {/* Current Filters Summary */}
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Current Filters:
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                {searchTerm.trim() && (
                  <div>• Keyword: "{searchTerm}"</div>
                )}
                {selectedIndustry !== 'all' && (
                  <div>• Industry: {selectedIndustry}</div>
                )}
                {minScore > 0 && (
                  <div>• Minimum Score: {minScore}</div>
                )}
                {!searchTerm.trim() && selectedIndustry === 'all' && minScore === 0 && (
                  <div className="text-gray-400">No active filters</div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveSearchName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSearch}
                disabled={!saveSearchName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    }>
      <CompaniesPageContent />
    </Suspense>
  );
}
