# AgroResilience — System Architecture

**Version:** 1.0
**Project:** AgroResilience
**Document:** System Architecture
**Target:** Hackathon MVP
**Primary Region:** India
**Initial Demonstration Region:** Assam, India

---

# 1. Overview

AgroResilience is an AI-powered climate-resilient farming platform that combines farm-level information with environmental and agricultural intelligence to provide localized, explainable and actionable recommendations.

The platform is designed around a simple principle:

> Farming decisions should consider current climate, soil, crop and farm conditions instead of relying entirely on historical farming practices.

AgroResilience combines:

* Farmer-provided information
* Farm geographic boundaries
* Satellite imagery
* Weather and climate information
* Soil information
* Machine-learning predictions
* Risk scoring
* Crop suitability analysis
* Google Gemini
* Multilingual and voice interaction

The platform is designed as an **India-first system** while keeping the architecture extensible to other regions and countries.

---

# 2. Architectural Goals

The architecture has the following goals.

## 2.1 Functional Goals

The system must allow a farmer to:

1. Create an account.
2. Create and manage a farm.
3. Select a farm location.
4. Draw or define the farm boundary.
5. Enter crop and farm information.
6. Enter or upload soil information.
7. Trigger farm analysis.
8. Retrieve agricultural intelligence.
9. View crop-health information.
10. View soil-health indicators.
11. View climate and weather risk.
12. View the AgroResilience Farm Risk Index.
13. Compare crop suitability.
14. Receive actionable recommendations.
15. Ask questions using text or voice.
16. Receive explanations in a supported language.

---

# 3. Non-Goals for the MVP

The first version should not attempt to build:

* Full agricultural marketplace
* Insurance marketplace
* Agricultural lending
* IoT hardware platform
* Drone management
* Complete disease-detection platform
* National-scale government monitoring system
* Global agricultural intelligence network
* Automated pesticide/fertilizer purchasing
* Fully autonomous farm management

These may be future extensions.

---

# 4. High-Level Architecture

```text
                         ┌─────────────────────┐
                         │       FARMER        │
                         └──────────┬──────────┘
                                    │
                         Voice / Text / Web UI
                                    │
                                    ▼
                    ┌────────────────────────────┐
                    │     React Web Application  │
                    │                            │
                    │  Farm Management           │
                    │  Map                       │
                    │  Dashboard                 │
                    │  Crop Suitability          │
                    │  Recommendations            │
                    │  AI Assistant               │
                    └─────────────┬──────────────┘
                                  │ HTTPS / REST
                                  ▼
                    ┌────────────────────────────┐
                    │       FastAPI Backend       │
                    │                            │
                    │ Authentication              │
                    │ Farm Management             │
                    │ API Gateway                 │
                    │ Analysis Orchestration      │
                    │ Chat / Voice                │
                    └─────────────┬──────────────┘
                                  │
                  ┌───────────────┼─────────────────┐
                  │               │                 │
                  ▼               ▼                 ▼
          ┌────────────┐   ┌─────────────┐   ┌──────────────┐
          │ PostgreSQL │   │ Intelligence │   │ External     │
          │ + PostGIS  │   │ Services     │   │ Providers    │
          └────────────┘   └──────┬──────┘   └──────────────┘
                                  │
                     ┌────────────┼─────────────┐
                     │            │             │
                     ▼            ▼             ▼
                Satellite      Weather         Soil
                Intelligence  Intelligence  Intelligence
                     │            │             │
                     └────────────┼─────────────┘
                                  ▼
                         ┌─────────────────┐
                         │ ML Intelligence │
                         │                 │
                         │ Risk Model      │
                         │ Crop Suitability│
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Recommendation  │
                         │ Engine          │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │ Google Gemini   │
                         │                 │
                         │ Explanation     │
                         │ Q&A             │
                         │ Multilingual    │
                         └─────────────────┘
```

---

# 5. Architecture Principle

The most important architectural principle is:

> **Gemini is an interface and reasoning component, not the complete agricultural intelligence system.**

The intelligence pipeline is:

```text
Farmer Input
     +
Satellite
     +
Weather
     +
Soil
     +
Crop Information
     ↓
Feature Engineering
     ↓
ML / Rule-Based Analysis
     ↓
Risk + Suitability
     ↓
Recommendation Engine
     ↓
Structured Intelligence
     ↓
Gemini
     ↓
Natural-Language Explanation
     ↓
Farmer
```

This prevents the system from becoming a generic chatbot.

---

# 6. System Components

The platform consists of the following major components:

```text
1. Web Application
2. API Backend
3. Authentication Service
4. Farm Management Service
5. Geospatial Service
6. Satellite Intelligence Service
7. Weather Intelligence Service
8. Soil Intelligence Service
9. Risk Engine
10. Crop Suitability Engine
11. Recommendation Engine
12. Gemini AI Service
13. Voice Service
14. Database
15. External Data Providers
```

