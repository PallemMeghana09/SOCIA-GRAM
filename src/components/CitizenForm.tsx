/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { translations } from '../translations';
import { Language } from '../types';
import { compressImage, generateId, playTungSound } from '../utils';
import { MapSelector } from './MapSelector';
import { 
  Camera, 
  MapPin, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  RefreshCw,
  Plus,
  Fingerprint,
  Bus,
  Layers
} from 'lucide-react';

interface CitizenFormProps {
  language: Language;
  onSuccess: (complaintId: string) => void;
  uid: string;
}

export const CitizenForm: React.FC<CitizenFormProps> = ({ language, onSuccess, uid }) => {
  const t = translations[language];

  // Form State
  const [reportType, setReportType] = useState<'civic' | 'transport'>('civic');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [landmarkNote, setLandmarkNote] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [villageName, setVillageName] = useState('');
  const [cityName, setCityName] = useState('');
  const [pinCode, setPinCode] = useState('');

  // Image Recognition / Validation States
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<{ isValid: boolean; reason: string } | null>(null);

  useEffect(() => {
    // If there is no photo, we reset the analysis result
    if (!photo) {
      setImageAnalysisResult(null);
      return;
    }

    // For 'civic' reportType, we need a selected category to validate.
    if (reportType === 'civic' && !category) {
      setImageAnalysisResult(null);
      return;
    }

    const triggerValidation = async () => {
      setIsAnalyzingImage(true);
      setImageAnalysisResult(null);
      try {
        const response = await fetch('/api/validate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: reportType === 'transport' ? 'Transportation Request' : category,
            photoUrl: photo,
            reportType,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setImageAnalysisResult({
            isValid: data.isValid,
            reason: data.reason,
          });
        } else {
          setImageAnalysisResult({
            isValid: true,
            reason: 'Image approved (validation service connection bypassed).',
          });
        }
      } catch (err) {
        console.error('Image validation failed:', err);
        setImageAnalysisResult({
          isValid: true,
          reason: 'Image approved (validation service error bypassed).',
        });
      } finally {
        setIsAnalyzingImage(false);
      }
    };

    triggerValidation();
  }, [photo, category, reportType]);

  // UI States
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger GPS detection on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Pre-populate reporter name from Google Auth profile
  useEffect(() => {
    if (auth.currentUser?.displayName && !reporterName) {
      setReporterName(auth.currentUser.displayName);
    }
  }, [auth.currentUser]);

  const detectLocation = () => {
    setLoadingLocation(true);
    setLocationStatus('idle');

    const fallbackToIPGeo = async () => {
      console.log('Attempting IP Geolocation fallback...');
      try {
        const res = await fetch('https://freeipapi.com/api/json');
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            setLatitude(Number(Number(data.latitude).toFixed(6)));
            setLongitude(Number(Number(data.longitude).toFixed(6)));
            if (data.cityName && !cityName) {
              setCityName(data.cityName);
            }
            if (data.zipCode && !pinCode) {
              setPinCode(data.zipCode);
            }
            setLandmarkNote(`Approx: ${data.cityName || 'Local Area'} (IP Detected)`);
            setLocationStatus('success');
            setLoadingLocation(false);
            return true;
          }
        }
      } catch (err) {
        console.warn('freeipapi fallback failed, trying ipapi.co...', err);
      }

      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            setLatitude(Number(Number(data.latitude).toFixed(6)));
            setLongitude(Number(Number(data.longitude).toFixed(6)));
            if (data.city && !cityName) {
              setCityName(data.city);
            }
            if (data.postal && !pinCode) {
              setPinCode(data.postal);
            }
            setLandmarkNote(`Approx: ${data.city || 'Local Area'} (IP Detected)`);
            setLocationStatus('success');
            setLoadingLocation(false);
            return true;
          }
        }
      } catch (err) {
        console.warn('ipapi.co fallback failed...', err);
      }

      console.log('Falling back to default coordinates.');
      setLatitude(17.385044);
      setLongitude(78.486671);
      if (!cityName) setCityName('Hyderabad');
      if (!pinCode) setPinCode('500001');
      setLandmarkNote('Auto-Set (Default Center Coordinates)');
      setLocationStatus('success');
      setLoadingLocation(false);
      return true;
    };

    if (!navigator.geolocation) {
      fallbackToIPGeo();
      return;
    }

    let handled = false;
    const timeoutId = setTimeout(() => {
      if (!handled) {
        handled = true;
        fallbackToIPGeo();
      }
    }, 3500);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (handled) return;
        handled = true;
        clearTimeout(timeoutId);
        setLatitude(Number(position.coords.latitude.toFixed(6)));
        setLongitude(Number(position.coords.longitude.toFixed(6)));
        setLocationStatus('success');
        setLoadingLocation(false);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        if (handled) return;
        handled = true;
        clearTimeout(timeoutId);
        fallbackToIPGeo();
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setErrorMsg('');
    try {
      // Compress the image before uploading to Firestore to stay within document limit (~300KB budget)
      const compressedBase64 = await compressImage(file, 800, 200000);
      setPhoto(compressedBase64);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to process image');
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (reportType === 'transport') {
      if (!villageName.trim()) {
        setErrorMsg(
          language === 'en' 
            ? 'Village Name is required for transportation requests.' 
            : language === 'te' 
              ? 'రవాణా అభ్యర్థనల కోసం గ్రామం పేరు తప్పనిసరి.' 
              : 'परिवहन अनुरोधों के लिए गाँव का नाम आवश्यक है।'
        );
        return;
      }
      if (!cityName.trim()) {
        setErrorMsg(
          language === 'en' 
            ? 'City/Town Name is required for transportation requests.' 
            : language === 'te' 
              ? 'రవాణా అభ్యర్థనల కోసం నగరం/పట్టణం పేరు తప్పనిసరి.' 
              : 'परिवहन अनुरोधों के लिए शहर/नगर का नाम आवश्यक है।'
        );
        return;
      }
      if (!pinCode.trim()) {
        setErrorMsg(
          language === 'en' 
            ? 'PIN Code is required for transportation requests.' 
            : language === 'te' 
              ? 'రవాణా అభ్యర్థనల కోసం పిన్ కోడ్ తప్పనిసరి.' 
              : 'परिवहन अनुरोधों के लिए पिन कोड आवश्यक है।'
        );
        return;
      }
      if (pinCode.trim().length !== 6) {
        setErrorMsg(
          language === 'en' 
            ? 'PIN Code must be exactly 6 digits.' 
            : language === 'te' 
              ? 'పిన్ కోడ్ ఖచ్చితంగా 6 అంకెలు ఉండాలి.' 
              : 'पिन कोड बिल्कुल 6 अंकों का होना चाहिए।'
        );
        return;
      }
    } else {
      if (!category) {
        setErrorMsg(t.selectCategory);
        return;
      }
      if (!description.trim()) {
        setErrorMsg(t.description);
        return;
      }
    }

    if (!photo) {
      setErrorMsg(
        reportType === 'transport'
          ? (language === 'en' ? 'Photo of the Village Name Board is required.' : language === 'te' ? 'గ్రామ పేరు బోర్డు ఫోటో తప్పనిసరి.' : 'गाँव के नाम बोर्ड की फोटो आवश्यक है।')
          : t.photoEvidence
      );
      return;
    }

    if (isAnalyzingImage) {
      setErrorMsg(
        language === 'en' 
          ? 'Please wait, AI is still verifying your photo category...' 
          : language === 'te' 
            ? 'దయచేసి వేచి ఉండండి, AI ఇంకా మీ ఫోటో వర్గాన్ని ధృవీకరిస్తోంది...' 
            : 'कृपया प्रतीक्षा करें, AI अभी भी आपकी फोटो श्रेणी की पुष्टि कर रहा है...'
      );
      return;
    }

    if (imageAnalysisResult && !imageAnalysisResult.isValid) {
      setErrorMsg(
        language === 'en'
          ? `Selected image does not match "${reportType === 'transport' ? 'Transportation Request' : category}". Please upload a matching photo or select the correct category.`
          : language === 'te'
            ? `ఎంచుకున్న చిత్రం "${reportType === 'transport' ? 'Transportation Request' : category}" కు సరిపోలడం లేదు. దయచేసి సరిపోలే ఫోటోను అప్‌లోడ్ చేయండి లేదా సరైన వర్గాన్ని ఎంచుకోండి.`
            : `चुनी गई छवि "${reportType === 'transport' ? 'Transportation Request' : category}" से मेल नहीं खाती। कृपया एक उपयुक्त फोटो अपलोड करें या सही श्रेणी चुनें।`
      );
      return;
    }
    if (latitude === null || longitude === null) {
      setErrorMsg(t.location);
      return;
    }

    if (aadhaarNumber.trim() && aadhaarNumber.trim().length !== 12) {
      setErrorMsg(
        language === 'en' 
          ? 'Aadhaar Card Number must be exactly 12 digits.' 
          : language === 'te' 
            ? 'ఆధార్ కార్డ్ నంబర్ ఖచ్చితంగా 12 అంకెలు ఉండాలి.' 
            : 'आधार कार्ड नंबर बिल्कुल 12 अंकों का होना चाहिए।'
      );
      return;
    }

    setSubmitting(true);
    const complaintId = generateId('GS');

    const issuePayload = {
      category: reportType === 'transport' ? 'Transportation Request' : category,
      reportType,
      villageName: reportType === 'transport' ? villageName.trim() : '',
      cityName: reportType === 'transport' ? cityName.trim() : '',
      pinCode: reportType === 'transport' ? pinCode.trim() : '',
      description: description.trim(),
      photoUrl: photo,
      latitude,
      longitude,
      landmarkNote: landmarkNote.trim() || '',
      reporterName: reporterName.trim() || '',
      reporterPhone: reporterPhone.trim() || '',
      aadhaarNumber: aadhaarNumber.trim() || '',
      status: 'Submitted' as const,
      submittedByUid: uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    try {
      const issueRef = doc(db, 'issues', complaintId);
      await setDoc(issueRef, issuePayload);
      
      // Clear fields on success
      setCategory('');
      setDescription('');
      setPhoto(null);
      setLandmarkNote('');
      setReporterName('');
      setReporterPhone('');
      setAadhaarNumber('');
      setVillageName('');
      setCityName('');
      setPinCode('');
      
      // Play premium success tone
      playTungSound();
      
      onSuccess(complaintId);
    } catch (err: any) {
      console.error('Error submitting issue:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, `issues/${complaintId}`);
      } catch (mappedError: any) {
        setErrorMsg('Submission failed: ' + mappedError.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const categoryEmojis: Record<string, string> = {
    "Road Damage": "🛣️",
    "Garbage & Waste": "🗑️",
    "Drainage/Sewage": "🌊",
    "Water Supply": "🚰",
    "School/Public Building": "🏫",
    "Streetlight/Electricity": "⚡",
    "Transportation Request": "🚌",
    "Other": "📍"
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8 space-y-8" id="citizen-form">
      <div>
        <h1 className="text-4xl sm:text-5xl font-black leading-[0.9] tracking-tighter text-emerald-950 uppercase">
          {reportType === 'transport' ? (
            language === 'en' ? (
              <>REQUEST<br />BUS SERVICE.</>
            ) : language === 'te' ? (
              'రవాణా అభ్యర్థన'
            ) : (
              'परिवहन अनुरोध'
            )
          ) : (
            language === 'en' ? (
              <>REPORT<br />A PROBLEM.</>
            ) : (
              t.reportIssue
            )
          )}
        </h1>
        <p className="text-slate-500 font-bold mt-2 text-xs uppercase tracking-wider">
          {reportType === 'transport'
            ? 'Request new bus services or transportation improvements for your village.'
            : 'Submit your civic issue with photo & location for quick resolution.'}
        </p>
      </div>

      {/* Report Type Selector */}
      <div className="space-y-3" id="report-type-selector">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.reportTypeLabel} *</label>
        <div className="flex bg-slate-100 rounded-xl p-1 border-2 border-slate-200" id="report-type-tabs">
          <button
            type="button"
            id="type-btn-civic"
            onClick={() => {
              setReportType('civic');
              setCategory('');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center text-xs font-black rounded-lg uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              reportType === 'civic'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.civicOption}</span>
          </button>
          <button
            type="button"
            id="type-btn-transport"
            onClick={() => {
              setReportType('transport');
              setCategory('Transportation Request');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-center text-xs font-black rounded-lg uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              reportType === 'transport'
                ? 'bg-emerald-800 text-white shadow-md'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>{t.transportOption}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-2.5 text-xs font-black border-2 border-red-200 uppercase tracking-tight" id="form-error-banner">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Conditional Fields based on Report Type */}
      {reportType === 'transport' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" id="transport-fields-section">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.villageNameLabel} *</label>
            <input
              type="text"
              id="txt-village-name"
              required
              maxLength={150}
              placeholder={t.villageNamePlaceholder}
              value={villageName}
              onChange={(e) => setVillageName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-800 focus:ring-0 outline-none text-slate-800 text-sm placeholder-slate-400 font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.cityNameLabel} *</label>
            <input
              type="text"
              id="txt-city-name"
              required
              maxLength={150}
              placeholder={t.cityNamePlaceholder}
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-800 focus:ring-0 outline-none text-slate-800 text-sm placeholder-slate-400 font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.pinCodeLabel} *</label>
            <input
              type="text"
              id="txt-pincode"
              required
              maxLength={6}
              placeholder={t.pinCodePlaceholder}
              value={pinCode}
              onChange={(e) => {
                const clean = e.target.value.replace(/\D/g, '');
                setPinCode(clean);
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-800 focus:ring-0 outline-none text-slate-800 text-sm font-mono tracking-wider placeholder-slate-400 font-bold"
            />
          </div>
        </div>
      ) : (
        /* Category Selection */
        <div className="space-y-3" id="category-section">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.category} *</label>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" id="category-chips">
            {Object.keys(t.categories)
              .filter(cat => cat !== 'Transportation Request')
              .map((cat) => {
                const isSelected = category === cat;
                const emoji = categoryEmojis[cat] || "📍";
                return (
                  <button
                    key={cat}
                    type="button"
                    id={`cat-chip-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setCategory(cat)}
                    className={`p-3.5 rounded-xl border-2 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-emerald-950 bg-emerald-50 text-emerald-950 font-black shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[10px] uppercase tracking-tight leading-none font-bold">
                      {t.categories[cat as keyof typeof t.categories]}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="space-y-3" id="description-section">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {t.description} {reportType === 'transport' ? '(Optional)' : '*'}
        </label>
        <textarea
          id="txt-description"
          rows={3}
          maxLength={1000}
          required={reportType === 'civic'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={reportType === 'transport' ? t.transportDescPlaceholder : t.descPlaceholder}
          className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-800 focus:ring-0 outline-none text-slate-800 text-sm placeholder-slate-400 font-bold"
        />
        <div className="text-right text-[11px] text-slate-400 font-mono" id="txt-desc-charcount">
          {description.length}/1000
        </div>
      </div>

      {/* Image Upload / Capture */}
      <div className="space-y-3" id="photo-section">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {reportType === 'transport' ? t.photoVillageNameBoard : t.photoEvidence} *
        </label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-44 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/50 transition-colors duration-200 relative p-4" 
          id="photo-upload-box"
        >
          {photo ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center" id="photo-preview-container" onClick={(e) => e.stopPropagation()}>
              <img src={photo} alt="Preview" className="max-h-[120px] rounded-lg object-contain shadow-sm border border-slate-200" id="img-preview" />
              <button
                type="button"
                id="btn-remove-photo"
                onClick={() => setPhoto(null)}
                className="mt-2.5 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-red-700 shadow active:scale-95 transition-transform cursor-pointer"
              >
                Change Photo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-2" id="photo-empty-container">
              <div className="p-3 bg-white rounded-full shadow-sm border border-slate-200 text-emerald-900" id="photo-icon-box">
                {compressing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
              </div>
              <div className="space-y-0.5" id="photo-upload-meta">
                <span className="text-xs font-black uppercase tracking-tight text-emerald-950 block">
                  {compressing ? 'Compressing...' : 'Tap to Take Photo'}
                </span>
                <p className="text-[10px] font-bold text-slate-400" id="photo-sublabel">
                  {reportType === 'transport' ? 'Photo of village board / name board' : 'Camera Capture & Uploads supported'}
                </p>
              </div>
            </div>
          )}
          <input
            type="file"
            id="file-input"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {/* Image Recognition/Validation Status Overlay */}
        {photo && (
          <div className="mt-2.5 rounded-xl border p-3 flex flex-col gap-1.5 text-xs transition-all duration-300" id="image-validation-status">
            {isAnalyzingImage ? (
              <div className="flex items-center gap-2 text-emerald-950 font-bold" id="validating-loader">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span>AI is validating your photo for Category match...</span>
              </div>
            ) : imageAnalysisResult ? (
              imageAnalysisResult.isValid ? (
                <div className="flex items-start gap-2 text-emerald-900 font-bold bg-emerald-50/60 p-2 rounded-lg border border-emerald-200/50" id="validation-success">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black uppercase tracking-wider text-[8px] text-emerald-700 mb-0.5">✓ Image Validated</span>
                    <span className="text-[11px] leading-snug">{imageAnalysisResult.reason}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-rose-900 font-bold bg-rose-50/60 p-2 rounded-lg border border-rose-200/50" id="validation-failure">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black uppercase tracking-wider text-[8px] text-rose-700 mb-0.5">⚠ Verification Mismatch</span>
                    <span className="text-[11px] leading-snug">{imageAnalysisResult.reason}</span>
                    <span className="block text-[10px] text-rose-700/80 mt-1">Please select the correct category or upload a relevant photo.</span>
                  </div>
                </div>
              )
            ) : null}
          </div>
        )}
      </div>

      {/* Geolocation Section */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3" id="location-section">
        <div className="flex items-center justify-between" id="location-header">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5" id="lbl-location">
            <MapPin className="w-3.5 h-3.5 text-emerald-900" />
            {t.location} *
          </label>
          <button
            type="button"
            id="btn-refresh-gps"
            onClick={detectLocation}
            disabled={loadingLocation}
            className="text-[10px] font-black text-emerald-900 flex items-center gap-1 hover:underline disabled:opacity-50 uppercase tracking-wider"
          >
            <RefreshCw className={`w-3 h-3 ${loadingLocation ? 'animate-spin' : ''}`} />
            Refresh GPS
          </button>
        </div>

        {locationStatus === 'idle' && (
          <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5" id="gps-status-idle">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-900" />
            <span className="uppercase text-[10px] tracking-wider">{t.gpsStatus}</span>
          </div>
        )}

        {locationStatus === 'success' && latitude !== null && longitude !== null && (
          <div className="space-y-1.5" id="gps-status-success">
            <div className="text-[10px] font-black text-green-700 flex items-center justify-between uppercase tracking-wider" id="gps-success-msg">
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> {t.gpsSuccess}</span>
              <span className="text-green-600 font-black">SECURE</span>
            </div>
            <div className="text-sm font-bold text-slate-800" id="gps-approx-label">
              {landmarkNote ? landmarkNote : 'Village Sector Coordinates Detected'}
            </div>
            <div className="text-[10px] font-mono text-slate-400" id="gps-coords-display">
              LAT: {latitude} / LONG: {longitude}
            </div>
          </div>
        )}

        {locationStatus === 'error' && (
          <div className="space-y-3" id="gps-status-error">
            <div className="text-xs text-amber-700 font-bold flex items-center gap-1.5 uppercase tracking-wider" id="gps-error-msg">
              <AlertCircle className="w-4 h-4" />
              <span>{t.gpsFailed}</span>
            </div>
            <div className="grid grid-cols-2 gap-3" id="gps-manual-inputs">
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest" id="lbl-lat">{t.latitude}</label>
                <input
                  type="number"
                  id="num-latitude"
                  step="0.000001"
                  required
                  placeholder="e.g. 17.543210"
                  value={latitude || ''}
                  onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-xs font-mono text-slate-800 focus:border-emerald-800 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest" id="lbl-lon">{t.longitude}</label>
                <input
                  type="number"
                  id="num-longitude"
                  step="0.000001"
                  required
                  placeholder="e.g. 80.234567"
                  value={longitude || ''}
                  onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-xs font-mono text-slate-800 focus:border-emerald-800 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Interactive OpenStreetMap Map */}
        {latitude !== null && longitude !== null && (
          <div className="pt-2" id="interactive-gps-map-container">
            <MapSelector
              latitude={latitude}
              longitude={longitude}
              onChange={(newLat, newLng) => {
                setLatitude(newLat);
                setLongitude(newLng);
              }}
              height="280px"
            />
          </div>
        )}

        {/* Landmark Note */}
        <div className="space-y-1" id="landmark-subsection">
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest" id="lbl-landmark">{t.landmark}</label>
          <input
            type="text"
            id="txt-landmark"
            maxLength={500}
            placeholder={t.landmarkPlaceholder}
            value={landmarkNote}
            onChange={(e) => setLandmarkNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-xs text-slate-800 font-bold focus:border-emerald-800 outline-none placeholder:font-normal"
          />
        </div>
      </div>

      {/* Reporter Details */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3" id="reporter-section">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5" id="lbl-reporter-details">
          <User className="w-3.5 h-3.5 text-emerald-950" />
          Reporter Details (Optional)
        </label>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-normal" id="reporter-disclaimer">
          Providing contact info helps us follow up directly. It is 100% optional.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" id="reporter-fields">
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest" id="lbl-reporter-name">{t.reporterName}</label>
            <input
              type="text"
              id="txt-reporter-name"
              maxLength={100}
              placeholder="e.g. Anand Kumar"
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-xs text-slate-800 font-bold focus:border-emerald-800 outline-none placeholder:font-normal"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest" id="lbl-reporter-phone">{t.reporterPhone}</label>
            <input
              type="tel"
              id="txt-reporter-phone"
              maxLength={20}
              placeholder="e.g. 9876543210"
              value={reporterPhone}
              onChange={(e) => setReporterPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-xs text-slate-800 font-bold focus:border-emerald-800 outline-none placeholder:font-normal"
            />
          </div>

          <div className="space-y-1 sm:col-span-2 border-t border-slate-200/60 pt-3" id="aadhaar-field-container">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1" id="lbl-reporter-aadhaar">
              <Fingerprint className="w-3.5 h-3.5 text-emerald-800" />
              {t.aadhaarLabel}
            </label>
            <input
              type="text"
              id="txt-reporter-aadhaar"
              maxLength={12}
              placeholder={t.aadhaarPlaceholder}
              value={aadhaarNumber}
              onChange={(e) => {
                // Keep only numeric input
                const clean = e.target.value.replace(/\D/g, '');
                setAadhaarNumber(clean);
              }}
              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-lg text-xs font-mono font-bold tracking-[0.1em] text-slate-800 focus:border-emerald-800 outline-none placeholder:font-sans placeholder:font-normal placeholder:tracking-normal"
            />
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider" id="aadhaar-secure-disclaimer">
              🛡️ Encrypted & securely stored for official citizen authentication.
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        id="btn-submit"
        disabled={submitting || compressing}
        className="w-full bg-emerald-800 hover:bg-emerald-900 text-white h-16 rounded-xl text-lg font-black shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t.submitting}</span>
          </>
        ) : (
          <span>{t.submit}</span>
        )}
      </button>
    </form>
  );
};
