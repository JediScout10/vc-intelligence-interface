import { Company } from '@/data/companies';

export interface ScoreBreakdown {
  industry: number;
  stage: number;
  keywords: number;
  signals: number;
  total: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  tier: 'Strong Fit' | 'Moderate Fit' | 'Weak Fit';
  matchedKeywords: string[];
  matchedSignals: string[];
}

export function getScoreTier(score: number): 'Strong Fit' | 'Moderate Fit' | 'Weak Fit' {
  if (score >= 70) return 'Strong Fit';
  if (score >= 40) return 'Moderate Fit';
  return 'Weak Fit';
}

export function getTierColor(tier: 'Strong Fit' | 'Moderate Fit' | 'Weak Fit'): string {
  switch (tier) {
    case 'Strong Fit': return 'text-green-400';
    case 'Moderate Fit': return 'text-yellow-400';
    case 'Weak Fit': return 'text-red-400';
  }
}

export function getTierBgColor(tier: 'Strong Fit' | 'Moderate Fit' | 'Weak Fit'): string {
  switch (tier) {
    case 'Strong Fit': return 'bg-green-900/20 text-green-300 border-green-700';
    case 'Moderate Fit': return 'bg-yellow-900/20 text-yellow-300 border-yellow-700';
    case 'Weak Fit': return 'bg-red-900/20 text-red-300 border-red-700';
  }
}

function getIndustryScore(companyIndustry: string, thesisKeywords: string[]): number {
  const normalizedCompanyIndustry = companyIndustry.toLowerCase();
  const normalizedKeywords = thesisKeywords.map(k => k.toLowerCase());
  
  // Exact match
  for (const keyword of normalizedKeywords) {
    if (normalizedCompanyIndustry === keyword || 
        normalizedCompanyIndustry.includes(keyword) || 
        keyword.includes(normalizedCompanyIndustry)) {
      return 30;
    }
  }
  
  // Related categories mapping
  const relatedCategories: Record<string, string[]> = {
    'fintech': ['finance', 'banking', 'payments', 'financial'],
    'ai/ml': ['artificial intelligence', 'machine learning', 'ai', 'ml'],
    'developer tools': ['devtools', 'development', 'programming', 'software development'],
    'productivity': ['productivity software', 'collaboration', 'workflow', 'efficiency'],
    'saas': ['software as a service', 'cloud software', 'subscription software'],
    'infrastructure': ['cloud infrastructure', 'devops', 'cloud services'],
    'enterprise': ['b2b', 'business software', 'enterprise software']
  };
  
  // Check for related category matches
  for (const [category, relatedTerms] of Object.entries(relatedCategories)) {
    if (normalizedCompanyIndustry.includes(category) || category.includes(normalizedCompanyIndustry)) {
      for (const keyword of normalizedKeywords) {
        if (relatedTerms.some(term => term.includes(keyword) || keyword.includes(term))) {
          return 15;
        }
      }
    }
  }
  
  return 0;
}

function getStageScore(companyStage: string, thesisKeywords: string[]): number {
  const normalizedStage = companyStage.toLowerCase();
  const normalizedKeywords = thesisKeywords.map(k => k.toLowerCase());
  
  // Check if thesis implies growth/mid-stage focus
  const growthKeywords = ['growth', 'scale', 'expansion', 'mature', 'established'];
  const earlyKeywords = ['early', 'seed', 'startup', 'emerging'];
  
  const hasGrowthFocus = normalizedKeywords.some(k => growthKeywords.some(g => k.includes(g)));
  const hasEarlyFocus = normalizedKeywords.some(k => earlyKeywords.some(e => k.includes(e)));
  
  // Stage scoring based on thesis focus
  if (hasGrowthFocus) {
    switch (normalizedStage) {
      case 'series a':
      case 'series b':
      case 'series c':
        return 20;
      case 'growth':
        return 10;
      case 'seed':
        return 5;
      case 'ipo':
        return 0;
    }
  } else if (hasEarlyFocus) {
    switch (normalizedStage) {
      case 'seed':
        return 20;
      case 'series a':
        return 15;
      case 'series b':
        return 10;
      case 'series c':
      case 'growth':
        return 5;
      case 'ipo':
        return 0;
    }
  } else {
    // Neutral thesis - moderate scoring
    switch (normalizedStage) {
      case 'series a':
      case 'series b':
        return 15;
      case 'seed':
      case 'series c':
        return 10;
      case 'growth':
        return 5;
      case 'ipo':
        return 0;
    }
  }
  
  return 0;
}