---

# 7. Frontend Architecture

## 7.1 Technology

Recommended frontend:

* React
* TypeScript
* Tailwind CSS
* React Router
* Recharts
* MapLibre GL or Leaflet

The frontend is responsible for:

* Rendering UI
* User interaction
* Form handling
* Map interaction
* Visualization
* API communication
* Authentication state
* Chat interface
* Voice interface
* Loading and error states

The frontend must not contain agricultural decision logic.

---

# 8. Frontend Structure

```text
frontend/
│
├── src/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── map/
│   │   ├── dashboard/
│   │   ├── charts/
│   │   ├── risk/
│   │   ├── crop/
│   │   ├── recommendations/
│   │   └── voice/
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── FarmsPage.tsx
│   │   ├── CreateFarmPage.tsx
│   │   ├── FarmDetailsPage.tsx
│   │   ├── AnalysisPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CropSuitabilityPage.tsx
│   │   ├── AssistantPage.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── layouts/
│   │   ├── PublicLayout.tsx
│   │   └── DashboardLayout.tsx
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── farms.ts
│   │   ├── analysis.ts
│   │   ├── weather.ts
│   │   ├── satellite.ts
│   │   ├── crops.ts
│   │   └── chat.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useFarm.ts
│   │   ├── useAnalysis.ts
│   │   └── useChat.ts
│   │
│   ├── types/
│   ├── utils/
│   ├── constants/
│   ├── routes/
│   └── main.tsx
│
└── package.json
```

---

# 9. Main Frontend Pages

## 9.1 Landing Page

Purpose:

* Explain the product
* Explain the problem
* Show core capabilities
* Direct users to create a farm

Primary CTA:

```text
Analyze My Farm
```

---

## 9.2 Farmer Onboarding

Collect:

```text
Name
Preferred Language
Location
Farm Size
Irrigation
Current Crop
Season
Sowing Date
```

Optional:

```text
Soil information
Soil Health Card
```

---

# 10. Farm Map Architecture

The map is a central part of the application.

Flow:

```text
Search / GPS
     ↓
Map
     ↓
Draw Farm Boundary
     ↓
Calculate Polygon Area
     ↓
Validate Geometry
     ↓
Save Farm
```

Farm geometry is stored using PostGIS.

Example:

```text
POLYGON((...))
```

The frontend may use GeoJSON.

Conversion:

```text
Frontend
GeoJSON
   ↓
FastAPI
   ↓
PostGIS geometry
```

---

# 11. Backend Architecture

## 11.1 Technology

Recommended:

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* PostgreSQL
* PostGIS
* Alembic
* JWT authentication

---

# 12. Backend Structure

```text
backend/
│
├── app/
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── farmers.py
│   │   ├── farms.py
│   │   ├── soil.py
│   │   ├── weather.py
│   │   ├── satellite.py
│   │   ├── analysis.py
│   │   ├── risk.py
│   │   ├── crops.py
│   │   ├── recommendations.py
│   │   ├── chat.py
│   │   └── voice.py
│   │
│   ├── models/
│   ├── schemas/
│   ├── services/
│   │   ├── satellite/
│   │   ├── weather/
│   │   ├── soil/
│   │   ├── risk/
│   │   ├── crop/
│   │   ├── recommendation/
│   │   ├── gemini/
│   │   └── voice/
│   │
│   ├── db/
│   │   ├── database.py
│   │   ├── models.py
│   │   └── migrations/
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── dependencies.py
│   │
│   ├── utils/
│   └── main.py
│
├── tests/
├── requirements.txt
├── .env.example
└── alembic.ini
```

---

# 13. API Architecture

The frontend communicates only with the FastAPI backend.

```text
React
  │
  │ HTTPS
  ▼
FastAPI
  │
  ├── Database
  ├── External APIs
  ├── ML Models
  └── Gemini
```

The browser must never directly expose private API keys.

---

# 14. REST API Groups

## Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

## Farms

```text
GET    /api/v1/farms
POST   /api/v1/farms
GET    /api/v1/farms/{farm_id}
PATCH  /api/v1/farms/{farm_id}
DELETE /api/v1/farms/{farm_id}
```

## Soil

```text
GET  /api/v1/farms/{farm_id}/soil
POST /api/v1/farms/{farm_id}/soil
PATCH /api/v1/farms/{farm_id}/soil
```

## Satellite

```text
GET /api/v1/farms/{farm_id}/satellite
GET /api/v1/farms/{farm_id}/satellite/ndvi
GET /api/v1/farms/{farm_id}/satellite/trend
```

## Weather

