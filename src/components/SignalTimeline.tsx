'use client';

interface SignalTimelineProps {
  signals: string[];
}

export default function SignalTimeline({ signals }: SignalTimelineProps) {
  const getSignalIcon = (signal: string) => {
    if (signal.toLowerCase().includes('founded')) return '🏢';
    if (signal.toLowerCase().includes('hiring')) return '👥';
    if (signal.toLowerCase().includes('pricing')) return '💰';
    if (signal.toLowerCase().includes('documentation')) return '📚';
    if (signal.toLowerCase().includes('api')) return '🔌';
    if (signal.toLowerCase().includes('developer')) return '👨‍💻';
    if (signal.toLowerCase().includes('blog')) return '📝';
    if (signal.toLowerCase().includes('careers')) return '🏢';
    return '📊';
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Signal Timeline</h3>
      
      {signals.length > 0 ? (
        <div className="space-y-3">
          {signals.map((signal, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="text-2xl mt-1">
                {getSignalIcon(signal)}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white font-medium">
                  {signal}
                </div>
                <div className="text-xs text-neutral-400">
                  Detected from website analysis
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-neutral-500 italic">
          No signals detected. Enrich the company data to see derived signals.
        </div>
      )}
    </div>
  );
}
