import { type CropSuitability } from '../../types/analysis';
import { Droplets, TrendingUp } from 'lucide-react';

interface CropSuitabilityPanelProps {
  crops: CropSuitability[];
}

function getRiskBadgeStyle(risk: string) {
  const lower = risk.toLowerCase();
  if (lower.includes('low')) return 'bg-green-100 text-green-700';
  if (lower.includes('moderate')) return 'bg-amber-100 text-amber-700';
  if (lower.includes('high')) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
}

export default function CropSuitabilityPanel({ crops }: CropSuitabilityPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-gray-900">What Should I Plant?</h2>
      </div>
      <p className="text-sm text-gray-500">Crop suitability scores based on your farm's soil, climate, and water conditions.</p>

      <div className="space-y-4">
        {crops.map((crop, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900">{crop.crop}</span>
              <span className="text-2xl font-black text-primary">{crop.suitability}%</span>
            </div>

            {/* Suitability Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-primary transition-all duration-700"
                style={{ width: `${crop.suitability}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>{crop.water_requirement} water requirement</span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getRiskBadgeStyle(crop.risk)}`}>
                {crop.risk}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
