import React from 'react';
import { 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info,
  BrainCircuit,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  ReferenceLine,
  CartesianGrid 
} from 'recharts';

const ExplainableSection = ({ featureImportances = {}, topFeatures = [], riskLevel = 'LOW' }) => {
  // Format SHAP features for horizontal bar visualization
  const chartData = Object.entries(featureImportances).map(([name, val]) => {
    const numVal = parseFloat(val) || 0;
    return {
      feature: name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      rawFeature: name,
      impact: parseFloat(numVal.toFixed(2)),
      isPositive: numVal >= 0,
    };
  });

  // Fallback data if no SHAP data is present yet
  const displayData = chartData.length > 0 ? chartData : [
    { feature: 'Internal Marks', impact: 8.45, isPositive: true },
    { feature: 'Attendance %', impact: 5.20, isPositive: true },
    { feature: 'Study Hours', impact: 3.10, isPositive: true },
    { feature: 'Previous Score', impact: -2.15, isPositive: false },
    { feature: 'Assignment Marks', impact: -4.30, isPositive: false },
  ];

  // Sort by highest absolute impact
  displayData.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Determine top negative and positive drivers for textual summary
  const negativeDrivers = displayData.filter((d) => !d.isPositive);
  const positiveDrivers = displayData.filter((d) => d.isPositive);

  const getExplanationNarrative = () => {
    if (riskLevel === 'AT_RISK' || riskLevel === 'HIGH') {
      const topNegatives = negativeDrivers.map((d) => d.feature.toLowerCase()).slice(0, 2);
      return topNegatives.length > 0
        ? `Low ${topNegatives.join(' and ')} are the primary factors pulling down the forecasted score and escalating failure risk.`
        : 'Sub-optimal engagement indicators and low internal marks are driving the high risk status.';
    } else if (riskLevel === 'AVERAGE' || riskLevel === 'MEDIUM') {
      return 'Performance is in the moderate band. Boosting weekly study hours and attendance will transition the student into the high-achievement tier.';
    } else {
      const topPositives = positiveDrivers.map((d) => d.feature.toLowerCase()).slice(0, 2);
      return topPositives.length > 0
        ? `Strong ${topPositives.join(' and ')} are actively driving the positive academic forecast.`
        : 'High consistency in attendance and coursework assignments is driving optimal performance.';
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Explainable AI: SHAP Factor Attribution</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                TreeExplainer
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Quantifies exact point additions and deductions calculated by the ML model.
            </p>
          </div>
        </div>
      </div>

      {/* Narrative Summary Callout */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
        {riskLevel === 'AT_RISK' || riskLevel === 'HIGH' ? (
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        )}
        <div className="text-xs leading-relaxed text-slate-300">
          <span className="font-bold text-white">AI Diagnostic Insight: </span>
          {getExplanationNarrative()}
        </div>
      </div>

      {/* SHAP Horizontal Diverging Bar Chart */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Feature Impact on Projected Grade (Points Delta)</span>
          <div className="flex items-center space-x-4 text-[11px]">
            <span className="flex items-center text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5"></span> Positive Impact (+)
            </span>
            <span className="flex items-center text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400 mr-1.5"></span> Negative Impact (-)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={displayData}
              margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
              <XAxis
                type="number"
                domain={['dataMin - 2', 'dataMax + 2']}
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}`}
              />
              <YAxis
                type="category"
                dataKey="feature"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={120}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-white">{item.feature}</p>
                        <p className={`font-semibold ${item.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Impact: {item.impact > 0 ? `+${item.impact}` : item.impact} pts
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {item.isPositive ? 'Positively boosts final score' : 'Reduces final score prediction'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={0} stroke="#64748b" strokeWidth={1.5} />
              <Bar dataKey="impact" radius={[4, 4, 4, 4]}>
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isPositive ? '#10b981' : '#f43f5e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ExplainableSection;
