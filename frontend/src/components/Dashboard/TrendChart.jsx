import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Sparkles 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  ReferenceDot
} from 'recharts';

const TrendChart = ({ academicRecords = [], latestPredictedScore = null }) => {
  // Construct chronological series: Sem 1 -> Sem 2 -> Current -> Predicted
  let chartData = [];

  if (academicRecords && academicRecords.length > 0) {
    chartData = academicRecords.map((rec) => ({
      name: `Sem ${rec.semester}`,
      score: rec.previous_score || rec.internal_marks,
      internal: rec.internal_marks,
      attendance: rec.attendance_pct,
      predicted: null,
      type: 'historical',
    }));

    // Append Current semester if available
    const lastRecord = academicRecords[academicRecords.length - 1];
    const nextSemNum = (lastRecord.semester || 1) + 1;

    // Connect last historical score to predicted
    chartData[chartData.length - 1].predicted = chartData[chartData.length - 1].score;

    if (latestPredictedScore !== null) {
      chartData.push({
        name: `Sem ${nextSemNum} (Forecast)`,
        score: null,
        internal: null,
        attendance: null,
        predicted: latestPredictedScore,
        type: 'forecast',
      });
    }
  } else {
    // Default high-fidelity dataset if student has only 1 initial record
    chartData = [
      { name: 'Sem 1', score: 68.0, internal: 65, attendance: 78, predicted: null },
      { name: 'Sem 2', score: 72.5, internal: 70, attendance: 82, predicted: null },
      { name: 'Sem 3 (Current)', score: 75.0, internal: 74, attendance: 85, predicted: 75.0 },
      { name: 'Sem 4 (Forecast)', score: null, internal: null, attendance: null, predicted: latestPredictedScore || 84.5 },
    ];
  }

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Academic Trajectory & AI Grade Projection</span>
          </h2>
          <p className="text-xs text-slate-400">
            Chronological progression from past semesters through the current term into ML forecasted score.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 text-teal-400">
            <span className="w-3 h-0.5 bg-teal-400"></span>
            <span>Historical</span>
          </div>
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400"></span>
            <span>AI Prediction</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[40, 100]} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-white">{label}</p>
                      {payload.map((entry, index) => {
                        if (entry.value === null || entry.value === undefined) return null;
                        return (
                          <p key={index} style={{ color: entry.color }} className="font-semibold">
                            {entry.name}: {entry.value}%
                          </p>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Historical Score Line */}
            <Line
              type="monotone"
              dataKey="score"
              name="Historical Score"
              stroke="#14b8a6"
              strokeWidth={3}
              dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#0f172a' }}
              activeDot={{ r: 6, fill: '#2dd4bf' }}
            />
            {/* Forecast Score Line (Dashed) */}
            <Line
              type="monotone"
              dataKey="predicted"
              name="AI Projected Score"
              stroke="#06b6d4"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 5, fill: '#06b6d4', strokeWidth: 2, stroke: '#0f172a' }}
              activeDot={{ r: 7, fill: '#22d3ee' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
