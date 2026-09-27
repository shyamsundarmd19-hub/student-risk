import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  User, 
  Sparkles, 
  X,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Calendar
} from 'lucide-react';

const RiskHeatmapTable = ({ students = [], onSelectStudent }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const getRiskBadge = (riskScore, level) => {
    const lvl = level?.toUpperCase();
    if (lvl === 'AT_RISK' || lvl === 'HIGH' || riskScore >= 0.5) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse mr-1.5"></span>
          🔴 High Risk
        </span>
      );
    } else if (lvl === 'AVERAGE' || lvl === 'MEDIUM' || (riskScore >= 0.25 && riskScore < 0.5)) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
          🟡 Moderate Risk
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
          🟢 On Track
        </span>
      );
    }
  };

  const handleRowAction = (student) => {
    setSelectedStudent(student);
    if (onSelectStudent) {
      onSelectStudent(student);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90 shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Student Profile</th>
              <th className="py-3.5 px-4">Department & Term</th>
              <th className="py-3.5 px-4">Attendance</th>
              <th className="py-3.5 px-4">Internal Marks</th>
              <th className="py-3.5 px-4">Predicted Score</th>
              <th className="py-3.5 px-4">Risk Status</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {students.length > 0 ? (
              students.map((s, idx) => {
                const isHighRisk = s.risk_score >= 0.5 || s.predicted_score < 60;
                return (
                  <tr
                    key={s.student_id || idx}
                    className={`transition-colors duration-150 ${
                      isHighRisk
                        ? 'bg-rose-500/[0.03] hover:bg-rose-500/[0.08]'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Student Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                          {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-500">ID #{s.student_id || idx + 1}</div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{s.department || 'Computer Science'}</div>
                      <div className="text-[10px] text-slate-500">Sem {s.semester || 5} &bull; Year {s.year || 3}</div>
                    </td>

                    {/* Attendance */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${s.attendance < 75 ? 'text-rose-400' : 'text-slate-200'}`}>
                          {s.attendance}%
                        </span>
                      </div>
                    </td>

                    {/* Internal Marks */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {s.internal_marks} / 100
                    </td>

                    {/* Predicted Score */}
                    <td className="py-3.5 px-4">
                      <span className={`font-extrabold text-sm ${
                        s.predicted_score < 60 ? 'text-rose-400' : s.predicted_score < 75 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {s.predicted_score}%
                      </span>
                    </td>

                    {/* Risk Badge */}
                    <td className="py-3.5 px-4">
                      {getRiskBadge(s.risk_score, s.predicted_score < 60 ? 'HIGH' : s.predicted_score < 75 ? 'MEDIUM' : 'LOW')}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRowAction(s)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Breakdown</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">
                  No students found matching current filter parameters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Individual Student Breakdown Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3.5 pb-3 border-b border-slate-800">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center font-bold text-white text-base">
                {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-400">
                  {selectedStudent.department} &bull; Semester {selectedStudent.semester} (ID #{selectedStudent.student_id})
                </p>
              </div>
            </div>

            {/* Scores & Metrics Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Predicted</span>
                <span className="text-lg font-extrabold text-teal-400">{selectedStudent.predicted_score}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance</span>
                <span className="text-lg font-extrabold text-white">{selectedStudent.attendance}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Study Time</span>
                <span className="text-lg font-extrabold text-indigo-400">{selectedStudent.study_hours || 2.5}h/d</span>
              </div>
            </div>

            {/* Primary Weakness & Bottleneck */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Primary Risk Driver: {selectedStudent.primary_weakness || 'Attendance & Continuous Assessment'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                SHAP attribution indicates this factor is currently the largest contributor lowering the projected final score.
              </p>
            </div>

            {/* Prescribed Intervention */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold">
                <BookOpen className="w-4 h-4" />
                <span>Prescribed Intervention Action:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedStudent.intervention || 'Assign targeted peer tutoring blocks and schedule academic advising review.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskHeatmapTable;