```text
GET /api/v1/farms/{farm_id}/weather
GET /api/v1/farms/{farm_id}/weather/forecast
GET /api/v1/farms/{farm_id}/weather/risk
```

## Analysis

```text
POST /api/v1/farms/{farm_id}/analyze
GET  /api/v1/farms/{farm_id}/analysis/latest
GET  /api/v1/farms/{farm_id}/analysis/history
```

## Risk

```text
GET /api/v1/farms/{farm_id}/risk
```

## Crop Suitability

```text
POST /api/v1/farms/{farm_id}/crop-suitability
GET  /api/v1/farms/{farm_id}/crop-suitability/latest
```

## Recommendations

```text
GET /api/v1/farms/{farm_id}/recommendations
```

## AI Assistant

```text
POST /api/v1/farms/{farm_id}/chat
GET  /api/v1/farms/{farm_id}/conversations
```

## Voice

```text
POST /api/v1/farms/{farm_id}/voice
```

---

# 15. Database Architecture

The database uses PostgreSQL.

PostGIS provides geographic storage and spatial operations.

---

# 16. Core Database Entities

## User

```text
users
-----
id
email
password_hash
created_at
updated_at
```

---

## Farmer

```text
farmers
-------
id
user_id
name
phone
language
created_at
updated_at
```

---

## Farm

```text
farms
-----
id
farmer_id
name
area_acres
latitude
longitude
boundary
irrigation_type
current_crop
season
sowing_date
created_at
updated_at
```

`boundary` uses PostGIS geometry.

---

## Soil

```text
farm_soil
---------
id
farm_id
ph
nitrogen
phosphorus
potassium
organic_carbon
moisture
source
sample_date
created_at
```

`source` examples:

```text
farmer_input
soil_health_card
demo_data
sensor
```

---

# 17. Weather Observation

```text
weather_observations
--------------------
id
farm_id
observed_at
temperature
humidity
rainfall
wind_speed
forecast_horizon
source
created_at
```

---

# 18. Satellite Observation

```text
satellite_observations
----------------------
id
farm_id
observation_date
ndvi
vegetation_health
ndvi_change
cloud_percentage
source
created_at
```

---

# 19. Risk Assessment

```text
risk_assessments
----------------
id
farm_id
crop_stress
soil_risk
climate_risk
water_risk
overall_risk
risk_level
model_version
created_at
```

---

# 20. Crop Suitability

```text
crop_suitability
----------------
id
farm_id
crop
suitability_score
climate_fit
soil_fit
water_requirement
estimated_risk
model_version
created_at
```

---

# 21. Recommendation

```text
recommendations
---------------
id
farm_id
title
description
priority
reason
risk_type
source
created_at
```

---

# 22. Conversation

```text
conversations
-------------
id
farmer_id
farm_id
language
created_at
updated_at
```

```text
conversation_messages
---------------------
id
conversation_id
role
content
audio_url
created_at
```

Roles:

```text
user
assistant
system
```

---

# 23. Satellite Intelligence Architecture

Satellite intelligence is provided as an independent service.

```text
Farm Boundary
      ↓
Satellite Provider
      ↓
Satellite Imagery
      ↓
Cloud Filtering
      ↓
Band Processing
      ↓
NDVI
      ↓
Historical Comparison
      ↓
Vegetation Trend
      ↓
Crop Health Indicator
```

The MVP should focus on NDVI rather than attempting too many remote-sensing features.

---

# 24. NDVI Processing

Conceptual calculation:

```text
NDVI = (NIR - RED) / (NIR + RED)
```

Processing pipeline:

```text
Farm Polygon
      ↓
Select imagery
      ↓
Filter cloud contamination
      ↓
Clip imagery to farm
      ↓
Calculate NDVI
      ↓
Calculate mean / median NDVI
      ↓
Compare against historical baseline
```

Output:

```json
{
  "ndvi": 0.58,
  "ndvi_change_14d": -8.2,
  "vegetation_health": 67,
  "trend": "declining"
}
```

---

# 25. Weather Intelligence Architecture

```text
Farm Coordinates
      ↓
Weather Provider
      ↓
Current Conditions
      ↓
Forecast
      ↓
Historical Comparison
      ↓
Feature Engineering
      ↓
Climate Indicators
```

Potential features:

```text
temperature
rainfall
humidity
rainfall anomaly
temperature anomaly
heavy rainfall risk
heat risk
water stress
```

Output:

```json
{
  "temperature_max": 34,
  "rainfall_72h": 84,
  "humidity": 81,
  "heavy_rain_risk": 0.76,
  "climate_risk": 72
}
```

---

# 26. Soil Intelligence Architecture

```text
Soil Data
   ↓
Validation
   ↓
Crop Requirement Profile
   ↓
Deficiency Detection
   ↓
Soil Health Indicator
   ↓
Soil Risk
```

