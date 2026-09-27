import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  BarChart2,
  Users
} from 'lucide-react';

const SubjectAnalysis = ({ subjects = [] }) => {
  // Enhanced default subject analytics if few entries exist in DB
  const defaultSubjects = [
    {
      subject_code: 'CS301',
      subject_name: 'Applied Mathematics & Statistics',
      average_internal: 58.4,
      average_attendance: 64.2,
      health: 'AT_RISK',
      student_count: 42,
    },
    {
      subject_code: 'CS402',
      subject_name: 'Database Management Systems',
      average_internal: 74.5,
      average_attendance: 81.0,
      health: 'AVERAGE',
      student_count: 42,
    },
    {
      subject_code: 'CS503',
      subject_name: 'Python & Machine Learning',
      average_internal: 86.2,
      average_attendance: 91.5,
      health: 'GOOD',
      student_count: 42,
    },
    {
      subject_code: 'CS604',
      subject_name: 'Computer Networks & Security',
      average_internal: 71.0,
      average_attendance: 76.5,
      health: 'AVERAGE',
      student_count: 42,
    },
  ];

  const items = subjects.length > 0 ? subjects.map(s => {
    const avgInt = s.average_internal || 70;
    const avgAtt = s.average_attendance || 75;
    let health = 'AVERAGE';
    if (avgInt < 65 || avgAtt < 70) health = 'AT_RISK';
    else if (avgInt >= 80 && avgAtt >= 85) health = 'GOOD';

    return {
      subject_code: s.subject_code,
      subject_name: s.subject_name || getSubjectName(s.subject_code),
      average_internal: s.average_internal,
      average_attendance: s.average_attendance,
      health,
      student_count: s.student_count || 42,
    };
  }) : defaultSubjects;

  function getSubjectName(code) {
    switch (code) {
      case 'CS101': return 'Computer Systems Architecture';
      case 'CS202': return 'Data Structures & Algorithms';
      case 'CS303': return 'Database Management Systems';
      case 'CS404': return 'Python & Machine Learning';
      default: return code;
    }
  }

  const getHealthBadge = (health) => {
    switch (health) {
      case 'AT_RISK':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            🔴 At Risk
          </span>
        );
      case 'AVERAGE':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            🟡 Average
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            🟢 Good
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-teal-400" />
            <span>Course-Level Health Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">Class assessment averages & attendance health across active subjects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((sub, idx) => (
          <div
            key={sub.subject_code || idx}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-lg space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-bold">
                  {sub.subject_code}
                </span>
                {getHealthBadge(sub.health)}
              </div>

              <h3 className="text-xs font-bold text-white line-clamp-1">
                {sub.subject_name}
              </h3>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] text-slate-400">Avg Internal:</span>
                <span className="font-bold text-white">{sub.average_internal} / 100</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-[11px] text-slate-400">Avg Attendance:</span>
                <span className={`font-bold ${sub.average_attendance < 75 ? 'text-rose-400' : 'text-teal-400'}`}>
                  {sub.average_attendance}%
                </span>
              </div>

              {/* Progress bar visual for internal marks */}
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${
                    sub.health === 'AT_RISK'
                      ? 'bg-rose-500'
                      : sub.health === 'AVERAGE'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, sub.average_internal)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectAnalysis;
