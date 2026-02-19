'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Company } from '@/data/companies';

interface EnrichmentData {
  success: boolean;
  summary: string;
  whatTheyDo: string[];
  keywords: string[];
  signals: string[];
  warning?: string;
  error?: string;
}

interface EnrichButtonProps {
  company: Company;
  onEnrichmentUpdate?: (data: EnrichmentData) => void;
}

// Demo mode enrichment data
const demoEnrichmentData: Record<string, EnrichmentData> = {
  '1': {
    success: true,
    summary: "Stripe is a financial technology company that provides payment processing and economic infrastructure for businesses of all sizes.",
    whatTheyDo: [
      "Payment processing for online businesses",
      "Financial infrastructure and APIs",
      "Stripe Connect for marketplaces",
      "Corporate card and spending management",
      "Banking as a service platform"
    ],
    keywords: ["payments", "fintech", "api", "infrastructure", "banking", "commerce"],
    signals: [
      "Founded 2010 by brothers Patrick and John Collison",
      "Processing billions of dollars annually",
      "Available in 47 countries globally",
      "Strong developer community and documentation",
      "Recent expansion into banking services"
    ]
  },
  '2': {
    success: true,
    summary: "Airbnb is an online marketplace for short-term homestays and experiences, connecting hosts with guests seeking accommodations worldwide.",
    whatTheyDo: [
      "Online accommodation marketplace",
      "Experience booking platform",
      "Host management tools",
      "Trust and safety systems",
      "Professional hospitality services"
    ],
    keywords: ["marketplace", "hospitality", "travel", "accommodation", "experiences", "sharing economy"],
    signals: [
      "Founded 2008 by Brian Chesky, Joe Gebbia, and Nathan Blecharczyk",
      "Over 7 million listings worldwide",
      "Public company with strong market presence",
      "Expanded into experiences and luxury rentals",
      "Strong brand recognition globally"
    ]
  }
};

export default function EnrichButton({ company, onEnrichmentUpdate }: EnrichButtonProps) {
  const [enrichmentData, setEnrichmentData] = useLocalStorage<Record<string, EnrichmentData>>(
    'enrichment-data',
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode] = useLocalStorage<boolean>('demo-mode', false);

  const companyEnrichment = enrichmentData[company.id];
  const hasEnrichmentData = companyEnrichment && companyEnrichment.summary;

  const handleEnrich = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let data: EnrichmentData;

      // Check if demo mode is enabled
      if (isDemoMode && demoEnrichmentData[company.id]) {
        // Use predefined demo data
        data = demoEnrichmentData[company.id];
      } else {
        // Use real API
        const response = await fetch('/api/enrich', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            websiteUrl: company.website
          }),
        });

        if (!response.ok) {
          throw new Error(`Enrichment service unavailable (${response.status})`);
        }

        data = await response.json();
      }

      // Handle response based on success/warning/error
      if (!data.success) {
        setError(data.error || 'Enrichment service unavailable');
        return;
      }

      // Store data even if there's a warning
      setEnrichmentData(prev => ({
        ...prev,
        [company.id]: data
      }));

      // Notify parent component if callback provided
      if (onEnrichmentUpdate) {
        onEnrichmentUpdate(data);
      }
    } catch (err) {
      // Only show error for actual failures, not scraping limitations
      const errorMessage = err instanceof Error ? err.message : 'Failed to enrich company data';
      setError(errorMessage);
      console.error('Enrichment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Data Enrichment</h3>
      
      {hasEnrichmentData ? (
        <div className="space-y-6">
          <div className="text-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-green-400 font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Enrichment Complete
              </span>
              <span className="text-neutral-400 text-xs">
                Enrichment completed
              </span>
            </div>
            
            {/* Summary */}
            {companyEnrichment?.summary && (
              <div className="mb-4">
                <h4 className="font-medium text-neutral-200 mb-2">Summary</h4>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  {companyEnrichment.summary}
                </p>
              </div>
            )}

            {/* Warning */}
            {companyEnrichment?.warning && (
              <div className="text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-800">
                <div className="font-medium mb-1">⚠ Limited Data Available</div>
                <div className="text-yellow-300 text-xs">{companyEnrichment.warning}</div>
              </div>
            )}

            {/* What They Do */}
            {Array.isArray(companyEnrichment?.whatTheyDo) && companyEnrichment.whatTheyDo.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-neutral-200 mb-2">What They Do</h4>
                <ul className="space-y-1">
                  {companyEnrichment.whatTheyDo.map((activity, index) => (
                    <li key={index} className="text-sm text-neutral-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Keywords */}
            {Array.isArray(companyEnrichment?.keywords) && companyEnrichment.keywords.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-neutral-200 mb-2">Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {companyEnrichment.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-neutral-800 text-neutral-300 rounded border border-neutral-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Signals */}
            {Array.isArray(companyEnrichment?.signals) && companyEnrichment.signals.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-neutral-200 mb-2">Signals</h4>
                <ul className="space-y-1">
                  {companyEnrichment.signals.map((signal, index) => (
                    <li key={index} className="text-sm text-neutral-300 flex items-start gap-2">
                      <span className="text-green-400 mt-1">✓</span>
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <button
            onClick={handleEnrich}
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-blue-400 border border-blue-600 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-neutral-300">
            Fetch and analyze company website to extract business insights, 
            keywords, and signals.
          </p>
          
          {error && (
            <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-800">
              <div className="font-medium mb-1">Error</div>
              <div>{error}</div>
            </div>
          )}
          
          <button
            onClick={handleEnrich}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Enrich Data
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
