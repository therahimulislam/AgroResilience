import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { analyzeFarm, getCachedAnalysis } from '../services/analysis';
import { getFarm, type Farm } from '../services/farms';
import { type AnalysisResult } from '../types/analysis';
import MetricCard from '../components/dashboard/MetricCard';
import RiskIndex from '../components/risk/RiskIndex';
import CropSuitabilityPanel from '../components/crops/CropSuitabilityPanel';
import RecommendationsPanel from '../components/recommendations/RecommendationsPanel';
import WeatherSoilPanel from '../components/dashboard/WeatherSoilPanel';
import { Leaf, MapPin, Activity, RefreshCw, AlertTriangle, Cpu, TrendingUp, ChevronRight, LayoutDashboard, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Form states
  const [regionState, setRegionState] = useState('Assam');
  const [advancedData, setAdvancedData] = useState({
    crop_year: '',
    area: '',
    annual_rainfall: '',
    fertilizer: '',
    pesticide: '',
  });

  useEffect(() => {
    if (farmId) {
      // Reset state for this farm first
      setResult(null);
      setError(null);
      setFarm(null);

      getFarm(farmId).then(f => {
        setFarm(f);
        const cached = getCachedAnalysis(farmId);
        if (cached) setResult(cached);
      }).catch(console.error);
    }
  }, [farmId]);

  const executeAnalysis = async (f: Farm, forceRefresh = false) => {
    if (!f || !farmId) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        latitude: f.latitude || 26.1445,
        longitude: f.longitude || 91.7362,
        crop: f.current_crop || 'Rice',
        state: regionState,
        season: f.season || 'Kharif'
      };

      if (advancedData.crop_year && advancedData.area && advancedData.annual_rainfall && advancedData.fertilizer && advancedData.pesticide) {
        payload.crop_year = Number(advancedData.crop_year);
        payload.area = Number(advancedData.area);
        payload.annual_rainfall = Number(advancedData.annual_rainfall);
        payload.fertilizer = Number(advancedData.fertilizer);
        payload.pesticide = Number(advancedData.pesticide);
      }

      const data = await analyzeFarm(farmId, payload, forceRefresh);
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (farm) executeAnalysis(farm, true);
  };

  if (!farm) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-medium text-gray-500">Loading farm...</div>;
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Analyze {farm.name}</h1>
            <p className="text-gray-500 mt-2 text-sm">
              We'll fetch live satellite vegetation and weather data. Please confirm the farm's state below.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary"
              value={regionState}
              onChange={e => setRegionState(e.target.value)}
            />
          </div>

          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <button 
              type="button" 
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex justify-between items-center text-sm font-semibold text-gray-700"
            >
              Optional: Historical ML Yield Inputs
              <span className="text-lg leading-none">{isAdvancedOpen ? '-' : '+'}</span>
            </button>
            {isAdvancedOpen && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Crop Year</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" value={advancedData.crop_year} onChange={e => setAdvancedData({...advancedData, crop_year: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Area</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" value={advancedData.area} onChange={e => setAdvancedData({...advancedData, area: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Annual Rainfall</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" value={advancedData.annual_rainfall} onChange={e => setAdvancedData({...advancedData, annual_rainfall: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fertilizer</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" value={advancedData.fertilizer} onChange={e => setAdvancedData({...advancedData, fertilizer: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Pesticide</label>
                  <input type="number" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm outline-none" value={advancedData.pesticide} onChange={e => setAdvancedData({...advancedData, pesticide: e.target.value})} />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-left">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Activity className="w-4 h-4" /> Analyze Farm</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Farm Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Link to="/farms" className="flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5" />
              My Farms
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 font-medium">{farm.name}</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">{farm.name}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {farm.area_acres?.toFixed(1)} acres</span>
                  <span>·</span>
                  <span className="font-medium text-emerald-600">{farm.current_crop}</span>
                  <span>·</span>
                  <span>{farm.season} season</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:border-emerald-400 hover:text-emerald-600 transition-colors disabled:opacity-60"
              >
                {loading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing...</>
                  : <><RefreshCw className="w-3.5 h-3.5" /> Re-analyze</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* Health Metrics Row */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Farm Health Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Crop Health" value={result.satellite.vegetation_health} color="#10b981" description="Vegetation index" />
            <MetricCard label="Soil Health" value={100 - result.soil.soil_risk} color="#0ea5e9" description="Soil condition index" />
            <MetricCard label="Climate Risk" value={result.weather.climate_risk} color="#f59e0b" description="Weather stress" />
            <MetricCard label="Water Risk" value={result.risk.water_risk} color="#8b5cf6" description="Irrigation & drainage" />
          </div>
        </div>

        {/* New Row: AI Advice and ML Signal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-gray-900">Gemini AI Advisory</h3>
            </div>
            {result.ai_advice ? (
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {result.ai_advice}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No AI advisory available.</p>
            )}
          </div>

          <div className="lg:col-span-1">
            {result.yield_prediction !== null && result.yield_prediction !== undefined ? (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-sm p-6 flex flex-col justify-center items-center text-center h-full space-y-3">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Historical Yield Signal</h3>
                <p className="text-4xl font-black text-emerald-600">{result.yield_prediction.toFixed(2)}</p>
                <p className="text-xs text-emerald-700 mt-2 px-2">
                  Based on historical agricultural data and the optional inputs provided.
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center items-center text-center h-full opacity-70">
                <TrendingUp className="w-8 h-8 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-500 mt-2">Historical Yield Signal</h3>
                <p className="text-xs text-gray-400 mt-2 px-2">
                  Not available. Provide advanced ML inputs to see the historical yield estimate.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RiskIndex risk={result.risk} />
          </div>
          <div className="lg:col-span-2">
            <WeatherSoilPanel data={result} />
          </div>
        </div>

        {/* Crop + Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CropSuitabilityPanel crops={result.crop_suitability} />
          <RecommendationsPanel recommendations={result.recommendations} />
        </div>

      </div>
    </div>
  );
}
