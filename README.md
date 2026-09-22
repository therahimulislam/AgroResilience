# AgroResilience

> AI-powered climate-resilient farming platform for India.

## Quick Start

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in your values
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env          # set VITE_API_URL
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL + PostGIS connection string | `postgresql+asyncpg://...` |
| `SECRET_KEY` | JWT signing secret | — |
| `PROVIDER_MODE` | `demo` or `real` | `demo` |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `VITE_API_URL` | Frontend → backend URL | `http://localhost:8000/api/v1` |

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full system design.

## API Docs

Start the backend and visit: `http://localhost:8000/docs`

## Key Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register farmer |
| `POST` | `/api/v1/auth/login` | Login (get JWT) |
| `GET` | `/api/v1/farms` | List my farms |
| `POST` | `/api/v1/farms` | Create farm |
| `POST` | `/api/v1/farms/{id}/analyze` | Full farm analysis |
| `POST` | `/api/v1/farms/{id}/chat` | Gemini AI chat |
| `POST` | `/api/v1/farms/{id}/voice` | Voice query |
| `GET` | `/api/v1/farms/{id}/satellite` | Satellite data |
| `GET` | `/api/v1/farms/{id}/weather` | Weather data |
| `GET` | `/api/v1/farms/{id}/soil` | Soil data |
| `GET` | `/api/v1/farms/{id}/risk` | Risk score |
| `GET` | `/api/v1/farms/{id}/crops` | Crop suitability |
| `GET` | `/api/v1/farms/{id}/recommendations` | Recommendations |

## Deployment

- **Frontend** → Vercel
- **Backend** → Google Cloud Run (see `backend/Dockerfile`)
- **Database** → Managed PostgreSQL with PostGIS extension
