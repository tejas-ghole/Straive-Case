import React from 'react';
import { X, User, ShieldAlert, CheckCircle, AlertTriangle, Building, CreditCard, Clock, MapPin } from 'lucide-react';
import { LoanContract, PolicyParams } from '../types/dashboard';

interface LoanDetailModalProps {
  loan: LoanContract | null;
  onClose: () => void;
  policy: PolicyParams;
}

export const LoanDetailModal: React.FC<LoanDetailModalProps> = ({ loan, onClose, policy }) => {
  if (!loan) return null;

  // Evaluate if this specific loan would be approved under current policy
  const wouldBeDeclined = 
    loan.cibilScore < policy.cibilCutoff ||
    loan.dtiPct > policy.maxDtiCutoff ||
    (policy.excludeGradeE && loan.grade === 'E') ||
    (policy.excludeAggregators && loan.channel === 'Fintech Aggregators');

  const declineReasons: string[] = [];
  if (loan.cibilScore < policy.cibilCutoff) declineReasons.push(`CIBIL ${loan.cibilScore} < ${policy.cibilCutoff} cutoff`);
  if (loan.dtiPct > policy.maxDtiCutoff) declineReasons.push(`DTI ${loan.dtiPct}% > ${policy.maxDtiCutoff}% limit`);
  if (policy.excludeGradeE && loan.grade === 'E') declineReasons.push(`Grade E (Subprime) excluded`);
  if (policy.excludeAggregators && loan.channel === 'Fintech Aggregators') declineReasons.push(`Aggregator channel restricted`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-[#0d1424] border border-slate-700 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg font-mono font-bold text-sm ${
              loan.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              loan.grade === 'B' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
              loan.grade === 'C' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              Grade {loan.grade}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">{loan.borrowerName}</h3>
                <span className="text-xs text-slate-400 font-mono">({loan.id})</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" />{loan.city}</span>
                <span>·</span>
                <span>{loan.employment}</span>
                <span>·</span>
                <span>{loan.channel}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Realized Status Banner */}
          <div className={`p-3.5 rounded-lg border flex items-center justify-between ${
            loan.isDefault 
              ? 'bg-rose-950/20 border-rose-500/30 text-rose-300' 
              : loan.status.includes('Late') 
              ? 'bg-amber-950/20 border-amber-500/30 text-amber-300' 
              : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              {loan.isDefault ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
              <span>Realized Book Status: {loan.status}</span>
            </div>
            {loan.recoveredAmount !== undefined && (
              <span className="text-xs font-mono text-slate-400">
                Recovered: ₹{loan.recoveredAmount.toLocaleString()}
              </span>
            )}
          </div>

          {/* Policy Simulation Check (Would this have been caught?) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Simulation Underwriting Verdict</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                wouldBeDeclined 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                {wouldBeDeclined ? 'Declined by Active Rules' : 'Approved by Active Rules'}
              </span>
            </div>
            {wouldBeDeclined ? (
              <div className="text-xs text-rose-300 space-y-1">
                <p>This loan contract violates simulated policy filters:</p>
                <ul className="list-disc list-inside text-[11px] text-rose-400/90 font-mono">
                  {declineReasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
                {loan.isDefault && (
                  <p className="text-teal-400 text-[11px] font-medium pt-1">
                    ✓ Positive Capture: This simulated policy would have averted a ₹{loan.loanAmount.toLocaleString()} loss!
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Meets all active cutoffs (CIBIL &ge; {policy.cibilCutoff}, DTI &le; {policy.maxDtiCutoff}%).
              </p>
            )}
          </div>

          {/* Underwriting Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Bureau CIBIL</span>
              <span className="text-lg font-bold font-mono text-white">{loan.cibilScore}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Debt-to-Income (DTI)</span>
              <span className={`text-lg font-bold font-mono ${loan.dtiPct > 50 ? 'text-rose-400' : 'text-teal-400'}`}>
                {loan.dtiPct}%
              </span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Loan-to-Income (LTI)</span>
              <span className="text-lg font-bold font-mono text-white">{loan.ltiRatio}x</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Loan Principal</span>
              <span className="text-lg font-bold font-mono text-white">₹{loan.loanAmount.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Monthly Income</span>
              <span className="text-lg font-bold font-mono text-white">₹{loan.monthlyIncome.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Monthly EMI</span>
              <span className="text-lg font-bold font-mono text-white">₹{loan.emi.toLocaleString()}</span>
            </div>
          </div>

          {/* Loan Profile & Intent */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-300">Contract Specifications</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300 bg-slate-900/40 p-3 rounded border border-slate-800">
              <div><span className="text-slate-500">Stated Purpose:</span> <strong className="text-slate-200">{loan.purpose}</strong></div>
              <div><span className="text-slate-500">Loan Tenure:</span> <strong className="text-slate-200">{loan.tenureMonths} Months</strong></div>
              <div><span className="text-slate-500">Origination Vintage:</span> <strong className="text-slate-200">{loan.disbursementQuarter}</strong></div>
              <div><span className="text-slate-500">Sourcing Channel:</span> <strong className="text-slate-200">{loan.channel}</strong></div>
            </div>
          </div>

          {/* Underwriter Observations / Risk Flags */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-slate-300">Underwriting Risk Flags & Signals</span>
            <div className="flex flex-wrap gap-1.5">
              {loan.riskFlags.map((flag, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-1 bg-slate-900 text-slate-300 rounded border border-slate-800 text-[11px]"
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0f172a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
