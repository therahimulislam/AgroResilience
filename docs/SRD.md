AgroResilience

Software Requirements Specification (SRS)

Version: 1.0
Status: Hackathon MVP
Product Type: AI-powered climate-resilient farming web platform
Primary Market: India
Initial Demonstration Region: Assam, India
Prepared For: AgroResilience Team

1. Purpose

AgroResilience is a web-based agricultural intelligence platform that combines farmer-provided information with satellite-derived vegetation indicators, soil information, weather/climate signals, predictive models, and Google Gemini to produce localized, explainable farming guidance.

The system is designed around the principle that farm decisions should consider current environmental conditions alongside crop, soil, location, season, and water availability rather than relying only on historical practice.

This SRS defines the functional requirements, non-functional requirements, system boundaries, users, data requirements, interfaces, constraints, and acceptance criteria for the hackathon MVP.

2. Scope

2.1 In Scope

Farmer account registration and authentication

Farmer profile and preferred language

Farm creation and editing

Map-based farm location selection

Farm boundary drawing and area calculation

Crop, season, sowing-date and irrigation information

Soil data entry and structured soil records

Satellite intelligence integration through a provider abstraction

NDVI and vegetation trend analysis

Weather/forecast integration through a provider abstraction

Soil deficiency/risk analysis

Farm risk assessment

Crop suitability analysis

Action-oriented recommendations

Google Gemini-based explanations and farmer Q&A

Multilingual interaction architecture

Voice interaction architecture

Development/demo data providers

Dashboard visualization

Deployment-ready configuration

2.2 Out of Scope for MVP

Automated farm machinery control

IoT hardware management

Drone fleet management

End-to-end crop disease diagnosis

Agricultural marketplace and payment processing

Insurance underwriting

Credit underwriting

Nationwide government operations dashboard

Fully autonomous agronomic decision-making

3. Product Objectives

Provide a single farm-level view of climate, soil, crop and vegetation signals.

Translate raw environmental data into understandable indicators.

Provide a transparent farm-risk estimate with contributing factors.

Help farmers compare crop suitability and associated trade-offs.

Make complex data accessible through simple language and voice.

Demonstrate a real, deployable India-first AI application suitable for hackathon evaluation.

4. Stakeholders and Users

4.1 Farmer

Primary end user. Creates a farm profile, views intelligence, asks questions, and reviews recommended actions.

4.2 AI/ML Engineer

Owns data processing, feature engineering, model inference, recommendation logic, and AI prompts.

4.3 Full-Stack Engineer

Owns web application, APIs, database, maps, authentication, integration, deployment and product UI.

4.4 Hackathon Judge / Evaluator

Evaluates the product through the deployed application, source repository, pitch deck, and demonstration video.

5. User Journeys

Journey A: First Farm Analysis

Farmer opens the application.

Farmer creates an account.

Farmer enters preferred language.

Farmer creates a farm.

Farmer selects a location and draws the farm boundary.

Farmer enters crop, season, irrigation and soil information.

Farmer starts analysis.

System retrieves available environmental data.

Intelligence services calculate indicators and model outputs.

Dashboard displays farm health, risk, crop suitability and actions.

Journey B: Ask the Farm Assistant

Farmer opens the assistant from a farm dashboard.

Farmer asks a question by text or voice.

System retrieves the selected farm context and latest analysis.

Gemini generates an explanation based on structured system outputs.

System returns a localized answer.

Journey C: Crop Selection

Farmer chooses season and irrigation context.

System uses soil, climate, location and crop requirements.

Suitability model evaluates candidate crops.

UI displays suitability and trade-offs.

6. Functional Requirements

6.1 Authentication

FR-AUTH-001 The system shall allow a new user to register with a valid email and password.
FR-AUTH-002 The system shall securely hash passwords before storage.
FR-AUTH-003 The system shall authenticate users using a token/session mechanism.
FR-AUTH-004 Protected farm data shall only be accessible to the owning farmer.
FR-AUTH-005 The system shall expose a current-user endpoint.

6.2 Farmer Profile