Example:

```text
Nitrogen = Low
Phosphorus = Medium
Potassium = High
pH = 6.2
```

Output:

```json
{
  "soil_risk": 41,
  "deficiencies": [
    "nitrogen"
  ]
}
```

---

# 27. Risk Engine

The risk engine combines multiple signals.

Conceptual inputs:

```text
Satellite
Weather
Soil
Water
Crop
Growth Stage
```

Example architecture:

```text
                  ┌─────────────┐
                  │  Satellite  │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │   Weather   │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │    Soil     │
                  └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │    Crop     │
                  └──────┬──────┘
                         │
                         ▼
                 Feature Engineering
                         │
                         ▼
                    Risk Model
                         │
                         ▼
                 Farm Risk Index
```

---

# 28. AgroResilience Farm Risk Index

The platform can use an internal composite index.

Example:

```text
Overall Risk =
    30% Climate Risk
  + 25% Crop Stress
  + 20% Water Risk
  + 15% Soil Risk
  + 10% Extreme Weather Risk
```

This weighting is an MVP design decision.

It must not be presented as an internationally standardized agricultural risk index.

Output:

```text
0–30   Low
31–60  Moderate
61–80  High
81–100 Very High
```

These thresholds are also product-level classifications and should be configurable.

---

# 29. Crop Suitability Engine

The crop suitability engine answers:

> "What should I plant?"

Inputs:

```text
Location
Season
Soil
Water availability
Rainfall
Temperature
Humidity
Crop requirements
Climate risk
```

Pipeline:

```text
Farmer Context
      ↓
Feature Engineering
      ↓
Candidate Crops
      ↓
ML Model
      ↓
Suitability Score
      ↓
Risk + Trade-offs
```

Example:

```json
[
  {
    "crop": "Rice",
    "suitability": 82,
    "climate_fit": "High",
    "soil_fit": "High",
    "water_requirement": "High",
    "estimated_risk": "Moderate"
  },
  {
    "crop": "Maize",
    "suitability": 78,
    "climate_fit": "High",
    "soil_fit": "Medium",
    "water_requirement": "Medium",
    "estimated_risk": "Low"
  }
]
```

---

# 30. Machine Learning Layer

The ML layer is independent from the web application.

Recommended structure:

```text
ml/
│
├── datasets/
├── preprocessing/
├── notebooks/
├── training/
├── inference/
├── models/
├── evaluation/
└── README.md
```

Models may include:

```text
1. Crop Suitability Model
2. Farm Risk Model
```

The initial implementation may use Random Forest or another appropriate tabular model.

Every model must track:

```text
model version
features
training dataset
evaluation metrics
date trained
```

---

# 31. ML Inference Contract

The model should not be directly called from React.

Preferred flow:

```text
React
 ↓
FastAPI
 ↓
Risk Service / Crop Service
 ↓
ML Model
 ↓
Prediction
 ↓
FastAPI
 ↓
React
```

Example risk request:

```json
{
  "ndvi": 0.58,
  "ndvi_change_14d": -8.2,
  "rainfall_72h": 84,
  "temperature_max": 34,
  "humidity": 81,
  "soil_moisture": 48,
  "nitrogen": 0,
  "phosphorus": 1,
  "potassium": 2,
  "crop": "rice"
}
```

Example response:

```json
{
  "overall_risk": 68,
  "risk_level": "Moderate"
}
```

---

# 32. Recommendation Engine

The recommendation engine converts intelligence into actions.

Example:

```text
Observed:
Heavy rainfall expected

Observed:
Soil moisture adequate

Observed:
Rice crop

Recommendation:
Delay irrigation
```

The recommendation engine should produce structured recommendations.

Example:

```json
{
  "title": "Review irrigation timing",
  "description": "Rainfall is expected within the next 72 hours.",
  "priority": "high",
  "reason": "Forecast rainfall may provide sufficient water.",
  "risk_type": "water"
}
```

---

# 33. Gemini Architecture

Gemini receives structured intelligence.

The system should not ask Gemini to calculate raw satellite or weather metrics itself.

Preferred flow:

```text
Farm Data
   ↓
Satellite Service
Weather Service
Soil Service
ML Service
   ↓
Structured Farm Intelligence
   ↓
Gemini
   ↓
Natural Language Response
```

Example context:

```json
{
  "farm": {
    "crop": "rice",
    "area": 2.1,
    "location": "Assam"
  },
  "satellite": {
    "ndvi": 0.58,
    "trend": "declining"
  },
  "soil": {
    "nitrogen": "low"
  },
  "weather": {
    "heavy_rain_expected": true
  },
  "risk": {
    "overall": 68
  }
}
```

---

# 34. Gemini Responsibilities

Gemini may handle:

