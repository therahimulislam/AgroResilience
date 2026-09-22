import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { analyzeFarm } from '../services/analysis';
import { type AnalysisResult } from '../types/analysis';
import MetricCard from '../components/dashboard/MetricCard';
import RiskIndex from '../components/risk/RiskIndex';
import CropSuitabilityPanel from '../components/crops/CropSuitabilityPanel';
import RecommendationsPanel from '../components/recommendations/RecommendationsPanel';
import WeatherSoilPanel from '../components/dashboard/WeatherSoilPanel';
import { Leaf, MapPin, Activity, RefreshCw, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { farmId } = useParams<{ farmId: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!farmId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeFarm(farmId);
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Farm Analysis</h1>
            <p className="text-gray-500 mt-2 text-sm">
              Tap below to analyze your farm using satellite, weather, soil and climate intelligence.
            </p>
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
              <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing farm...</>
            ) : (
              <><Activity className="w-4 h-4" /> Analyze My Farm</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Farm Header */}
      <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{result.farm.name}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {result.farm.area_acres?.toFixed(1)} acres</span>
                <span>·</span>
                <span>{result.farm.current_crop}</span>
                <span>·</span>
                <span>{result.farm.season} season</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {result.data_mode === 'demo' && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                Demo Data
              </span>
            )}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Index — full left column */}
          <div className="lg:col-span-1">
            <RiskIndex risk={result.risk} />
          </div>

          {/* Intelligence Panel — spans 2 columns */}
          <div className="lg:col-span-2">
            <WeatherSoilPanel data={result} />
          </div>
        </div>

        {/* Crop + Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CropSuitabilityPanel crops={result.crop_suitability} />
          <RecommendationsPanel recommendations={result.recommendations} />
        </div>

        {/* Analysis Timestamp */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Last analyzed: {new Date(result.analyzed_at).toLocaleString()} · AgroResilience Farm Risk Index v1.0
        </p>
      </div>
    </div>
  );
}
