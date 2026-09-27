import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal',
  trend,
  trendValue,
  badge,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'good':
      case 'low':
        return {
          border: 'border-emerald-500/20 hover:border-emerald-500/40',
          bg: 'bg-emerald-500/5',
          text: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          glow: 'group-hover:shadow-emerald-500/10',
        };
      case 'average':
      case 'medium':
        return {
          border: 'border-amber-500/20 hover:border-amber-500/40',
          bg: 'bg-amber-500/5',
          text: 'text-amber-400',
          badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          glow: 'group-hover:shadow-amber-500/10',
        };
      case 'at_risk':
      case 'high':
        return {
          border: 'border-rose-500/20 hover:border-rose-500/40',
          bg: 'bg-rose-500/5',
          text: 'text-rose-400',
          badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          glow: 'group-hover:shadow-rose-500/10',
        };
      default:
        return {
          border: 'border-slate-800 hover:border-teal-500/40',
          bg: 'bg-slate-900/90',
          text: 'text-teal-400',
          badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
          iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
          glow: 'group-hover:shadow-teal-500/10',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`relative p-5 rounded-2xl bg-slate-900/90 border ${styles.border} shadow-lg transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-xl ${styles.glow}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${styles.iconBg} transition-transform group-hover:scale-110`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${styles.badgeBg}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px] truncate">{subtitle}</span>
        {trendValue && (
          <span
            className={`flex items-center text-[11px] font-semibold shrink-0 ${
              trend === 'up'
                ? 'text-emerald-400'
                : trend === 'down'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {trend === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
            {trend === 'neutral' && <Minus className="w-3 h-3 mr-0.5" />}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