* Natural-language explanations
* Farmer Q&A
* Summarization
* Translation/localization
* Conversational interaction
* Explaining model outputs
* Explaining why a recommendation was generated

Gemini should not invent:

* Soil measurements
* Weather readings
* Satellite measurements
* Crop conditions
* Model results
* Farm size
* Farmer information

---

# 35. AI Response Safety

The AI assistant should follow these principles:

```text
Use provided data only
↓
Explain uncertainty
↓
Avoid inventing measurements
↓
Do not claim certainty when data is insufficient
↓
Recommend verification for important agricultural decisions
```

For example:

```text
"Irrigation can likely be delayed based on the current
forecast and soil-moisture estimate. Recheck field
conditions if rainfall changes."
```

rather than:

```text
"Do not irrigate for exactly 3 days."
```

unless such a recommendation is supported by the system's validated logic.

---

# 36. Voice Architecture

Voice support is designed as:

```text
Farmer speaks
      ↓
Audio capture
      ↓
Speech-to-Text
      ↓
Language detection
      ↓
Farm context
      ↓
Intelligence context
      ↓
Gemini
      ↓
Localized response
      ↓
Text-to-Speech
      ↓
Audio playback
```

Voice is an interface over the same underlying intelligence.

It should not create a separate decision system.

---

# 37. Multilingual Architecture

Language should be stored at the farmer level.

Example:

```text
language = "as"
```

The language layer should be independent of agricultural logic.

```text
Agricultural Intelligence
        ↓
Language-neutral structured response
        ↓
Localization
        ↓
English / Hindi / Assamese / ...
```

This makes it easier to expand across Indian states.

---

# 38. External Provider Architecture

External providers must be abstracted.

Example:

```text
SatelliteProvider
    ├── EarthEngineSatelliteProvider
    └── DemoSatelliteProvider

WeatherProvider
    ├── IMDWeatherProvider
    └── DemoWeatherProvider

SoilProvider
    ├── SoilHealthProvider
    └── DemoSoilProvider
```

The system can switch providers without rewriting the rest of the application.

---

# 39. Provider Configuration

Example:

```env
SATELLITE_PROVIDER=demo
WEATHER_PROVIDER=demo
SOIL_PROVIDER=demo
AI_PROVIDER=gemini
```

For the real environment:

```env
SATELLITE_PROVIDER=earth_engine
WEATHER_PROVIDER=imd
SOIL_PROVIDER=soil_health
AI_PROVIDER=gemini
```

---

# 40. Development Mode

The MVP must remain usable if external APIs are unavailable.

Therefore the application should support:

```text
DEMO MODE
```

Demo mode provides realistic structured sample data.

The UI should not misrepresent demo data as live data.

Example label:

```text
Demo farm data
```

or:

```text
Development data
```

---

# 41. Farm Analysis Orchestration

The main analysis endpoint is:

```text
POST /api/v1/farms/{farm_id}/analyze
```

The backend orchestrates:

```text
1. Load farm
2. Validate farm geometry
3. Load crop data
4. Load soil data
5. Retrieve weather
6. Retrieve satellite information
7. Generate features
8. Run risk model
9. Run crop suitability model
10. Generate recommendations
11. Persist results
12. Return aggregated response
```

---

# 42. Aggregated Analysis Response

Example:

```json
{
  "farm": {
    "id": "farm_001",
    "name": "Rahim Farm",
    "area_acres": 2.1,
    "crop": "rice"
  },

  "satellite": {
    "ndvi": 0.58,
    "ndvi_change_14d": -8.2,
    "vegetation_health": 67,
    "trend": "declining"
  },

  "soil": {
    "ph": 6.2,
    "nitrogen": "low",
    "phosphorus": "medium",
    "potassium": "high",
    "soil_risk": 41
  },

  "weather": {
    "temperature_max": 34,
    "rainfall_72h": 84,
    "humidity": 81,
    "climate_risk": 72
  },

  "risk": {
    "crop_stress": 63,
    "water_risk": 61,
    "overall_risk": 68,
    "risk_level": "Moderate"
  },

  "crop_suitability": [],

  "recommendations": []
}
```

---

# 43. Frontend Data Flow

```text
Dashboard Page
      ↓
useFarm()
      ↓
GET /farms/{id}
      ↓
GET /analysis/latest
      ↓
Render:
  - health metrics
  - risk
  - weather
  - satellite
  - soil
  - recommendations
```

The frontend should not calculate agricultural scores itself.

---

# 44. Dashboard Architecture

The dashboard is divided into:

```text
Farm Header
      ↓
Farm Risk Summary
      ↓
Health Metrics
      ↓
Satellite Trend
      ↓
Weather Intelligence
      ↓
Soil Intelligence
      ↓
Main Risk Factors
      ↓
Recommended Actions
      ↓
Crop Suitability
      ↓
AI Assistant
```

