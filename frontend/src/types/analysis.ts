export interface SatelliteData {
  ndvi: number;
  ndvi_change_14d: number;
  vegetation_health: number;
  trend: string;
}

export interface WeatherData {
  rainfall_72h: number;
  temperature_max: number;
  humidity: number;
  heavy_rain_risk: number;
  climate_risk: number;
}

export interface SoilData {
  ph: number;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  organic_carbon: string;
  moisture: number;
  soil_risk: number;
}

export interface RiskData {
  crop_stress: number;
  soil_risk: number;
  climate_risk: number;
  water_risk: number;
  overall_risk: number;
  risk_level: string;
}

export interface CropSuitability {
  crop: string;
  suitability: number;
  water_requirement: string;
  risk: string;
}

export interface Recommendation {
  title: string;
  reason?: string;
  priority: string;
  related_risk?: string;
  data_source?: string;
}

export interface AnalysisResult {
  farm: {
    id: string;
    name: string;
    area_acres?: number;
    current_crop?: string;
    season?: string;
    irrigation_type?: string;
  };
  satellite: SatelliteData;
  weather: WeatherData;
  soil: SoilData;
  risk: RiskData;
  crop_suitability: CropSuitability[];
  recommendations: Recommendation[];
  data_mode: string;
  analyzed_at: string;
}
