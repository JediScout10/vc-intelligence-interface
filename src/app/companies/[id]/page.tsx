'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import companies, { Company } from '@/data/companies';
import CompanyOverview from '@/components/CompanyOverview';
import NotesSection from '@/components/NotesSection';
import SaveToListButton from '@/components/SaveToListButton';
import EnrichButton from '@/components/EnrichButton';
import ThesisMatch from '@/components/ThesisMatch';
import SignalTimeline from '@/components/SignalTimeline';
import { ThesisState } from '@/types/thesis';
import { computeScore, ScoreResult } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [thesis, setThesis] = useState<ThesisState | null>(null);
  const [enrichmentData, setEnrichmentData] = useState<any>(null);

  useEffect(() => {
    const companyId = params.id as string;
    const foundCompany = companies.find(c => c.id === companyId);
    
    if (!foundCompany) {
      router.push('/companies');
      return;
    }
    
    setCompany(foundCompany);
    setLoading(false);

    // Load thesis and enrichment data
    try {
      const thesisData = localStorage.getItem('investment-thesis');
      if (thesisData) {
        const parsed = JSON.parse(thesisData);
        if (parsed && typeof parsed.text === 'string') {
          setThesis(parsed);
        }
      }

      const enrichmentKey = `enrichment-${companyId}`;
      const enrichmentData = localStorage.getItem(enrichmentKey);
      if (enrichmentData) {
        const parsed = JSON.parse(enrichmentData);
        setEnrichmentData(parsed);
      }
    } catch (error) {
      // Handle errors silently
    }
  }, [params.id, router]);

  const handleEnrichmentUpdate = (data: any) => {
    setEnrichmentData(data);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-zinc-800 rounded"></div>
              <div className="h-48 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  // Calculate thesis match score
  const thesisScore = thesis && enrichmentData ? 
    computeScore(company, thesis.text) : null;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-neutral-600 hover:text-neutral-900"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Companies
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <CompanyOverview company={company} />
            <NotesSection companyId={company.id} />
            
            {/* Thesis Match */}
            <ThesisMatch score={thesisScore} />
            
            {/* Signal Timeline */}
            <SignalTimeline signals={enrichmentData?.signals || []} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <SaveToListButton company={company} />
            <EnrichButton company={company} onEnrichmentUpdate={handleEnrichmentUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}
