import { Company } from '@/data/companies';

interface CompanyOverviewProps {
  company: Company;
}

export default function CompanyOverview({ company }: CompanyOverviewProps) {
  const getStageColor = (stage: string) => {
    const colors = {
      'Seed': 'bg-emerald-900/80 text-emerald-300 border border-emerald-700',
      'Series A': 'bg-blue-900/80 text-blue-300 border border-blue-700',
      'Series B': 'bg-purple-900/80 text-purple-300 border border-purple-700',
      'Series C': 'bg-amber-900/80 text-amber-300 border border-amber-700',
      'Growth': 'bg-rose-900/80 text-rose-300 border border-rose-700',
      'IPO': 'bg-neutral-800 text-neutral-200 border border-neutral-600'
    };
    return colors[stage as keyof typeof colors] || 'bg-neutral-800 text-neutral-200 border border-neutral-600';
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {company.name}
          </h1>
          <div className="flex items-center gap-4 text-neutral-300">
            <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700">
              {company.industry}
            </span>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStageColor(company.stage)}`}>
              {company.stage}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-neutral-400 mb-2">Website</h3>
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-2"
          >
            {company.website.replace('https://', '').replace('http://', '')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <div>
          <h3 className="text-sm font-medium text-neutral-400 mb-2">Location</h3>
          <p className="text-neutral-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {company.location}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-neutral-400 mb-2">Stage</h3>
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStageColor(company.stage)}`}>
            {company.stage}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-medium text-neutral-400 mb-2">Industry</h3>
          <p className="text-neutral-100">{company.industry}</p>
        </div>
      </div>
    </div>
  );
}