FR-PROF-001 The farmer shall be able to maintain name and preferred language.
FR-PROF-002 The selected language shall be retained for future interactions.
FR-PROF-003 The system shall support at minimum English, Hindi and an Assamese-ready localization architecture for the MVP.

6.3 Farm Management

FR-FARM-001 The farmer shall create a farm.
FR-FARM-002 The system shall store farm area.
FR-FARM-003 The system shall store farm latitude and longitude.
FR-FARM-004 The system shall store a farm boundary as a geospatial polygon.
FR-FARM-005 The farmer shall edit farm information.
FR-FARM-006 The farmer shall delete a farm.
FR-FARM-007 The system shall associate a farm with exactly one owning farmer.

6.4 Crop and Farm Context

FR-CROP-001 The farmer shall record the current crop or intended crop.
FR-CROP-002 The farmer shall record season.
FR-CROP-003 The farmer shall optionally record sowing date.
FR-CROP-004 The farmer shall record irrigation availability/type.

6.5 Soil Data

FR-SOIL-001 The system shall support pH, nitrogen, phosphorus, potassium, organic carbon and moisture fields.
FR-SOIL-002 Soil data shall record a source such as farmer input, soil card, sensor, or demo data.
FR-SOIL-003 The system shall validate numeric ranges.
FR-SOIL-004 The system shall expose structured soil information to the analysis pipeline.

6.6 Satellite Intelligence

FR-SAT-001 The system shall accept a farm polygon as input to satellite analysis.
FR-SAT-002 The satellite service shall support a real provider adapter and a development/demo adapter.
FR-SAT-003 The system shall support NDVI as a primary vegetation indicator.
FR-SAT-004 The system shall support a recent-vs-baseline or time-series vegetation trend where source data permits.
FR-SAT-005 Satellite observations shall store observation date and provider metadata.

6.7 Weather Intelligence

FR-WX-001 The system shall retrieve weather/forecast data for a farm location using a provider adapter.
FR-WX-002 Weather data shall support temperature, rainfall and humidity at minimum.
FR-WX-003 The system shall support derived signals such as rainfall anomaly, heat risk and heavy-rain risk where data permits.
FR-WX-004 Weather observations shall store source and timestamp.

6.8 Risk Analysis

FR-RISK-001 The system shall calculate crop stress, soil risk, climate risk and water risk indicators.
FR-RISK-002 The system shall produce an overall AgroResilience Farm Risk Index from 0 to 100.
FR-RISK-003 The system shall classify risk into configurable categories.
FR-RISK-004 The UI shall display contributing risk factors.
FR-RISK-005 Risk results shall include model/version metadata.

6.9 Crop Suitability

FR-SUIT-001 The system shall accept farm context for crop evaluation.
FR-SUIT-002 The system shall evaluate multiple candidate crops.
FR-SUIT-003 The output shall include suitability score and trade-off attributes.
FR-SUIT-004 The system shall show water requirement and estimated risk when available.
FR-SUIT-005 The model version shall be recorded.

6.10 Recommendations

FR-REC-001 The recommendation layer shall generate structured next actions.
FR-REC-002 Each recommendation shall contain a reason.
FR-REC-003 Recommendations shall support priority levels.
FR-REC-004 Recommendations shall be traceable to one or more risk/data factors.

6.11 Google Gemini Assistant

FR-AI-001 The system shall integrate Google Gemini on the server side.
FR-AI-002 The assistant shall receive structured farm intelligence rather than relying only on raw user text.
FR-AI-003 The assistant shall support farm-specific questions.
FR-AI-004 The assistant shall avoid inventing unavailable measurements.
FR-AI-005 The assistant shall communicate uncertainty where appropriate.
FR-AI-006 The assistant shall return a language appropriate to the farmer preference.

6.12 Voice

FR-VOICE-001 The UI shall provide a microphone action.
FR-VOICE-002 The voice pipeline shall support speech-to-text, AI response and text-to-speech through pluggable services.
FR-VOICE-003 Voice requests shall inherit farm context from the active farm.

6.13 Dashboard

