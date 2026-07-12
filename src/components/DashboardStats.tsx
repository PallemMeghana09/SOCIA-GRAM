/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Issue } from '../types';
import { translations } from '../translations';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface DashboardStatsProps {
  issues: Issue[];
  language: 'en' | 'te' | 'hi';
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ issues, language }) => {
  const t = translations[language];

  // Calculations
  const total = issues.length;
  const submitted = issues.filter(i => i.status === 'Submitted').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  // Category counts
  const categoryCounts = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => (b[1] as number) - (a[1] as number));

  return (
    <div className="space-y-6" id="dashboard-stats-wrapper">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-metric-grid">
        {/* Total Issues */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex items-center gap-3.5 shadow-sm" id="stat-total">
          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl" id="stat-total-icon">
            <FileText className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalIssues}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">{total}</p>
          </div>
        </div>

        {/* Pending Issues */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex items-center gap-3.5 shadow-sm" id="stat-pending">
          <div className="p-3 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl" id="stat-pending-icon">
            <AlertCircle className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.unsolved}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">{submitted}</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex items-center gap-3.5 shadow-sm" id="stat-inprogress">
          <div className="p-3 bg-amber-50 text-amber-800 border border-amber-100 rounded-xl" id="stat-inprogress-icon">
            <Clock className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.inProgress}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">{inProgress}</p>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 flex items-center gap-3.5 shadow-sm" id="stat-resolved">
          <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl" id="stat-resolved-icon">
            <CheckCircle className="w-5 h-5 sm:w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.resolved}</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-950 font-mono tracking-tight">{resolved}</p>
          </div>
        </div>
      </div>

      {/* Category distribution visualizer */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm" id="stats-category-breakdown">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-5" id="stat-category-title">
          <TrendingUp className="w-4 h-4 text-emerald-900" />
          Issue Category Distribution
        </h3>
        {total === 0 ? (
          <p className="text-xs text-slate-400 py-2 font-bold uppercase tracking-wider">No category data available.</p>
        ) : (
          <div className="space-y-4" id="category-bars-list">
            {sortedCategories.map(([cat, count]) => {
              const percentage = Math.round(((count as number) / total) * 100);
              return (
                <div key={cat} className="space-y-1.5" id={`cat-bar-${cat.replace(/\s+/g, '-').toLowerCase()}`}>
                  <div className="flex justify-between text-xs font-black text-slate-700 uppercase tracking-tight" id="cat-bar-label">
                    <span>{t.categories[cat as keyof typeof t.categories] || cat}</span>
                    <span className="font-mono text-xs text-slate-500">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/40" id="cat-bar-track">
                    <div 
                      className="bg-emerald-800 h-full rounded-full transition-all duration-500" 
                      id="cat-bar-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