function getKeywordScore(company: Company, thesisKeywords: string[]): { score: number; matched: string[] } {
  const normalizedKeywords = thesisKeywords.map(k => k.toLowerCase());
  const matchedKeywords: string[] = [];
  
  // Search in company.industry, enrichment.keywords, enrichment.summary
  const searchableText = [
    company.industry.toLowerCase(),
    ...(company.enrichment?.keywords || []).map(k => k.toLowerCase()),
    (company.enrichment?.summary || '').toLowerCase()
  ].join(' ');
  
  let matchCount = 0;
  for (const keyword of normalizedKeywords) {
    if (searchableText.includes(keyword)) {
      matchedKeywords.push(keyword);
      matchCount++;
    }
  }
  
  // Scale: 0-5 matches → linear scale up to 25
  const score = Math.min(matchCount * 5, 25);
  
  return { score, matched: matchedKeywords };
}

function getSignalsScore(company: Company): { score: number; matched: string[] } {
  const validSignals = ['api', 'enterprise', 'developer', 'infrastructure', 'saas'];
  const companySignals = (company.enrichment?.signals || []).map(s => s.toLowerCase());
  const matchedSignals: string[] = [];
  
  let score = 0;
  for (const signal of validSignals) {
    if (companySignals.some(cs => cs.includes(signal))) {
      matchedSignals.push(signal);
      score += 5; // Each valid signal → +5 (max 25)
    }
  }
  
  return { score: Math.min(score, 25), matched: matchedSignals };
}

export function computeScore(company: Company, thesis: string): ScoreResult {
  const thesisKeywords = extractKeywords(thesis.toLowerCase());
  
  // Calculate individual components
  const industryScore = getIndustryScore(company.industry, thesisKeywords);
  const stageScore = getStageScore(company.stage, thesisKeywords);
  const { score: keywordScore, matched: matchedKeywords } = getKeywordScore(company, thesisKeywords);
  const { score: signalsScore, matched: matchedSignals } = getSignalsScore(company);
  
  // Calculate total
  const total = Math.min(industryScore + stageScore + keywordScore + signalsScore, 100);
  
  const breakdown: ScoreBreakdown = {
    industry: industryScore,
    stage: stageScore,
    keywords: keywordScore,
    signals: signalsScore,
    total
  };
  
  return {
    score: total,
    breakdown,
    tier: getScoreTier(total),
    matchedKeywords,
    matchedSignals
  };
}

export function computeScoredCompanies(companies: Company[], thesis: string) {
  return companies.map(company => ({
    ...company,
    scoring: computeScore(company, thesis)
  }));
}

export function getThesisSummary(companies: Company[], thesis: string) {
  if (!thesis) {
    return {
      strong: 0,
      moderate: 0,
      weak: companies.length
    };
  }
  
  const scoredCompanies = computeScoredCompanies(companies, thesis);
  
  return {
    strong: scoredCompanies.filter(c => c.scoring.tier === 'Strong Fit').length,
    moderate: scoredCompanies.filter(c => c.scoring.tier === 'Moderate Fit').length,
    weak: scoredCompanies.filter(c => c.scoring.tier === 'Weak Fit').length
  };
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .filter(word => !isStopWord(word))
    .slice(0, 20);
}

function isStopWord(word: string): boolean {
  const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'this', 'that', 'these', 'those', 'will', 'would', 'could', 'should', 'looking', 'seeking', 'interested', 'invest'];
  return stopWords.includes(word);
}
