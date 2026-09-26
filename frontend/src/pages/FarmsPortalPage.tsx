import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getFarms, deleteFarm, type Farm } from '../services/farms';
import { getMe } from '../services/auth';
import {
  PlusCircle, Leaf, MapPin, Droplets, Calendar, Activity,
  Trash2, ChevronRight, Loader2, LayoutDashboard, MessageSquare, TrendingUp, AlertTriangle, X
} from 'lucide-react';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center shadow-inner">
        <Leaf className="w-12 h-12 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No farms yet</h3>
        <p className="text-gray-500 max-w-md">Add your first farm to start tracking vegetation health, weather risk, and getting AI-powered advisory.</p>
      </div>
      <Link
        to="/farms/new"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all duration-200"
      >
        <PlusCircle className="w-5 h-5" />
        Add Your First Farm
      </Link>
    </div>
  );
}

function FarmCard({ farm, onDelete }: { farm: Farm; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const cropEmoji: Record<string, string> = {
    Rice: '🌾', Wheat: '🌿', Maize: '🌽', Cotton: '☁️', Sugarcane: '🎋'
  };
  const emoji = cropEmoji[farm.current_crop || ''] || '🌱';
  const navigate = useNavigate();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFarm(farm.id);
      onDelete(farm.id);
    } catch {
      setDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 space-y-6 animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Farm?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                You are about to permanently delete <span className="font-semibold text-gray-800">"{farm.name}"</span>. All associated data including analysis results will be lost. This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold hover:shadow-lg hover:shadow-red-200 transition-all flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Delete Farm'}
              </button>
            </div>
          </div>
        </div>
      )}

    <div 
      onClick={() => navigate(`/farms/${farm.id}/dashboard`)}
      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Card gradient header */}
      <div className="h-3 bg-gradient-to-r from-emerald-400 to-teal-500" />

      <div className="p-6">
        {/* Top row */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-2xl">
              {emoji}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{farm.name}</h3>
              <p className="text-emerald-600 font-medium text-sm">{farm.current_crop || 'Unknown Crop'}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
            disabled={deleting}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {farm.area_acres !== undefined && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{farm.area_acres.toFixed(1)} acres</span>
            </div>
          )}
          {farm.season && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{farm.season}</span>
            </div>
          )}
          {farm.irrigation_type && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Droplets className="w-3.5 h-3.5 text-gray-400" />
              <span>{farm.irrigation_type}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-600 text-sm font-medium">Ready to analyze</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            to={`/farms/${farm.id}/dashboard`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl text-sm hover:shadow-md hover:shadow-emerald-200 transition-all"
          >
            <Activity className="w-4 h-4" />
            Analyze
          </Link>
          <Link
            to={`/farms/${farm.id}/assistant`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>
          <button 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default function FarmsPortalPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    Promise.all([
      getFarms().catch(() => []),
      getMe().catch(() => null),
    ]).then(([farmsData, userData]) => {
      setFarms(farmsData);
      setUser(userData);
      setLoading(false);
    });
  }, []);

  const handleDelete = (id: string) => {
    setFarms(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                  <LayoutDashboard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900">My Farms</h1>
                  {user && <p className="text-gray-500 text-sm">{user.email}</p>}
                </div>
              </div>
            </div>
            <Link
              to="/farms/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Farm
            </Link>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {farms.length > 0 && (
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-black text-gray-900">{farms.length}</p>
              <p className="text-xs text-gray-500 font-medium">Total Farms</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-black text-emerald-600">
                {farms.reduce((sum, f) => sum + (f.area_acres || 0), 0).toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 font-medium">Total Acres</p>
            </div>
            <div className="w-px h-10 bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-black text-teal-600">
                {[...new Set(farms.map(f => f.current_crop).filter(Boolean))].length}
              </p>
              <p className="text-xs text-gray-500 font-medium">Crop Types</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-medium">Loading your farms...</span>
          </div>
        ) : farms.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-500 text-sm">{farms.length} farm{farms.length !== 1 ? 's' : ''} · Select one to run AI analysis</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ChevronRight className="w-3 h-3" /> Click Analyze to get AI insights
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map(farm => (
                <FarmCard key={farm.id} farm={farm} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
