import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  SlidersHorizontal, 
  Users, 
  BrainCircuit, 
  TrendingUp, 
  BookOpen,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const isFacultyOrAdmin = user?.role === 'faculty' || user?.role === 'admin';

  const navItems = [
    {
      name: 'Student Dashboard',
      path: '/student-dashboard',
      icon: LayoutDashboard,
      description: 'Performance overview & trends',
    },
    {
      name: 'What-If Simulator',
      path: '/what-if',
      icon: SlidersHorizontal,
      description: 'Counterfactual scenario modeling',
    },
    {
      name: 'Faculty Heatmap',
      path: '/faculty-dashboard',
      icon: Users,
      description: 'Cohort distribution & at-risk alerts',
      badge: isFacultyOrAdmin ? 'Faculty' : null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3">
            Analytics & Models
          </span>
          <nav className="mt-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm shadow-teal-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    <div>
                      <div className="font-semibold">{item.name}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* System Intelligence Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-teal-950/50 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-teal-400 mb-1.5">
            <Activity className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-semibold">Model Status</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Random Forest & SHAP Explainer active with 89.5% accuracy.
          </p>
        </div>
      </div>

      {/* System Footer Note */}
      <div className="pt-4 border-t border-slate-800/80 px-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>PostgreSQL & FastAPI</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
