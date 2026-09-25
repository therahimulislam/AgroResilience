import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FarmMap from '../components/map/FarmMap';
import { createFarm } from '../services/farms';
import {
  Leaf, MapPin, Sprout, Droplets, Calendar,
  CheckCircle, AlertCircle, Info, ChevronLeft, Wheat, Map,
} from 'lucide-react';

const CROPS = [
  { name: 'Rice', emoji: '🌾' },
  { name: 'Wheat', emoji: '🌿' },
  { name: 'Maize', emoji: '🌽' },
  { name: 'Cotton', emoji: '☁️' },
  { name: 'Sugarcane', emoji: '🎋' },
  { name: 'Pulses', emoji: '🫘' },
  { name: 'Vegetables', emoji: '🥬' },
];

const SEASONS = [
  { name: 'Kharif', desc: 'Jun – Oct' },
  { name: 'Rabi',   desc: 'Nov – Apr' },
  { name: 'Zaid',   desc: 'Mar – Jun' },
];

const IRRIGATIONS = [
  { name: 'Rainfed',   icon: '🌧️' },
  { name: 'Canal',     icon: '🏞️' },
  { name: 'Tube Well', icon: '⛽' },
  { name: 'Drip',      icon: '💧' },
  { name: 'Sprinkler', icon: '🌀' },
];

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha',
  'Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura',
  'Uttar Pradesh','Uttarakhand','West Bengal',
];

function SectionHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
        {n}
      </div>
      <span className="text-sm font-bold text-gray-700 tracking-tight">{title}</span>
    </div>
  );
}

