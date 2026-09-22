import { useState } from 'react';
import { type AnalysisResult } from '../../types/analysis';
import { Satellite, CloudRain, Layers, Thermometer, Droplets } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface WeatherSoilPanelProps {
  data: AnalysisResult;
}

// Mock NDVI trend data (in real app this comes from satellite time-series)
const ndviTrendData = [
  { day: '14d ago', ndvi: 0.66 },
  { day: '10d ago', ndvi: 0.64 },
  { day: '7d ago', ndvi: 0.62 },
  { day: '4d ago', ndvi: 0.60 },
  { day: 'Today', ndvi: 0.58 },
];

function NutrientBadge({ label, level }: { label: string; level: string }) {
  const color = level === 'low' ? 'bg-red-100 text-red-700' : level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${color}`}>{level}</span>
    </div>
  );
}

export default function WeatherSoilPanel({ data }: WeatherSoilPanelProps) {
  const [activeTab, setActiveTab] = useState<'satellite' | 'weather' | 'soil'>('satellite');
  const { satellite, weather, soil } = data;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: 'satellite', label: 'Satellite', icon: <Satellite className="w-3.5 h-3.5" /> },
          { key: 'weather', label: 'Weather', icon: <CloudRain className="w-3.5 h-3.5" /> },
          { key: 'soil', label: 'Soil', icon: <Layers className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Satellite Tab */}
      {activeTab === 'satellite' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-primary">{satellite.ndvi}</p>
              <p className="text-xs text-gray-500 mt-1">NDVI</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-red-500">{satellite.ndvi_change_14d}%</p>
              <p className="text-xs text-gray-500 mt-1">14d Change</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-amber-500 capitalize">{satellite.trend}</p>
              <p className="text-xs text-gray-500 mt-1">Trend</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-3">NDVI Trend (14 days)</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={ndviTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0.5, 0.75]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Line type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weather Tab */}
      {activeTab === 'weather' && (
        <div className="space-y-3">
          {[
            { label: 'Rainfall (72h)', value: `${weather.rainfall_72h} mm`, icon: <CloudRain className="w-4 h-4 text-sky-500" /> },
            { label: 'Max Temperature', value: `${weather.temperature_max}°C`, icon: <Thermometer className="w-4 h-4 text-orange-500" /> },
            { label: 'Humidity', value: `${weather.humidity}%`, icon: <Droplets className="w-4 h-4 text-blue-500" /> },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Heavy Rain Risk</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-sky-500"
                    style={{ width: `${weather.heavy_rain_risk * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700">{(weather.heavy_rain_risk * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soil Tab */}
      {activeTab === 'soil' && (
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-gray-800">{soil.ph}</p>
              <p className="text-xs text-gray-500 mt-1">Soil pH</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-gray-800">{soil.moisture}%</p>
              <p className="text-xs text-gray-500 mt-1">Moisture</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-600 mb-2">Nutrients</p>
          <NutrientBadge label="Nitrogen" level={soil.nitrogen} />
          <NutrientBadge label="Phosphorus" level={soil.phosphorus} />
          <NutrientBadge label="Potassium" level={soil.potassium} />
          <NutrientBadge label="Organic Carbon" level={soil.organic_carbon} />
        </div>
      )}
    </div>
  );
}
