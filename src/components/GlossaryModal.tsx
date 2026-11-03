import React, { useState } from 'react';
import { X, BookOpen, Search, CheckCircle2 } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GLOSSARY_TERMS = [
  {
    term: 'KS Statistic (Kolmogorov-Smirnov)',
    category: 'Model Discrimination',
    definition: 'A metric measuring the maximum vertical separation between the cumulative distribution of good (performing) loans and bad (defaulted) loans. A KS score above 40 indicates strong predictive discrimination. In FinNova’s decision-time model, peak KS reaches 46.8 at Decile 6.',
    formula: 'KS = max |Cumulative Good% - Cumulative Bad%|',
    significance: 'Ensures the underwriting model accurately differentiates low-risk from high-risk applicants before disbursing credit.'
  },
  {
    term: 'MOB (Months on Book) & Vintage Seasoning',
    category: 'Portfolio Maturation',
    definition: 'The number of elapsed calendar months since loan disbursement. Unsecured retail loans typically require 12 to 18 months of seasoning to reveal true default risk. Evaluating green vintages (e.g., Q4-2025 at 3m MOB) using raw realized default creates an illusion of superior underwriting.',
    formula: 'Maturity Adjusted Loss = Raw Realized Loss / Maturity Factor(MOB)',
    significance: 'Prevents premature portfolio expansion based on artificially low early default rates.'
  },
  {
    term: 'Monotonic Decile Lift',
    category: 'Scoring Validation',
    definition: 'In a well-calibrated credit scorecard, default rates must strictly increase as score deciles progress from Decile 1 (best credit) to Decile 10 (worst credit). FinNova’s model shows unbroken monotonic ascent from 0.4% in Decile 1 to 27.4% in Decile 10.',
    formula: 'Default Rate (Decile n) <= Default Rate (Decile n+1)',
    significance: 'Confirms that credit score cutoffs operate predictably across the entire risk continuum.'
  },
  {
    term: 'DTI (Debt-to-Income) vs LTI (Loan-to-Income)',
    category: 'Affordability',
    definition: 'DTI represents the percentage of gross monthly income consumed by total monthly debt obligations (including the proposed EMI). LTI reflects total loan principal relative to annual gross income.',
    formula: 'DTI = (Total Monthly EMIs / Monthly Gross Income) × 100',
    significance: 'FinNova data shows defaulted borrowers have an average DTI of 58.7% vs 34.2% for performing loans, making DTI capping the single most potent underwriting lever.'
  },
  {
    term: 'Data Leakage Governance',
    category: 'Regulatory & Model Risk',
    definition: 'Strict exclusion of any variables recorded after the moment of credit decision (e.g. repayment delinquencies, months on book, recovery collections) from the origination scorecard.',
    formula: 'Allowed Features = {Variables verified at time t <= t_disbursement}',
    significance: 'Prevents artificially inflated backtest performance and guarantees real-world production validity.'
  },
  {
    term: 'Association vs. Causation in Loan Tenures',
    category: 'Credit Strategy',
    definition: 'Longer loan terms (e.g., 60 months) carry a 16.4% default rate vs 3.8% for 12 months. However, the tenure length itself does not cause failure; rather, distressed borrowers with high DTI (51.6%) and lower CIBIL (671) self-select 60-month tenures to minimize immediate EMI outlay.',
    formula: 'Correlation ≠ Direct Causal Relationship',
    significance: 'Directs policy intervention toward capping borrower leverage rather than indiscriminately banning longer loan terms.'
  }
];

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', 'Model Discrimination', 'Portfolio Maturation', 'Scoring Validation', 'Affordability', 'Regulatory & Model Risk', 'Credit Strategy'];

  const filteredTerms = GLOSSARY_TERMS.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-[#0d1424] border border-slate-700/80 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Credit Risk & Underwriting Knowledge Base</h3>
              <p className="text-xs text-slate-400">Institutional definitions, mathematical formulas, and governance standards</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search concepts, formulas, or metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded transition ${
                  selectedCategory === cat 
                    ? 'bg-teal-500 text-slate-950 font-semibold' 
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 divide-y divide-slate-800/80">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching credit risk concepts found.
            </div>
          ) : (
            filteredTerms.map((item, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-4 space-y-2' : 'space-y-2'}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-sm font-semibold text-teal-400">{item.term}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">{item.category}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>
                
                {item.formula && (
                  <div className="bg-slate-950/80 p-2 rounded border border-slate-800/80 font-mono text-[11px] text-slate-300">
                    <span className="text-slate-500 mr-2">Formula:</span>
                    <span className="text-teal-300">{item.formula}</span>
                  </div>
                )}

                <div className="flex items-start gap-1.5 text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-300">Executive Takeaway:</strong> {item.significance}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0f172a] flex justify-between items-center text-xs text-slate-400">
          <span>FinNova Internal Risk Governance Guidelines (FY26)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md font-medium transition"
          >
            Close Glossary
          </button>
        </div>
      </div>
    </div>
  );
};
