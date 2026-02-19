'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface NotesSectionProps {
  companyId: string;
}

export default function NotesSection({ companyId }: NotesSectionProps) {
  const [notes, setNotes] = useLocalStorage<string>(`company-notes-${companyId}`, '');
  const [isEditing, setIsEditing] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes);

  const handleSave = () => {
    setNotes(tempNotes);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempNotes(notes);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setTempNotes(notes);
    setIsEditing(true);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={tempNotes}
            onChange={(e) => setTempNotes(e.target.value)}
            className="w-full h-32 px-3 py-2 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Add your notes about this company..."
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {notes ? (
            <div className="text-gray-700 whitespace-pre-wrap">
              {notes}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              No notes yet. Click Edit to add notes about this company.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
