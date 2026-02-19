'use client';

import { useState } from 'react';

interface DemoModeToggleProps {
  isDemoMode: boolean;
  onDemoModeChange: (enabled: boolean) => void;
}

export default function DemoModeToggle({ isDemoMode, onDemoModeChange }: DemoModeToggleProps) {
  const toggleDemoMode = () => {
    onDemoModeChange(!isDemoMode);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-neutral-400">Demo Mode:</span>
      <button
        onClick={toggleDemoMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isDemoMode ? 'bg-blue-600' : 'bg-neutral-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDemoMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-sm font-medium ${isDemoMode ? 'text-blue-400' : 'text-neutral-500'}`}>
        {isDemoMode ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}
