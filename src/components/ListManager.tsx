'use client';

import { useState, useEffect } from 'react';

interface List {
  id: string;
  name: string;
  description: string;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
  averageScore?: number;
  topCompany?: string;
  strongFitCount?: number;
  moderateFitCount?: number;
  weakFitCount?: number;
  strongFitPercentage?: number;
  moderateFitPercentage?: number;
  weakFitPercentage?: number;
}

interface ListManagerProps {
  lists: List[];
  selectedList: string | null;
  onSelectList: (id: string) => void;
  onCreateList: () => void;
  onDeleteList: (id: string) => void;
  showCreateForm: boolean;
  onCancelCreate: () => void;
  onListCreated: (name: string, description: string) => void;
}

export default function ListManager({
  lists,
  selectedList,
  onSelectList,
  onCreateList,
  onDeleteList,
  showCreateForm,
  onCancelCreate,
  onListCreated
}: ListManagerProps) {
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      onListCreated(newListName.trim(), newListDescription.trim());
      setNewListName('');
      setNewListDescription('');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">My Lists</h2>
        </div>
        <div className="space-y-2">
          <div className="text-center py-8 text-neutral-400">
            <div className="h-4 w-8 bg-neutral-800 rounded animate-pulse mb-2"></div>
            <p className="text-sm">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">My Lists</h2>
        <button
          onClick={onCreateList}
          className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          New List
        </button>
      </div>

      {/* Create List Form */}
      {showCreateForm && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <form onSubmit={handleCreateList} className="space-y-3">
            <div>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name"
                className="w-full px-3 py-2 text-neutral-100 placeholder-neutral-400 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <textarea
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 text-neutral-100 placeholder-neutral-400 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!newListName.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                type="button"
                onClick={onCancelCreate}
                className="px-3 py-1 text-sm font-medium border border-neutral-700 rounded-lg hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lists */}
      <div className="space-y-2">
        {lists.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <svg className="mx-auto h-8 w-8 text-neutral-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
            <p className="text-sm">No lists yet</p>
            <p className="text-xs mt-1">Create your first list to get started</p>
          </div>
        ) : (
          lists.map((list) => (
            <div
              key={list.id}
              className={`bg-neutral-900 rounded-lg border p-4 cursor-pointer transition-colors ${selectedList === list.id ? 'border-blue-500 bg-blue-900/30 shadow-lg shadow-blue-500/20' : 'border-neutral-700 hover:bg-neutral-800'}`}
              onClick={() => onSelectList(list.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-neutral-100 truncate">
                    {list.name}
                  </h3>
                  {list.description && (
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                      {list.description}
                    </p>
                  )}
                  <div className="text-xs text-neutral-400 mt-2">
                    {list.companyIds.length} companies • 
                    {list.averageScore !== undefined && (
                      <span className={`ml-2 font-medium ${getScoreColor(list.averageScore)}`}>
                        Avg: {list.averageScore}
                      </span>
                    )}
                    {list.strongFitPercentage !== undefined && (
                      <span className="ml-2 text-green-400">
                        {list.strongFitPercentage}% Strong
                      </span>
                    )}
                    {list.moderateFitPercentage !== undefined && (
                      <span className="ml-2 text-yellow-400">
                        {list.moderateFitPercentage}% Moderate
                      </span>
                    )}
                    {list.weakFitPercentage !== undefined && (
                      <span className="ml-2 text-red-400">
                        {list.weakFitPercentage}% Weak
                      </span>
                    )}
                    • Updated {new Date(list.updatedAt).toLocaleDateString()}
                  </div>
                  {list.topCompany && list.topCompany !== 'No companies' && (
                    <div className="text-xs text-neutral-500 mt-1">
                      Top: {list.topCompany}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteList(list.id);
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
