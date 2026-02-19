'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import companies from '@/data/companies';
import ListManager from '@/components/ListManager';
import CompanySelector from '@/components/CompanySelector';
import { ThesisState } from '@/types/thesis';
import { computeScoredCompanies, ScoreResult } from '@/lib/scoring';
import Link from 'next/link';

interface List {
  id: string;
  name: string;
  description: string;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface ListWithScore extends List {
  averageScore: number;
  topCompany: string;
  strongFitCount: number;
  moderateFitCount: number;
  weakFitCount: number;
  strongFitPercentage: number;
  moderateFitPercentage: number;
  weakFitPercentage: number;
}

export default function ListsPage() {
  const [mounted, setMounted] = useState(false);
  const [lists, setLists] = useLocalStorage<List[]>('vc-lists', []);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [scoredCompanies, setScoredCompanies] = useState<any[]>([]);
  const [thesis] = useLocalStorage<ThesisState | null>('investment-thesis', null);
  
  // List view sorting and filtering
  const [listSortConfig, setListSortConfig] = useState<'score' | 'stage' | 'name'>('score');
  const [listFilterLevel, setListFilterLevel] = useState<'all' | 'strong' | 'moderate' | 'weak'>('all');

  // Client-side mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-select first list when available and none selected
  useEffect(() => {
    if (lists.length > 0 && !selectedList) {
      setSelectedList(lists[0].id);
    }
  }, [lists.length, selectedList]);

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

  const listsWithScores = useMemo((): ListWithScore[] => {
    if (!mounted || scoredCompanies.length === 0) return [];
    
    return lists.map(list => {
      const listCompanies = scoredCompanies.filter(company => 
        list.companyIds.includes(company.id)
      );
      
      const averageScore = listCompanies.length > 0 
        ? Math.round(listCompanies.reduce((sum, company) => sum + company.scoring.score, 0) / listCompanies.length)
        : 0;
      
      const topCompany = listCompanies.length > 0
        ? listCompanies.reduce((top, company) => 
            company.scoring.score > top.scoring.score ? company : top
          ).name
        : 'No companies';
      
      // Calculate fit level counts
      const strongFitCount = listCompanies.filter(c => c.scoring.score >= 70).length;
      const moderateFitCount = listCompanies.filter(c => c.scoring.score >= 40 && c.scoring.score < 70).length;
      const weakFitCount = listCompanies.filter(c => c.scoring.score < 40).length;
      
      // Calculate percentages
      const total = listCompanies.length;
      const strongFitPercentage = total > 0 ? Math.round((strongFitCount / total) * 100) : 0;
      const moderateFitPercentage = total > 0 ? Math.round((moderateFitCount / total) * 100) : 0;
      const weakFitPercentage = total > 0 ? Math.round((weakFitCount / total) * 100) : 0;

      return {
        ...list,
        averageScore,
        topCompany,
        strongFitCount,
        moderateFitCount,
        weakFitCount,
        strongFitPercentage,
        moderateFitPercentage,
        weakFitPercentage
      };
    });
  }, [lists, scoredCompanies]);

  const selectedListData = useMemo(() => {
    return listsWithScores.find(list => list.id === selectedList);
  }, [listsWithScores, selectedList]);

  const selectedListCompanies = useMemo(() => {
    if (!selectedListData) return [];
    
    let filtered = scoredCompanies.filter(company => selectedListData.companyIds.includes(company.id));
    
    // Apply fit level filter
    if (listFilterLevel !== 'all') {
      filtered = filtered.filter(company => {
        const score = company.scoring.score;
        switch (listFilterLevel) {
          case 'strong': return score >= 70;
          case 'moderate': return score >= 40 && score < 70;
          case 'weak': return score < 40;
          default: return true;
        }
      });
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (listSortConfig) {
        case 'score':
          return b.scoring.score - a.scoring.score;
        case 'stage':
          return a.stage.localeCompare(b.stage);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.scoring.score - a.scoring.score;
      }
    });
    
    return sorted;
  }, [selectedListData, scoredCompanies, listSortConfig, listFilterLevel]);

