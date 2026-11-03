import React, { useState, useMemo } from 'react';
import { AlertOctagon, TrendingDown, DollarSign, ShieldAlert, Cpu, BarChart2, CheckCircle2, RotateCcw } from 'lucide-react';
import { MACRO_STRESS_SCENARIOS } from '../data/mockLoans';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine
} from 'recharts';

interface StressTestingProps {
  baseDefaultRate: number; // 8.16%
  baseLossCr: number; // 83.1 Cr
}

export const StressTestingSection: React.FC<StressTestingProps> = ({
  baseDefaultRate,
  baseLossCr
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('baseline');
  const [customRateHike, setCustomRateHike] = useState<number>(0);
  const [customIncomeHaircut, setCustomIncomeHaircut] = useState<number>(0);

  const activeScenario = MACRO_STRESS_SCENARIOS.find(s => s.id === selectedScenarioId) || MACRO_STRESS_SCENARIOS[0];

  const calculatedStress = useMemo(() => {
    // Calculate total multiplier from preset scenario + custom sliders
    const rateMultiplier = (customRateHike / 100) * 0.12; // +1.2% default per 100 bps
    const incomeMultiplier = (customIncomeHaircut / 10) * 0.15; // +1.5% default per 10% income reduction
    
    const combinedMultiplier = activeScenario.defaultRateMultiplier + rateMultiplier + incomeMultiplier;
    const stressedDefaultRate = +(baseDefaultRate * combinedMultiplier).toFixed(2);
    const stressedLossCr = +(baseLossCr * combinedMultiplier).toFixed(1);
    const additionalProvisionsCr = +(stressedLossCr - baseLossCr).toFixed(1);
    
    // Capital Adequacy (CRAR) impact (Assume base CRAR 18.5%)
    const baseCRAR = 18.5;
    const crarDrop = +(additionalProvisionsCr / 1422.5 * 100 * 0.7).toFixed(2);
    const stressedCRAR = Math.max(11.5, +(baseCRAR - crarDrop).toFixed(2));
    
    // ROE Impact (Assume base ROE 14.8%)
    const baseROE = 14.8;
    const roeDrop = +(additionalProvisionsCr / 280 * 100).toFixed(1);
    const stressedROE = +(baseROE - roeDrop).toFixed(1);

    const stressChartData = [
      { metric: 'Base Case', defaultRate: baseDefaultRate, lossCr: baseLossCr },
      { metric: 'Stressed Case', defaultRate: stressedDefaultRate, lossCr: stressedLossCr }
    ];

    return {
      stressedDefaultRate,
      stressedLossCr,
      additionalProvisionsCr,
      stressedCRAR,
      stressedROE,
      stressChartData,
      deltaDefaultPp: +(stressedDefaultRate - baseDefaultRate).toFixed(2)
    };
  }, [selectedScenarioId, customRateHike, customIncomeHaircut, activeScenario, baseDefaultRate, baseLossCr]);

  const handleResetStress = () => {
    setSelectedScenarioId('baseline');
    setCustomRateHike(0);
    setCustomIncomeHaircut(0);
  };

  return (
    <section className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Macroeconomic Stress Testing & Capital Adequacy Lab
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate FinNova portfolio resilience under RBI interest rate hikes, liquidity squeezes, and stagflationary shocks.
          </p>
        </div>
        <button
          onClick={handleResetStress}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 transition self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Stress Scenario</span>
        </button>
      </div>

      {/* Preset Scenario Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {MACRO_STRESS_SCENARIOS.map((scen) => {
          const isSelected = selectedScenarioId === scen.id;
          return (
            <div
              key={scen.id}
              onClick={() => setSelectedScenarioId(scen.id)}
              className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-teal-500 shadow-md ring-1 ring-teal-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-teal-400' : 'text-slate-200'}`}>
                    {scen.name}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-teal-400" />}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {scen.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Loss Shock:</span>
                <span className={scen.defaultRateMultiplier > 1 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                  {scen.defaultRateMultiplier > 1 ? `+${Math.round((scen.defaultRateMultiplier - 1) * 100)}%` : 'Baseline'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Controls & Stress Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Custom Lever Adjusters */}
        <div className="lg:col-span-5 bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Dynamic Macro Levers
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Live Sensitivity</span>
          </div>

          {/* Lever 1: Interest Rate Hike */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300">Policy Rate Hike Shock (bps)</label>
              <span className="font-mono text-teal-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                +{customRateHike} bps
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              step="25"
              value={customRateHike}
              onChange={(e) => setCustomRateHike(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 bps (No hike)</span>
              <span>+125 bps</span>
              <span>+250 bps (Severe)</span>
            </div>
          </div>

          {/* Lever 2: Real Income Haircut */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="text-slate-300">Borrower Income Haircut / Inflation</label>
              <span className="font-mono text-teal-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                -{customIncomeHaircut}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="2"
              value={customIncomeHaircut}
              onChange={(e) => setCustomIncomeHaircut(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Steady)</span>
              <span>-10% (Moderate)</span>
              <span>-20% (Crisis)</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Sensitivity Elasticity</div>
            <p>Every 100 bps policy rate hike increases retail personal loan default rate by ~0.98% pp due to floating rate EMI resets in borrowers with DTI &gt; 45%.</p>
          </div>
        </div>

        {/* Stress Results Display & Comparison Chart */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block font-mono">Stressed Default Rate</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono text-rose-400">{calculatedStress.stressedDefaultRate}%</span>
                <span className="text-[10px] font-mono text-rose-400">({calculatedStress.deltaDefaultPp > 0 ? `+${calculatedStress.deltaDefaultPp}` : '0'} pp)</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Base: 8.16%</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block font-mono">Addl. ECL Provisioning</span>
              <div className="mt-1">
                <span className="text-xl font-bold font-mono text-amber-400">
                  +₹{calculatedStress.additionalProvisionsCr} Cr
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Total: ₹{calculatedStress.stressedLossCr} Cr</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block font-mono">Stressed CRAR Ratio</span>
              <div className="mt-1">
                <span className={`text-xl font-bold font-mono ${calculatedStress.stressedCRAR < 15 ? 'text-rose-400' : 'text-teal-400'}`}>
                  {calculatedStress.stressedCRAR}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">RBI Min: 15.0%</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block font-mono">Stressed Return on Equity</span>
              <div className="mt-1">
                <span className={`text-xl font-bold font-mono ${calculatedStress.stressedROE < 10 ? 'text-amber-400' : 'text-teal-400'}`}>
                  {calculatedStress.stressedROE}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Base ROE: 14.8%</span>
            </div>
          </div>

          {/* Stressed vs Baseline Visual */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Default Rate & Net Credit Loss Exposure: Baseline vs Under Shock
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calculatedStress.stressChartData} margin={{ top: 10, right: 30, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '8px' }}
                    formatter={(val, name) => [
                      name === 'defaultRate' ? `${val}%` : `₹${val} Cr`,
                      name === 'defaultRate' ? 'Default Rate' : 'Total Net Loss'
                    ]}
                  />
                  <Bar dataKey="defaultRate" name="Default Rate (%)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lossCr" name="Net Loss (₹ Cr)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
