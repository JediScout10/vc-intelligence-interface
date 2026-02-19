'use client';

import { useState, useEffect } from 'react';

interface SavedSearch {
  id: string;
  name: string;
  searchTerm: string;
  industry: string;
  createdAt: string;
}

interface SavedSearchesProps {
  savedSearches: SavedSearch[];
  activeSearch: SavedSearch | null;
  onRunSearch: (search: SavedSearch) => void;
  onDeleteSearch: (searchId: string) => void;
  currentFilters: { searchTerm: string; industry: string };
  onSaveSearch: () => void;
  showSaveForm: boolean;
  onCancelSave: () => void;
  onSearchSaved: (name: string) => void;
}

export default function SavedSearches({
  savedSearches,
  activeSearch,
  onRunSearch,
  onDeleteSearch,
  currentFilters,
  onSaveSearch,
  showSaveForm,
  onCancelSave,
  onSearchSaved
}: SavedSearchesProps) {
  const [searchName, setSearchName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchName.trim()) {
      onSearchSaved(searchName.trim());
      setSearchName('');
    }
  };

  const hasActiveFilters = currentFilters.searchTerm.trim() || currentFilters.industry !== 'all';

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">Saved Searches</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">Saved Searches</h2>
        {hasActiveFilters && (
          <button
            onClick={onSaveSearch}
            className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Save Current
          </button>
        )}
      </div>

      {/* Save Search Form */}
      {showSaveForm && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <form onSubmit={handleSaveSearch} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-1">
                Search Name
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="e.g., AI Companies Series B"
                className="w-full px-3 py-2 text-neutral-100 placeholder-neutral-400 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            <div className="text-xs text-neutral-400">
              <div>Current filters:</div>
              <div>• Search: "{currentFilters.searchTerm || 'None'}"</div>
              <div>• Industry: {currentFilters.industry === 'all' ? 'All' : currentFilters.industry}</div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!searchName.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                type="button"
                onClick={onCancelSave}
                className="px-3 py-1 text-sm font-medium border border-neutral-700 rounded-lg hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Filters Info */}
      {hasActiveFilters && !showSaveForm && (
        <div className="bg-blue-900/20 rounded-lg border border-blue-800 p-4">
          <div className="text-sm">
            <div className="font-medium text-blue-300 mb-2">Current Filters:</div>
            <div className="space-y-1 text-blue-200">
              {currentFilters.searchTerm && (
                <div>• Search: "{currentFilters.searchTerm}"</div>
              )}
              {currentFilters.industry !== 'all' && (
                <div>• Industry: {currentFilters.industry}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches List */}
      <div className="space-y-2">
        {savedSearches.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <svg className="mx-auto h-8 w-8 text-neutral-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm">No saved searches yet</p>
            <p className="text-xs mt-1">Apply filters and save them for quick access</p>
          </div>
        ) : (
          savedSearches.map((search) => (
            <div
              key={search.id}
              className={`bg-neutral-900 rounded-lg border p-4 cursor-pointer transition-colors ${
                activeSearch?.id === search.id
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-neutral-700 hover:bg-neutral-800'
              }`}
              onClick={() => onRunSearch(search)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-neutral-100 truncate">
                    {search.name}
                  </h3>
                  
                  <div className="text-xs text-neutral-400 mt-1 space-y-1">
                    {search.searchTerm && (
                      <div>Search: "{search.searchTerm}"</div>
                    )}
                    {search.industry !== 'all' && (
                      <div>Industry: {search.industry}</div>
                    )}
                    <div>Created {new Date(search.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSearch(search.id);
                  }}
                  className="ml-2 text-neutral-400 hover:text-red-400 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