---

# 45. Dashboard Example

```text
────────────────────────────────────────
             FARM INTELLIGENCE
────────────────────────────────────────

Rice
2.1 acres
Assam

Crop Health       67%
Soil Health       58%
Climate Risk      72%
Water Risk        61%

────────────────────────────────────────

        OVERALL FARM RISK

              68 / 100
                MODERATE

────────────────────────────────────────

MAIN RISK FACTORS

• Rainfall variability
• Elevated temperature
• Declining vegetation
• Soil nutrient limitation

────────────────────────────────────────

NEXT ACTIONS

Review irrigation timing
Inspect drainage
Monitor vegetation
Review nitrogen availability
────────────────────────────────────────
```

---

# 46. Authentication Flow

```text
User
 ↓
Register
 ↓
Password hashing
 ↓
Database
 ↓
Login
 ↓
JWT
 ↓
Frontend stores session/token securely
 ↓
Protected API requests
```

The backend validates JWT on protected endpoints.

Farm resources must always be checked against the authenticated farmer.

Example:

```text
User A
 ↓
GET /farms/B
 ↓
403 Forbidden
```

---

# 47. Security Architecture

Minimum security controls:

```text
HTTPS
JWT authentication
Password hashing
Input validation
CORS configuration
Environment variables
No secrets in Git
Protected API routes
Resource ownership checks
Safe error responses
```

Environment example:

```env
DATABASE_URL=
JWT_SECRET=
GEMINI_API_KEY=
EARTH_ENGINE_PROJECT=
WEATHER_API_KEY=
```

`.env` must never be committed.

Commit:

```text
.env.example
```

instead.

---

# 48. Error Handling

All external services may fail.

Example:

```text
Satellite unavailable
        ↓
Return provider error
        ↓
Dashboard:
"Satellite analysis temporarily unavailable."
        ↓
Retry
```

The backend should distinguish:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
422 Validation Error
429 Rate Limited
500 Internal Server Error
502 External Provider Error
503 Service Unavailable
```

---

# 49. Caching Strategy

External data should not be unnecessarily requested repeatedly.

Potential caching:

```text
Weather:
short-term cache

Satellite:
cache by farm + observation date

Soil:
cache until new soil sample

ML:
cache by analysis input/version
```

This helps reduce API usage and improves performance.

---

# 50. Asynchronous Analysis

Satellite analysis and other external operations may take time.

The system should support:

```text
POST /analyze
      ↓
analysis_id
      ↓
processing
      ↓
frontend polling/status
      ↓
completed
      ↓
dashboard
```

Example status:

```text
QUEUED
PROCESSING
COMPLETED
FAILED
```

For a simple hackathon MVP, synchronous processing is acceptable when response times are manageable, but the architecture should remain compatible with asynchronous processing.

---

# 51. Observability

The application should log:

```text
request ID
user ID
farm ID
endpoint
provider
duration
status
error
```

Never log:

```text
password
JWT
API key
secret
```

For ML requests, log model version and request metadata without leaking sensitive information.

---

# 52. Deployment Architecture

Recommended structure:

```text
                 INTERNET
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
     React/Vercel        FastAPI/Cloud Run
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
           PostgreSQL     Gemini API    External Data
             + PostGIS                    Providers
```

Possible deployment:

```text
Frontend → Vercel
Backend  → Google Cloud Run
Database → Managed PostgreSQL
```

The exact hosting provider can be changed without changing the application architecture.

---

# 53. Environment Separation

Three environments are recommended:

```text
Development
Staging
Production
```

For the hackathon:

```text
Development
Production
```

may be sufficient.

Each environment should use separate configuration.

---

# 54. API Versioning

Use:

```text
/api/v1/
```

Example:

```text
/api/v1/farms
/api/v1/farms/{farm_id}/analysis
```

Future versions can use:

```text
/api/v2/
```

without breaking the existing client.

---

# 55. AI/ML Integration Boundary

The full-stack and AI/ML components must communicate through explicit contracts.

```text
                 FULL-STACK
                    │
                    │ API / service contract
                    ▼
              INTELLIGENCE
                    │
           ┌────────┼────────┐
           ▼        ▼        ▼
       Satellite  Weather   Soil
                    │
                    ▼
                   ML
