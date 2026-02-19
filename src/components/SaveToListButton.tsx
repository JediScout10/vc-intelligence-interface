'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Company } from '@/data/companies';

interface List {
  id: string;
  name: string;
  description: string;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface SaveToListButtonProps {
  company: Company;
}

export default function SaveToListButton({ company }: SaveToListButtonProps) {
  const [lists, setLists] = useLocalStorage<List[]>('vc-lists', []);
  const [isSaved, setIsSaved] = useState(() => {
    // Check if company is in any list
    return lists.some(list => list.companyIds.includes(company.id));
  });

  const handleSave = () => {
    if (isSaved) {
      // Remove from all lists
      const updatedLists = lists.map(list => ({
        ...list,
        companyIds: list.companyIds.filter(id => id !== company.id),
        updatedAt: new Date().toISOString()
      }));
      setLists(updatedLists);
      setIsSaved(false);
    } else {
      // Add to first list or create a default list
      if (lists.length === 0) {
        // Create a default list
        const defaultList: List = {
          id: Date.now().toString(),
          name: 'My Companies',
          description: 'Default list for saved companies',
          companyIds: [company.id],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setLists([defaultList]);
      } else {
        // Add to first existing list
        const updatedLists = lists.map((list, index) => 
          index === 0 
            ? {
                ...list,
                companyIds: [...list.companyIds, company.id],
                updatedAt: new Date().toISOString()
              }
            : list
        );
        setLists(updatedLists);
      }
      setIsSaved(true);
    }
  };

  // Update isSaved state when lists change
  useEffect(() => {
    const saved = lists.some(list => list.companyIds.includes(company.id));
    if (saved !== isSaved) {
      setIsSaved(saved);
    }
  }, [lists, company.id, isSaved]);

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Save Company</h3>
      <button
        onClick={handleSave}
        className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isSaved
            ? 'bg-yellow-900/50 text-yellow-300 hover:bg-yellow-900/70 border border-yellow-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isSaved ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Saved
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            Save to List
          </span>
        )}
      </button>
      
      {isSaved && (
        <p className="mt-2 text-sm text-neutral-400">
          This company is saved to your list.
        </p>
      )}
    </div>
  );
}
