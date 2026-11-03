export type RiskGrade = 'A' | 'B' | 'C' | 'D' | 'E';
export type ChannelType = 'Direct Mobile App' | 'Fintech Aggregators' | 'DSA / Field Agency' | 'Organic Web Portal';
export type EmploymentType = 'Salaried Tier-1 Corp' | 'Salaried SME / Retail' | 'Self-Employed / MSME' | 'Gig & Contractual';
export type LoanPurpose = 
  | 'Debt Consolidation' 
  | 'Small Business Working Cap' 
  | 'Medical Emergency' 
  | 'Wedding & Social Events' 
  | 'Home Renovation' 
  | 'Higher Education / Upskill';

export interface LoanContract {
  id: string;
  borrowerName: string;
  city: string;
  grade: RiskGrade;
  cibilScore: number;
  monthlyIncome: number;
  loanAmount: number;
  tenureMonths: number;
  emi: number;
  dtiPct: number;
  ltiRatio: number;
  channel: ChannelType;
  employment: EmploymentType;
  purpose: LoanPurpose;
  disbursementQuarter: string;
  status: 'Performing' | 'Late 30-59 DPD' | 'Late 60-89 DPD' | 'Default (90+ DPD)';
  isDefault: boolean;
  recoveredAmount?: number;
  riskFlags: string[];
}

export interface PolicyParams {
  cibilCutoff: number;
  maxDtiCutoff: number;
  maxLtiCutoff: number;
  excludeGradeE: boolean;
  excludeAggregators: boolean;
  tightenGigRequirements: boolean;
}

export interface SimulationResult {
  simFundedVolume: number;
  simDisbursementCr: string;
  simTotalDefaults: number;
  simDefaultRate: string;
  simulatedCreditLoss: string;
  netSavingsCr: string;
  approvalRatePct: string;
  volumeDeltaPct: string;
  defaultRateDeltaPp: string;
  portfolioROE: string;
}

export interface StressTestScenario {
  id: string;
  name: string;
  description: string;
  macroShock: string;
  rateHikeBps: number;
  defaultRateMultiplier: number;
  volumeImpactPct: number;
  lossProvisionCrDelta: number;
}
