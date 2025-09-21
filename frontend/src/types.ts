// TypeScript types for agent responses
export interface VoiceResult {
  text: string;
  language: string;
  panic: boolean;
}

export interface TriageResult {
  esi_level: number;
  analysis: string;
}

export interface TranslationResult {
  translation: string;
}

export interface HistoryResult {
  history: string;
}

export interface VitalsResult {
  stress_level: string;
  heart_rate: number;
}

export interface DispatchResult {
  status: string;
  location: string;
}

export interface InsuranceResult {
  verified: boolean;
  provider: string;
}

export interface EmergencyFlowResult {
  voice: VoiceResult;
  triage: TriageResult;
  translation: string;
  history: HistoryResult;
  vitals: VitalsResult;
  dispatch: DispatchResult;
  insurance: InsuranceResult;
}