FR-DASH-001 The dashboard shall show crop health, soil health, climate risk, water risk and overall risk.
FR-DASH-002 The dashboard shall show at least one vegetation trend visualization.
FR-DASH-003 The dashboard shall show main risk factors.
FR-DASH-004 The dashboard shall show recommended actions.
FR-DASH-005 The dashboard shall allow the farmer to open the AI assistant.

7. Non-Functional Requirements

7.1 Usability

NFR-USE-001 Primary workflows shall be usable on desktop and mobile browsers.
NFR-USE-002 High-priority farmer actions shall use simple language.
NFR-USE-003 The interface shall clearly distinguish current conditions, risk estimates, and recommendations.

7.2 Performance

NFR-PERF-001 Standard CRUD API requests should normally complete within 2 seconds under hackathon-scale load, excluding external provider latency.
NFR-PERF-002 Long-running analysis shall support visible progress/status.
NFR-PERF-003 Repeated provider requests should use caching where appropriate.

7.3 Security

NFR-SEC-001 Passwords shall never be stored in plaintext.
NFR-SEC-002 Secrets shall be stored in environment configuration.
NFR-SEC-003 Farm resources shall enforce owner authorization.
NFR-SEC-004 API responses shall not expose internal stack traces to users.
NFR-SEC-005 Production traffic shall use HTTPS.

7.4 Reliability

NFR-REL-001 Provider failures shall not crash the entire dashboard.
NFR-REL-002 Failed external calls shall return meaningful status to the UI.
NFR-REL-003 Demo mode shall allow the core user journey to function without live providers.

7.5 Maintainability

NFR-MAINT-001 External data providers shall use adapter interfaces.
NFR-MAINT-002 ML inference shall be separated from UI logic.
NFR-MAINT-003 API contracts shall be versioned under /api/v1.
NFR-MAINT-004 Significant model and data transformations shall be documented.

8. Data Requirements

The core entities are:

users

farmers

farms

farm_soil

farm_crops

weather_observations

satellite_observations

risk_assessments

crop_suitability

recommendations

conversations

conversation_messages

Each intelligence record should retain source, timestamp and model/provider version where applicable.

9. System Interfaces

9.1 Browser to Backend

Protocol: HTTPS
Format: JSON for standard APIs
Authentication: JWT/session mechanism
Versioning: /api/v1

9.2 Backend to Database

Database: PostgreSQL
Spatial extension: PostGIS
ORM: SQLAlchemy
Migrations: Alembic

9.3 Backend to AI/ML Services

Preferred interface: Python service adapters or internal HTTP service contracts.

9.4 Backend to External Providers

Provider adapters shall isolate vendor-specific authentication, request formats, rate limits and response mapping.

10. Core Business Rules

A farm must belong to one farmer.

An analysis must reference a specific farm and analysis timestamp.

Risk scores are estimates produced by the AgroResilience model and shall not be presented as certified agricultural standards.

AI explanations must be grounded in available structured system data.

Missing data must be represented explicitly.

Demo data must be distinguishable from live/provider data.

Recommendations should be actionable and evidence-linked.

11. Acceptance Criteria

The MVP is accepted when a test user can complete the following without manual backend intervention:

Register/login

Create a farm

Draw and save a farm boundary

Enter crop/soil/farm context

Trigger an analysis

View satellite/vegetation output

View weather output

View soil output

View Farm Risk Index

View crop suitability results

View recommendations

Ask the farm assistant

Complete the main flow on a supported mobile screen

12. Constraints

Hackathon time and team size are limited.

Some providers may have quota, authentication or latency constraints.

Satellite and weather availability may vary by location/date.

Soil data may depend on farmer-provided or reference datasets.

Model quality is limited by available training data.

The MVP is decision support, not a replacement for agronomists or local agricultural services.

13. Assumptions

Farmers can provide at least location, area, crop and basic context.

A farm polygon can be created from a browser map.

Satellite imagery can be accessed through a supported provider.

Weather information is available for the selected location.

The project can use realistic development data when live data is unavailable.

14. Future Enhancements

IoT soil sensors

Disease detection using computer vision

Yield prediction

Market-price intelligence

Government-scheme integrations

Crop insurance support

Farm-level anomaly alerts

Cross-region agricultural knowledge sharing

Additional Indian languages

Expansion to other countries/BRICS contexts