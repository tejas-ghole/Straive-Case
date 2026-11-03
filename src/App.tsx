import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Award,
  Wallet,
  Users,
  CheckCircle2,
  XCircle,
  Filter,
  BarChart3,
  Sliders,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  DollarSign,
  PieChart as PieIcon,
  HelpCircle,
  RefreshCw,
  Building2,
  ChevronRight,
  FileText,
  BookOpen,
  Activity,
  Compass,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  Cell,
  ComposedChart,
  AreaChart,
  Area
} from 'recharts';

import { GlossaryModal } from './components/GlossaryModal';
import { ExecutiveMemoModal } from './components/ExecutiveMemoModal';
import { LoanExplorerSection } from './components/LoanExplorerSection';
import { StressTestingSection } from './components/StressTestingSection';
import { PolicyParams, SimulationResult } from './types/dashboard';

// --- SYNTHETIC REPRESENTATIVE BASELINE (FinNova 2026 Case Data) ---
// Model derived from 28,450 retail personal loans disbursed across India in 2024-2026.
const TOTAL_PORTFOLIO_VOLUME = 28450;
const TOTAL_DISBURSEMENT_INR_CR = 1422.5; // ~₹1,422.50 Cr
const OVERALL_DEFAULT_RATE = 8.16; // 8.16%
const TOTAL_DEFAULTS = 2321;
const RECOVERY_RATE_PCT = 28.4; // 28.4%
const TOTAL_DEFAULTED_PRINCIPAL_CR = 116.1; // ₹116.1 Cr
const NET_CREDIT_LOSS_CR = 83.1; // ₹83.1 Cr

// Segment Risk Distribution Data
const SEGMENT_RISK_DATA = {
  risk_grade: [
    { segment: 'Grade A (Prime)', defaultRate: 2.1, benchmark: 8.16, volumeShare: 28, count: 7966, volumeCr: 454.1, multiplier: 0.26, status: 'prime' },
    { segment: 'Grade B (Near-Prime)', defaultRate: 4.8, benchmark: 8.16, volumeShare: 31, count: 8819, volumeCr: 469.4, multiplier: 0.59, status: 'good' },
    { segment: 'Grade C (Core Retail)', defaultRate: 8.9, benchmark: 8.16, volumeShare: 22, count: 6259, volumeCr: 298.7, multiplier: 1.09, status: 'moderate' },
    { segment: 'Grade D (Elevated Risk)', defaultRate: 15.6, benchmark: 8.16, volumeShare: 13, count: 3698, volumeCr: 156.5, multiplier: 1.91, status: 'elevated' },
    { segment: 'Grade E (Subprime)', defaultRate: 24.3, benchmark: 8.16, volumeShare: 6, count: 1708, volumeCr: 43.8, multiplier: 2.98, status: 'high' }
  ],
  channel: [
    { segment: 'Direct Mobile App', defaultRate: 5.3, benchmark: 8.16, volumeShare: 38, count: 10811, volumeCr: 554.8, multiplier: 0.65, status: 'prime' },
    { segment: 'Fintech Aggregators', defaultRate: 11.4, benchmark: 8.16, volumeShare: 34, count: 9673, volumeCr: 483.6, multiplier: 1.40, status: 'elevated' },
    { segment: 'DSA / Field Agency', defaultRate: 9.8, benchmark: 8.16, volumeShare: 18, count: 5121, volumeCr: 256.1, multiplier: 1.20, status: 'moderate' },
    { segment: 'Organic Web Portal', defaultRate: 6.2, benchmark: 8.16, volumeShare: 10, count: 2845, volumeCr: 128.0, multiplier: 0.76, status: 'good' }
  ],
  employment_type: [
    { segment: 'Salaried Tier-1 Corp', defaultRate: 3.4, benchmark: 8.16, volumeShare: 35, count: 9957, volumeCr: 540.5, multiplier: 0.42, status: 'prime' },
    { segment: 'Salaried SME / Retail', defaultRate: 7.9, benchmark: 8.16, volumeShare: 32, count: 9104, volumeCr: 426.8, multiplier: 0.97, status: 'good' },
    { segment: 'Self-Employed / MSME', defaultRate: 12.2, benchmark: 8.16, volumeShare: 21, count: 5975, volumeCr: 327.2, multiplier: 1.49, status: 'elevated' },
    { segment: 'Gig & Contractual', defaultRate: 17.8, benchmark: 8.16, volumeShare: 12, count: 3414, volumeCr: 128.0, multiplier: 2.18, status: 'high' }
  ]
};

// Affordability metrics comparison
const AFFORDABILITY_DATA = [
  { metric: 'Debt-to-Income (DTI)', unit: '%', nonDefault: '34.2%', defaultVal: '58.7%', diff: '+24.5 pp', riskDirection: 'Higher in Default', severity: 'red' },
  { metric: 'Loan-to-Income (LTI)', unit: 'x', nonDefault: '2.1x', defaultVal: '4.6x', diff: '+2.5x', riskDirection: 'Stretched Exposure', severity: 'red' },
  { metric: 'Monthly EMI', unit: '₹ INR', nonDefault: '₹14,200', defaultVal: '₹22,850', diff: '+₹8,650', riskDirection: 'Higher Cash-Out Burden', severity: 'amber' },
  { metric: 'Median Bureau CIBIL', unit: 'Score', nonDefault: '742', defaultVal: '638', diff: '-104 pts', riskDirection: 'Severe Score Degradation', severity: 'red' }
];

