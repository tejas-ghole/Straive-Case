import React, { useState } from 'react';
import { X, FileText, Copy, Check, Download, Building, ShieldCheck } from 'lucide-react';
import { SimulationResult, PolicyParams } from '../types/dashboard';

interface ExecutiveMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: PolicyParams;
  results: SimulationResult;
}

export const ExecutiveMemoModal: React.FC<ExecutiveMemoModalProps> = ({
  isOpen,
  onClose,
  policy,
  results
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const memoDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const memoText = `FINNOVA FINANCIAL TECHNOLOGIES LIMITED
EXECUTIVE RISK MANAGEMENT COMMITTEE (RMC) MEMORANDUM
DATE: ${memoDate}
SUBJECT: RETAIL PERSONAL LOAN PORTFOLIO REVIEW & POLICY SIMULATION RECOMMENDATION
CLASSIFICATION: STRICTLY CONFIDENTIAL // SENIOR LEADERSHIP ONLY

1. EXECUTIVE SUMMARY & PORTFOLIO HEALTH
FinNova's retail personal loan book (₹1,422.50 Cr total disbursements across 28,450 originated accounts) exhibits steady top-line growth (+18.4% YoY) but currently carries an unhedged portfolio default rate of 8.16% (96 bps above the industry benchmark of 7.20%), resulting in ₹83.1 Cr in net unrecoverable credit losses.

2. ACTIVE POLICY SIMULATION PARAMETERS
- Bureau Cutoff (CIBIL): >= ${policy.cibilCutoff} (Baseline: >= 650)
- Maximum Allowed Debt-to-Income (DTI): <= ${policy.maxDtiCutoff}% (Baseline: <= 55%)
- Subprime Grade E Origination: ${policy.excludeGradeE ? 'STRICTLY PROHIBITED' : 'ALLOWED'}
- Fintech Aggregator Channel: ${policy.excludeAggregators ? 'THROTTLED / RESTRICTED' : 'STANDARD VOLUME'}

3. PROJECTED PORTFOLIO OUTCOMES UNDER SIMULATED POLICY
- Approved Loan Volume: ${results.simFundedVolume.toLocaleString()} contracts (${results.approvalRatePct}% approval rate; delta: ${results.volumeDeltaPct}%)
- Total Capital Disbursed: ₹${results.simDisbursementCr} Cr
- Gross Defaults Avoided: ~${(2321 - results.simTotalDefaults).toLocaleString()} defaulted contracts
- Projected Default Rate: ${results.simDefaultRate}% (Reduction of ${Math.abs(parseFloat(results.defaultRateDeltaPp))} percentage points)
- Net Credit Loss Avoidance: ₹${results.netSavingsCr} Cr saved
- Revised Projected Credit Loss: ₹${results.simulatedCreditLoss} Cr (Down from ₹83.1 Cr baseline)

4. ROOT CAUSE RISK CONCENTRATIONS
- Aggregator Sourcing: Displays a 1.40x default multiple (11.4% vs 8.16% base) driven by multi-platform loan shopping and acute adverse selection.
- Debt Consolidation End-Use: Delivers highest segment failure at 14.8% default rate, indicating pre-insolvency stress.
- Leverage Overburden: Defaulted borrowers display median DTI of 58.7% vs 34.2% for performing accounts; 66% of bad loans breach 45% DTI.
- Tenure Distortion: 60-month tenures carry 16.4% default rate, reflecting borrower distress self-selection rather than term length causation.

5. STRATEGIC DIRECTIVES RECOMMENDED TO THE BOARD
a. Adopt CIBIL >= ${policy.cibilCutoff} and cap DTI at <= ${policy.maxDtiCutoff}% effective immediately across all digital onboarding channels.
b. Discontinue subprime Grade E underwriting across all sourcing channels.
c. Implement dynamic aggregator tiering with strict DTI ceilings of 45% for multi-inquiry leads.
d. Re-calibrate underwriting scorecards semi-annually ensuring strict exclusion of post-origination data leakage.

Prepared by: FinNova Risk Analytics & Portfolio Modeling Unit
Approved for Circulation: Chief Risk Officer (CRO) & Credit Committee
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(memoText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-[#0c1322] border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Board & Risk Committee Memorandum</h3>
              <p className="text-xs text-slate-400">Institutional credit risk policy proposal ready for review</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-medium border border-teal-500/30 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Memorandum'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Memo Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs bg-slate-950/90 text-slate-300">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <div className="text-sm font-bold text-teal-400">FINNOVA FINANCIAL TECHNOLOGIES LIMITED</div>
              <div className="text-[11px] text-slate-400">RISK MANAGEMENT COMMITTEE // BOARD OF DIRECTORS</div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <div>STATUS: <span className="text-amber-400 font-bold">CONFIDENTIAL</span></div>
              <div>DATE: {memoDate}</div>
            </div>
          </div>

          <div className="space-y-4 font-sans text-xs">
            <div className="bg-[#0f172a] p-3.5 rounded-lg border border-slate-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-teal-400">1. Executive Summary</div>
              <p className="text-slate-300 leading-relaxed">
                FinNova's personal loan portfolio comprises 28,450 retail contracts totaling ₹1,422.50 Cr in disbursed capital.
                While origination growth continues (+18.4% YoY), unseasoned and unhedged default rates stand at 8.16% (₹83.1 Cr net loss).
                Adopting our simulated underwriting constraints eliminates ₹{results.netSavingsCr} Cr in unrecoverable credit losses while preserving {results.approvalRatePct}% of prime volume.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Origination Volume</span>
                <span className="text-base font-bold text-white">{results.simFundedVolume.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">({results.approvalRatePct}% Approved)</span>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Net Losses Saved</span>
                <span className="text-base font-bold text-teal-400">+₹{results.netSavingsCr} Cr</span>
                <span className="text-[10px] text-teal-400/80 block mt-0.5">Capital Preserved</span>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Projected Default Rate</span>
                <span className="text-base font-bold text-amber-400">{results.simDefaultRate}%</span>
                <span className="text-[10px] text-teal-400 block mt-0.5">({results.defaultRateDeltaPp} pp vs base)</span>
              </div>
              <div className="p-3 bg-slate-900 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Revised Credit Loss</span>
                <span className="text-base font-bold text-slate-200">₹{results.simulatedCreditLoss} Cr</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Base: ₹83.1 Cr</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">2. Active Policy Configuration Under Review</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300 bg-slate-900/60 p-3 rounded border border-slate-800">
                <li>Minimum Bureau CIBIL Score: <strong className="text-teal-300">&ge; {policy.cibilCutoff}</strong> (Base: 650)</li>
                <li>Maximum Debt-to-Income (DTI): <strong className="text-teal-300">&le; {policy.maxDtiCutoff}%</strong> (Base: 55%)</li>
                <li>Subprime Grade E Segment: <strong className={policy.excludeGradeE ? 'text-teal-400' : 'text-amber-400'}>{policy.excludeGradeE ? 'Discontinued (Eliminates 17.8% of defaults)' : 'Active'}</strong></li>
                <li>Fintech Aggregator Sourcing: <strong className={policy.excludeAggregators ? 'text-teal-400' : 'text-slate-400'}>{policy.excludeAggregators ? 'Restricted with mandatory DTI <= 45%' : 'Standard Volume'}</strong></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300">3. Actionable Directives for Credit Operations</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-200 text-xs">Immediate Cut-Off Enforcement</div>
                  <p className="text-[11px] text-slate-400">Hard stop rules on automated decisioning engine for applicants below CIBIL {policy.cibilCutoff} and DTI {policy.maxDtiCutoff}%.</p>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                  <div className="font-semibold text-slate-200 text-xs">Aggregator Risk Sharing</div>
                  <p className="text-[11px] text-slate-400">Renegotiate sourcing contracts with fintech partners to include first-loss default guarantees (FLDG) for non-prime cohorts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0f172a] flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Audited for Executive Committee Review</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium transition"
          >
            Close Memorandum
          </button>
        </div>
      </div>
    </div>
  );
};
