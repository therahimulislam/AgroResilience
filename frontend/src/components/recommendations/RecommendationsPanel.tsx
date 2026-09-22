import { type Recommendation } from '../../types/analysis';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

function getPriorityStyle(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high': return { bg: 'bg-red-50 border-red-200', icon: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />, badge: 'bg-red-100 text-red-700' };
    case 'medium': return { bg: 'bg-amber-50 border-amber-200', icon: <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />, badge: 'bg-amber-100 text-amber-700' };
    default: return { bg: 'bg-green-50 border-green-200', icon: <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />, badge: 'bg-green-100 text-green-700' };
  }
}

export default function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-gray-900">Next Actions</h2>
      </div>
      <p className="text-sm text-gray-500">Evidence-based actions recommended for your farm's current conditions.</p>

      <div className="space-y-3">
        {recommendations.map((rec, i) => {
          const style = getPriorityStyle(rec.priority);
          return (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${style.bg}`}>
              {style.icon}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800 text-sm leading-snug">{rec.title}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${style.badge}`}>
                    {rec.priority}
                  </span>
                </div>
                {rec.reason && <p className="text-xs text-gray-500 leading-relaxed">{rec.reason}</p>}
                {rec.data_source && (
                  <p className="text-xs text-gray-400">Source: {rec.data_source}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
