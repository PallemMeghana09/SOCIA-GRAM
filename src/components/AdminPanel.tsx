/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Issue } from '../types';
import { translations } from '../translations';
import { DashboardStats } from './DashboardStats';
import { IssueCard } from './IssueCard';
import { 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertCircle,
  HelpCircle,
  FolderMinus,
  LogOut
} from 'lucide-react';

interface AdminPanelProps {
  issues: Issue[];
  language: 'en' | 'te' | 'hi';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ issues, language }) => {
  const t = translations[language];

  // PIN Authentication MVP State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [adminVillageQuery, setAdminVillageQuery] = useState('');
  const [adminCityQuery, setAdminCityQuery] = useState('');

  const HARDCODED_PIN = '6925';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (pin === HARDCODED_PIN) {
      setIsAuthenticated(true);
      setPin('');
    } else {
      setPinError(t.invalidPin);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Filter and Sort logic
  const filteredIssues = issues
    .filter((issue) => {
      // Category filter
      if (selectedCategory !== 'All' && issue.category !== selectedCategory) return false;
      // Status filter
      if (selectedStatus !== 'All' && issue.status !== selectedStatus) return false;
      
      // Search query (matches description, landmark, or reporter info)
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const descMatch = issue.description.toLowerCase().includes(query);
        const landmarkMatch = issue.landmarkNote?.toLowerCase().includes(query) || false;
        const reporterMatch = issue.reporterName?.toLowerCase().includes(query) || false;
        const aadhaarMatch = issue.aadhaarNumber?.toLowerCase().includes(query) || false;
        const villageMatch = issue.villageName?.toLowerCase().includes(query) || false;
        const cityMatch = issue.cityName?.toLowerCase().includes(query) || false;
        const pinMatch = issue.pinCode?.toLowerCase().includes(query) || false;
        const idMatch = issue.id.toLowerCase().includes(query);
        return descMatch || landmarkMatch || reporterMatch || aadhaarMatch || villageMatch || cityMatch || pinMatch || idMatch;
      }

      // Village specific filter (only evaluated if not empty)
      if (adminVillageQuery.trim()) {
        const villageMatch = issue.villageName?.toLowerCase().includes(adminVillageQuery.toLowerCase().trim()) || false;
        if (!villageMatch) return false;
      }

      // City specific filter (only evaluated if not empty)
      if (adminCityQuery.trim()) {
        const cityMatch = issue.cityName?.toLowerCase().includes(adminCityQuery.toLowerCase().trim()) || false;
        if (!cityMatch) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort logic
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  // Render Login view
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white border-2 border-slate-200 rounded-2xl shadow-lg p-8 space-y-6" id="admin-login-card">
        <div className="text-center space-y-2.5" id="login-header">
          <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-950 rounded-full flex items-center justify-center border-2 border-emerald-200" id="login-lock-icon">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight" id="login-title">{t.adminLogin}</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-snug">Access limited to authorized village administration officials.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4" id="login-form">
          {pinError && (
            <div className="bg-red-50 text-red-700 border-2 border-red-200 p-3.5 rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2" id="login-error-banner">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <div className="space-y-2" id="pin-field-box">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest" id="lbl-pin">{t.enterPin}</label>
            <input
              type="password"
              id="txt-admin-pin"
              maxLength={4}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-xl font-black px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-800 outline-none placeholder:font-normal"
            />
            <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-wider">Demo/MVP PIN is <span className="font-black font-mono text-slate-600">6925</span></p>
          </div>

          <button
            type="submit"
            id="btn-login"
            className="w-full py-3.5 bg-emerald-800 text-white font-black hover:bg-emerald-900 transition-all shadow-md text-xs uppercase tracking-widest rounded-xl cursor-pointer"
          >
            {t.login}
          </button>
        </form>

        <div className="bg-amber-50/60 border-2 border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5" id="login-mvp-warning">
          <p className="font-black uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            MVP Demo Configuration
          </p>
          <p className="font-bold leading-normal text-[11px] text-slate-600">
            This administrative login screen is hardcoded for demonstration and prototype purposes. Before deploying this application in a production environment, you must integrate Firebase Custom Claims, OAuth Google Workspaces, or standard email/password authentication.
          </p>
        </div>
      </div>
    );
  }

  // Render Admin Dashboard
  return (
    <div className="space-y-6" id="admin-dashboard-container">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-950 text-white p-6 rounded-2xl border-2 border-emerald-900 shadow" id="admin-header">
        <div id="admin-title-box">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2 uppercase">
            <Unlock className="w-5 h-5 text-emerald-400" />
            Socia Gram — Command Centre
          </h2>
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1">Manage, evaluate, and resolve public civic issues in real-time.</p>
        </div>
        <button
          type="button"
          id="btn-logout"
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600/95 text-white font-black rounded-xl text-xs hover:bg-red-700 flex items-center gap-1.5 transition-colors shadow cursor-pointer uppercase tracking-wider border border-red-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.logout}</span>
        </button>
      </div>

      {/* Summary statistics */}
      <DashboardStats issues={issues} language={language} />

      {/* Filter and controls bar */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="admin-controls-card">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search & Filter Controls</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5" id="filters-grid">
          {/* Search bar */}
          <div className="relative" id="filter-search-box">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="txt-admin-search"
              placeholder="Search desc, landmark, village, PIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-emerald-800 outline-none text-xs text-slate-800 placeholder-slate-400 font-bold"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5" id="filter-category-box">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="sel-filter-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 text-xs bg-white text-slate-800 font-black uppercase tracking-wider"
            >
              <option value="All">All Categories</option>
              {Object.keys(t.categories).map((cat) => (
                <option key={cat} value={cat}>
                  {t.categories[cat as keyof typeof t.categories]}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5" id="filter-status-box">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="sel-filter-status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 text-xs bg-white text-slate-800 font-black uppercase tracking-wider"
            >
              <option value="All">All Statuses</option>
              {(['Submitted', 'In Progress', 'Resolved'] as const).map((st) => (
                <option key={st} value={st}>
                  {t.status[st]}
                </option>
              ))}
            </select>
          </div>

          {/* Date Sorting */}
          <div className="flex items-center gap-1.5" id="filter-sort-box">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="sel-sort-date"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="w-full py-2.5 px-3 rounded-xl border-2 border-slate-200 text-xs bg-white text-slate-800 font-black uppercase tracking-wider"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Dedicated Village Name and City Name Search for Transportation Requests */}
        {(selectedCategory === 'All' || selectedCategory === 'Transportation Request') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t-2 border-slate-100" id="admin-transportation-filters">
            <div className="space-y-1.5" id="admin-village-filter">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                {t.filterByVillage}
              </label>
              <input
                type="text"
                placeholder={t.villageNamePlaceholder}
                value={adminVillageQuery}
                onChange={(e) => setAdminVillageQuery(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-800 transition-colors placeholder-slate-400"
                id="admin-village-search-input"
              />
            </div>
            <div className="space-y-1.5" id="admin-city-filter">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                {t.filterByCity}
              </label>
              <input
                type="text"
                placeholder={t.cityNamePlaceholder}
                value={adminCityQuery}
                onChange={(e) => setAdminCityQuery(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-800 transition-colors placeholder-slate-400"
                id="admin-city-search-input"
              />
            </div>
          </div>
        )}

        {/* Clear/Reset Admin Filters Button */}
        {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All' || adminVillageQuery || adminCityQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400" id="admin-filter-active-indicator">
            <span>FILTERS ACTIVE: {filteredIssues.length} MATCHING COMPLAINTS FOUND</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('All');
                setAdminVillageQuery('');
                setAdminCityQuery('');
              }}
              className="text-red-600 hover:text-red-700 font-black uppercase hover:underline flex items-center gap-1 cursor-pointer"
              id="btn-admin-clear-filters"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Grid of issues */}
      <div className="space-y-4" id="admin-results-section">
        <div className="flex justify-between items-center px-1" id="results-meta">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing {filteredIssues.length} of {issues.length} reported issues
          </span>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-2" id="admin-empty-results">
            <FolderMinus className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-black uppercase tracking-wider text-slate-500">No issues matching your filters were found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6" id="admin-issues-grid">
            {filteredIssues.map((issue) => (
              <IssueCard 
                key={issue.id} 
                issue={issue} 
                language={language} 
                isAdminView={true} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
