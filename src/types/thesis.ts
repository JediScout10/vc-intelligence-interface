export interface ThesisState {
  text: string;
  updatedAt: string;
}

export interface CompanyScore {
  score: number;
  matchedKeywords: string[];
  matchedSignals: string[];
  reasoning: string[];
}