  const handleCreateList = (name: string, description: string) => {
    const newList: List = {
      id: Date.now().toString(),
      name,
      description,
      companyIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setLists(prev => [...prev, newList]);
    setSelectedList(newList.id);
    setShowCreateForm(false);
  };

  const handleUpdateList = (updatedList: List) => {
    setLists(prev => prev.map(list => 
      list.id === updatedList.id 
        ? { ...updatedList, updatedAt: new Date().toISOString() }
        : list
    ));
  };

  const handleDeleteList = (listId: string) => {
    setLists(prev => prev.filter(list => list.id !== listId));
    if (selectedList === listId) {
      setSelectedList(null);
    }
  };

  const handleAddCompanies = (companyIds: string[]) => {
    if (!selectedListData) return;
    
    const updatedList = {
      ...selectedListData,
      companyIds: [...new Set([...selectedListData.companyIds, ...companyIds])]
    };
    
    handleUpdateList(updatedList);
    setShowCompanySelector(false);
  };

  const handleRemoveCompany = (companyId: string) => {
    if (!selectedListData) return;
    
    const updatedList = {
      ...selectedListData,
      companyIds: selectedListData.companyIds.filter(id => id !== companyId)
    };
    
    handleUpdateList(updatedList);
  };

  const exportAsJSON = () => {
    if (!selectedListData) return;
    
    const exportData = {
      list: selectedListData,
      companies: selectedListCompanies.map(company => ({
        name: company.name,
        industry: company.industry,
        stage: company.stage,
        location: company.location,
        website: company.website,
        score: company.scoring.score,
        fitLevel: company.scoring.tier,
        matchedKeywords: company.scoring.matchedKeywords,
        breakdown: company.scoring.breakdown
      })),
      summary: {
        totalCompanies: selectedListCompanies.length,
        averageScore: selectedListData.averageScore,
        strongFitCount: selectedListData.strongFitCount,
        moderateFitCount: selectedListData.moderateFitCount,
        weakFitCount: selectedListData.weakFitCount,
        strongFitPercentage: selectedListData.strongFitPercentage,
        moderateFitPercentage: selectedListData.moderateFitPercentage,
        weakFitPercentage: selectedListData.weakFitPercentage
      },
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedListData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    if (!selectedListData) return;
    
    const headers = ['Name', 'Industry', 'Stage', 'Location', 'Website', 'Score', 'Fit Level', 'Matched Keywords'];
    const rows = selectedListCompanies.map(company => [
      company.name,
      company.industry,
      company.stage,
      company.location,
      company.website,
      company.scoring.score.toString(),
      company.scoring.tier,
      company.scoring.matchedKeywords.join('; ')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedListData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Company Lists
          </h1>
          <p className="text-neutral-300">
            Create and manage curated lists of companies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lists Sidebar */}
          <div className="lg:col-span-1">
            <ListManager
              lists={lists}
              selectedList={selectedList}
              onSelectList={setSelectedList}
              onCreateList={() => setShowCreateForm(true)}
              onDeleteList={handleDeleteList}
              showCreateForm={showCreateForm}
              onCancelCreate={() => setShowCreateForm(false)}
              onListCreated={handleCreateList}
            />
          </div>

          {/* List Content */}
          <div className="lg:col-span-2">
            {selectedListData ? (
              <div className="space-y-6">
                {/* List Header */}
                <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedListData.name}
                      </h2>
                      <p className="text-neutral-300 mb-4">
                        {selectedListData.description}
                      </p>
                      <div className="text-sm text-neutral-400">
                        {selectedListCompanies.length} companies • 
                        Updated {new Date(selectedListData.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCompanySelector(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                      >
                        Add Companies
                      </button>
                      <button
                        onClick={exportAsJSON}
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Export JSON
                      </button>
                      <button
                        onClick={exportAsCSV}
                        className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Companies in List */}
                <div className="bg-neutral-900 rounded-lg border border-neutral-800">
                  <div className="px-6 py-4 border-b border-neutral-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        Companies ({selectedListCompanies.length})
                      </h3>
                      
                      {/* Sorting and Filtering Controls */}
                      <div className="flex items-center gap-4">
                        {/* Filter by Fit Level */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-400">Filter:</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setListFilterLevel('all')}
                              className={`px-3 py-1 text-xs font-medium rounded ${
                                listFilterLevel === 'all'
                                  ? 'bg-neutral-700 text-white'
                                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                              }`}
                            >
                              All
                            </button>
                            <button
                              onClick={() => setListFilterLevel('strong')}
                              className={`px-3 py-1 text-xs font-medium rounded ${
                                listFilterLevel === 'strong'
                                  ? 'bg-green-900/50 text-green-300'
                                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                              }`}
                            >
                              Strong
                            </button>
                            <button
                              onClick={() => setListFilterLevel('moderate')}
                              className={`px-3 py-1 text-xs font-medium rounded ${
                                listFilterLevel === 'moderate'
                                  ? 'bg-yellow-900/50 text-yellow-300'
                                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                              }`}
                            >
                              Moderate
                            </button>
                            <button
                              onClick={() => setListFilterLevel('weak')}
                              className={`px-3 py-1 text-xs font-medium rounded ${
                                listFilterLevel === 'weak'
                                  ? 'bg-red-900/50 text-red-300'
                                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                              }`}
                            >
                              Weak
                            </button>
                          </div>
                        </div>
                        
                        {/* Sort Options */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-400">Sort:</span>
                          <select
                            value={listSortConfig}
                            onChange={(e) => setListSortConfig(e.target.value as 'score' | 'stage' | 'name')}
                            className="px-3 py-1 text-sm bg-neutral-800 text-neutral-200 border border-neutral-700 rounded focus:outline-none focus:border-blue-500"
                          >
                            <option value="score">Highest Score</option>
                            <option value="stage">Stage</option>
                            <option value="name">Name</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedListCompanies.length > 0 ? (
                    <div className="divide-y divide-neutral-700">
                      {selectedListCompanies.map((company) => (
                        <div key={company.id} className="px-6 py-4 flex items-center justify-between hover:bg-neutral-800">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Link
                                href={`/companies/${company.id}`}
                                className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline"
                              >
                                {company.name}
                              </Link>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-neutral-800 text-neutral-200">
                                {company.industry}
                              </span>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/50 text-blue-300">
                                {company.stage}
                              </span>
                            </div>
                            <div className="text-sm text-neutral-400 mt-1">
                              {company.location} • 
                              <Link
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 hover:underline ml-1"
                              >
                                {company.website.replace('https://', '').replace('http://', '')}
                              </Link>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveCompany(company.id)}
                            className="ml-4 text-red-400 hover:text-red-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-neutral-400">
                      No companies in this list yet. Click "Add Companies" to get started.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-12 text-center">
                <div className="text-neutral-400">
                  <svg className="mx-auto h-12 w-12 text-neutral-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-medium text-white mb-2">No list selected</h3>
                  <p className="text-sm">Create a new list or select an existing one to get started.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Selector Modal */}
        {showCompanySelector && (
          <CompanySelector
            companies={scoredCompanies}
            selectedCompanyIds={selectedListData?.companyIds || []}
            onConfirm={handleAddCompanies}
            onCancel={() => setShowCompanySelector(false)}
          />
        )}
      </div>
    </div>
  );
}
