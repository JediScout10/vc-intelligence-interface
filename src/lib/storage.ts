'use client';

import { useState } from 'react';

// Interfaces for type safety
interface List {
  id: string;
  name: string;
  description: string;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface SavedSearch {
  id: string;
  name: string;
  searchTerm: string;
  industry: string;
  minScore?: number;
  sortMode?: 'score' | 'stage' | 'name';
  createdAt: string;
}

interface ThesisState {
  text: string;
  updatedAt: string;
}

// Generic localStorage hook with type safety
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get initial value from localStorage or use provided value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as [T, (value: T | ((val: T) => T)) => void];
}

// Specific storage functions for lists
export function getStoredLists(): List[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const item = window.localStorage.getItem('vc-lists');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading lists from localStorage:', error);
    return [];
  }
}

export function saveList(list: List) {
  if (typeof window === 'undefined') return;
  
  try {
    const lists = getStoredLists();
    const updatedLists = lists.some((l) => l.id === list.id)
      ? lists.map((l) => l.id === list.id ? { ...list, updatedAt: new Date().toISOString() } : l)
      : [...lists, { ...list, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    
    window.localStorage.setItem('vc-lists', JSON.stringify(updatedLists));
  } catch (error) {
    console.error('Error saving list to localStorage:', error);
  }
}

export function deleteList(listId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const lists = getStoredLists();
    const updatedLists = lists.filter((l) => l.id !== listId);
    window.localStorage.setItem('vc-lists', JSON.stringify(updatedLists));
  } catch (error) {
    console.error('Error deleting list from localStorage:', error);
  }
}

// Specific storage functions for saved searches
export function getStoredSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const item = window.localStorage.getItem('saved-searches');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading saved searches from localStorage:', error);
    return [];
  }
}

export function saveSearch(search: SavedSearch) {
  if (typeof window === 'undefined') return;
  
  try {
    const searches = getStoredSearches();
    const updatedSearches = searches.some((s) => s.id === search.id)
      ? searches.map((s) => s.id === search.id ? search : s)
      : [...searches, { ...search, createdAt: new Date().toISOString() }];
    
    window.localStorage.setItem('saved-searches', JSON.stringify(updatedSearches));
  } catch (error) {
    console.error('Error saving search to localStorage:', error);
  }
}

export function deleteSearch(searchId: string) {
  if (typeof window === 'undefined') return;
  
  try {
    const searches = getStoredSearches();
    const updatedSearches = searches.filter((s) => s.id !== searchId);
    window.localStorage.setItem('saved-searches', JSON.stringify(updatedSearches));
  } catch (error) {
    console.error('Error deleting search from localStorage:', error);
  }
}

// Specific storage functions for thesis
export function getStoredThesis(): ThesisState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const item = window.localStorage.getItem('investment-thesis');
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading thesis from localStorage:', error);
    return null;
  }
}

export function saveThesis(thesis: ThesisState) {
  if (typeof window === 'undefined') return;
  
  try {
    window.localStorage.setItem('investment-thesis', JSON.stringify({ ...thesis, updatedAt: new Date().toISOString() }));
  } catch (error) {
    console.error('Error saving thesis to localStorage:', error);
  }
}
