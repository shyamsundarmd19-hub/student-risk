# StudentRisk - Cloud-Based Student Performance Prediction & Early Warning System

A full-stack, enterprise-grade cloud architecture for tracking academic trajectories, predicting student performance, generating early warning alerts, and providing explainable ML insights with SHAP. Built with **FastAPI (Python 3.10+)**, **React (Vite + Tailwind CSS)**, **PostgreSQL / SQLite Adaptive Fallback**, **Scikit-learn**, and **SHAP**.

---

## 🌟 Key Features

### Authentication & Role-Based Access Control (RBAC)
- **Role-Based Portals**: Dedicated, isolated workspaces for **Students** and **Faculty / Academic Advisors**.
- **JWT-Secured Endpoints**: Stateless authentication utilizing `pyjwt` and `bcrypt` password hashing with auto-refreshing sessions.
- **Automatic Account Seeding**: Pre-configured demo student and faculty profiles initialized on first launch.

### Machine Learning & Explainable AI (SHAP)
- **Random Forest Prediction Engine**: Serialized ML model (`rf_model.pkl`) evaluating multi-dimensional academic metrics (attendance %, internal marks, assignments, study hours, previous scores).
- **Early Warning Risk Classification**: Real-time student categorization into `Good`, `Average`, or `At-Risk` status with calculated risk probabilities.
- **TreeExplainer SHAP Interpretability**: Local feature contribution breakdown visualizing exact positive and negative point impacts per academic input.
- **Automated Advisory Recommendations**: Intelligent generation of targeted interventions and weak-area study prescriptions based on model outputs.

### Interactive What-If Grade Simulator
- **Live Parameter Experimentation**: Interactive slider controls for attendance percentage, study hours, and continuous assessments.
- **Instant ML Inference**: Immediate score delta recalculation and risk status re-evaluation to simulate potential grade improvements prior to final examinations.

### Faculty Cohort Intelligence & Analytics
- **Cohort Risk Heatmap Matrix**: High-visibility risk dashboard highlighting at-risk students, attendance deficits, and intervention urgencies.
- **Departmental & Subject Analytics**: Aggregated class performance distributions visualized with interactive Recharts graphs.
- **Historical Trajectory Tracking**: Multi-semester academic trend curves and continuous assessment monitoring.

### Dual-Engine Intelligent Persistence
- **PostgreSQL Production Support**: High-performance relational database support via Docker Compose and standard `DATABASE_URL` configurations.
- **Zero-Setup Local SQLite Fallback**: Automatic, seamless fallback to local SQLite storage (`student_performance.db`) when no PostgreSQL instance is detected, requiring zero database setup.

---

## 📂 Project Structure

```text
student-risk/
├── backend/
│   ├── Dockerfile                  # Container definition for FastAPI backend
│   ├── requirements.txt            # Backend Python dependencies
│   ├── .env.example                # Example environment variables
│   ├── app/
│   │   ├── main.py                 # FastAPI application entrypoint & CORS
│   │   ├── api/v1/                 # RESTful API routers (Auth, Academic, Dashboard, Prediction)
│   │   ├── core/                   # Security, DB engine configuration, and seeder
│   │   ├── models/                 # SQLAlchemy ORM models (Users, Profiles, Metrics, Predictions)
│   │   ├── schemas/                # Pydantic v2 validation schemas
│   │   └── services/               # ML inference service & SHAP explainer
│   ├── ml_models/                  # Serialized ML artifacts (RandomForest, Scaler, SHAP)
│   └── scripts/                    # Model training and dataset generation scripts
├── frontend/
│   ├── package.json                # Frontend dependencies (React, Vite, Tailwind, Recharts, Lucide)
│   ├── vite.config.js              # Vite server & API proxy configuration
│   ├── tailwind.config.js          # Tailwind CSS theme tokens
│   ├── index.html                  # HTML entrypoint
│   └── src/
│       ├── App.jsx                 # Master application routing & layout
│       ├── components/             # Reusable UI widgets (MetricCard, TrendChart, RiskHeatmapTable)
│       ├── context/                # Authentication context & session state
│       ├── pages/                  # Page views (StudentDashboard, FacultyDashboard, Simulator, Login)
│       └── services/               # Axios API client & interceptors
├── database/
│   └── init.sql                    # Initial SQL schema for PostgreSQL deployment
├── docker-compose.yml              # Multi-container orchestration (FastAPI + PostgreSQL)
├── .gitignore                      # Git ignore configuration
└── README.md                       # Project documentation & instructions
```

---

## 💻 Installation & Setup

### Prerequisites
- **Python 3.10+** installed.
- **Node.js 18+** and **npm** installed.
- **Docker & Docker Compose** *(Optional; automatic local SQLite persistence fallback is included out-of-the-box)*.

---

### 1. Clone / Extract Repository
Ensure you are in the project root directory:
```bash
git clone https://github.com/shyamsundarmd19-hub/student-risk.git
cd student-risk
```

---

### 2. Run with Docker Compose (Option A: Recommended)
Orchestrates both the PostgreSQL database and the FastAPI backend in synchronized containers:
```bash
docker-compose up --build
```
- **Backend API & Swagger Docs**: `http://localhost:8000/api/v1/docs`
- **PostgreSQL Database**: `localhost:5432`

---

### 3. Run Locally (Option B: Development Mode)

#### Backend Setup
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

#### Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and visit: [http://localhost:3000](http://localhost:3000)

---

## 🌐 Live Demo & Endpoints

- **Repository URL**: [https://github.com/shyamsundarmd19-hub/student-risk](https://github.com/shyamsundarmd19-hub/student-risk)
- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs (Swagger UI)**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **ReDoc Documentation**: [http://localhost:8000/api/v1/redoc](http://localhost:8000/api/v1/redoc)
- **Service Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🔑 Default Accounts & Sample Cohort Data (Created Automatically)

| Role / Entity | Identifier / Email | Default Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Student** | `student@university.edu` | `StudentPass123!` | Personal Academic Trajectory, SHAP Explainability Breakdown, What-If Simulator, Custom Recommendations |
| **Faculty / Advisor** | `faculty@university.edu` | `FacultyPass123!` | Cohort Risk Heatmap Matrix, At-Risk Student Flags, Departmental Grade Distribution, Batch Insights |
| **At-Risk Sample 1** | `marcus.v@university.edu` | `StudentPass123!` | Predicted Score: 48.2% (Risk: 0.518), Flagged for Attendance & Continuous Assessment deficit |
| **At-Risk Sample 2** | `elena.r@university.edu` | `StudentPass123!` | Predicted Score: 52.4% (Risk: 0.476), Flagged for Study Hours Deficit |
| **High Achiever** | `aiden.p@university.edu` | `StudentPass123!` | Predicted Score: 90.2% (Risk: 0.098), Nominated for Honors Research Fellowship |

---

## 🔒 Security & Engineering Best Practices Implemented

- **Explainable ML Transparency**: Integrated SHAP TreeExplainer ensures that all ML predictions are fully interpretable, eliminating black-box academic risk scoring.
- **Bcrypt Password Encryption**: Industry-standard salt rounds with secure one-way password hashing.
- **Stateless JWT Authorization**: Bearer token authentication verified on every protected API transaction.
- **Pydantic v2 Schema Enforcement**: Strict request and response payload validation preventing injection and malformed parameter attacks.
- **CORS Negotiation**: Granular CORS origin handling enabling secure communication between Vite frontend and FastAPI backend.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Shyam Sundar](https://github.com/shyamsundarmd19-hub)