```

The AI/ML teammate should be able to replace:

```text
demo_risk_model
```

with:

```text
real_risk_model
```

without modifying the React application.

---

# 56. Responsibility Boundary

## Full-Stack / Platform

Responsible for:

```text
Frontend
Backend
Authentication
Database
PostGIS
Maps
API layer
Application orchestration
Dashboard
Voice UI
Gemini endpoint integration
Deployment
```

## AI/ML / Intelligence

Responsible for:

```text
Satellite processing
Weather feature engineering
Soil analysis
Risk model
Crop suitability model
Recommendation logic
Gemini reasoning/prompt layer
Voice intelligence
Model evaluation
```

---

# 57. Complete End-to-End Flow

The complete product flow is:

```text
                    FARMER
                       │
                       ▼
                Create Account
                       │
                       ▼
                  Create Farm
                       │
                       ▼
               Draw Farm Polygon
                       │
                       ▼
              Enter Farm Context
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Satellite      Soil       Weather
          │            │            │
          └────────────┼────────────┘
                       ▼
                Feature Engineering
                       │
                       ▼
                  ML Analysis
                 ┌─────┴─────┐
                 ▼           ▼
              Risk       Suitability
                 │           │
                 └─────┬─────┘
                       ▼
                 Recommendations
                       │
                       ▼
              Structured Intelligence
                       │
                       ▼
                     Gemini
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
       Dashboard                 Voice Q&A
          │                         │
          └────────────┬────────────┘
                       ▼
                     FARMER
```

---

# 58. Data Flow for "Analyze My Farm"

```text
User clicks:
"Analyze My Farm"

       ↓

Frontend:
POST /farms/{id}/analyze

       ↓

FastAPI:
Validate authentication
Validate farm
Validate crop
Validate coordinates

       ↓

Satellite Service:
Retrieve imagery
Calculate NDVI

       ↓

Weather Service:
Retrieve forecast
Calculate climate features

       ↓

Soil Service:
Retrieve soil profile
Calculate soil indicators

       ↓

Feature Engineering

       ↓

Risk Model

       ↓

Crop Suitability Model

       ↓

Recommendation Engine

       ↓

Persist Results

       ↓

Return Aggregated Response

       ↓

React Dashboard

       ↓

Farmer understands:
"What is happening?"

and:

"What should I do?"
```

---

# 59. Data Lineage

Every important intelligence value should ideally have a source.

Example:

```json
{
  "ndvi": {
    "value": 0.58,
    "source": "satellite",
    "provider": "earth_engine",
    "observation_date": "..."
  }
}
```

Similarly:

```json
{
  "rainfall_72h": {
    "value": 84,
    "source": "weather",
    "provider": "imd"
  }
}
```

This improves explainability and debugging.

---

# 60. Explainability

The farmer should not only see:

```text
Risk = 68
```

The system should explain:

```text
Why?

1. Rainfall variability detected
2. Vegetation trend is declining
3. Elevated temperature forecast
4. Potential nutrient limitation
```

This explanation should be derived from actual features.

---

# 61. UI Information Hierarchy

The interface should prioritize:

```text
1. What is happening?
2. Why is it happening?
3. What should I do?
4. What data supports this?
5. Ask AI for more information
```

Avoid overwhelming users with raw agricultural metrics.

---

# 62. Mobile-First Farmer Experience

The system is primarily a web application but must work well on smartphones.

Mobile priorities:

```text
Large buttons
Simple forms
Readable numbers
Minimal navigation
Voice access
Clear warnings
Short recommendations
Map usability
```

The dashboard should prioritize the most important information above the fold.

---

# 63. India-First Architecture

The MVP should be designed around Indian users.

Examples:

```text
Country
 ↓
State
 ↓
District
 ↓
Farm
```

The system must not hardcode:

```text
Assam
```

throughout the application.

Instead:

```text
country = IN
state = AS
district = ...
```

Assam is the demonstration dataset, not the architectural limit.

---

# 64. Multi-Country Extensibility

Future architecture:

```text
Country Configuration
        ↓
Language
        ↓
Crop Database
        ↓
Weather Provider
        ↓
Soil Standard
        ↓
Agricultural Rules
```

Example:

```text
India
 ├── IMD
 ├── Soil Health Card
 ├── Hindi / Assamese / ...
 └── Indian crops

Brazil
 ├── Local weather source
 ├── Local soil standard
 ├── Portuguese
 └── Brazilian crops
```

The common intelligence platform remains the same.

---

# 65. BRICS Expansion Concept

A future cross-border layer could aggregate:

```text
Region
Crop
Climate Signal
Observed Stress
Response
Outcome
```

This could enable:

```text
Cross-region agricultural patterns
Climate resilience comparisons
Knowledge sharing
Research datasets
Policy support
```

However, this is a future architecture capability and not required for the MVP.

---

# 66. Future Architecture

Future modules may include:

```text
IoT Soil Sensors
        ↓
Real-Time Soil Data

Drone Imagery
        ↓
High-Resolution Farm Monitoring

Disease Detection
        ↓
Computer Vision

Yield Prediction
        ↓
Harvest Forecast

Market Intelligence
        ↓
Price Forecast

Government Services
        ↓
