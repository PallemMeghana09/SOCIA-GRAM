import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ZoomIn, ZoomOut, Search } from 'lucide-react';

interface MapSelectorProps {
  latitude: number | null;
  longitude: number | null;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  height?: string;
}

export function MapSelector({
  latitude,
  longitude,
  onChange,
  readOnly = false,
  height = '320px',
}: MapSelectorProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Default coordinates (Hyderabad, India center or provided coords)
  const defaultLat = 17.385044;
  const defaultLng = 78.486671;

  const currentLat = latitude || defaultLat;
  const currentLng = longitude || defaultLng;

  // Set up the Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Initialize the map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false, // We'll add custom styled zoom controls
      attributionControl: false,
    }).setView([currentLat, currentLng], latitude ? 15 : 12);

    mapRef.current = map;

    // Add high quality modern OSM tiles (CartoDB Positron is extremely clean and matches modern designs)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Custom modern green Pin using divIcon
    const pinHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-10 h-10 bg-emerald-500/25 rounded-full animate-ping"></div>
        <div class="relative w-7 h-7 bg-emerald-800 rounded-full border-2 border-white flex items-center justify-center shadow-md">
          <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: pinHtml,
      className: 'custom-leaflet-marker-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    // Create marker
    const marker = L.marker([currentLat, currentLng], {
      icon: customIcon,
      draggable: !readOnly,
    }).addTo(map);

    markerRef.current = marker;

    // Listen to marker drag events (update coordinates)
    if (!readOnly && onChange) {
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        // Keep 6 decimal places for exact accurate GPS coordinates
        onChange(Number(position.lat.toFixed(6)), Number(position.lng.toFixed(6)));
      });

      // Listen to map click events (reposition marker and update coordinates)
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
      });
    }

    // Handle map container resizing
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [readOnly]); // Run once on mount

  // Watch for external coordinate updates (e.g. from Auto GPS or changing coordinates)
  useEffect(() => {
    if (mapRef.current && markerRef.current && latitude !== null && longitude !== null) {
      const currentMarkerLatLng = markerRef.current.getLatLng();
      if (
        Math.abs(currentMarkerLatLng.lat - latitude) > 0.00001 ||
        Math.abs(currentMarkerLatLng.lng - longitude) > 0.00001
      ) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapRef.current.setView([latitude, longitude], 15);
      }
    }
  }, [latitude, longitude]);

  // Handle Location Search
  const handleSearch = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      // Use Nominatim OpenStreetMap Search API (Free, fast, no API key required)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en,te,hi',
          'User-Agent': 'SociaGram-Citizen-Portal',
        },
      });

      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data && data.length > 0) {
        const foundLat = Number(Number(data[0].lat).toFixed(6));
        const foundLng = Number(Number(data[0].lon).toFixed(6));

        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([foundLat, foundLng]);
          mapRef.current.setView([foundLat, foundLng], 15);
        }

        if (onChange) {
          onChange(foundLat, foundLng);
        }
      } else {
        setSearchError('Location not found. Try entering a nearby landmark, village, or pincode.');
      }
    } catch (err) {
      console.error('Map search error:', err);
      setSearchError('Search unavailable. Please click/drag directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  // Custom zoom helpers
  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-2 border-slate-200/90 shadow-inner bg-slate-50" id="map-selector-component">
      {/* Search Bar - only visible when not read-only */}
      {!readOnly && (
        <div className="absolute top-3 left-3 right-3 z-[1000] flex gap-2" id="map-search-form">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search village, city, landmark or pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch(e);
                }
              }}
              className="w-full pl-9 pr-3 py-2 bg-white/95 backdrop-blur-sm rounded-xl border border-slate-300 shadow-md text-xs font-bold text-slate-800 outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/50 placeholder:font-normal"
              id="map-search-input"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSearch(e);
            }}
            disabled={isSearching}
            className="px-3 bg-emerald-850 hover:bg-emerald-900 active:scale-95 text-white rounded-xl shadow-md font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
            id="map-search-submit-btn"
          >
            {isSearching ? 'Searching...' : 'Find'}
          </button>
        </div>
      )}

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full z-10"
        id="leaflet-map-canvas"
      />

      {/* Custom Map Controls Overlay (Zoom, Center) */}
      <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1.5" id="map-custom-controls">
        <button
          type="button"
          onClick={zoomIn}
          className="p-2.5 bg-white/95 hover:bg-slate-50 active:scale-95 rounded-xl shadow-md border border-slate-200 text-slate-700 cursor-pointer flex items-center justify-center"
          title="Zoom In"
          id="btn-zoom-in"
        >
          <ZoomIn className="w-4 h-4 stroke-[2.5]" />
        </button>
        <button
          type="button"
          onClick={zoomOut}
          className="p-2.5 bg-white/95 hover:bg-slate-50 active:scale-95 rounded-xl shadow-md border border-slate-200 text-slate-700 cursor-pointer flex items-center justify-center"
          title="Zoom Out"
          id="btn-zoom-out"
        >
          <ZoomOut className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Helpful drag indicator for manual placement (only if interactive) */}
      {!readOnly && (
        <div className="absolute bottom-3 left-3 z-[1000] px-2.5 py-1.5 bg-slate-900/85 backdrop-blur-sm rounded-lg text-[10px] text-white font-bold flex items-center gap-1.5 shadow-md pointer-events-none" id="drag-indicator-box">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Click anywhere or drag pin to adjust coordinates precisely</span>
        </div>
      )}

      {/* Search Error Indicator */}
      {searchError && (
        <div className="absolute top-15 left-3 right-3 z-[1000] px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 font-bold shadow-md" id="search-error-message">
          {searchError}
        </div>
      )}
    </div>
  );
}