export default function CreateFarmPage() {
  const navigate = useNavigate();
  const [mobileTab, setMobileTab] = useState<'form' | 'map'>('map');
  const [formData, setFormData] = useState({
    name: '', current_crop: 'Rice', season: 'Kharif',
    irrigation_type: 'Rainfed', sowing_date: '', state: 'Assam',
  });
  const [geoData, setGeoData] = useState<{
    geojson: string | null; area: number; lat?: number; lng?: number;
  }>({ geojson: null, area: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePolygonDrawn = (
    geojson: string | null, area: number, lat?: number, lng?: number
  ) => {
    setGeoData({ geojson, area, lat, lng });
    // Auto-switch to form after drawing on mobile
    if (geojson) setMobileTab('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geoData.geojson) { setError('Draw your farm boundary on the map first.'); return; }
    if (!formData.name.trim()) { setError('Enter a farm name.'); return; }
    setLoading(true); setError('');
    try {
      // Build clean payload — omit empty optional strings, drop 'state' (not in DB schema)
      const payload: any = {
        name: formData.name.trim(),
        current_crop: formData.current_crop,
        season: formData.season,
        irrigation_type: formData.irrigation_type,
        boundary_geojson: geoData.geojson,
        area_acres: geoData.area,
        latitude:  geoData.lat  ?? 26.2006,
        longitude: geoData.lng  ?? 92.9376,
      };
      // Only include sowing_date if the user actually picked one
      if (formData.sowing_date) payload.sowing_date = formData.sowing_date;

      const created = await createFarm(payload);
      navigate(`/farms/${created.id}/dashboard`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => `${d.loc?.join('.')}: ${d.msg}`).join(' | ')
        : detail || 'Failed to save. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  const input  = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm bg-white hover:border-gray-300 transition-all';
  const select = input + ' cursor-pointer appearance-none';
  const boundaryReady = !!geoData.geojson;
  const formReady     = !!formData.name.trim();

  /* ── Shared form JSX (used in both mobile and desktop) ─────── */
  const FormContent = (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 md:px-5 py-5 space-y-6">

        {/* Hint */}
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            First go to the <strong>Map tab</strong> and click "Draw Farm Boundary" to outline your farm,
            then fill in the details here.
          </p>
        </div>

        {/* 1 — Identity */}
        <div>
          <SectionHeader n={1} title="Farm Identity" />
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Farm Name *</label>
              <input required type="text" className={input}
                placeholder="e.g. North Paddy Field"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">State *</label>
              <div className="relative">
                <select className={select} value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Used for AI weather &amp; yield analysis</p>
            </div>
          </div>
        </div>

        {/* 2 — Crop */}
        <div>
          <SectionHeader n={2} title="Current Crop" />
          <div className="grid grid-cols-4 gap-2">
            {CROPS.map(c => (
              <button key={c.name} type="button"
                onClick={() => setFormData({ ...formData, current_crop: c.name })}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                  formData.current_crop === c.name
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm scale-105'
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200 hover:bg-white'
                }`}>
                <span className="text-lg">{c.emoji}</span>
                <span className="leading-none text-center">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 — Season */}
        <div>
          <SectionHeader n={3} title="Growing Season" />
          <div className="grid grid-cols-3 gap-2">
            {SEASONS.map(s => (
              <button key={s.name} type="button"
                onClick={() => setFormData({ ...formData, season: s.name })}
                className={`flex flex-col items-center gap-0.5 p-3 rounded-xl border-2 text-xs transition-all ${
                  formData.season === s.name
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-sm'
                    : 'border-gray-100 bg-gray-50 text-gray-500 font-medium hover:border-gray-200 hover:bg-white'
                }`}>
                <span className="font-bold text-sm">{s.name}</span>
                <span className={`font-normal ${formData.season === s.name ? 'text-emerald-500' : 'text-gray-400'}`}>{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4 — Irrigation */}
        <div>
          <SectionHeader n={4} title="Irrigation Type" />
          <div className="grid grid-cols-2 gap-2">
            {IRRIGATIONS.map(irr => (
              <button key={irr.name} type="button"
                onClick={() => setFormData({ ...formData, irrigation_type: irr.name })}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                  formData.irrigation_type === irr.name
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200 hover:bg-white'
                }`}>
                <span>{irr.icon}</span> {irr.name}
              </button>
            ))}
          </div>
        </div>

        {/* 5 — Sowing Date */}
        <div>
          <SectionHeader n={5} title="Sowing Date (optional)" />
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="date" className={input + ' pl-10'}
              value={formData.sowing_date}
              onChange={e => setFormData({ ...formData, sowing_date: e.target.value })}
            />
          </div>
        </div>

        {/* Area chip */}
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
          boundaryReady ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className={`w-4 h-4 ${boundaryReady ? 'text-emerald-500' : 'text-gray-400'}`} />
            <span className={`font-semibold ${boundaryReady ? 'text-emerald-700' : 'text-gray-400'}`}>Farm Area</span>
          </div>
          {boundaryReady ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xl font-black text-emerald-700">{geoData.area.toFixed(2)}</span>
              <span className="text-sm font-semibold text-emerald-600">ac</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">draw boundary first</span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Sticky submit footer */}
      <div className="flex-shrink-0 px-4 md:px-5 py-4 border-t border-gray-100 bg-white">
        <button
          type="submit"
          disabled={loading || !boundaryReady || !formReady}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-2 text-sm"
        >
          {loading
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
            : <><Leaf className="w-4 h-4" />Save Farm &amp; Open Dashboard</>
          }
        </button>
        {(!boundaryReady || !formReady) && (
          <p className="text-center text-xs text-gray-400 mt-2">
            {!boundaryReady ? '↗ Draw boundary on map first' : '↑ Enter a farm name above'}
          </p>
        )}
      </div>
    </form>
  );

  /* ── Shared map JSX ─────────────────────────────────────────── */
  const MapContent = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-sm font-bold text-gray-700">Farm Boundary Map</span>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <Droplets className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">OpenStreetMap · Esri Satellite</span>
          <span className="sm:hidden">OSM · Satellite</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <FarmMap onPolygonDrawn={handlePolygonDrawn} />
      </div>
    </div>
  );

  /* ── Shared panel header ────────────────────────────────────── */
  const PanelHeader = (
    <div className="bg-white border-b border-gray-100 px-4 py-3 flex-shrink-0">
      <button onClick={() => navigate('/farms')}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 mb-2 transition-colors">
        <ChevronLeft className="w-3 h-3" /> Back to My Farms
      </button>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
          <Sprout className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900 leading-tight">Add New Farm</h1>
          <p className="text-xs text-gray-400">Draw boundary · fill details · save</p>
        </div>
        {/* Status pills */}
        <div className="ml-auto flex gap-1.5">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all ${
            boundaryReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'
          }`}>
            <MapPin className="w-3 h-3" />
            {boundaryReady ? `${geoData.area.toFixed(1)}ac` : 'Map'}
          </div>
          <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all ${
            formReady ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'
          }`}>
            <Wheat className="w-3 h-3" />
            {formReady ? formData.name.slice(0, 12) : 'Name'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          MOBILE layout (< lg): tab switcher + full-height panel
      ════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:hidden" style={{ height: 'calc(100vh - 65px)' }}>

        {/* Header */}
        {PanelHeader}

        {/* Tab bar */}
        <div className="flex bg-white border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all ${
              mobileTab === 'map'
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <Map className="w-4 h-4" />
            Map
            {boundaryReady && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
          </button>
          <button
            onClick={() => setMobileTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all ${
              mobileTab === 'form'
                ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <Sprout className="w-4 h-4" />
            Details
            {formReady && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
          </button>
        </div>

        {/* Active panel */}
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'map' ? MapContent : FormContent}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          DESKTOP layout (≥ lg): side-by-side split panels
      ════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex overflow-hidden bg-slate-50" style={{ height: 'calc(100vh - 65px)' }}>

        {/* Left scrollable form */}
        <div className="w-[420px] min-w-[360px] max-w-[440px] flex flex-col border-r border-gray-200 bg-white flex-shrink-0">
          {PanelHeader}
          {FormContent}
        </div>

        {/* Right full-height map */}
        <div className="flex-1 overflow-hidden bg-slate-100">
          {MapContent}
        </div>
      </div>
    </>
  );
}