Scheme / Subsidy Information
```

These should integrate through the same service architecture.

---

# 67. Scalability Strategy

The architecture should scale horizontally.

Frontend:

```text
CDN
+
Static hosting
```

Backend:

```text
Containerized FastAPI
+
Horizontal replicas
```

Database:

```text
Managed PostgreSQL
+
Connection pooling
+
Indexes
```

ML:

```text
Independent inference service
```

Long-running jobs:

```text
Queue
+
Background workers
```

---

# 68. Performance Priorities

Target:

```text
Fast page loading
Fast farmer onboarding
Fast dashboard rendering
Cached external data
Asynchronous heavy analysis
Optimized map data
Lazy-loaded charts
```

Do not block the entire interface while a slow satellite request is running.

---

# 69. Testing Architecture

Testing layers:

```text
Frontend
 ├── Component tests
 └── UI flow tests

Backend
 ├── Unit tests
 ├── API tests
 └── Integration tests

ML
 ├── Data validation
 ├── Model evaluation
 └── Inference tests

End-to-End
 └── Farmer workflow
```

Critical E2E flow:

```text
Register
 → Login
 → Create Farm
 → Draw Boundary
 → Enter Soil/Crop
 → Analyze
 → View Risk
 → View Crop Suitability
 → Ask AI
```

---

# 70. Model Versioning

Every prediction should identify its model version.

Example:

```text
risk_model_version = "risk-v1"
crop_model_version = "crop-v1"
```

When a model changes:

```text
risk-v2
```

This enables comparison and debugging.

---

# 71. Data Quality

Each data source should have metadata:

```text
source
timestamp
coverage
confidence
provider
```

Example:

```json
{
  "source": "satellite",
  "provider": "earth_engine",
  "observation_date": "...",
  "confidence": "medium"
}
```

This becomes important because agricultural decisions depend on data quality.

---

# 72. Confidence and Uncertainty

The platform should distinguish:

```text
High confidence
Medium confidence
Low confidence
```

Confidence can depend on:

```text
Data availability
Recency
Cloud cover
Soil-data age
Model confidence
Forecast uncertainty
```

Example:

```text
Crop Health: 67

Confidence: Medium

Reason:
Recent satellite coverage contains limited
usable observations.
```

---

# 73. Logging and Monitoring

Monitor:

```text
API latency
API errors
External provider failures
ML inference failures
Gemini failures
Analysis completion rate
Voice failures
Database errors
```

For a hackathon, lightweight logging is sufficient.

---

# 74. Project Directory

Final recommended repository:

```text
AgroResilience/
│
├── frontend/
│
├── backend/
│
├── ml/
│
├── demo-data/
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── ai.md
│   ├── data-sources.md
│   ├── integration.md
│   └── deployment.md
│
├── .gitignore
├── README.md
└── LICENSE
```

---

# 75. MVP Definition of Done

The architecture is successfully implemented when:

```text
✓ Farmer can register
✓ Farmer can login
✓ Farmer can create farm
✓ Farmer can draw farm boundary
✓ Farm geometry is stored
✓ Crop information is stored
✓ Soil data is stored
✓ Weather data can be loaded
✓ Satellite service can be called
✓ NDVI result can be displayed
✓ Risk engine can produce a score
✓ Crop suitability can be displayed
✓ Recommendations can be displayed
✓ Gemini can explain results
✓ Farmer can ask questions
✓ Voice architecture is integrated
✓ English/Hindi/Assamese are supported or structured
✓ Demo mode works
✓ Production configuration exists
✓ Application is deployed
```

---

# 76. Final Architecture Summary

AgroResilience is not designed as:

```text
Farmer
  ↓
Chatbot
  ↓
Advice
```

It is designed as:

```text
                  FARMER
                     │
                     ▼
             FARM CONTEXT
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
      SATELLITE     SOIL     WEATHER
          │          │          │
          └──────────┼──────────┘
                     ▼
              FEATURE ENGINE
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
      RISK MODEL          CROP MODEL
          │                     │
          └──────────┬──────────┘
                     ▼
            RECOMMENDATION ENGINE
                     │
                     ▼
              STRUCTURED DATA
                     │
                     ▼
                 GEMINI AI
                     │
             ┌───────┴────────┐
             ▼                ▼
         DASHBOARD          VOICE
             │                │
             └───────┬────────┘
                     ▼
                  FARMER
```

The core architecture therefore separates:

**Data → Intelligence → Decision → Explanation → Interaction**

This separation makes AgroResilience easier to develop, test, explain, and scale.

---

# 77. Architecture Principle to Remember

The most important sentence in the entire project is:

> **AgroResilience does not use AI to guess what happens on a farm. It combines farm, environmental and climate evidence to generate structured intelligence, then uses AI to explain that intelligence to the farmer.**

That is the foundation of the platform.
