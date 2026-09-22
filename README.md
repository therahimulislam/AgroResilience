# 🌾 AgroResilience

> **AI-Powered Climate-Resilient Farming Platform for India**

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/Database-PostGIS-336791?logo=postgresql)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)

AgroResilience is a full-stack, intelligence-driven platform designed to empower farmers with real-time, actionable insights. By fusing satellite imagery (NDVI), local weather forecasts, soil science, and Google's powerful Gemini AI, AgroResilience transforms complex agronomic data into conversational, actionable guidance available in multiple regional languages.

---

## ✨ Features

- 🗺️ **Interactive Farm Mapping:** Draw farm boundaries directly on a high-performance Mapbox/MapLibre interface. PostGIS stores and queries farm geometries natively.
- 📡 **Multi-Provider Intelligence Pipeline:** A unified architecture aggregating mock (or real) data from Satellite (Vegetation Health), Weather, and Soil APIs.
- 📊 **Dynamic Risk & Health Dashboards:** Visual ring gauges and trend charts (built with Recharts) breaking down Climate Risk, Water Risk, and Soil Health.
- 🌱 **Crop Suitability Engine:** Automated matching of current field conditions to optimal crop profiles.
- 🤖 **Gemini AI Farm Assistant (Chat & Voice):** A farm-grounded AI assistant that knows your farm's exact stats. Ask questions via text or **Voice (Web Speech API)** and get localized answers (English, Hindi, Bengali, Assamese) via TTS.
- 🔐 **Robust Security:** Full JWT-based authentication and separated farmer data boundaries.

---

## 🏗️ Technology Stack

### **Frontend**
- React 18 (Vite)
- Tailwind CSS (Premium, spacious design system)
- MapLibre GL JS + Mapbox Draw (WebGIS integration)
- Recharts (Data visualization)
- Lucide React (Iconography)

### **Backend**
- Python 3.12 + FastAPI (High performance, async)
- SQLAlchemy 2.0 (Async ORM)
- Pydantic v2 (Data validation & serialization)
- Google GenAI SDK (Gemini 2.0 Flash integration)

### **Database & Infrastructure**
- PostgreSQL 16 + PostGIS (Geospatial data)
- Alembic (Database migrations)
- Docker (Containerized deployment)

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- Python 3.12+
- PostgreSQL with PostGIS extension enabled

### 1. Database Setup
Ensure you have a local PostgreSQL database running with the PostGIS extension installed.
```sql
CREATE DATABASE agroresilience;
\c agroresilience
CREATE EXTENSION postgis;
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and GEMINI_API_KEY

# Start the server (runs on http://localhost:8000)
uvicorn app.main:app --reload
```
*API Documentation available at: [http://localhost:8000/docs](http://localhost:8000/docs)*

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Environment variables
cp .env.example .env
# Ensure VITE_API_URL is set to http://localhost:8000/api/v1

# Start the dev server
npm run dev
```

---

## 📚 Project Architecture

The system is built on a strictly layered architecture separating the Core Platform from the Intelligence/ML Providers. 

For an in-depth dive into the system design, data flows, and architectural decisions, please read our comprehensive **[Architecture Documentation (docs/architecture.md)](docs/architecture.md)**.

---

## 🗺️ Key API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register farmer |
| `POST` | `/api/v1/auth/login` | Login (get JWT) |
| `POST` | `/api/v1/farms` | Create a farm (Polygon GeoJSON) |
| `POST` | `/api/v1/farms/{id}/analyze` | Orchestrates all intelligence providers |
| `POST` | `/api/v1/farms/{id}/chat` | Text chat grounded in farm context |
| `POST` | `/api/v1/farms/{id}/voice` | Multilingual STT/TTS Gemini query |

---

## ☁️ Deployment

- **Frontend:** Optimized for Vercel/Netlify deployment.
- **Backend:** A `Dockerfile` is provided in the `/backend` directory, optimized for Google Cloud Run or AWS ECS.
- **Database:** Requires a Managed PostgreSQL instance with PostGIS support (e.g., Supabase, Neon, AWS RDS).

---

*Built for the future of resilient agriculture.* 🌾