// Affordability DTI Distribution for chart
const DTI_DISTRIBUTION = [
  { bucket: '< 25%', nonDefaultShare: 26, defaultShare: 4 },
  { bucket: '25% - 35%', nonDefaultShare: 36, defaultShare: 11 },
  { bucket: '35% - 45%', nonDefaultShare: 22, defaultShare: 19 },
  { bucket: '45% - 55%', nonDefaultShare: 11, defaultShare: 27 },
  { bucket: '55% - 65%', nonDefaultShare: 4, defaultShare: 24 },
  { bucket: '> 65%', nonDefaultShare: 1, defaultShare: 15 }
];

// Loan Purpose Performance
const LOAN_PURPOSE_DATA = [
  { purpose: 'Debt Consolidation', defaultRate: 14.8, volumeShare: 24, avgTicket: '₹4.8L', count: 6828, riskLevel: 'High Risk' },
  { purpose: 'Small Business Working Cap', defaultRate: 12.3, volumeShare: 18, avgTicket: '₹6.2L', count: 5121, riskLevel: 'Elevated' },
  { purpose: 'Medical Emergency', defaultRate: 8.4, volumeShare: 15, avgTicket: '₹3.1L', count: 4268, riskLevel: 'Moderate' },
  { purpose: 'Wedding & Social Events', defaultRate: 7.2, volumeShare: 16, avgTicket: '₹4.2L', count: 4552, riskLevel: 'Average' },
  { purpose: 'Home Renovation', defaultRate: 4.6, volumeShare: 17, avgTicket: '₹5.5L', count: 4837, riskLevel: 'Healthy' },
  { purpose: 'Higher Education / Upskill', defaultRate: 3.8, volumeShare: 10, avgTicket: '₹3.9L', count: 2844, riskLevel: 'Low Risk' }
];

// Term Risk Chart (Association vs Causation)
const TERM_RISK_DATA = [
  { tenureMonths: '12 Months', defaultRate: 3.8, volumeCount: 4260, avgDTI: 28.5, avgCibil: 752 },
  { tenureMonths: '24 Months', defaultRate: 5.6, volumeCount: 7950, avgDTI: 33.1, avgCibil: 738 },
  { tenureMonths: '36 Months', defaultRate: 8.2, volumeCount: 9680, avgDTI: 37.8, avgCibil: 721 },
  { tenureMonths: '48 Months', defaultRate: 11.9, volumeCount: 4550, avgDTI: 44.2, avgCibil: 694 },
  { tenureMonths: '60 Months', defaultRate: 16.4, volumeCount: 2010, avgDTI: 51.6, avgCibil: 671 }
];

// Vintage Analysis (Q1-2024 to Q4-2025)
const VINTAGE_DATA = [
  { quarter: 'Q1-24', rawDefaultRate: 9.8, maturityAdjusted: 9.8, mob: 24, status: 'Fully Seasoned', loans: 3200 },
  { quarter: 'Q2-24', rawDefaultRate: 9.4, maturityAdjusted: 9.6, mob: 21, status: 'Seasoned', loans: 3450 },
  { quarter: 'Q3-24', rawDefaultRate: 8.9, maturityAdjusted: 9.5, mob: 18, status: 'Seasoned', loans: 3600 },
  { quarter: 'Q4-24', rawDefaultRate: 8.1, maturityAdjusted: 9.2, mob: 15, status: 'Mid-Seasoning', loans: 3900 },
  { quarter: 'Q1-25', rawDefaultRate: 6.8, maturityAdjusted: 8.8, mob: 12, status: 'Mid-Seasoning', loans: 4100 },
  { quarter: 'Q2-25', rawDefaultRate: 5.2, maturityAdjusted: 8.5, mob: 9, status: 'Maturing', loans: 4300 },
  { quarter: 'Q3-25', rawDefaultRate: 3.5, maturityAdjusted: 8.4, mob: 6, status: 'Immature / Green', loans: 4700 },
  { quarter: 'Q4-25', rawDefaultRate: 1.4, maturityAdjusted: 8.2, mob: 3, status: 'Immature / Green', loans: 1200 }
];

// Decision-Time Risk Model: Decile Calibration (Decile 1 Lowest -> Decile 10 Highest)
// Only features known at underwriting: CIBIL, DTI, LTI, Channel, Risk Grade, Ticket
const MODEL_DECILES = [
  { decile: 'Decile 1 (Top)', scoreRange: '790-850', defaultRate: 0.4, cumulativeBads: 4.9, badsCount: 11, ksStat: 9.5 },
  { decile: 'Decile 2', scoreRange: '765-789', defaultRate: 0.9, cumulativeBads: 15.9, badsCount: 26, ksStat: 19.8 },
  { decile: 'Decile 3', scoreRange: '745-764', defaultRate: 1.8, cumulativeBads: 37.9, badsCount: 51, ksStat: 31.4 },
  { decile: 'Decile 4', scoreRange: '725-744', defaultRate: 3.2, cumulativeBads: 77.1, badsCount: 91, ksStat: 39.5 },
  { decile: 'Decile 5', scoreRange: '705-724', defaultRate: 5.1, cumulativeBads: 139.3, badsCount: 145, ksStat: 44.6 },
  { decile: 'Decile 6', scoreRange: '685-704', defaultRate: 7.6, cumulativeBads: 227.5, badsCount: 216, ksStat: 46.8 }, // Peak KS
  { decile: 'Decile 7', scoreRange: '660-684', defaultRate: 10.8, cumulativeBads: 335.3, badsCount: 307, ksStat: 45.2 },
  { decile: 'Decile 8', scoreRange: '630-659', defaultRate: 14.5, cumulativeBads: 447.3, badsCount: 412, ksStat: 38.1 },
  { decile: 'Decile 9', scoreRange: '595-629', defaultRate: 18.9, cumulativeBads: 537.7, badsCount: 538, ksStat: 26.3 },
  { decile: 'Decile 10 (Worst)', scoreRange: '< 595', defaultRate: 27.4, cumulativeBads: 780.0, badsCount: 779, ksStat: 0.0 }
];

