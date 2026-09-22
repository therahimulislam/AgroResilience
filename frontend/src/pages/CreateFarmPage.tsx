import { useState } from 'react';
import FarmMap from '../components/map/FarmMap';
import { createFarm } from '../services/farms';

export default function CreateFarmPage() {
  const [formData, setFormData] = useState({
    name: '',
    current_crop: 'Rice',
    season: 'Kharif',
    irrigation_type: 'Rainfed',
    sowing_date: '',
  });

  const [geoData, setGeoData] = useState<{ geojson: string | null; area: number }>({
    geojson: null,
    area: 0,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePolygonDrawn = (geojson: string | null, area: number) => {
    setGeoData({ geojson, area });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geoData.geojson) {
      alert("Please draw a farm boundary on the map first.");
      return;
    }
    setLoading(true);
    try {
      await createFarm({
        ...formData,
        boundary_geojson: geoData.geojson,
        area_acres: geoData.area,
        latitude: 26.2006, // Normally extracted from centroid of polygon
        longitude: 92.9376,
      });
      setSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Failed to create farm.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-2xl font-semibold text-primary mb-2">Farm Created Successfully!</h2>
        <p className="text-gray-500 mb-6">Your farm boundary and details have been saved.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
        >
          Add Another Farm
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Form */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Add New Farm</h1>
          <p className="text-gray-500">Provide details and draw the boundary to start tracking your farm's health and climate risk.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="e.g. North Field"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <select 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.current_crop}
                onChange={e => setFormData({...formData, current_crop: e.target.value})}
              >
                <option>Rice</option>
                <option>Maize</option>
                <option>Wheat</option>
                <option>Cotton</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select 
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                value={formData.season}
                onChange={e => setFormData({...formData, season: e.target.value})}
              >
                <option>Kharif</option>
                <option>Rabi</option>
                <option>Zaid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation</label>
            <select 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.irrigation_type}
              onChange={e => setFormData({...formData, irrigation_type: e.target.value})}
            >
              <option>Rainfed</option>
              <option>Canal</option>
              <option>Tube Well</option>
              <option>Drip</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sowing Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              value={formData.sowing_date}
              onChange={e => setFormData({...formData, sowing_date: e.target.value})}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Calculated Area</span>
              <span className="text-lg font-bold text-primary">{geoData.area.toFixed(2)} Acres</span>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !geoData.geojson}
              className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Farm'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Map */}
      <div className="lg:col-span-2 h-[600px] lg:h-auto min-h-[600px] flex flex-col bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Farm Boundary</h3>
          <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-md font-medium">Use the polygon tool to draw</span>
        </div>
        <div className="flex-1">
          <FarmMap onPolygonDrawn={handlePolygonDrawn} />
        </div>
      </div>
    </div>
  );
}
