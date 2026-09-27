import React from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Clock,
  Target,
  Users
} from 'lucide-react';

const RecommendationsList = ({ recommendations = [], riskLevel = 'LOW' }) => {
  // Fallback high-impact recommendations if database has no entries yet
  const defaultRecommendations = [
    {
      id: 1,
      weak_area: 'Attendance Optimization',
      recommendation_text: 'Increase morning lecture attendance above 85% to recover projected 5.2 points in final grade.',
      category: 'Attendance',
      priority: 'High',
    },
    {
      id: 2,
      weak_area: 'Midterm Prep Block',
      recommendation_text: 'Complete 2 hours of structured peer problem-solving weekly for Data Structures & Algorithms.',
      category: 'Study Hours',
      priority: 'Medium',
    },
    {
      id: 3,
      weak_area: 'Continuous Assessment',
      recommendation_text: 'Submit upcoming Assignment 4 early to unlock instructor feedback revisions.',
      category: 'Assignments',
      priority: 'Standard',
    },
  ];

  const items = recommendations.length > 0 ? recommendations : defaultRecommendations;

  const getPriorityBadge = (priority, weakArea) => {
    if (priority === 'High' || weakArea?.toLowerCase().includes('attendance')) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          High Priority
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
        Recommended
      </span>
    );
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Prescriptive Action Plan & Interventions</span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalized interventions targeted at addressing primary bottleneck features.
            </p>
          </div>
        </div>

        <span className="text-xs text-teal-400 font-medium self-start sm:self-auto">
          {items.length} Active Suggestions
        </span>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                  {item.weak_area}
                </span>
                {getPriorityBadge(item.priority, item.weak_area)}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.recommendation_text}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center">
                <Target className="w-3 h-3 mr-1 text-teal-400" />
                Target: Next Term
              </span>
              <span className="text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                Action Plan <ArrowRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsList;
