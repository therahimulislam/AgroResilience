import { type RiskData } from '../../types/analysis';
import { AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

interface RiskIndexProps {
  risk: RiskData;
}

function getRiskColor(level: string) {
  switch (level.toLowerCase()) {
    case 'low': return { ring: '#22c55e', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
    case 'moderate': return { ring: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'high': return { ring: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'very high': return { ring: '#991b1b', bg: 'bg-red-100', text: 'text-red-900', border: 'border-red-300' };
    default: return { ring: '#94a3b8', bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
}

const riskFactors = [
  { label: 'Crop Stress', key: 'crop_stress', description: 'Vegetation health decline' },
  { label: 'Soil Risk', key: 'soil_risk', description: 'Nutrient limitation detected' },
  { label: 'Climate Risk', key: 'climate_risk', description: 'Rainfall variability, elevated temperature' },
  { label: 'Water Risk', key: 'water_risk', description: 'Irrigation and drainage conditions' },
];

export default function RiskIndex({ risk }: RiskIndexProps) {
  const colors = getRiskColor(risk.risk_level);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (risk.overall_risk / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">AgroResilience Farm Risk Index</h2>
          <p className="text-xs text-gray-400 mt-1">AI/model-based estimate — not a certified agricultural standard</p>
        </div>
        <AlertTriangle className="w-5 h-5 text-amber-400 mt-1 flex-shrink-0" />
      </div>

      {/* Overall Score */}
      <div className="flex items-center gap-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} stroke="#f1f5f9" strokeWidth="10" fill="none" />
            <circle
              cx="60" cy="60" r={radius}
              stroke={colors.ring}
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-900">{risk.overall_risk}</span>
            <span className="text-xs text-gray-400">/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border} mb-3`}>
            {risk.risk_level === 'Low' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span className="font-semibold text-sm">{risk.risk_level} Risk</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            The farm's overall risk score considers climate, crop, soil and water conditions combined.
          </p>
        </div>
      </div>

      {/* Risk Factor Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Contributing Factors</h3>
        {riskFactors.map((factor) => {
          const val = risk[factor.key as keyof RiskData] as number;
          return (
            <div key={factor.key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{factor.label}</span>
                <span className="text-gray-500">{val}/100</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{
                    width: `${val}%`,
                    backgroundColor: val > 70 ? '#ef4444' : val > 50 ? '#f59e0b' : '#22c55e'
                  }}
                />
              </div>
              <p className="text-xs text-gray-400">{factor.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
