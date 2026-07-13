/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  auth,
  signInWithGoogle,
  signOutUser,
  testConnection, 
  db, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Issue, Language, ViewMode } from './types';
import { translations } from './translations';
import { LanguageSelector } from './components/LanguageSelector';
import { CitizenForm } from './components/CitizenForm';
import { IssueCard } from './components/IssueCard';
import { AdminPanel } from './components/AdminPanel';
import { SplashScreen } from './components/SplashScreen';
import { InteractiveLogo } from './components/InteractiveLogo';
import { 
  Activity, 
  ClipboardList, 
  CheckCircle, 
  Loader2, 
  PlusCircle, 
  MapPin, 
  Users, 
  BookmarkCheck,
  ShieldCheck,
  Search,
  Filter,
  X
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [viewMode, setViewMode] = useState<ViewMode>('citizen');
  const [uid, setUid] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeCitizenTab, setActiveCitizenTab] = useState<'report' | 'track'>('report');
  
  // Successful submission tracker
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Search & filter states for the public feed
  const [publicSearchQuery, setPublicSearchQuery] = useState<string>('');
  const [publicCategoryFilter, setPublicCategoryFilter] = useState<string>('');
  const [publicVillageQuery, setPublicVillageQuery] = useState<string>('');
  const [publicCityQuery, setPublicCityQuery] = useState<string>('');

  const t = translations[language];

  // Initialize Auth & Connection Test
  useEffect(() => {
    async function init() {
      try {
        await testConnection();
      } catch (err: any) {
        console.error('Database connection check failed:', err);
      }
    }
    init();

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUid(firebaseUser.uid);
        setUser(firebaseUser);
      } else {
        setUid('');
        setUser(null);
      }
      setLoading(false);
    }, (err) => {
      console.error('Auth state subscription failed:', err);
      setAuthError('Authentication state initialization failed.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Set up real-time listener for ALL issues
  useEffect(() => {
    if (!uid) return;

    const pathForOnSnapshot = 'issues';
    const q = query(collection(db, pathForOnSnapshot), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Issue[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Issue);
      });
      setIssues(fetched);
    }, (error) => {
      // Mandated standard error catcher
      handleFirestoreError(error, OperationType.GET, pathForOnSnapshot);
    });

    return () => unsubscribe();
  }, [uid]);

  // Track personal reports
  const personalIssues = issues.filter(issue => issue.submittedByUid === uid);

  // Filter public issues based on search & category
  const filteredPublicIssues = issues.filter(issue => {
    // Only show that person's problems, not all problems
    if (issue.submittedByUid !== uid) return false;

    // Category match
    const matchesCategory = !publicCategoryFilter || issue.category === publicCategoryFilter;
    
    // Keyword match (supports description, landmark, category, villageName, cityName, and ID)
    const keyword = publicSearchQuery.trim().toLowerCase();
    const matchesKeyword = !keyword || 
      issue.description.toLowerCase().includes(keyword) || 
      (issue.landmarkNote && issue.landmarkNote.toLowerCase().includes(keyword)) ||
      (issue.villageName && issue.villageName.toLowerCase().includes(keyword)) ||
      (issue.cityName && issue.cityName.toLowerCase().includes(keyword)) ||
      issue.category.toLowerCase().includes(keyword) ||
      issue.id.toLowerCase().includes(keyword);

    // Village specific match (only active when category is Transportation Request)
    const matchesVillage = !publicVillageQuery.trim() || 
      (issue.villageName && issue.villageName.toLowerCase().includes(publicVillageQuery.trim().toLowerCase()));

    // City/Town specific match (only active when category is Transportation Request)
    const matchesCity = !publicCityQuery.trim() || 
      (issue.cityName && issue.cityName.toLowerCase().includes(publicCityQuery.trim().toLowerCase()));

    return matchesCategory && matchesKeyword && matchesVillage && matchesCity;
  });

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-4" id="app-loading-screen">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-700" id="loading-spinner" />
        <p className="text-sm font-bold text-slate-600 font-sans uppercase tracking-wider">Connecting to Socia Gram Portal...</p>
      </div>
    );
  }

  if (!uid) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between" id="app-login-screen">
        {/* Simple Header */}
        <header className="bg-emerald-800 text-white border-b-4 border-emerald-600 shadow-md py-4 px-6" id="login-header">
          <div className="max-w-7xl mx-auto flex justify-between items-center" id="login-header-content">
            <div className="flex items-baseline gap-2.5" id="login-header-brand">
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">
                {t.title}
              </h1>
              <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest hidden sm:inline">
                {t.tagline}
              </span>
            </div>
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
          </div>
        </header>

        {/* Login Card Container */}
        <main className="flex-grow flex items-center justify-center p-6" id="login-main">
          <div className="max-w-md w-full bg-white border-2 border-slate-200 rounded-2xl shadow-xl p-8 space-y-8 text-center" id="login-card">
            
            {/* Visual Header / Brand Accent */}
            <div className="space-y-6" id="login-brand-group">
              {/* Premium Logo Container with Soft Light-Green Radial Gradient */}
              <div className="relative mx-auto w-48 h-48 rounded-full flex items-center justify-center overflow-visible bg-white" id="login-logo-radial-frame">
                <div 
                  className="absolute inset-0 rounded-full pointer-events-none z-0 border-2 border-emerald-100/60 shadow-inner" 
                  style={{
                    background: "radial-gradient(circle at center, rgba(230,244,234,0.85) 0%, rgba(255,255,255,1) 85%)"
                  }}
                  id="login-radial-bg"
                />
                <InteractiveLogo size="lg" className="z-10" />
              </div>
              <div className="space-y-1.5" id="login-titles">
                <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tight">SECURE CIVIC PORTAL</h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.tagline}</p>
              </div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider leading-relaxed" id="login-explanation">
                A modern platform connecting citizens with village administration. Easily report infrastructure issues and track resolutions in real-time.
              </p>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="bg-red-50 text-red-700 border-2 border-red-200 p-4 rounded-xl text-xs font-black uppercase tracking-tight flex items-start gap-2.5 text-left" id="login-error">
                <Activity className="w-5 h-5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Sign-In Action */}
            <div className="space-y-4" id="login-actions">
              <button
                type="button"
                id="btn-google-signin"
                onClick={async () => {
                  setLoading(true);
                  setAuthError('');
                  try {
                    await signInWithGoogle();
                  } catch (err: any) {
                    console.error('Google sign-in failed:', err);
                    setAuthError('Google sign-in was cancelled or failed. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full h-14 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-black rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow transition-all cursor-pointer hover:border-slate-300 active:scale-95 duration-150"
              >
                {/* SVG Google Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" id="svg-google-logo">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Connect with Google</span>
              </button>
            </div>

            {/* Verification & Trust badges */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest" id="login-trust-footer">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Government Approved Secure Portal</span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-50 border-t-2 border-slate-200 py-6 text-center text-xs text-slate-400" id="login-footer">
          <p className="font-black text-emerald-950 uppercase tracking-widest">Socia Gram — SECURE PUBLIC GOVERNANCE NETWORK</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between" id="app-main-layout">
      
      {/* Navigation / Header */}
      <header className="sticky top-0 z-40 bg-emerald-800 text-white border-b-4 border-emerald-600 shadow-md" id="app-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between" id="header-content">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5" id="header-brand">
            <InteractiveLogo size="sm" className="bg-white/95 rounded-xl p-1 shadow-md border-2 border-emerald-300 shrink-0" />
            <div className="flex items-baseline gap-2.5">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase" id="brand-title">
                {t.title}
              </h1>
              <span className="text-emerald-200 text-xs md:text-sm font-bold uppercase tracking-widest hidden sm:inline" id="brand-tagline">
                {t.tagline}
              </span>
            </div>
          </div>

          {/* Controls: Language Selection & Role Switcher */}
          <div className="flex flex-wrap items-center gap-4" id="header-controls">
            <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
            
            <div className="h-6 w-[1px] bg-emerald-700/60 hidden md:block"></div>

            {/* User Profile Info & Sign Out */}
            {user && (
              <div className="flex items-center gap-2.5 bg-emerald-950/35 border border-emerald-800/40 px-3 py-1.5 rounded-lg" id="user-profile-badge">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-6 h-6 rounded-full border border-emerald-300" id="user-avatar" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 bg-emerald-800 rounded-full flex items-center justify-center text-[10px] font-black border border-emerald-300" id="user-avatar-fallback">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </div>
                )}
                <div className="hidden sm:block text-left" id="user-info-text">
                  <p className="text-[10px] font-black leading-none uppercase tracking-wide truncate max-w-[100px] text-white">{user.displayName || 'Citizen'}</p>
                  <p className="text-[8px] text-emerald-200 font-bold tracking-tight truncate max-w-[100px]">{user.email || 'Verified User'}</p>
                </div>
                <button
                  type="button"
                  id="btn-signout"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await signOutUser();
                    } catch (err) {
                      console.error('Sign-out error:', err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-[9px] font-black text-red-200 hover:text-red-400 uppercase tracking-widest cursor-pointer pl-1.5 border-l border-emerald-800/40"
                >
                  Exit
                </button>
              </div>
            )}

            <div className="h-6 w-[1px] bg-emerald-700/60 hidden md:block"></div>

            {/* View Mode Switcher */}
            <div className="flex bg-emerald-950/40 rounded-lg p-1 border border-emerald-800/40" id="view-mode-tabs">
              <button
                type="button"
                id="btn-switch-citizen"
                onClick={() => {
                  setViewMode('citizen');
                  setSubmittedId(null);
                }}
                className={`px-4 py-1.5 rounded font-black text-xs transition-all uppercase flex items-center gap-1.5 ${
                  viewMode === 'citizen'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-white hover:text-emerald-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t.citizenView}</span>
              </button>
              <button
                type="button"
                id="btn-switch-admin"
                onClick={() => setViewMode('admin')}
                className={`px-4 py-1.5 rounded font-black text-xs transition-all uppercase flex items-center gap-1.5 ${
                  viewMode === 'admin'
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-white hover:text-emerald-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.adminView}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8" id="app-content-area">
        {viewMode === 'admin' ? (
          <AdminPanel issues={issues} language={language} />
        ) : (
          /* Citizen Flow */
          <div className="space-y-8" id="citizen-flow-container">
            {submittedId ? (
              /* Submission Confirmation Screen */
              <div className="max-w-md mx-auto bg-white border-2 border-slate-200 rounded-2xl shadow-lg p-8 text-center space-y-6" id="confirmation-card">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-800 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto" id="confirmation-success-icon">
                  <BookmarkCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2" id="confirmation-titles">
                  <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">{t.submitSuccess}</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-normal">Complaint synchronized with public village records database.</p>
                </div>

                <div className="bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-2xl p-5 font-mono space-y-1.5 text-center" id="confirmation-id-box">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.complaintId}</p>
                  <p className="text-xl font-black text-emerald-900 tracking-widest">{submittedId}</p>
                </div>

                <div className="flex flex-col gap-2.5" id="confirmation-actions">
                  <button
                    type="button"
                    id="btn-view-my-reports"
                    onClick={() => {
                      setSubmittedId(null);
                      setActiveCitizenTab('track');
                    }}
                    className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow active:scale-95 transition-all"
                  >
                    {t.trackMyIssues}
                  </button>
                  <button
                    type="button"
                    id="btn-another-report"
                    onClick={() => setSubmittedId(null)}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer border border-slate-200 active:scale-95 transition-all"
                  >
                    {t.backToHome}
                  </button>
                </div>
              </div>
            ) : (
              /* Report / Track Tabs & Forms */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="citizen-workspace">
                
                {/* Form or Personal list panel */}
                <div className="lg:col-span-7 space-y-6" id="citizen-interactive-panel">
                  {/* Tab bar switcher */}
                  <div className="flex bg-slate-100 rounded-xl p-1.5 border-2 border-slate-200" id="citizen-action-tabs">
                    <button
                      type="button"
                      id="tab-btn-report"
                      onClick={() => setActiveCitizenTab('report')}
                      className={`flex-1 py-3.5 text-center text-xs font-black rounded-lg uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        activeCitizenTab === 'report'
                          ? 'bg-emerald-800 text-white shadow-md'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{t.reportIssue}</span>
                    </button>
                    <button
                      type="button"
                      id="tab-btn-track"
                      onClick={() => setActiveCitizenTab('track')}
                      className={`flex-1 py-3.5 text-center text-xs font-black rounded-lg uppercase flex items-center justify-center gap-2 transition-all relative cursor-pointer ${
                        activeCitizenTab === 'track'
                          ? 'bg-emerald-800 text-white shadow-md'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>{t.trackMyIssues}</span>
                      {personalIssues.length > 0 && (
                        <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center absolute right-3 top-3.5 ${
                          activeCitizenTab === 'track' ? 'bg-white text-emerald-900' : 'bg-emerald-800 text-white'
                        }`} id="badge-personal-count">
                          {personalIssues.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {activeCitizenTab === 'report' ? (
                    <CitizenForm 
                      language={language} 
                      onSuccess={(id) => setSubmittedId(id)} 
                      uid={uid} 
                    />
                  ) : (
                    /* Track complaints reported from this device */
                    <div className="space-y-6" id="personal-reports-container">
                      <div className="border-b-2 border-slate-200 pb-3" id="personal-track-header">
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">MY PORTAL</h2>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] mt-1">{t.trackTitle}</h2>
                      </div>
                      {personalIssues.length === 0 ? (
                        <div className="bg-white border-2 border-slate-200 rounded-2xl p-10 text-center text-slate-400" id="personal-reports-empty">
                          <p className="text-xs font-black uppercase tracking-wider text-slate-500">{t.noIssues}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4" id="personal-reports-list">
                          {personalIssues.map((issue) => (
                            <IssueCard 
                              key={issue.id} 
                              issue={issue} 
                              language={language} 
                              isAdminView={false} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Public feed column */}
                <div className="lg:col-span-5 space-y-6" id="citizen-public-feed">
                  
                  <div className="flex justify-between items-end border-b-2 border-slate-200 pb-3" id="public-feed-header">
                    <div>
                      <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">TRACK</h2>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] mt-1">
                        {t.publicFeed}
                      </h2>
                    </div>
                    <div className="text-right min-w-[80px]" id="public-resolved-stat">
                      <div className="text-3xl font-black text-emerald-900 leading-none">
                        {personalIssues.filter(i => i.status === 'Resolved').length}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">
                        {t.resolved}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-500 leading-relaxed" id="public-feed-subtitle">
                    {language === 'en' 
                      ? 'Secure dashboard tracking your reported issues and their live status.' 
                      : language === 'te' 
                        ? 'మీరు నివేదించిన సమస్యలు మరియు వాటి లైవ్ స్థితిని ట్రాక్ చేసే సురక్షిత డాష్‌బోర్డ్.' 
                        : 'आपके द्वारा रिपोर्ट की गई समस्याओं और उनकी लाइव स्थिति को ट्रैक करने वाला सुरक्षित डैशबोर्ड।'}
                  </p>

                  {/* Search and Category Filter Section */}
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-sm" id="public-feed-search-filter">
                    
                    {/* Search Input */}
                    <div className="relative" id="feed-search-container">
                      <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={publicSearchQuery}
                        onChange={(e) => setPublicSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-800 transition-colors placeholder-slate-400"
                        id="feed-search-input"
                      />
                      {publicSearchQuery && (
                        <button
                          onClick={() => setPublicSearchQuery('')}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          id="feed-search-clear"
                          title="Clear search"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="space-y-2" id="feed-filter-container">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5" id="lbl-filter-category">
                        <Filter className="w-3.5 h-3.5 text-emerald-900" />
                        {t.filterByCategory}
                      </label>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1" id="feed-category-pills">
                        <button
                          type="button"
                          onClick={() => setPublicCategoryFilter('')}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            publicCategoryFilter === ''
                              ? 'bg-emerald-800 border-emerald-800 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                          id="btn-cat-all"
                        >
                          {t.allCategories}
                        </button>
                        {Object.keys(t.categories).map((catKey) => {
                          const isSelected = publicCategoryFilter === catKey;
                          return (
                            <button
                              key={catKey}
                              type="button"
                              onClick={() => setPublicCategoryFilter(catKey)}
                              className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-800 border-emerald-800 text-white shadow-sm'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                              id={`btn-cat-${catKey.replace(/[\s/&]+/g, '-').toLowerCase()}`}
                            >
                              {(t.categories as any)[catKey]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Conditional Village & City Name search filters for Transportation Request */}
                    {publicCategoryFilter === 'Transportation Request' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t-2 border-slate-100" id="transportation-filters">
                        <div className="space-y-1.5" id="village-filter-box">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {t.filterByVillage}
                          </label>
                          <input
                            type="text"
                            placeholder={t.villageNamePlaceholder}
                            value={publicVillageQuery}
                            onChange={(e) => setPublicVillageQuery(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-800 transition-colors placeholder-slate-400"
                            id="feed-village-search-input"
                          />
                        </div>
                        <div className="space-y-1.5" id="city-filter-box">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {t.filterByCity}
                          </label>
                          <input
                            type="text"
                            placeholder={t.cityNamePlaceholder}
                            value={publicCityQuery}
                            onChange={(e) => setPublicCityQuery(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-800 transition-colors placeholder-slate-400"
                            id="feed-city-search-input"
                          />
                        </div>
                      </div>
                    )}

                    {/* Clear all active filters indicator */}
                    {(publicSearchQuery || publicCategoryFilter || publicVillageQuery || publicCityQuery) && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] font-bold text-slate-400" id="filter-active-indicator">
                        <span className="uppercase">Filters active: {filteredPublicIssues.length} found</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPublicSearchQuery('');
                            setPublicCategoryFilter('');
                            setPublicVillageQuery('');
                            setPublicCityQuery('');
                          }}
                          className="text-emerald-800 hover:text-emerald-900 font-black uppercase hover:underline flex items-center gap-1 cursor-pointer"
                          id="btn-clear-filters"
                        >
                          Reset Filters
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {personalIssues.length === 0 ? (
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-10 text-center text-slate-400" id="public-feed-empty">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                        {language === 'en' 
                          ? 'You have not reported any issues yet.' 
                          : language === 'te' 
                            ? 'మీరు ఇంకా ఎలాంటి సమస్యలను నివేదించలేదు.' 
                            : 'आपने अभी तक कोई समस्या रिपोर्ट नहीं की है।'}
                      </p>
                    </div>
                  ) : filteredPublicIssues.length === 0 ? (
                    <div className="bg-white border-2 border-slate-200 rounded-2xl p-10 text-center text-slate-400" id="public-feed-no-results">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{t.noFilteredIssues}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setPublicSearchQuery('');
                          setPublicCategoryFilter('');
                        }}
                        className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                        id="btn-reset-filters-empty"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4" id="public-feed-list">
                      {filteredPublicIssues.map((issue) => (
                        <IssueCard 
                          key={issue.id} 
                          issue={issue} 
                          language={language} 
                          isAdminView={false} 
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t-2 border-slate-200 py-8 text-center text-xs text-slate-400" id="app-footer">
        <div className="max-w-5xl mx-auto px-4 space-y-1.5" id="footer-content">
          <p className="font-black text-emerald-950 uppercase tracking-widest" id="footer-logo">Socia Gram — Village Public Service & Infrastructure Reporting Platform</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1" id="footer-copyright">© 2026 Local Village Governance Secretariat. Secure Public Portal.</p>
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1" id="footer-developer">Developed by — P.Meghana</p>
        </div>
      </footer>

    </div>
  );
}
