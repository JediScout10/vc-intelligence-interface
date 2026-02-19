'use client';

import { useState, useMemo } from 'react';
import { Company } from '@/data/companies';
import { ScoreResult } from '@/lib/scoring';

interface CompanyWithScore extends Company {
  scoring: ScoreResult;
}

interface CompanySelectorProps {
  companies: CompanyWithScore[];
  selectedCompanyIds: string[];
  onConfirm: (companyIds: string[]) => void;
  onCancel: () => void;
}

export default function CompanySelector({
  companies,
  selectedCompanyIds,
  onConfirm,
  onCancel
}: CompanySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedCompanyIds);

  const filteredCompanies = useMemo(() => {
    return companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.scoring.score - a.scoring.score);
  }, [companies, searchTerm]);

  const handleToggleCompany = (companyId: string) => {
    setSelectedIds(prev => 
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedIds.filter(id => !selectedCompanyIds.includes(id)));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStageColor = (stage: string) => {
    const colors = {
      'Seed': 'bg-green-100 text-green-800',
      'Series A': 'bg-blue-100 text-blue-800',
      'Series B': 'bg-purple-100 text-purple-800',
      'Series C': 'bg-orange-100 text-orange-800',
      'Growth': 'bg-red-100 text-red-800',
      'IPO': 'bg-gray-100 text-gray-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Add Companies to List
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search companies by name or industry..."
            />
          </div>
        </div>

        {/* Companies List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No companies found matching your search.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCompanies.map((company) => {
                  const isSelected = selectedIds.includes(company.id);
                  const isAlreadyInList = selectedCompanyIds.includes(company.id);
                  
                  return (
                    <div
                      key={company.id}
                      className={`flex items-center p-3 rounded-lg border transition-colors ${
                        isAlreadyInList
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : isSelected
                          ? 'bg-blue-50 border-blue-200'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isAlreadyInList}
                        onChange={() => handleToggleCompany(company.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            isAlreadyInList ? 'text-gray-500' : 'text-gray-900'
                          }`}>
                            {company.name}
                          </span>
                          <span className={`text-xs font-bold ${getScoreColor(company.scoring.score)}`}>
                            {company.scoring.score}
                          </span>
                          {isAlreadyInList && (
                            <span className="text-xs text-gray-500">(Already in list)</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {company.industry}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageColor(company.stage)}`}>
                            {company.stage}
                          </span>
                          <span className="text-xs text-gray-500">
                            {company.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedIds.filter(id => !selectedCompanyIds.includes(id)).length} new companies selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedIds.filter(id => !selectedCompanyIds.includes(id)).length === 0}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