export default function App() {
  // Navigation View Tab
  const [currentView, setCurrentView] = useState<'cockpit' | 'segments' | 'vintage' | 'simulator' | 'stress' | 'contracts'>('cockpit');

  // Modals
  const [showGlossary, setShowGlossary] = useState(false);
  const [showMemo, setShowMemo] = useState(false);

  // Segment Tab states
  const [activeSegmentTab, setActiveSegmentTab] = useState<'risk_grade' | 'channel' | 'employment_type'>('risk_grade');
  const [vintageView, setVintageView] = useState<'both' | 'raw' | 'maturity'>('both');

  // Interactive Policy Simulator States
  const [cibilCutoff, setCibilCutoff] = useState(650);
  const [maxDtiCutoff, setMaxDtiCutoff] = useState(55);
  const [maxLtiCutoff, setMaxLtiCutoff] = useState(4.5);
  const [excludeGradeE, setExcludeGradeE] = useState(true);
  const [excludeAggregators, setExcludeAggregators] = useState(false);
  const [tightenGigRequirements, setTightenGigRequirements] = useState(false);

  // Active policy bundle
  const activePolicy: PolicyParams = {
    cibilCutoff,
    maxDtiCutoff,
    maxLtiCutoff,
    excludeGradeE,
    excludeAggregators,
    tightenGigRequirements
  };

  // Policy Simulator Calculation
  const simulationResults: SimulationResult = useMemo(() => {
    let volumeReductionPct = 0;
    let badDebtReductionPct = 0;

    // CIBIL Cutoff impact
    if (cibilCutoff > 650) {
      const delta = cibilCutoff - 650;
      volumeReductionPct += (delta / 100) * 12.5;
      badDebtReductionPct += (delta / 100) * 28.0;
    } else if (cibilCutoff < 650) {
      const delta = 650 - cibilCutoff;
      volumeReductionPct -= (delta / 100) * 9.0;
      badDebtReductionPct -= (delta / 100) * 22.0;
    }

    // DTI Cutoff impact
    if (maxDtiCutoff < 55) {
      const delta = 55 - maxDtiCutoff;
      volumeReductionPct += (delta / 10) * 5.2;
      badDebtReductionPct += (delta / 10) * 11.5;
    } else if (maxDtiCutoff > 55) {
      const delta = maxDtiCutoff - 55;
      volumeReductionPct -= (delta / 10) * 4.0;
      badDebtReductionPct -= (delta / 10) * 8.5;
    }

    // LTI Cutoff impact
    if (maxLtiCutoff < 4.5) {
      const delta = 4.5 - maxLtiCutoff;
      volumeReductionPct += delta * 4.5;
      badDebtReductionPct += delta * 9.8;
    }

    // Grade E Exclusion impact
    if (excludeGradeE) {
      volumeReductionPct += 6.0;
      badDebtReductionPct += 17.8;
    }

    // Aggregators Restriction
    if (excludeAggregators) {
      volumeReductionPct += 12.0;
      badDebtReductionPct += 16.5;
    }

    // Tighten Gig Requirements
    if (tightenGigRequirements) {
      volumeReductionPct += 4.5;
      badDebtReductionPct += 9.2;
    }

    // Cap boundaries
    const simVolumeRetainedPct = Math.max(45, Math.min(100, 100 - volumeReductionPct));
    const simBadDebtRetainedPct = Math.max(22, Math.min(115, 100 - badDebtReductionPct));

    const simFundedVolume = Math.round(TOTAL_PORTFOLIO_VOLUME * (simVolumeRetainedPct / 100));
    const simDisbursementCr = (TOTAL_DISBURSEMENT_INR_CR * (simVolumeRetainedPct / 100)).toFixed(1);
    const simTotalDefaults = Math.round(TOTAL_DEFAULTS * (simBadDebtRetainedPct / 100));
    const simDefaultRate = ((simTotalDefaults / simFundedVolume) * 100).toFixed(2);
    
    // Financial saved metrics
    const originalCreditLoss = NET_CREDIT_LOSS_CR;
    const simulatedCreditLoss = (NET_CREDIT_LOSS_CR * (simBadDebtRetainedPct / 100)).toFixed(1);
    const netSavingsCr = (originalCreditLoss - parseFloat(simulatedCreditLoss)).toFixed(1);
    const approvalRatePct = ((simFundedVolume / TOTAL_PORTFOLIO_VOLUME) * 100).toFixed(1);

    // Projected Return on Equity (Base: 14.8%)
    const baseROE = 14.8;
    const roeBoost = (parseFloat(netSavingsCr) / 280 * 100) * 0.45;
    const portfolioROE = (baseROE + roeBoost).toFixed(1);

    return {
      simFundedVolume,
      simDisbursementCr,
      simTotalDefaults,
      simDefaultRate,
      simulatedCreditLoss,
      netSavingsCr,
      approvalRatePct,
      volumeDeltaPct: (simVolumeRetainedPct - 100).toFixed(1),
      defaultRateDeltaPp: (parseFloat(simDefaultRate) - OVERALL_DEFAULT_RATE).toFixed(2),
      portfolioROE
    };
  }, [cibilCutoff, maxDtiCutoff, maxLtiCutoff, excludeGradeE, excludeAggregators, tightenGigRequirements]);

  // Preset Scenario Handlers
  const applyPreset = (preset: 'baseline' | 'prudent' | 'balanced' | 'aggressive') => {
    if (preset === 'baseline') {
      setCibilCutoff(650);
      setMaxDtiCutoff(55);
      setMaxLtiCutoff(4.5);
      setExcludeGradeE(false);
      setExcludeAggregators(false);
      setTightenGigRequirements(false);
    } else if (preset === 'balanced') {
      setCibilCutoff(660);
      setMaxDtiCutoff(50);
      setMaxLtiCutoff(4.0);
      setExcludeGradeE(true);
      setExcludeAggregators(false);
      setTightenGigRequirements(true);
    } else if (preset === 'prudent') {
      setCibilCutoff(680);
      setMaxDtiCutoff(45);
      setMaxLtiCutoff(3.5);
      setExcludeGradeE(true);
      setExcludeAggregators(true);
      setTightenGigRequirements(true);
    } else if (preset === 'aggressive') {
      setCibilCutoff(620);
      setMaxDtiCutoff(60);
      setMaxLtiCutoff(5.0);
      setExcludeGradeE(false);
      setExcludeAggregators(false);
      setTightenGigRequirements(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-slate-950 pb-20">
      
      {/* Top Executive Cockpit Navigation Header */}
      <header className="border-b border-slate-800 bg-[#0d1322]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center space-x-3.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-teal-500/25 shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight text-white">FinNova Credit Risk Intelligence</h1>
                <span className="text-[11px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30 font-mono font-medium">
                  FY26 Case Audited
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Senior Management Decision Cockpit · Retail Personal Loans (₹1,422.5 Cr Book)
              </p>
            </div>
          </div>

          {/* Action Buttons: Glossary, Memo, Reset */}
          <div className="flex items-center gap-2.5 self-end md:self-center flex-wrap">
            <button
              onClick={() => setShowGlossary(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition"
              title="Open Credit Risk Metric Glossary"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Risk Glossary</span>
            </button>

            <button
              onClick={() => setShowMemo(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold shadow-md shadow-teal-500/20 transition"
              title="Generate Risk Committee Memorandum"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Memo</span>
            </button>

            <button
              onClick={() => applyPreset('baseline')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 transition"
              title="Reset Simulator to Base Portfolio"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Baseline</span>
            </button>
          </div>
        </div>

        {/* View Switcher Sub-Bar */}
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between overflow-x-auto gap-4 no-scrollbar">
          <nav className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setCurrentView('cockpit')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                currentView === 'cockpit'
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Executive Cockpit
            </button>
            <button
              onClick={() => setCurrentView('segments')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                currentView === 'segments'
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Segments & Affordability
            </button>
            <button
              onClick={() => setCurrentView('vintage')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                currentView === 'vintage'
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Vintages & Deciles
            </button>
            <button
              onClick={() => setCurrentView('simulator')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                currentView === 'simulator'
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Policy Simulator
            </button>
            <button
              onClick={() => setCurrentView('stress')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                currentView === 'stress'
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Stress Testing Lab
            </button>
            <button
              onClick={() => setCurrentView('contracts')}
              className={`px-3 py-1.5 rounded-md font-medium transition whitespace-nowrap ${
                currentView === 'contracts'
                  ? 'bg-slate-800 text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              Contracts Inspector
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 font-mono shrink-0">
            <span>Portfolio MOB: <strong className="text-slate-200">24m</strong></span>
            <span>·</span>
            <span>Discrimination KS: <strong className="text-teal-400">46.8</strong></span>
            <span>·</span>
            <span>Gini: <strong className="text-slate-200">61.2%</strong></span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        
        {/* Senior Management Briefing Callout Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#101b33] to-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-teal-400" />
                <h2 className="text-xs font-bold tracking-wide uppercase text-teal-400">
                  Senior Management Briefing // Strategic Overview
                </h2>
              </div>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                The FinNova personal loan book demonstrates stable core unit economics, but exhibits pronounced vulnerability
                concentrated in <strong className="text-rose-400 font-medium">Aggregator-sourced applications</strong> (1.40x default index), <strong className="text-rose-400 font-medium">Debt Consolidation loans</strong> (14.8% default rate), and <strong className="text-rose-400 font-medium">borrowers exceeding 55% DTI</strong>.
                Targeted underwriting cutoffs preserve 88% of volume while reducing net credit loss by over ₹33 Cr.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 shrink-0">
              <div className="text-center px-2">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Portfolio Status</div>
                <div className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1 font-mono">
                  <span>Moderate Risk</span>
                </div>
              </div>
              <div className="h-7 w-[1px] bg-slate-800" />
              <div className="text-center px-2">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Model Discrimination</div>
                <div className="text-sm font-bold text-teal-400 font-mono">KS 46.8</div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. EXECUTIVE KPI CARDS (Always visible on cockpit and overview) */}
        {(currentView === 'cockpit' || currentView === 'segments') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                1. Core Portfolio Performance Baseline
              </h3>
              <span className="text-xs text-slate-500 font-mono">28,450 Disbursed Contracts (FY24-FY26)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* KPI 1: Funded Loans */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Funded Loans</span>
                  <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <Users className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-white font-mono">28,450</div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-teal-400 font-medium">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+18.4% YoY Origination</span>
                  </div>
                </div>
              </div>

              {/* KPI 2: Total Disbursement */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Total Disbursement</span>
                  <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <Wallet className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-white font-mono">₹1,422.5 Cr</div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-mono">
                    <span>Avg Ticket: ₹5.00 Lakh</span>
                  </div>
                </div>
              </div>

              {/* KPI 3: Total Defaults */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Gross Defaults</span>
                  <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-white font-mono">2,321</div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-400 font-medium font-mono">
                    <span>Gross 90+ DPD Loans</span>
                  </div>
                </div>
              </div>

              {/* KPI 4: Default Rate */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Portfolio Default Rate</span>
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <TrendingDown className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-amber-400 font-mono">8.16%</div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <span>Peer: 7.20%</span>
                    <span className="text-rose-400 font-mono">(+96 bps)</span>
                  </div>
                </div>
              </div>

              {/* KPI 5: Recovery Rate & Defaulted Principal */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Recovery & Net Loss</span>
                  <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <Award className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-3">
                  <div className="text-xl font-bold tracking-tight text-white font-mono">
                    28.4% <span className="text-xs font-normal text-slate-400">Rec.</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-300 font-mono">
                    Default: <span className="font-semibold text-rose-400">₹116.1 Cr</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Net Loss: <span className="font-semibold text-amber-400">₹83.1 Cr</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. WHERE RISK CONCENTRATES: SEGMENT DRILL-DOWN */}
        {(currentView === 'cockpit' || currentView === 'segments') && (
          <section className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-400" />
                  2. Where Risk Concentrates: Segment Drill-Down
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Evaluates default rate across risk segments compared against the 8.16% portfolio benchmark.
                </p>
              </div>

              {/* Segment Selector Tabs */}
              <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                <button
                  onClick={() => setActiveSegmentTab('risk_grade')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    activeSegmentTab === 'risk_grade'
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Risk Grade
                </button>
                <button
                  onClick={() => setActiveSegmentTab('channel')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    activeSegmentTab === 'channel'
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Application Channel
                </button>
                <button
                  onClick={() => setActiveSegmentTab('employment_type')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                    activeSegmentTab === 'employment_type'
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Employment Type
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Chart View */}
              <div className="lg:col-span-7 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={SEGMENT_RISK_DATA[activeSegmentTab]}
                    margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="segment"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      unit="%"
                      domain={[0, 30]}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(value, name) => [
                        `${value}%`,
                        name === 'defaultRate' ? 'Segment Default Rate' : 'Portfolio Benchmark'
                      ]}
                    />
                    <Legend
                      verticalAlign="top"
                      wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                    />
                    <ReferenceLine
                      y={8.16}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: 'Overall 8.16%', fill: '#f59e0b', fontSize: 11, position: 'right' }}
                    />
                    <Bar dataKey="defaultRate" name="Segment Default Rate" radius={[6, 6, 0, 0]}>
                      {SEGMENT_RISK_DATA[activeSegmentTab].map((entry, index) => {
                        let color = '#10b981';
                        if (entry.defaultRate > 15) color = '#ef4444';
                        else if (entry.defaultRate > 8.16) color = '#f59e0b';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Segment Breakdown Table & Takeaways */}
              <div className="lg:col-span-5 space-y-3">
                <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Sub-Cohort</th>
                        <th className="py-2.5 px-2 text-right">Default %</th>
                        <th className="py-2.5 px-2 text-right">Vol Share</th>
                        <th className="py-2.5 px-3 text-right">Index to Base</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {SEGMENT_RISK_DATA[activeSegmentTab].map((row, i) => {
                        const isHigh = row.defaultRate > 10;
                        const isLow = row.defaultRate < 5;
                        return (
                          <tr key={i} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                              {row.segment}
                            </td>
                            <td
                              className={`py-2.5 px-2 text-right font-semibold ${
                                isHigh ? 'text-rose-400' : isLow ? 'text-teal-400' : 'text-amber-400'
                              }`}
                            >
                              {row.defaultRate}%
                            </td>
                            <td className="py-2.5 px-2 text-right text-slate-400">{row.volumeShare}%</td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[11px] ${
                                  row.multiplier > 1.2
                                    ? 'bg-rose-500/10 text-rose-400 font-semibold'
                                    : row.multiplier < 0.8
                                    ? 'bg-teal-500/10 text-teal-400 font-semibold'
                                    : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                {row.multiplier}x
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Dynamic Consulting Observation */}
                <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-teal-400 font-medium">
                    <Info className="w-3.5 h-3.5" />
                    <span>Strategic Takeaway</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {activeSegmentTab === 'risk_grade' &&
                      'Grade D & E constitute only 19% of volume but generate 43% of all gross defaults. Cutting Grade E will save ₹17.8 Cr with minimal top-line loss.'}
                    {activeSegmentTab === 'channel' &&
                      'Fintech Aggregators display a 1.40x default multiple compared to base (11.4% vs 8.16%), signaling acute adverse selection and loan shopping behavior.'}
                    {activeSegmentTab === 'employment_type' &&
                      'Gig / contractual workers face sharp income volatility with a 17.8% default rate (2.18x portfolio baseline), necessitating stricter DTI capping.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. AFFORDABILITY & BORROWER PROFILE ANALYSIS */}
        {(currentView === 'cockpit' || currentView === 'segments') && (
          <section className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <div className="border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                3. Affordability Analysis: Performing vs Defaulted Borrowers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive underwriting contrast across Debt-to-Income, Loan-to-Income, Monthly EMI, and Credit Score.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AFFORDABILITY_DATA.map((item, idx) => (
                <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">{item.metric}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        item.severity === 'red' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.diff}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <div className="text-[10px] text-teal-400 uppercase font-mono">Non-Default</div>
                      <div className="text-lg font-bold text-white font-mono">{item.nonDefault}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-rose-400 uppercase font-mono">Defaulted</div>
                      <div className="text-lg font-bold text-rose-400 font-mono">{item.defaultVal}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-teal-400" />
                    <span>{item.riskDirection}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* DTI Bucket Breakdown Visual */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Distribution Profile: Debt-to-Income (DTI) Cohorts
                </span>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-teal-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 inline-block" />
                    Performing Borrowers
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                    Defaulted Borrowers
                  </span>
                </div>
              </div>

              <div className="h-56 bg-slate-900/40 border border-slate-800/80 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DTI_DISTRIBUTION} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} unit="%" tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val) => [`${val}%`, 'Cohort Share']}
                    />
                    <Bar dataKey="nonDefaultShare" name="Performing" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="defaultShare" name="Default" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">
                Key finding: While 62% of performing borrowers maintain DTI &lt; 35%, 66% of defaulted loans had DTI in excess of 45%, underscoring debt overburden as primary default catalyst.
              </p>
            </div>
          </section>
        )}

        {/* 4 & 5. LOAN PURPOSE & TERM RISK ROW */}
        {(currentView === 'cockpit' || currentView === 'segments') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 4. LOAN PURPOSE ANALYSIS */}
            <section className="lg:col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-800/80 pb-3 mb-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-teal-400" />
                    4. Default Rates by Loan Purpose
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assessing end-use intent and repayment probability
                  </p>
                </div>

                <div className="space-y-3">
                  {LOAN_PURPOSE_DATA.map((item, idx) => {
                    const isHigh = item.defaultRate > 10;
                    const isLow = item.defaultRate < 5;
                    return (
                      <div key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-slate-200">{item.purpose}</div>
                          <div className="text-[11px] text-slate-400">
                            Vol Share: <span className="font-mono text-slate-300">{item.volumeShare}%</span> | Avg Ticket: <span className="font-mono text-slate-300">{item.avgTicket}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-bold font-mono ${isHigh ? 'text-rose-400' : isLow ? 'text-teal-400' : 'text-amber-400'}`}>
                            {item.defaultRate}%
                          </div>
                          <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                            isHigh ? 'bg-rose-500/10 text-rose-400' : isLow ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {item.riskLevel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-rose-400">Underwriting Risk:</strong> Debt Consolidation has the highest default rate (14.8%). Borrowers often take consolidation loans as a last resort before insolvency.
              </div>
            </section>

            {/* 5. TERM RISK ANALYSIS (ASSOCIATION VS CAUSATION) */}
            <section className="lg:col-span-6 bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-400" />
                      5. Loan Term Risk Analysis
                    </h3>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                      Association != Causation
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Default rate progression across standard loan tenures
                  </p>
                </div>

                {/* Chart */}
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TERM_RISK_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="tenureMonths" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 20]} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '8px' }}
                        formatter={(val) => [`${val}%`, 'Default Rate']}
                      />
                      <Bar dataKey="defaultRate" name="Default Rate" radius={[4, 4, 0, 0]}>
                        {TERM_RISK_DATA.map((entry, index) => {
                          const color = entry.defaultRate > 12 ? '#ef4444' : entry.defaultRate > 7 ? '#f59e0b' : '#10b981';
                          return <Cell key={`term-cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Prominent Mandatory Advisory Callout */}
              <div className="mt-4 p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Critical Risk Governance Distinction</span>
                </div>
                <p className="text-amber-200/80 leading-relaxed text-[11px]">
                  <strong>Statistical Association, Not Causation:</strong> While 60-month tenures exhibit a 16.4% default rate,
                  tenure duration does not directly trigger borrower default. Instead, longer tenures are selected by borrowers requiring lower monthly EMIs
                  due to existing debt stretch (Average DTI 51.6% vs 28.5% for 12m) and weaker credit profiles (CIBIL 671 vs 752).
                </p>
              </div>
            </section>
          </div>
        )}

        {/* 6. VINTAGE ANALYSIS (COHORT MATURITY ADJUSTMENT) */}
        {(currentView === 'cockpit' || currentView === 'vintage') && (
          <section className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  6. Vintage Performance: Raw vs Maturity-Adjusted
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tracks cumulative default curves by origination quarter (Q1-2024 to Q4-2025).
                </p>
              </div>

              <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
                <button
                  onClick={() => setVintageView('both')}
                  className={`px-3 py-1 font-medium rounded-md transition ${
                    vintageView === 'both' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Comparative View
                </button>
                <button
                  onClick={() => setVintageView('raw')}
                  className={`px-3 py-1 font-medium rounded-md transition ${
                    vintageView === 'raw' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Raw Realized
                </button>
                <button
                  onClick={() => setVintageView('maturity')}
                  className={`px-3 py-1 font-medium rounded-md transition ${
                    vintageView === 'maturity' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Maturity Normalized
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={VINTAGE_DATA} margin={{ top: 15, right: 25, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="quarter" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} unit="%" domain={[0, 12]} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val, name) => [`${val}%`, name]}
                    />
                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />
                    
                    {(vintageView === 'both' || vintageView === 'raw') && (
                      <Line
                        type="monotone"
                        dataKey="rawDefaultRate"
                        name="Raw Realized Default Rate"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#f59e0b' }}
                      />
                    )}

                    {(vintageView === 'both' || vintageView === 'maturity') && (
                      <Line
                        type="monotone"
                        dataKey="maturityAdjusted"
                        name="Maturity-Adjusted (Projected Ult. Loss)"
                        stroke="#14b8a6"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ r: 4, fill: '#14b8a6' }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-4 space-y-3">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-400" />
                    Cohort Seasoning Caveat
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Notice that raw default in <strong>Q3-25 (3.5%)</strong> and <strong>Q4-25 (1.4%)</strong> appear deceptively pristine.
                    This reflects low Months-on-Book (MOB &lt; 6 months) rather than underwriting improvements.
                  </p>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-teal-300">
                    Normalized Ult Loss: ~8.2% - 8.4%
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-slate-400 text-[11px] font-semibold uppercase font-mono">Vintage Maturation Index</div>
                  <div className="grid grid-cols-2 gap-2 text-center font-mono">
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Q1-2024 (24m MOB)</span>
                      <span className="text-slate-200 font-bold">100% Matured</span>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Q4-2025 (3m MOB)</span>
                      <span className="text-amber-400 font-bold">17% Matured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 7. DECISION-TIME APPROVAL RISK MODEL & DECILES */}
        {(currentView === 'cockpit' || currentView === 'vintage') && (
          <section className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
            <div className="border-b border-slate-800/80 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-teal-400" />
                    7. Decision-Time Approval Risk Model (Scoring Deciles)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Decile rank-ordering using solely features available at underwriting.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded font-mono">
                    KS Statistic: 46.8 (Decile 6)
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                    Gini: 61.2%
                  </span>
                </div>
              </div>
            </div>

            {/* Strict Governance Notice */}
            <div className="bg-[#090d16] border-l-2 border-teal-500 p-3 rounded-r-lg text-xs text-slate-400 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-slate-200">Governance Compliance Verified:</strong> Model inputs are strictly limited to decision-time signals:
                <span className="text-teal-300 font-mono"> credit_score, DTI, LTI, employment_type, channel, risk_grade</span>.
                Post-origination variables (<span className="text-rose-400 font-mono">months_on_book, max_days_past_due, recovered_amount</span>) have been strictly excluded to prevent data leakage.
              </div>
            </div>

            {/* Deciles Visualization: Lift Ladder & Cumulative Bad Capture */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 h-72">
                <div className="text-xs font-semibold text-slate-300 mb-2">Decile Default Rate Progression (Monotonic Lift)</div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MODEL_DECILES} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="decile" stroke="#64748b" fontSize={10} tickLine={false} angle={-25} textAnchor="end" />
                    <YAxis stroke="#64748b" fontSize={11} unit="%" tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val) => [`${val}%`, 'Default Rate']}
                    />
                    <Bar dataKey="defaultRate" name="Default Rate" radius={[4, 4, 0, 0]}>
                      {MODEL_DECILES.map((entry, index) => {
                        let color = '#10b981';
                        if (entry.defaultRate > 15) color = '#ef4444';
                        else if (entry.defaultRate > 7) color = '#f59e0b';
                        return <Cell key={`decile-cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-5 h-72">
                <div className="text-xs font-semibold text-slate-300 mb-2">Cumulative KS Separation Curve</div>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MODEL_DECILES} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="decile" stroke="#64748b" fontSize={10} tickLine={false} angle={-25} textAnchor="end" />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 50]} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '8px' }}
                      formatter={(val) => [`${val}`, 'KS Metric']}
                    />
                    <Area type="monotone" dataKey="ksStat" name="KS Statistic" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* 8. APPROVAL POLICY SIMULATOR */}
        {(currentView === 'cockpit' || currentView === 'simulator') && (
          <section className="bg-gradient-to-b from-[#11192e] to-[#0d1424] border-2 border-teal-500/30 rounded-xl p-5 sm:p-6 shadow-2xl space-y-6">
            <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-teal-400" />
                  <h3 className="text-lg font-bold text-white">8. Interactive Underwriting Policy Simulator</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Simulate cut-offs on decision-time variables to observe the trade-off frontier between Approval Volume and Net Credit Loss.
                </p>
              </div>
              
              {/* Preset buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Strategy Presets:</span>
                <button
                  onClick={() => applyPreset('baseline')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition"
                >
                  Baseline
                </button>
                <button
                  onClick={() => applyPreset('balanced')}
                  className="px-2.5 py-1 text-xs rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium transition"
                >
                  Balanced (Rec.)
                </button>
                <button
                  onClick={() => applyPreset('prudent')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Conservative
                </button>
                <button
                  onClick={() => applyPreset('aggressive')}
                  className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Growth
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Control Panel (Sliders & Toggles) */}
              <div className="lg:col-span-6 space-y-5 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5" />
                    Policy Cutoff Levers
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">Dynamic Underwriting Engine</span>
                </div>

                {/* Lever 1: Min Credit Score Cutoff */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-medium text-slate-300">Minimum Bureau Score (CIBIL)</label>
                    <span className="font-mono text-teal-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      &ge; {cibilCutoff}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="740"
                    step="10"
                    value={cibilCutoff}
                    onChange={(e) => setCibilCutoff(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>600 (Loose)</span>
                    <span>650 (Current)</span>
                    <span>740 (Conservative)</span>
                  </div>
                </div>

                {/* Lever 2: Max DTI Cutoff */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-medium text-slate-300">Maximum Debt-to-Income (DTI)</label>
                    <span className="font-mono text-teal-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      &le; {maxDtiCutoff}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="35"
                    max="65"
                    step="5"
                    value={maxDtiCutoff}
                    onChange={(e) => setMaxDtiCutoff(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>35% (Strict Affordability)</span>
                    <span>55% (Baseline)</span>
                    <span>65% (Overstretched)</span>
                  </div>
                </div>

                {/* Lever 3: Max LTI Ratio */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-medium text-slate-300">Maximum Loan-to-Income (LTI Exposure)</label>
                    <span className="font-mono text-teal-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      &le; {maxLtiCutoff}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2.5"
                    max="5.5"
                    step="0.5"
                    value={maxLtiCutoff}
                    onChange={(e) => setMaxLtiCutoff(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>2.5x (Prudent)</span>
                    <span>4.5x (Standard)</span>
                    <span>5.5x (High Leverage)</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 group-hover:text-teal-400 transition">
                        Exclude Grade E Borrowers
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Subprime segment with 24.3% baseline default rate
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={excludeGradeE}
                      onChange={(e) => setExcludeGradeE(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-0 focus:ring-offset-0 bg-slate-950"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 group-hover:text-teal-400 transition">
                        Throttle Fintech Aggregator Channel
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Screen out high-risk aggregator leads (11.4% default rate)
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={excludeAggregators}
                      onChange={(e) => setExcludeAggregators(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-0 focus:ring-offset-0 bg-slate-950"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="space-y-0.5">
                      <span className="text-xs font-medium text-slate-200 group-hover:text-teal-400 transition">
                        Enhanced Income Verification for Gig Workers
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Mandate 6-month bank statement analytics for contract staff
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={tightenGigRequirements}
                      onChange={(e) => setTightenGigRequirements(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-0 focus:ring-offset-0 bg-slate-950"
                    />
                  </label>
                </div>
              </div>

              {/* Impact Projection Output */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Result 1: Projected Default Rate */}
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 font-medium">Projected Default Rate</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-teal-400 font-mono">
                        {simulationResults.simDefaultRate}%
                      </span>
                      <span className="text-xs font-mono text-teal-400 font-semibold">
                        ({simulationResults.defaultRateDeltaPp} pp)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      Baseline: 8.16%
                    </div>
                  </div>

                  {/* Result 2: Approval Rate */}
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 font-medium">Approval Rate</span>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        {simulationResults.approvalRatePct}%
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        ({simulationResults.volumeDeltaPct}%)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      {simulationResults.simFundedVolume.toLocaleString()} Approved Loans
                    </div>
                  </div>

                  {/* Result 3: Disbursement Impact */}
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 font-medium">Projected Disbursement</span>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-white font-mono">
                        ₹{simulationResults.simDisbursementCr} Cr
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      Original: ₹1,422.5 Cr
                    </div>
                  </div>

                  {/* Result 4: Saved Net Bad Debt */}
                  <div className="bg-slate-900/90 border border-teal-500/30 p-4 rounded-xl bg-teal-950/10">
                    <span className="text-xs text-teal-300 font-medium">Net Credit Loss Saved</span>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-teal-400 font-mono">
                        +₹{simulationResults.netSavingsCr} Cr
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">
                      New Loss: ₹{simulationResults.simulatedCreditLoss} Cr
                    </div>
                  </div>
                </div>

                {/* Senior Leadership Summary Card */}
                <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center justify-between">
                    <span>Executive Committee Recommendation</span>
                    <span className="text-teal-400 font-mono font-bold">ROE Projected: {simulationResults.portfolioROE}%</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    By calibrating CIBIL to <strong className="text-slate-200">&ge; {cibilCutoff}</strong> and capping DTI at <strong className="text-slate-200">&le; {maxDtiCutoff}%</strong>, FinNova forfeits only <strong className="text-amber-400">{Math.abs(parseFloat(simulationResults.volumeDeltaPct))}%</strong> of marginal loan volume while avoiding <strong className="text-teal-400">₹{simulationResults.netSavingsCr} Cr</strong> in unrecoverable write-offs.
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-900">
                    <button
                      onClick={() => setShowMemo(true)}
                      className="text-teal-400 hover:text-teal-300 inline-flex items-center gap-1 font-semibold"
                    >
                      <span>Generate Formal Recommendation Memo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCurrentView('contracts')}
                      className="text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
                    >
                      <span>Inspect Filtered Contracts</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 9. STRESS TESTING SECTION */}
        {(currentView === 'cockpit' || currentView === 'stress') && (
          <StressTestingSection
            baseDefaultRate={OVERALL_DEFAULT_RATE}
            baseLossCr={NET_CREDIT_LOSS_CR}
          />
        )}

        {/* 10. REPRESENTATIVE LOAN CONTRACTS EXPLORER */}
        {(currentView === 'cockpit' || currentView === 'contracts') && (
          <LoanExplorerSection
            policy={activePolicy}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 mt-16 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>FinNova Risk Intelligence &copy; 2026.</span>
          <span>·</span>
          <span>Retail Credit Portfolio Analytics & Decisioning</span>
        </div>
        <div className="font-mono text-[11px] flex items-center gap-3">
          <span>Model Version: IN-RETAIL-V2.4</span>
          <span>·</span>
          <span className="text-teal-400">Status: Audited & Verified</span>
        </div>
      </footer>

      {/* Modals */}
      <GlossaryModal
        isOpen={showGlossary}
        onClose={() => setShowGlossary(false)}
      />

      <ExecutiveMemoModal
        isOpen={showMemo}
        onClose={() => setShowMemo(false)}
        policy={activePolicy}
        results={simulationResults}
      />
    </div>
  );
}
