'use client';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedIndustry: string;
  onIndustryChange: (value: string) => void;
  industries: string[];
  sortConfig: {
    key: 'name' | 'stage' | 'location' | 'score';
    direction: 'asc' | 'desc';
  };
  onSortChange: (config: {
    key: 'name' | 'stage' | 'location' | 'score';
    direction: 'asc' | 'desc';
  }) => void;
}

export default function SearchAndFilter({
  searchTerm,
  onSearchChange,
  selectedIndustry,
  onIndustryChange,
  industries,
  sortConfig,
  onSortChange
}: SearchAndFilterProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 text-white placeholder-zinc-400 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search companies by name..."
          />
        </div>
      </div>

      <div className="sm:w-48">
        <select
          value={selectedIndustry}
          onChange={(e) => onIndustryChange(e.target.value)}
          className="w-full px-3 py-2 text-white bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all" className="bg-zinc-800">All Industries</option>
          {industries.map(industry => (
            <option key={industry} value={industry} className="bg-zinc-800">
              {industry}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-48">
        <select
          value={sortConfig.key}
          onChange={(e) => onSortChange({
            ...sortConfig,
            key: e.target.value as 'name' | 'stage' | 'location' | 'score'
          })}
          className="w-full px-3 py-2 text-white bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="score" className="bg-zinc-800">Match Score</option>
          <option value="name" className="bg-zinc-800">Name</option>
          <option value="stage" className="bg-zinc-800">Stage</option>
          <option value="location" className="bg-zinc-800">Location</option>
        </select>
      </div>
    </div>
  );
}
