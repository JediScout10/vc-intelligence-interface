'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import companies from '@/data/companies';
import { ThesisState } from '@/types/thesis';
import ThesisPanel from '@/components/ThesisPanel';
import TopMatches from '@/components/TopMatches';
import ThesisSummary from '@/components/ThesisSummary';

export const dynamic = 'force-static';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [activeLists, setActiveLists] = useState(0);
  const [savedItems, setSavedItems] = useState(0);
  const [thesis, setThesis] = useState<ThesisState | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Clear corrupted localStorage and read fresh data
    try {
      // Clear any corrupted data first
      const listsData = localStorage.getItem('vc-lists');
      const savedData = localStorage.getItem('vc-saved-searches');
      const thesisData = localStorage.getItem('investment-thesis');
      
      // Validate and parse data safely
      let lists = [];
      let savedSearches = [];
      let thesisState = null;
      
      if (listsData) {
        try {
          lists = JSON.parse(listsData);
          if (!Array.isArray(lists)) {
            localStorage.removeItem('vc-lists');
            lists = [];
          }
        } catch (e) {
          localStorage.removeItem('vc-lists');
          lists = [];
        }
      }
      
      if (savedData) {
        try {
          savedSearches = JSON.parse(savedData);
          if (!Array.isArray(savedSearches)) {
            localStorage.removeItem('vc-saved-searches');
            savedSearches = [];
          }
        } catch (e) {
          localStorage.removeItem('vc-saved-searches');
          savedSearches = [];
        }
      }

      if (thesisData) {
        try {
          thesisState = JSON.parse(thesisData);
          if (!thesisState || typeof thesisState !== 'object') {
            localStorage.removeItem('investment-thesis');
            thesisState = null;
          }
        } catch (e) {
          localStorage.removeItem('investment-thesis');
          thesisState = null;
        }
      }
      
      setTotalCompanies(companies.length);
      setActiveLists(lists.length);
      setSavedItems(savedSearches.length);
      setThesis(thesisState);
    } catch (e) {
      console.error('Error reading localStorage:', e);
      setTotalCompanies(companies.length);
      setActiveLists(0);
      setSavedItems(0);
    }
  }, [mounted]);

  const handleThesisChange = (thesisText: string) => {
    const newThesis: ThesisState = {
      text: thesisText,
      updatedAt: new Date().toISOString()
    };
    
    setThesis(newThesis);
    localStorage.setItem('investment-thesis', JSON.stringify(newThesis));
  };

  if (!mounted) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-32 bg-zinc-800 rounded-lg"></div>
              <div className="h-32 bg-zinc-800 rounded-lg"></div>
              <div className="h-32 bg-zinc-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">VC Intelligence Dashboard</h1>
          <p className="text-neutral-400">Precision AI Scout - Thesis-Driven Company Sourcing</p>
        </div>

        {/* Thesis Panel */}
        <ThesisPanel thesis={thesis} onThesisChange={handleThesisChange} />

        {/* Thesis Summary */}
        <ThesisSummary thesis={thesis} />

        {/* Top Matches */}
        <TopMatches thesis={thesis} />

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/companies" className="block">
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 hover:border-neutral-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-white">{totalCompanies}</span>
                <span className="text-blue-400">🏢</span>
              </div>
              <h3 className="text-lg font-medium text-neutral-200">Total Companies</h3>
              <p className="text-sm text-neutral-400">Complete database</p>
            </div>
          </Link>

          <Link href="/lists" className="block">
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 hover:border-neutral-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-white">{activeLists}</span>
                <span className="text-green-400">📋</span>
              </div>
              <h3 className="text-lg font-medium text-neutral-200">Active Lists</h3>
              <p className="text-sm text-neutral-400">Custom collections</p>
            </div>
          </Link>

          <Link href="/saved" className="block">
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 hover:border-neutral-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-white">{savedItems}</span>
                <span className="text-yellow-400">⭐</span>
              </div>
              <h3 className="text-lg font-medium text-neutral-200">Saved Items</h3>
              <p className="text-sm text-neutral-400">Bookmarked companies</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
