/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Issue } from '../types';
import { translations } from '../translations';
import { CategoryIcon } from './CategoryIcon';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { updateDoc, doc, Timestamp } from 'firebase/firestore';
import { formatDate, compressImage } from '../utils';
import { MapSelector } from './MapSelector';
import { 
  MapPin, 
  ExternalLink, 
  Calendar, 
  User, 
  Phone, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MessageSquare,
  ChevronDown,
  Loader2,
  X,
  Camera,
  Fingerprint,
  Bus
} from 'lucide-react';

interface IssueCardProps {
  issue: Issue;
  language: 'en' | 'te' | 'hi';
  isAdminView?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, language, isAdminView = false }) => {
  const t = translations[language];

  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false);
  const [isResPhotoExpanded, setIsResPhotoExpanded] = useState(false);
  const [showStatusEditor, setShowStatusEditor] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // Status editing states (for Admin Mode)
  const [newStatus, setNewStatus] = useState<Issue['status']>(issue.status);
  const [resNote, setResNote] = useState(issue.resolutionNote || '');
  const [resPhoto, setResPhoto] = useState<string | null>(issue.resolutionPhotoUrl || null);
  const [compressingPhoto, setCompressingPhoto] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [saveError, setSaveError] = useState('');

  const resFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleResFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressingPhoto(true);
    setSaveError('');
    try {
      const compressedBase64 = await compressImage(file, 800, 200000);
      setResPhoto(compressedBase64);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || 'Failed to process resolution image');
    } finally {
      setCompressingPhoto(false);
    }
  };

  // Status Badge configurations
  const getStatusConfig = (status: Issue['status']) => {
    switch (status) {
      case 'Resolved':
        return {
          bg: 'bg-emerald-100 border-2 border-emerald-900 text-emerald-950',
          dot: 'bg-emerald-600',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-800" />,
          label: t.status['Resolved']
        };
      case 'In Progress':
        return {
          bg: 'bg-amber-100 border-2 border-amber-900 text-amber-950',
          dot: 'bg-amber-600',
          icon: <Clock className="w-3.5 h-3.5 text-amber-800" />,
          label: t.status['In Progress']
        };
      default: // Submitted
        return {
          bg: 'bg-slate-100 border-2 border-slate-900 text-slate-950',
          dot: 'bg-slate-600',
          icon: <AlertCircle className="w-3.5 h-3.5 text-slate-700" />,
          label: t.status['Submitted']
        };
    }
  };

  const getBorderColor = (status: Issue['status']) => {
    switch (status) {
      case 'Resolved':
        return 'border-l-[10px] border-l-emerald-500';
      case 'In Progress':
        return 'border-l-[10px] border-l-amber-500';
      default:
        return 'border-l-[10px] border-l-slate-400';
    }
  };

  const statusConfig = getStatusConfig(issue.status);

  // Update status in Firestore
  const handleUpdateStatus = async () => {
    setSavingStatus(true);
    setSaveError('');
    try {
      const docRef = doc(db, 'issues', issue.id);
      const updateData: any = {
        status: newStatus,
        resolutionNote: resNote.trim() || '',
        updatedAt: Timestamp.now()
      };
      if (newStatus === 'Resolved') {
        updateData.resolutionPhotoUrl = resPhoto || '';
      } else {
        updateData.resolutionPhotoUrl = '';
      }
      await updateDoc(docRef, updateData);
      setShowStatusEditor(false);
    } catch (err: any) {
      console.error('Error updating status:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `issues/${issue.id}`);
      } catch (mappedError: any) {
        setSaveError(mappedError.message || 'Update failed');
      }
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-md border-2 border-slate-200/80 ${getBorderColor(issue.status)} overflow-hidden flex flex-col md:flex-row h-full transition-all duration-200 hover:shadow-lg`} id={`issue-card-${issue.id}`}>
      {/* Left side: Photo thumbnail */}
      <div className="relative w-full md:w-48 shrink-0 bg-slate-100 min-h-[160px] md:min-h-full cursor-zoom-in" id="card-photo-wrapper" onClick={() => setIsPhotoExpanded(true)}>
        <img 
          src={issue.photoUrl} 
          alt={issue.category} 
          className="w-full h-full object-cover min-h-[160px] md:absolute md:top-0 md:left-0 md:right-0 md:bottom-0"
          id={`img-thumb-${issue.id}`}
        />
        <div className="absolute bottom-2.5 left-2.5 bg-black/70 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
          <span>Click to Zoom</span>
        </div>
      </div>

      {/* Right side: Detailed contents */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4" id="card-details-wrapper">
        <div className="space-y-3">
          {/* Category & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2" id="card-meta">
            <div className="flex items-center gap-2" id="card-category-box">
              <CategoryIcon category={issue.category} className="w-5 h-5" />
              <span className="font-black text-slate-950 text-base uppercase tracking-tight">
                {t.categories[issue.category as keyof typeof t.categories] || issue.category}
              </span>
            </div>
            <div className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${statusConfig.bg}`} id="card-status-badge">
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </div>
          </div>

          {/* Transportation Request Details */}
          {issue.reportType === 'transport' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-blue-50/40 p-3.5 rounded-xl border-2 border-blue-100/60 text-xs" id="card-transport-details">
              <div className="flex items-center gap-2" id="transport-village-name">
                <Bus className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  <strong className="font-black text-[10px] uppercase tracking-wider text-slate-400 block">{t.villageNameLabel}</strong>
                  <span className="font-black text-slate-800 text-sm">{issue.villageName}</span>
                </span>
              </div>
              <div className="flex items-center gap-2" id="transport-city-name">
                <span className="w-4 h-4 text-blue-700 font-bold shrink-0 text-center flex items-center justify-center">🏙️</span>
                <span>
                  <strong className="font-black text-[10px] uppercase tracking-wider text-slate-400 block">{t.cityNameLabel}</strong>
                  <span className="font-black text-slate-800 text-sm">{issue.cityName || 'N/A'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2" id="transport-pincode">
                <span className="w-4 h-4 text-blue-700 font-bold shrink-0 text-center flex items-center justify-center">📍</span>
                <span>
                  <strong className="font-black text-[10px] uppercase tracking-wider text-slate-400 block">{t.pinCodeLabel}</strong>
                  <span className="font-mono font-bold text-slate-800 text-sm tracking-widest">{issue.pinCode}</span>
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          {issue.description ? (
            <p className="text-slate-700 text-sm leading-relaxed font-bold" id="card-description">
              {issue.description}
            </p>
          ) : issue.reportType === 'transport' ? (
            <p className="text-slate-400 text-sm italic font-bold" id="card-description">
              {language === 'en' ? 'No additional description provided.' : language === 'te' ? 'అదనపు వివరణ ఏదీ ఇవ్వబడలేదు.' : 'कोई अतिरिक्त विवरण नहीं दिया गया है।'}
            </p>
          ) : null}

          {/* Landmark Note */}
          {issue.landmarkNote && (
            <div className="text-xs text-slate-700 bg-slate-50 border-2 border-slate-200 rounded-xl p-3 flex items-start gap-1.5" id="card-landmark">
              <MapPin className="w-3.5 h-3.5 text-emerald-900 mt-0.5 shrink-0" />
              <span><strong className="font-black text-[10px] uppercase text-slate-400 tracking-wider block">Landmark</strong> {issue.landmarkNote}</span>
            </div>
          )}

          {/* Metadata: Coordinates & Map link, Date */}
          <div className="grid grid-cols-1 gap-2 border-t-2 border-slate-100 pt-3 sm:grid-cols-2 text-xs text-slate-500" id="card-stats-metadata">
            <div className="flex items-center gap-1.5 font-bold" id="card-date-box">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDate(issue.createdAt)}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2.5" id="card-maps-box">
              <span className="font-mono text-[10px] text-slate-400 font-bold">({issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)})</span>
              
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="text-emerald-850 font-black uppercase tracking-tight hover:text-emerald-950 inline-flex items-center gap-1 text-[11px] cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors"
                id="btn-toggle-inline-map"
              >
                <MapPin className="w-3 h-3" />
                <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
              </button>

              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${issue.latitude},${issue.longitude}`}
                target="_blank"
                rel="noreferrer referrer"
                className="text-slate-500 hover:text-emerald-900 font-black uppercase tracking-tight hover:underline inline-flex items-center gap-0.5 text-[11px]"
                id="btn-maps-link"
              >
                {t.viewOnMap}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Collapsible Inline Map */}
          {showMap && (
            <div className="mt-2.5 overflow-hidden rounded-xl border border-slate-200" id="card-inline-map">
              <MapSelector
                latitude={issue.latitude}
                longitude={issue.longitude}
                readOnly={true}
                height="220px"
              />
            </div>
          )}

          {/* Reporter Details (Only if present) */}
          {(issue.reporterName || issue.reporterPhone || issue.aadhaarNumber) && (
            <div className="flex flex-wrap gap-4 text-xs text-slate-700 bg-emerald-50/30 p-3 rounded-xl border-2 border-emerald-100/60" id="card-reporter-info">
              {issue.reporterName && (
                <div className="flex items-center gap-1.5" id="reporter-name-box">
                  <User className="w-3.5 h-3.5 text-emerald-950" />
                  <span><strong className="font-black text-[10px] uppercase tracking-wider text-slate-400 block">Reporter</strong> {issue.reporterName}</span>
                </div>
              )}
              {issue.reporterPhone && (
                <div className="flex items-center gap-1.5" id="reporter-phone-box">
                  <Phone className="w-3.5 h-3.5 text-emerald-950" />
                  <span><strong className="font-black text-[10px] uppercase tracking-wider text-slate-400 block">Phone</strong> {issue.reporterPhone}</span>
                </div>
              )}
              {issue.aadhaarNumber && (
                <div className="flex items-center gap-1.5" id="reporter-aadhaar-box">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-800" />
                  <span>
                    <strong className="font-black text-[10px] uppercase tracking-wider text-slate-400 block">
                      {t.aadhaarLabel}
                    </strong>
                    <span className="font-mono tracking-wider font-bold">
                      {isAdminView || auth.currentUser?.uid === issue.submittedByUid
                        ? `${issue.aadhaarNumber.slice(0, 4)} ${issue.aadhaarNumber.slice(4, 8)} ${issue.aadhaarNumber.slice(8, 12)}`
                        : `•••• •••• ${issue.aadhaarNumber.slice(8, 12)}`}
                    </span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Resolution Note & Photo (if Resolved or has resolution info) */}
          {(issue.resolutionNote || issue.resolutionPhotoUrl) && (
            <div className="bg-emerald-50/40 border-2 border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 space-y-3" id="card-resolution-note-container">
              <div className="flex justify-between items-center" id="card-resolution-header">
                <span className="font-black flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-800">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {t.resolutionNote}
                </span>
                {issue.status === 'Resolved' && (
                  <span className="bg-emerald-200/60 border border-emerald-300 text-emerald-900 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Resolved Work
                  </span>
                )}
              </div>
              
              {issue.resolutionNote && (
                <p className="font-bold italic leading-normal text-slate-800" id="card-resolution-text">
                  {issue.resolutionNote}
                </p>
              )}

              {issue.resolutionPhotoUrl && (
                <div className="space-y-1.5" id="card-resolution-photo-box">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Resolution Evidence Photo</span>
                  <div 
                    className="relative w-36 h-24 bg-slate-100 rounded-xl overflow-hidden cursor-zoom-in border border-emerald-200 hover:shadow-md transition-shadow" 
                    id="res-photo-thumb-container"
                    onClick={() => setIsResPhotoExpanded(true)}
                  >
                    <img 
                      src={issue.resolutionPhotoUrl} 
                      alt="Work Completed" 
                      className="w-full h-full object-cover"
                      id={`img-res-thumb-${issue.id}`}
                    />
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                      Zoom
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin controls inside card */}
        {isAdminView && (
          <div className="border-t-2 border-slate-100 pt-3 flex flex-col gap-2.5" id="admin-actions-box">
            {!showStatusEditor ? (
              <button
                type="button"
                id="btn-open-editor"
                onClick={() => setShowStatusEditor(true)}
                className="w-full sm:w-auto self-end px-4 py-2 bg-slate-100 text-slate-900 hover:bg-slate-200 font-black rounded-lg text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider border border-slate-200 transition-all cursor-pointer"
              >
                <span>{t.updateStatus}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 space-y-4" id="admin-editor-form">
                <div className="flex justify-between items-center" id="editor-header">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Action & Status</span>
                  <button 
                    type="button" 
                    id="btn-close-editor"
                    onClick={() => setShowStatusEditor(false)} 
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {saveError && (
                  <div className="text-[11px] font-black text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg uppercase tracking-tight" id="editor-error">
                    {saveError}
                  </div>
                )}

                {/* Status Selection */}
                <div className="flex gap-2" id="editor-status-radios">
                  {(['Submitted', 'In Progress', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      id={`editor-status-btn-${st.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setNewStatus(st)}
                      className={`flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wider rounded-lg border-2 transition-all cursor-pointer ${
                        newStatus === st
                          ? 'bg-emerald-800 border-emerald-800 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t.status[st]}
                    </button>
                  ))}
                </div>

                {/* Resolution Note */}
                <div className="space-y-1.5" id="editor-note-box">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.resolutionNote}</label>
                  <textarea
                    id="txt-editor-resolution-note"
                    rows={2}
                    maxLength={1000}
                    value={resNote}
                    onChange={(e) => setResNote(e.target.value)}
                    placeholder={t.resolutionNotePlaceholder}
                    className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 outline-none text-xs text-slate-800 placeholder-slate-400 font-bold focus:border-emerald-800"
                  />
                </div>

                {/* Resolution Photo Evidence (Only when Resolved is selected) */}
                {newStatus === 'Resolved' && (
                  <div className="space-y-1.5" id="editor-photo-box">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Resolution Photo Evidence (Optional)
                    </label>
                    <div 
                      onClick={() => resFileInputRef.current?.click()}
                      className="w-full h-32 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative p-3"
                      id="res-photo-upload-box"
                    >
                      {resPhoto ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center" id="res-photo-preview-container" onClick={(e) => e.stopPropagation()}>
                          <img src={resPhoto} alt="Resolution Preview" className="max-h-[80px] rounded-lg object-contain shadow-sm border border-slate-200" id="res-img-preview" />
                          <button
                            type="button"
                            id="btn-remove-res-photo"
                            onClick={() => setResPhoto(null)}
                            className="mt-1.5 px-3 py-1 bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider hover:bg-red-700 shadow cursor-pointer"
                          >
                            Remove Photo
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center space-y-1" id="res-photo-empty-container">
                          <div className="p-2 bg-slate-50 rounded-full shadow-sm border border-slate-200 text-emerald-900" id="res-photo-icon-box">
                            {compressingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                          </div>
                          <div className="space-y-0.5" id="res-photo-upload-meta">
                            <span className="text-[10px] font-black uppercase tracking-tight text-emerald-950 block">
                              {compressingPhoto ? 'Compressing...' : 'Upload Work Photo'}
                            </span>
                            <p className="text-[8px] font-bold text-slate-400">Snap or select image of completed work</p>
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        id="res-file-input"
                        ref={resFileInputRef}
                        accept="image/*"
                        capture="environment"
                        onChange={handleResFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end" id="editor-actions">
                  <button
                    type="button"
                    id="btn-cancel-editor"
                    onClick={() => setShowStatusEditor(false)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900 font-black uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="btn-save-editor"
                    disabled={savingStatus}
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-black rounded-lg flex items-center gap-1.5 uppercase tracking-wider cursor-pointer shadow active:scale-95 transition-all"
                  >
                    {savingStatus ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded photo lightbox / modal */}
      {isPhotoExpanded && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          id="photo-lightbox"
          onClick={() => setIsPhotoExpanded(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()} id="lightbox-content">
            <button 
              type="button" 
              id="btn-close-lightbox"
              className="absolute -top-10 right-0 text-white hover:text-slate-300 font-bold text-sm bg-black/40 p-2 rounded-full"
              onClick={() => setIsPhotoExpanded(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={issue.photoUrl} 
              alt={issue.category} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              id="lightbox-img"
            />
          </div>
          <div className="text-white text-xs mt-4 text-center font-semibold bg-black/40 px-4 py-2 rounded-lg" id="lightbox-caption">
            {t.categories[issue.category as keyof typeof t.categories] || issue.category} - {issue.description}
          </div>
        </div>
      )}

      {/* Expanded resolution photo lightbox / modal */}
      {isResPhotoExpanded && issue.resolutionPhotoUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          id="res-photo-lightbox"
          onClick={() => setIsResPhotoExpanded(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()} id="res-lightbox-content">
            <button 
              type="button" 
              id="btn-close-res-lightbox"
              className="absolute -top-10 right-0 text-white hover:text-slate-300 font-bold text-sm bg-black/40 p-2 rounded-full"
              onClick={() => setIsResPhotoExpanded(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={issue.resolutionPhotoUrl} 
              alt="Resolution Evidence" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              id="res-lightbox-img"
            />
          </div>
          <div className="text-white text-xs mt-4 text-center font-semibold bg-black/40 px-4 py-2 rounded-lg" id="res-lightbox-caption">
            {t.categories[issue.category as keyof typeof t.categories] || issue.category} - Resolution Evidence Photo
          </div>
        </div>
      )}
    </div>
  );
};
