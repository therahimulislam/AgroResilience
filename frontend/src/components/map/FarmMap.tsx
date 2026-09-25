import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Map as MLMap, NavigationControl, ScaleControl,
  GeoJSONSource, MapMouseEvent, GeolocateControl, Marker,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface FarmMapProps {
  onPolygonDrawn: (geojson: string | null, areaEstimate: number, lat?: number, lng?: number) => void;
}

/* ── Map styles ─────────────────────────────────────────────────── */
const MAP_STYLES = {
  map: {
    label: '🗺 Map',
    style: {
      version: 8 as const,
      sources: {
        osm: {
          type: 'raster' as const,
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
    },
  },
  satellite: {
    label: '🛰 Satellite',
    style: {
      version: 8 as const,
      sources: {
        esri: {
          type: 'raster' as const,
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        },
      },
      layers: [{ id: 'esri', type: 'raster' as const, source: 'esri' }],
    },
  },
};

type MapMode = 'map' | 'satellite';

/* ── Geometry helpers ───────────────────────────────────────────── */
function toRad(d: number) { return (d * Math.PI) / 180; }
function polygonAreaM2(ring: [number, number][]): number {
  const R = 6371000; let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lo1, la1] = ring[i], [lo2, la2] = ring[i + 1];
    area += toRad(lo2 - lo1) * (2 + Math.sin(toRad(la1)) + Math.sin(toRad(la2)));
  }
  return Math.abs((area * R * R) / 2);
}
function centroid(pts: [number, number][]): [number, number] {
  const n = pts.length;
  return [pts.reduce((s, p) => s + p[0], 0) / n, pts.reduce((s, p) => s + p[1], 0) / n];
}

