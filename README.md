# Cloud-Based Student Performance Prediction & Early Warning System

A full-stack, enterprise-grade cloud architecture for tracking academic trajectories, predicting student performance, generating early warning alerts, and providing explainable ML insights with SHAP.

---

## Architecture Overview

```
├── docker-compose.yml              # Multi-container orchestration (PostgreSQL + FastAPI)
├── .gitignore                      # Git ignore configuration
├── database/                       # Database initialization
│   └── init.sql                    # Initial SQL schema for students, metrics & alerts
├── backend/                        # Python / FastAPI Workspace
│   ├── Dockerfile                  # Container definition for backend
│   ├── requirements.txt            # Python dependencies (FastAPI, SQLAlchemy, Scikit-learn, SHAP, etc.)
│   ├── .env.example                # Example environment variables
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry with CORS & Health Check
│   │   └── api/
│   │       └── v1/
│   │           └── .gitkeep        # API route handlers
│   └── ml_models/
│       └── .gitkeep                # Serialized model artifacts (.pkl, .joblib)
└── frontend/                       # React / Vite Workspace
    ├── package.json                # Frontend dependencies (React, Vite, Tailwind, Axios, Lucide, Recharts)
    ├── vite.config.js              # Vite server & proxy configuration
    ├── tailwind.config.js          # Tailwind CSS theme configuration
    ├── postcss.config.js           # PostCSS configuration
    ├── index.html                  # HTML entrypoint
    └── src/
        ├── main.jsx                # React root mount
        ├── App.jsx                 # Dashboard interface
        ├── index.css               # Tailwind directives and styling
        ├── components/
        │   └── .gitkeep            # Reusable UI widgets
        └── pages/
            └── .gitkeep            # Page-level route views
```

---

## Quickstart

### 1. Run with Docker Compose
```bash
docker-compose up --build
```
- **FastAPI API & Docs**: `http://localhost:8000/docs`
- **PostgreSQL**: `localhost:5432`

### 2. Run Backend Locally
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```
- **Frontend App**: `http://localhost:3000`
