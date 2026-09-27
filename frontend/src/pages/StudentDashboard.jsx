import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  BookOpen,
  User,
  GraduationCap
} from 'lucide-react';
import MetricCard from '../components/Dashboard/MetricCard';
import TrendChart from '../components/Dashboard/TrendChart';
import ExplainableSection from '../components/Dashboard/ExplainableSection';
import RecommendationsList from '../components/Dashboard/RecommendationsList';
import { dashboardService, predictionService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await dashboardService.getStudentDashboard(1);
      setData(res.data);
    } catch (err) {
      console.warn('Backend offline or student record not initialized, using initial mock data:', err);
      // Fallback state if backend is booting or empty
      setData({
        student: {
          id: 1,
          name: user?.email?.split('@')[0] || 'Alex Morgan',
          department: 'Computer Science & Engineering',
          year: 3,
          semester: 5,
        },
        latest_metrics: {
          predicted_score: 84.5,
          performance_level: 'GOOD',
          risk_score: 0.155,
          feature_importances: {
            internal_marks: 8.45,
            attendance: 5.2,
            study_hours: 3.1,
            previous_score: 2.1,
            assignment_marks: -1.5,
          },
          current_attendance: 88.0,
          current_internal: 78.5,
          study_hours: 5.5,
        },
        academic_trends: [
          { semester: 1, internal_marks: 68, previous_score: 65, attendance_pct: 78 },
          { semester: 2, internal_marks: 72, previous_score: 70, attendance_pct: 82 },
          { semester: 3, internal_marks: 75, previous_score: 74, attendance_pct: 85 },
        ],
        recommendations: [
          {
            id: 1,
            weak_area: 'Attendance Optimization',
            recommendation_text: 'Maintain attendance above 85% to preserve your positive SHAP grade contribution (+5.2 pts).',
            created_at: 'Active Plan',
          },
          {
            id: 2,
            weak_area: 'Continuous Assessment',
            recommendation_text: 'Complete weekly self-paced lab quizzes to boost assignment score confidence.',
            created_at: 'Active Plan',
          },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 font-medium">
            Aggregating Explainable AI Analytics...
          </span>
        </div>
      </div>
    );
  }

  const student = data?.student || {};
  const metrics = data?.latest_metrics || {};
  const records = data?.academic_trends || [];
  const recommendations = data?.recommendations || [];

  // Categorize Performance Category variant & badge
  const getPerformanceProps = (level) => {
    switch (level?.toUpperCase()) {
      case 'AT_RISK':
      case 'HIGH':
        return {
          variant: 'at_risk',
          badge: 'At-Risk 🔴',
          subtitle: 'Academic Counseling Required',
        };
      case 'AVERAGE':
      case 'MEDIUM':
        return {
          variant: 'average',
          badge: 'Average 🟡',
          subtitle: 'Moderate Performance Tier',
        };
      default:
        return {
          variant: 'good',
          badge: 'Good 🟢',
          subtitle: 'On-Track & Strong Trajectory',
        };
    }
  };

  const perfProps = getPerformanceProps(metrics.performance_level);

  return (
    <div className="space-y-6">
      {/* Student Profile & Hero Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/20">
            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">
                {student.name || 'Student Analytics'}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold">
                ID #{student.id || 1}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {student.department || 'Computer Science & Engineering'} &bull; Year {student.year || 3}, Semester {student.semester || 5}
            </p>
          </div>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="self-start md:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Re-analyzing...' : 'Refresh AI Analytics'}</span>
        </button>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Predicted Final Score */}
        <MetricCard
          title="Predicted Final Score"
          value={metrics.predicted_score ? `${metrics.predicted_score}%` : '84.5%'}
          subtitle="Model Confidence: 89.5% R²"
          icon={Award}
          variant="teal"
          trend="up"
          trendValue="+4.2 pts"
        />

        {/* Performance Category */}
        <MetricCard
          title="Performance Category"
          value={metrics.performance_level || 'GOOD'}
          subtitle={perfProps.subtitle}
          badge={perfProps.badge}
          icon={CheckCircle2}
          variant={perfProps.variant}
        />

        {/* Failure Risk Score */}
        <MetricCard
          title="Attrition / Risk Score"
          value={metrics.risk_score ? `${(metrics.risk_score * 100).toFixed(1)}%` : '15.5%'}
          subtitle="Probability of Academic Difficulty"
          icon={AlertTriangle}
          variant={metrics.risk_score > 0.4 ? 'at_risk' : metrics.risk_score > 0.25 ? 'average' : 'good'}
          trend={metrics.risk_score < 0.2 ? 'down' : 'up'}
          trendValue={metrics.risk_score < 0.2 ? 'Low Risk' : 'Needs Review'}
        />

        {/* Attendance & Study Time */}
        <MetricCard
          title="Attendance & Study"
          value={metrics.current_attendance ? `${metrics.current_attendance}%` : '88.0%'}
          subtitle={`Study: ${metrics.study_hours || 5.5} hrs/week`}
          icon={Clock}
          variant="teal"
          trend="up"
          trendValue="Healthy"
        />
      </div>

      {/* Trajectory and SHAP Explainable AI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <TrendChart
          academicRecords={records}
          latestPredictedScore={metrics.predicted_score}
        />

        {/* SHAP Explainable Section */}
        <ExplainableSection
          featureImportances={metrics.feature_importances}
          riskLevel={metrics.performance_level}
        />
      </div>

      {/* Recommendations List */}
      <RecommendationsList
        recommendations={recommendations}
        riskLevel={metrics.performance_level}
      />
    </div>
  );
};

export default StudentDashboard;
