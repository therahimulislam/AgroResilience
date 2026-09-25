import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FarmMap from '../components/map/FarmMap';
import { createFarm } from '../services/farms';
import { Leaf, MapPin, Sprout, Droplets, Calendar, CheckCircle, AlertCircle, Info } from 'lucide-react';

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Pulses', 'Vegetables'];
const SEASONS = ['Kharif', 'Rabi', 'Zaid'];
const IRRIGATIONS = ['Rainfed', 'Canal', 'Tube Well', 'Drip', 'Sprinkler'];
const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function CreateFarmPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    current_crop: 'Rice',
    season: 'Kharif',
    irrigation_type: 'Rainfed',
    sowing_date: '',
    state: 'Assam',
  });
  const [geoData, setGeoData] = useState<{ geojson: string | null; area: number; lat?: number; lng?: number }>({
    geojson: null, area: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePolygonDrawn = (geojson: string | null, area: number) => {
    setGeoData({ geojson, area });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geoData.geojson) {
      setError('Please draw your farm boundary on the map first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await createFarm({
        ...formData,
        boundary_geojson: geoData.geojson,
        area_acres: geoData.area,
        latitude: geoData.lat || 26.2006,
        longitude: geoData.lng || 92.9376,
      });
      // Redirect to dashboard with newly created farm ID
      navigate(`/farms/${created.id}/dashboard`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save farm. Please try again.');
      setLoading(false);
    }
  };

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-shadow hover:border-gray-300";
  const selectClass = inputClass + " bg-white cursor-pointer";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Add New Farm</h1>
              <p className="text-gray-500 text-sm">Draw the boundary and provide farm details to begin AI monitoring.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Info tip */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">Use the polygon tool on the map to draw your farm's exact boundary. The area will be calculated automatically.</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">

            {/* Farm Name */}
            {field('Farm Name',
              <input
                required
                type="text"
                className={inputClass}
                placeholder="e.g. North Paddy Field"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />,
              'A memorable name to identify this farm'
            )}

            {/* Crop & Season */}
            <div className="grid grid-cols-2 gap-4">
              {field('Current Crop',
                <select className={selectClass} value={formData.current_crop} onChange={e => setFormData({ ...formData, current_crop: e.target.value })}>
                  {CROPS.map(c => <option key={c}>{c}</option>)}
                </select>
              )}
              {field('Season',
                <select className={selectClass} value={formData.season} onChange={e => setFormData({ ...formData, season: e.target.value })}>
                  {SEASONS.map(s => <option key={s}>{s}</option>)}
                </select>
              )}
            </div>

            {/* State */}
            {field('State',
              <select className={selectClass} value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })}>
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>,
              'Used for weather and historical yield data'
            )}

            {/* Irrigation */}
            {field('Irrigation Type',
              <div className="grid grid-cols-2 gap-2">
                {IRRIGATIONS.map(irr => (
                  <button
                    key={irr}
                    type="button"
                    onClick={() => setFormData({ ...formData, irrigation_type: irr })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.irrigation_type === irr
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    <Droplets className={`w-3.5 h-3.5 ${formData.irrigation_type === irr ? 'text-emerald-500' : 'text-gray-400'}`} />
                    {irr}
                  </button>
                ))}
              </div>
            )}

            {/* Sowing Date */}
            {field('Sowing Date (optional)',
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  className={inputClass + ' pl-10'}
                  value={formData.sowing_date}
                  onChange={e => setFormData({ ...formData, sowing_date: e.target.value })}
                />
              </div>
            )}

            {/* Area Preview */}
            <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Calculated Area</span>
              </div>
              <div className="flex items-center gap-2">
                {geoData.area > 0 ? (
                  <><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="font-bold text-emerald-700">{geoData.area.toFixed(2)} Acres</span></>
                ) : (
                  <span className="text-gray-400 text-sm italic">Draw boundary first</span>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !geoData.geojson}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Leaf className="w-4 h-4" /> Save Farm & Open Dashboard</>
              )}
            </button>
          </form>
        </div>

        {/* Right: Map */}
        <div className="lg:col-span-3 h-[650px] lg:h-auto min-h-[500px] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-gray-800">Farm Boundary Map</h3>
            </div>
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded-lg font-semibold">
              🔷 Use polygon tool to draw
            </span>
          </div>
          <div className="flex-1">
            <FarmMap onPolygonDrawn={handlePolygonDrawn} />
          </div>
        </div>
      </div>
    </div>
  );
}
