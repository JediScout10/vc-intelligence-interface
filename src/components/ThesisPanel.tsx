'use client';

import { useState, useEffect } from 'react';
import { ThesisState } from '@/types/thesis';

interface ThesisPanelProps {
  thesis: ThesisState | null;
  onThesisChange: (thesis: string) => void;
}

export default function ThesisPanel({ thesis, onThesisChange }: ThesisPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setEditText(thesis?.text || '');
  }, [thesis]);

  const handleSave = () => {
    onThesisChange(editText.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(thesis?.text || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Investment Thesis</h3>
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Edit
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full h-32 px-3 py-2 text-sm text-white bg-neutral-800 border border-neutral-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your investment thesis..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm bg-neutral-600 text-white rounded hover:bg-neutral-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {thesis?.text ? (
            <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {thesis.text}
            </div>
          ) : (
            <div className="text-sm text-neutral-500 italic">
              No investment thesis set. Click "Edit" to add your thesis criteria.
            </div>
          )}
          
          {thesis?.updatedAt && (
            <div className="text-xs text-neutral-400">
              Last updated: {new Date(thesis.updatedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