/* ── Numbered vertex marker DOM element ─────────────────────────── */
function makeMarkerEl(n: number, satellite: boolean): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    width: 28px; height: 28px;
    background: ${satellite ? '#facc15' : '#10b981'};
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    color: ${satellite ? '#1a1a1a' : '#fff'};
    font-size: 11px; font-weight: 800;
    font-family: system-ui, sans-serif;
    pointer-events: none; user-select: none;
  `;
  el.textContent = String(n);
  return el;
}

const LINE_SOURCE = 'draw-line';
const FILL_SOURCE = 'draw-fill';

/* ── Component ──────────────────────────────────────────────────── */
export default function FarmMap({ onPolygonDrawn }: FarmMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<MLMap | null>(null);
  const ptsRef       = useRef<[number, number][]>([]);
  const markersRef   = useRef<Marker[]>([]);
  const [mapReady, setMapReady]     = useState(false);
  const [drawing, setDrawing]       = useState(false);
  const [ptCount, setPtCount]       = useState(0);
  const [done, setDone]             = useState(false);
  const [mapMode, setMapMode]       = useState<MapMode>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching]     = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSug, setShowSug]         = useState(false);
  const [activeSug, setActiveSug]     = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  /* ── refresh line + fill ────────────────────────────────────── */
  const refreshLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const pts = ptsRef.current;

    const lineFC: any = {
      type: 'FeatureCollection',
      features: pts.length >= 2
        ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [...pts, pts[0]] } }]
        : [],
    };
    (map.getSource(LINE_SOURCE) as GeoJSONSource)?.setData(lineFC);

    const fillFC: any = {
      type: 'FeatureCollection',
      features: pts.length >= 3
        ? [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...pts, pts[0]]] } }]
        : [],
    };
    (map.getSource(FILL_SOURCE) as GeoJSONSource)?.setData(fillFC);
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
  }, []);

  const commitPolygon = useCallback(() => {
    const pts = ptsRef.current;
    if (pts.length < 3) return;
    const ring = [...pts, pts[0]];
    const areaAcres = parseFloat((polygonAreaM2(ring) / 4046.86).toFixed(2));
    const [lng, lat] = centroid(pts);
    onPolygonDrawn(
      JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }] }),
      areaAcres, lat, lng
    );
  }, [onPolygonDrawn]);

  const clearAll = useCallback(() => {
    ptsRef.current = [];
    setPtCount(0); setDrawing(false); setDone(false);
    clearMarkers(); refreshLayers(); onPolygonDrawn(null, 0);
  }, [clearMarkers, refreshLayers, onPolygonDrawn]);

  const finishDrawing = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.getCanvas().style.cursor = '';
    setDrawing(false); setDone(true);
    refreshLayers(); commitPolygon();
  }, [refreshLayers, commitPolygon]);

  /* ── switch map mode ─────────────────────────────────────────── */
  const switchMode = useCallback((mode: MapMode) => {
    const map = mapRef.current;
    if (!map) return;
    setMapMode(mode);
    // Set new style, then re-add draw sources/layers on next load
    (map as any).setStyle(MAP_STYLES[mode].style);
    map.once('styledata', () => {
      if (!map.getSource(FILL_SOURCE)) {
        map.addSource(FILL_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addSource(LINE_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        const lineColor = mode === 'satellite' ? '#facc15' : '#047857';
        const fillColor = mode === 'satellite' ? '#facc15' : '#10b981';
        map.addLayer({ id: 'fill-layer', type: 'fill', source: FILL_SOURCE,
          paint: { 'fill-color': fillColor, 'fill-opacity': 0.25 } });
        map.addLayer({ id: 'line-layer', type: 'line', source: LINE_SOURCE,
          paint: { 'line-color': lineColor, 'line-width': 2.5, 'line-dasharray': [4, 2] } });
      }
      // Rehydrate existing geometry
      refreshLayers();
    });
  }, [refreshLayers]);

  /* ── init map ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MLMap({
      container: containerRef.current,
      style: MAP_STYLES.map.style,
      center: [78.9629, 20.5937],   // Centre of India
      zoom: 5,
    });

    map.addControl(new NavigationControl(), 'bottom-right');
    map.addControl(new ScaleControl());
    map.addControl(
      new GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
      'bottom-right'
    );

    map.on('load', () => {
      map.addSource(FILL_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addSource(LINE_SOURCE, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({ id: 'fill-layer', type: 'fill', source: FILL_SOURCE,
        paint: { 'fill-color': '#10b981', 'fill-opacity': 0.28 } });
      map.addLayer({ id: 'line-layer', type: 'line', source: LINE_SOURCE,
        paint: { 'line-color': '#047857', 'line-width': 2.5, 'line-dasharray': [4, 2] } });
      setMapReady(true);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  /* ── click/dblclick while drawing ───────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    if (!drawing) { map.getCanvas().style.cursor = ''; return; }
    map.getCanvas().style.cursor = 'crosshair';

    const onClick = (e: MapMouseEvent) => {
      if ((e.originalEvent as any)._processed) return;
      const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      ptsRef.current = [...ptsRef.current, pt];
      const idx = ptsRef.current.length;
      setPtCount(idx);
      const marker = new Marker({ element: makeMarkerEl(idx, mapMode === 'satellite'), anchor: 'center' })
        .setLngLat(pt).addTo(map);
      markersRef.current.push(marker);
      refreshLayers();
    };

    const onDblClick = (e: MapMouseEvent) => {
      e.preventDefault();
      (e.originalEvent as any)._processed = true;
      if (ptsRef.current.length >= 3) finishDrawing();
    };

    map.on('click', onClick);
    map.on('dblclick', onDblClick);
    return () => { map.off('click', onClick); map.off('dblclick', onDblClick); };
  }, [drawing, mapReady, mapMode, refreshLayers, finishDrawing]);

  /* ── search ─────────────────────────────────────────────────── */
  /* ── Debounced autocomplete ─────────────────────────────────── */
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim() || q.length < 2) { setSuggestions([]); setShowSug(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&countrycodes=in`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data || []);
        setShowSug(true);
        setActiveSug(-1);
      } catch { /* silent */ }
    }, 300);
  }, []);

  const selectSuggestion = useCallback((item: any) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [parseFloat(item.lon), parseFloat(item.lat)], zoom: 14, duration: 1200 });
    setSearchQuery(item.display_name.split(',').slice(0, 2).join(','));
    setSuggestions([]);
    setShowSug(false);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSug(false);
    if (!searchQuery.trim() || !mapRef.current) return;
    setSearching(true);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=in`);
      const data = await res.json();
      if (data?.[0]) mapRef.current.flyTo({ center: [parseFloat(data[0].lon), parseFloat(data[0].lat)], zoom: 14, duration: 1500 });
      else alert('Location not found.');
    } catch { alert('Search failed.'); }
    finally { setSearching(false); }
  };

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowSug(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isSat = mapMode === 'satellite';

  return (
    <div className="w-full h-full flex flex-col" style={{ minHeight: '500px' }}>

      {/* Top bar: Search + Map/Satellite toggle */}
      <div className="bg-white px-3 py-2 border-b border-gray-200 flex-shrink-0 flex items-center gap-2">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1" autoComplete="off">
          <div className="relative flex-1" ref={searchBoxRef}>
            {/* Search icon */}
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>

            <input
              type="text"
              placeholder="Search location (e.g. Guwahati, Assam)..."
              value={searchQuery}
              autoComplete="off"
              onChange={e => { setSearchQuery(e.target.value); fetchSuggestions(e.target.value); }}
              onFocus={() => suggestions.length > 0 && setShowSug(true)}
              onKeyDown={e => {
                if (!showSug) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); setActiveSug(i => Math.min(i + 1, suggestions.length - 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveSug(i => Math.max(i - 1, -1)); }
                else if (e.key === 'Enter' && activeSug >= 0) { e.preventDefault(); selectSuggestion(suggestions[activeSug]); }
                else if (e.key === 'Escape') setShowSug(false);
              }}
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />

            {/* Clear button */}
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSug(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors z-10">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}

            {/* Autocomplete dropdown */}
            {showSug && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {/* Header */}
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <span className="text-xs text-gray-400 font-medium">Search results</span>
                  <span className="ml-auto text-xs text-gray-300">{suggestions.length} found</span>
                </div>

                {suggestions.map((s, i) => {
                  const parts = s.display_name.split(',');
                  const main  = parts.slice(0, 2).join(',').trim();
                  const sub   = parts.slice(2, 5).join(',').trim();
                  const typeIcon: Record<string, string> = {
                    city: '🏙️', town: '🏘️', village: '🏡', suburb: '🏙️',
                    state: '🗺️', country: '🌍', administrative: '📍',
                    farm: '🌾', residential: '🏠',
                  };
                  const icon = typeIcon[s.type] || typeIcon[s.class] || '📍';

                  return (
                    <button key={s.place_id} type="button"
                      onMouseDown={() => selectSuggestion(s)}
                      onMouseEnter={() => setActiveSug(i)}
                      className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors border-b border-gray-50 last:border-0 ${
                        activeSug === i ? 'bg-emerald-50' : 'hover:bg-gray-50'
                      }`}>
                      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-800 truncate">{main}</div>
                        {sub && <div className="text-xs text-gray-400 truncate mt-0.5">{sub}</div>}
                      </div>
                      {activeSug === i && (
                        <svg className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="m9 18 6-6-6-6"/>
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" disabled={searching || !mapReady}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex-shrink-0">
            {searching
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : 'Go'
            }
          </button>
        </form>

        {/* Map / Satellite toggle */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
          {(['map', 'satellite'] as MapMode[]).map(mode => (
            <button key={mode} disabled={!mapReady}
              onClick={() => switchMode(mode)}
              className={`px-3 py-2 text-xs font-semibold transition-all ${
                mapMode === mode
                  ? mode === 'satellite' ? 'bg-slate-800 text-yellow-300' : 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {MAP_STYLES[mode].label}
            </button>
          ))}
        </div>
      </div>

      {/* Draw toolbar */}
      <div className={`border-b px-3 py-2 flex items-center gap-2 flex-shrink-0 flex-wrap transition-colors ${
        isSat ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        {!drawing && !done && (
          <button disabled={!mapReady}
            onClick={() => { clearAll(); setDrawing(true); }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 ${
              isSat
                ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 17L7 3l10 4 4 10-9 4-9-4z"/>
            </svg>
            Draw Farm Boundary
          </button>
        )}

        {drawing && (
          <>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${
              isSat ? 'bg-slate-800 border-yellow-500 text-yellow-300' : 'bg-emerald-50 border-emerald-300 text-emerald-700'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse block ${isSat ? 'bg-yellow-400' : 'bg-emerald-500'}`} />
              Drawing… {ptCount} point{ptCount !== 1 ? 's' : ''}
            </div>
            {ptCount >= 3 && (
              <button onClick={finishDrawing}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm ${
                  isSat ? 'bg-yellow-400 text-slate-900 hover:bg-yellow-300' : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}>
                ✓ Finish Polygon
              </button>
            )}
            <button onClick={clearAll}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isSat ? 'bg-slate-700 text-gray-300 hover:bg-red-900 hover:text-red-300 border border-slate-600' : 'bg-white border border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
              }`}>
              ✕ Cancel
            </button>
          </>
        )}

        {done && (
          <>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border ${
              isSat ? 'bg-slate-800 border-yellow-500 text-yellow-300' : 'bg-teal-50 border-teal-300 text-teal-700'
            }`}>
              ✓ {ptCount} points · Polygon set
            </div>
            <button onClick={() => { clearAll(); setDrawing(true); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isSat ? 'bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600' : 'bg-white border border-gray-300 text-gray-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'
              }`}>
              ✎ Redraw
            </button>
          </>
        )}
      </div>

      {/* Hint bar */}
      <div className={`px-4 py-1.5 flex-shrink-0 text-xs font-medium border-b ${
        isSat
          ? drawing ? 'bg-slate-900 text-yellow-400 border-slate-700'
            : done   ? 'bg-slate-900 text-green-400 border-slate-700'
            :          'bg-slate-900 text-slate-400 border-slate-700'
          : drawing ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
            : done   ? 'bg-teal-50 text-teal-700 border-teal-100'
            :          'bg-amber-50 text-amber-700 border-amber-100'
      }`}>
        {drawing
          ? '🖱️ Click on the map to place boundary points. Double-click or "Finish Polygon" to complete.'
          : done
          ? '✅ Boundary saved. Fill the form on the left and click "Save Farm".'
          : '👆 Click "Draw Farm Boundary", then click around your farm on the map.'}
      </div>

      {/* Map canvas */}
      <div ref={containerRef} className="flex-1" style={{ minHeight: '400px', width: '100%' }} />
    </div>
  );
}
