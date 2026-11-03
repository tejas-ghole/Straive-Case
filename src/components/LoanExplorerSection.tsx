import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ChevronRight, CheckCircle2, AlertTriangle, ShieldX, Eye } from 'lucide-react';
import { LoanContract, PolicyParams, RiskGrade } from '../types/dashboard';
import { SAMPLE_LOAN_CONTRACTS } from '../data/mockLoans';
import { LoanDetailModal } from './LoanDetailModal';

interface LoanExplorerProps {
  policy: PolicyParams;
}

export const LoanExplorerSection: React.FC<LoanExplorerProps> = ({ policy }) => {
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'cibil' | 'dti' | 'amount' | 'status'>('dti');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeModalLoan, setActiveModalLoan] = useState<LoanContract | null>(null);

  const filteredLoans = useMemo(() => {
    return SAMPLE_LOAN_CONTRACTS.filter(loan => {
      const matchesSearch = 
        loan.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
        loan.city.toLowerCase().includes(search.toLowerCase()) ||
        loan.id.toLowerCase().includes(search.toLowerCase()) ||
        loan.purpose.toLowerCase().includes(search.toLowerCase());

      const matchesGrade = selectedGrade === 'ALL' || loan.grade === selectedGrade;
      const matchesChannel = selectedChannel === 'ALL' || loan.channel === selectedChannel;
      const matchesStatus = 
        selectedStatus === 'ALL' || 
        (selectedStatus === 'DEFAULT' && loan.isDefault) ||
        (selectedStatus === 'PERFORMING' && !loan.isDefault);

      return matchesSearch && matchesGrade && matchesChannel && matchesStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'cibil') comparison = a.cibilScore - b.cibilScore;
      else if (sortBy === 'dti') comparison = a.dtiPct - b.dtiPct;
      else if (sortBy === 'amount') comparison = a.loanAmount - b.loanAmount;
      else if (sortBy === 'status') comparison = (a.isDefault ? 1 : 0) - (b.isDefault ? 1 : 0);

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [search, selectedGrade, selectedChannel, selectedStatus, sortBy, sortOrder]);

  // Count how many shown would be declined by active simulator policy
  const simulatedDeclinedCount = useMemo(() => {
    return filteredLoans.filter(l => 
      l.cibilScore < policy.cibilCutoff ||
      l.dtiPct > policy.maxDtiCutoff ||
      (policy.excludeGradeE && l.grade === 'E') ||
      (policy.excludeAggregators && l.channel === 'Fintech Aggregators')
    ).length;
  }, [filteredLoans, policy]);

  return (
    <section className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">Representative Loan Contract Inspector</h3>
            <span className="text-xs text-slate-500 font-mono">
              ({filteredLoans.length} Contracts Sampled)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit individual loan files to examine borrower affordability profiles, sourcing channels, and simulated policy verdicts.
          </p>
        </div>

        {/* Dynamic simulator impact notice */}
        <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
          <span className="text-slate-400">Current Policy Filter:</span>
          <span className="text-rose-400 font-semibold">{simulatedDeclinedCount} of {filteredLoans.length} Would Be Blocked</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, city, loan ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Grade Filter */}
        <div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Risk Grades (A - E)</option>
            <option value="A">Grade A (Prime)</option>
            <option value="B">Grade B (Near-Prime)</option>
            <option value="C">Grade C (Core Retail)</option>
            <option value="D">Grade D (Elevated Risk)</option>
            <option value="E">Grade E (Subprime)</option>
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Sourcing Channels</option>
            <option value="Direct Mobile App">Direct Mobile App</option>
            <option value="Fintech Aggregators">Fintech Aggregators</option>
            <option value="DSA / Field Agency">DSA / Field Agency</option>
            <option value="Organic Web Portal">Organic Web Portal</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">All Loan Statuses</option>
            <option value="PERFORMING">Performing Accounts</option>
            <option value="DEFAULT">Defaulted (90+ DPD)</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-teal-500"
          >
            <option value="dti">Sort: DTI Burden</option>
            <option value="cibil">Sort: CIBIL Score</option>
            <option value="amount">Sort: Loan Amount</option>
            <option value="status">Sort: Default Status</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
            title="Toggle sort direction"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Contract / Borrower</th>
              <th className="py-2.5 px-2">Grade</th>
              <th className="py-2.5 px-2 text-right">CIBIL</th>
              <th className="py-2.5 px-2 text-right">DTI %</th>
              <th className="py-2.5 px-2 text-right">Principal</th>
              <th className="py-2.5 px-2 text-right">EMI</th>
              <th className="py-2.5 px-2">Channel</th>
              <th className="py-2.5 px-2">Book Status</th>
              <th className="py-2.5 px-3 text-center">Simulated Filter</th>
              <th className="py-2.5 px-3 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredLoans.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500 font-sans">
                  No contracts matched your filter criteria.
                </td>
              </tr>
            ) : (
              filteredLoans.map((loan) => {
                const wouldDecline = 
                  loan.cibilScore < policy.cibilCutoff ||
                  loan.dtiPct > policy.maxDtiCutoff ||
                  (policy.excludeGradeE && loan.grade === 'E') ||
                  (policy.excludeAggregators && loan.channel === 'Fintech Aggregators');

                return (
                  <tr 
                    key={loan.id}
                    onClick={() => setActiveModalLoan(loan)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-medium text-slate-200">{loan.borrowerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{loan.id} · {loan.city}</div>
                    </td>
                    <td className="py-2.5 px-2 font-sans font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        loan.grade === 'A' ? 'text-emerald-400 bg-emerald-500/10' :
                        loan.grade === 'B' ? 'text-teal-400 bg-teal-500/10' :
                        loan.grade === 'C' ? 'text-amber-400 bg-amber-500/10' :
                        'text-rose-400 bg-rose-500/10'
                      }`}>
                        {loan.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-200">
                      {loan.cibilScore}
                    </td>
                    <td className={`py-2.5 px-2 text-right font-semibold ${
                      loan.dtiPct > 50 ? 'text-rose-400' : loan.dtiPct > 40 ? 'text-amber-400' : 'text-teal-400'
                    }`}>
                      {loan.dtiPct}%
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-300">
                      ₹{(loan.loanAmount / 100000).toFixed(1)}L
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-400">
                      ₹{loan.emi.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 font-sans text-slate-400 text-[11px]">
                      {loan.channel}
                    </td>
                    <td className="py-2.5 px-2 font-sans">
                      <span className={`text-[11px] font-medium ${
                        loan.isDefault ? 'text-rose-400' : loan.status.includes('Late') ? 'text-amber-400' : 'text-teal-400'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      {wouldDecline ? (
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-semibold">
                          Decline
                        </span>
                      ) : (
                        <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 font-semibold">
                          Approve
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-sans">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Inspect</span>
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Contract Detail Modal */}
      {activeModalLoan && (
        <LoanDetailModal
          loan={activeModalLoan}
          onClose={() => setActiveModalLoan(null)}
          policy={policy}
        />
      )}
    </section>
  );
};
