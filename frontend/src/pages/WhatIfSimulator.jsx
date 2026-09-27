import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  BrainCircuit,
  Target,
  Zap,
  BookOpen,
  Award,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { predictionService, dashboardService } from '../services/api';

const WhatIfSimulator = () => {
  // Baseline initial state
  const [baseline, setBaseline] = useState({
    attendance: 62.0,
    internal_marks: 54.0,
    assignment_marks: 58.0,
    study_hours: 2.5,
    previous_score: 55.0,
  });

  // Simulated parameters
  const [simulated, setSimulated] = useState({
    attendance: 80.0,
    internal_marks: 72.0,
    assignment_marks: 78.0,
    study_hours: 5.5,
    previous_score: 55.0,
  });

  // Goal Target Setting
  const [targetGoal, setTargetGoal] = useState(75.0); // 60 (Pass), 75 (Good), 85 (Distinction)

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Fetch initial student data to seed baseline if available
  useEffect(() => {
    const fetchInitialBaseline = async () => {
      try {
        const res = await dashboardService.getStudentDashboard(1);
        const metrics = res.data?.latest_metrics;
        if (metrics) {
          const loadedBaseline = {
            attendance: metrics.current_attendance || 65.0,
            internal_marks: metrics.current_internal || 58.0,
            assignment_marks: 60.0,
            study_hours: metrics.study_hours || 3.0,
            previous_score: 55.0,
          };
          setBaseline(loadedBaseline);
          // Set simulated slightly higher as initial scenario
          setSimulated({
            attendance: Math.min(100, loadedBaseline.attendance + 15),
            internal_marks: Math.min(100, loadedBaseline.internal_marks + 15),
            assignment_marks: 78.0,
            study_hours: Math.min(12, loadedBaseline.study_hours + 2.5),
            previous_score: loadedBaseline.previous_score,
          });
        }
      } catch (e) {
        console.log('Using default simulator baseline parameters');
      }
    };

    fetchInitialBaseline();
  }, []);

  // Trigger simulation computation
  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await predictionService.runWhatIf({
        baseline_data: baseline,
        simulated_data: simulated,
      });
      setResult(res.data);
      setHasCalculated(true);
    } catch (err) {
      console.error('What-If simulation failed:', err);
      // Fallback local calculation if backend is unreachable
      const baseScore = Math.min(100, 0.25 * baseline.internal_marks + 0.20 * baseline.assignment_marks + 0.18 * baseline.attendance + 0.25 * baseline.previous_score + 1.2 * baseline.study_hours);
      const simScore = Math.min(100, 0.25 * simulated.internal_marks + 0.20 * simulated.assignment_marks + 0.18 * simulated.attendance + 0.25 * simulated.previous_score + 1.2 * simulated.study_hours);
      const delta = +(simScore - baseScore).toFixed(2);
      
      setResult({
        original_prediction: {
          predicted_score: +baseScore.toFixed(2),
          risk_level: baseScore >= 70 ? 'LOW' : baseScore >= 50 ? 'MEDIUM' : 'HIGH',
          risk_score: +((100 - baseScore) / 100).toFixed(4),
        },
        simulated_prediction: {
          predicted_score: +simScore.toFixed(2),
          risk_level: simScore >= 70 ? 'LOW' : simScore >= 50 ? 'MEDIUM' : 'HIGH',
          risk_score: +((100 - simScore) / 100).toFixed(4),
        },
        differential_analysis: {
          score_delta: delta,
          risk_score_delta: -+(delta / 100).toFixed(4),
          risk_transition: `${baseScore >= 70 ? 'LOW' : baseScore >= 50 ? 'MEDIUM' : 'HIGH'} ➔ ${simScore >= 70 ? 'LOW' : simScore >= 50 ? 'MEDIUM' : 'HIGH'}`,
          is_improved: delta > 0,
          feature_deltas: {
            attendance: +(simulated.attendance - baseline.attendance).toFixed(1),
            internal_marks: +(simulated.internal_marks - baseline.internal_marks).toFixed(1),
            assignment_marks: +(simulated.assignment_marks - baseline.assignment_marks).toFixed(1),
            study_hours: +(simulated.study_hours - baseline.study_hours).toFixed(1),
            previous_score: +(simulated.previous_score - baseline.previous_score).toFixed(1),
          },
          impact_summary: delta > 0 
            ? `Intervention yields an estimated performance boost of +${delta} points, significantly reducing failure risk.` 
            : 'Adjustment yields minimal net variation.',
        }
      });
      setHasCalculated(true);
    } finally {
      setLoading(false);
    }
  };

  // Run calculation on initial load once baseline is ready
  useEffect(() => {
    handleCalculate();
  }, [baseline]);

  // Preset Handlers
  const applyPreset = (presetType) => {
    switch (presetType) {
      case 'catchup':
        setSimulated({
          ...baseline,
          attendance: Math.min(100, baseline.attendance + 20),
          study_hours: Math.min(12, baseline.study_hours + 2.0),
          assignment_marks: Math.min(100, baseline.assignment_marks + 15),
        });
        break;
      case 'high_achiever':
        setSimulated({
          attendance: 95.0,
          internal_marks: 88.0,
          assignment_marks: 90.0,
          study_hours: 6.5,
          previous_score: baseline.previous_score,
        });
        break;
      case 'intensive':
        setSimulated({
          attendance: 90.0,
          internal_marks: 82.0,
          assignment_marks: 85.0,
          study_hours: 8.0,
          previous_score: baseline.previous_score,
        });
        break;
      case 'reset':
      default:
        setSimulated({ ...baseline });
        break;
    }
  };

  // Calculations for Goal Visualizer
  const currentSimScore = result?.simulated_prediction?.predicted_score || 72.0;
  const originalScore = result?.original_prediction?.predicted_score || 54.0;
  const scoreGap = targetGoal - currentSimScore;
  const progressToGoal = Math.min(100, Math.max(0, ((currentSimScore - 40) / (targetGoal - 40)) * 100));

  const getRiskColor = (level) => {
    switch (level?.toUpperCase()) {
      case 'AT_RISK':
      case 'HIGH':
        return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', badge: '🔴 HIGH' };
      case 'AVERAGE':
      case 'MEDIUM':
        return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: '🟡 MEDIUM' };
      default:
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: '🟢 LOW' };
    }
  };

  const origRisk = getRiskColor(result?.original_prediction?.risk_level || 'HIGH');
  const simRisk = getRiskColor(result?.simulated_prediction?.risk_level || 'LOW');
  const diff = result?.differential_analysis;

  return (
    <div className="space-y-6">
      {/* Hero Header & Preset Selector */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">What-If Academic Simulator</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Interactive Model
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Experiment with attendance rates and study commitments to forecast score improvements.
            </p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('catchup')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-medium transition-all"
          >
            ⚡ Catch-Up Plan
          </button>
          <button
            onClick={() => applyPreset('high_achiever')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-medium transition-all"
          >
            🌟 Dean's List
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700/80 text-xs font-medium flex items-center space-x-1 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Target Goal Progression Visualizer */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Target Grade Progression Path
            </span>
          </div>

          {/* Goal Selectors */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Target Goal:</span>
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setTargetGoal(60.0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  targetGoal === 60.0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                60% (Pass)
              </button>
              <button
                onClick={() => setTargetGoal(75.0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  targetGoal === 75.0 ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                75% (Low Risk)
              </button>
              <button
                onClick={() => setTargetGoal(85.0)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  targetGoal === 85.0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                85% (Distinction)
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">
              Current Simulated: <strong className="text-teal-400">{currentSimScore}%</strong>
            </span>
            <span className="font-semibold text-slate-300">
              {scoreGap <= 0 ? (
                <span className="text-emerald-400 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Target Achieved (+{Math.abs(scoreGap).toFixed(1)}% buffer)
                </span>
              ) : (
                <span className="text-amber-400">
                  +{scoreGap.toFixed(1)}% needed to reach target
                </span>
              )}
            </span>
          </div>

          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                scoreGap <= 0
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-400'
              }`}
              style={{ width: `${progressToGoal}%` }}
            ></div>
          </div>
        </div>

        {/* Required increments guidance */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
          <Zap className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <span>
            {scoreGap <= 0 ? (
              <span>Your simulated adjustments comfortably surpass the <strong>{targetGoal}%</strong> benchmark. Maintaining this momentum preserves LOW risk status.</span>
            ) : (
              <span>
                To bridge the remaining <strong>{scoreGap.toFixed(1)} points</strong> to hit <strong>{targetGoal}%</strong>, consider increasing attendance by <strong>+{Math.min(100 - simulated.attendance, Math.ceil(scoreGap * 0.8))}%</strong> and studying an extra <strong>+{(scoreGap * 0.15).toFixed(1)} hrs/day</strong>.
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Main Dual-Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Sliders & Adjusters (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Adjust Performance Parameters
              </span>
              <span className="text-xs text-slate-400">Real-Time Parameter Control</span>
            </div>

            {/* Attendance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Attendance Percentage</label>
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    simulated.attendance >= baseline.attendance ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {simulated.attendance >= baseline.attendance ? `+${(simulated.attendance - baseline.attendance).toFixed(0)}%` : `${(simulated.attendance - baseline.attendance).toFixed(0)}%`}
                  </span>
                  <span className="text-sm font-bold text-teal-400 w-12 text-right">
                    {simulated.attendance}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={simulated.attendance}
                onChange={(e) => setSimulated({ ...simulated, attendance: parseFloat(e.target.value) })}
                className="w-full accent-teal-400 bg-slate-950 h-2.5 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0%</span>
                <span>Current Baseline: {baseline.attendance}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Internal Marks Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Internal Assessment Marks</label>
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    simulated.internal_marks >= baseline.internal_marks ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {simulated.internal_marks >= baseline.internal_marks ? `+${(simulated.internal_marks - baseline.internal_marks).toFixed(0)}` : `${(simulated.internal_marks - baseline.internal_marks).toFixed(0)}`}
                  </span>
                  <span className="text-sm font-bold text-cyan-400 w-12 text-right">
                    {simulated.internal_marks}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={simulated.internal_marks}
                onChange={(e) => setSimulated({ ...simulated, internal_marks: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 bg-slate-950 h-2.5 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0</span>
                <span>Current Baseline: {baseline.internal_marks}</span>
                <span>100</span>
              </div>
            </div>

            {/* Assignment Completion % Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Assignment Completion Score</label>
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    simulated.assignment_marks >= baseline.assignment_marks ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {simulated.assignment_marks >= baseline.assignment_marks ? `+${(simulated.assignment_marks - baseline.assignment_marks).toFixed(0)}%` : `${(simulated.assignment_marks - baseline.assignment_marks).toFixed(0)}%`}
                  </span>
                  <span className="text-sm font-bold text-indigo-400 w-12 text-right">
                    {simulated.assignment_marks}%
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={simulated.assignment_marks}
                onChange={(e) => setSimulated({ ...simulated, assignment_marks: parseFloat(e.target.value) })}
                className="w-full accent-indigo-400 bg-slate-950 h-2.5 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0%</span>
                <span>Current Baseline: {baseline.assignment_marks}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Study Hours / Day Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-200">Study Hours (Daily Target)</label>
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    simulated.study_hours >= baseline.study_hours ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {simulated.study_hours >= baseline.study_hours ? `+${(simulated.study_hours - baseline.study_hours).toFixed(1)}h` : `${(simulated.study_hours - baseline.study_hours).toFixed(1)}h`}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 w-12 text-right">
                    {simulated.study_hours}h
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={simulated.study_hours}
                onChange={(e) => setSimulated({ ...simulated, study_hours: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 bg-slate-950 h-2.5 rounded-lg cursor-pointer transition-all"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 hrs/day</span>
                <span>Current Baseline: {baseline.study_hours} hrs</span>
                <span>12 hrs/day</span>
              </div>
            </div>

            {/* Calculate Impact Primary Button */}
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>{loading ? 'Evaluating Scenarios...' : 'Calculate Impact & Risk Transition'}</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Real-Time Result Diff (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center space-x-2 text-white font-bold text-sm pb-3 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Predicted Impact & Difference</span>
            </div>

            {/* Score Comparison Display (e.g. 51% -> 68%) */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Score Forecast Progression
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Baseline Score</span>
                  <span className="text-2xl font-extrabold text-slate-400">
                    {result?.original_prediction?.predicted_score || 54.0}%
                  </span>
                </div>
                <div className="flex flex-col items-center px-3">
                  <ArrowRight className="w-6 h-6 text-teal-400 animate-pulse" />
                  <span className={`text-[11px] font-bold mt-1 ${diff?.score_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {diff?.score_delta > 0 ? `+${diff.score_delta}` : diff?.score_delta || '+18.0'}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-teal-400 block font-semibold">Simulated Score</span>
                  <span className="text-3xl font-extrabold text-white">
                    {result?.simulated_prediction?.predicted_score || 72.0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Category Comparison (e.g. HIGH -> MEDIUM / LOW) */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Attrition Risk Shift
              </span>
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${origRisk.border} ${origRisk.bg} text-center min-w-[90px]`}>
                  <span className="text-[10px] text-slate-400 block">Current</span>
                  <span className={`text-xs font-extrabold ${origRisk.text}`}>
                    {origRisk.badge}
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-teal-400" />

                <div className={`p-2.5 rounded-xl border ${simRisk.border} ${simRisk.bg} text-center min-w-[90px]`}>
                  <span className="text-[10px] text-slate-400 block">Simulated</span>
                  <span className={`text-xs font-extrabold ${simRisk.text}`}>
                    {simRisk.badge}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                <span>Failure Risk Probability:</span>
                <span className="text-teal-400 font-bold">
                  {( (result?.simulated_prediction?.risk_score || 0.28) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Feature Changes Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Parameter Adjustments
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Attendance:</span>
                  <span className="font-bold text-emerald-400">
                    +{Math.max(0, simulated.attendance - baseline.attendance).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Internal:</span>
                  <span className="font-bold text-cyan-400">
                    +{Math.max(0, simulated.internal_marks - baseline.internal_marks).toFixed(0)} pts
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Assignments:</span>
                  <span className="font-bold text-indigo-400">
                    +{Math.max(0, simulated.assignment_marks - baseline.assignment_marks).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Study Hours:</span>
                  <span className="font-bold text-emerald-400">
                    +{Math.max(0, simulated.study_hours - baseline.study_hours).toFixed(1)} hrs/d
                  </span>
                </div>
              </div>
            </div>

            {/* AI Diagnostic Narrative */}
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-teal-300 block mb-1">Model Synthesis:</span>
              {diff?.impact_summary || 'Simulated parameters indicate positive score acceleration and reduced attrition risk.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;
