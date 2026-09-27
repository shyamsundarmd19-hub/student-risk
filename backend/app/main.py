from contextlib import asynccontextmanager
from typing import Dict, Any
from fastapi import FastAPI, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal, get_db
from app.core.seeder import seed_database_if_empty
import app.models.student  # Ensure models are registered with Base metadata
from app.api.v1 import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager for startup and shutdown events.
    Initializes database tables and seeds demo accounts.
    """
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database_if_empty(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Database initialization/seeder warning: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="RESTful API for real-time student performance analytics, risk evaluation, and early warning interventions.",
    version=settings.VERSION,
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Explicit CORS configuration allowing requests from Vite frontend (http://localhost:5173 & http://localhost:3000)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Register API v1 Endpoints
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
    """Root endpoint providing service information."""
    return {
        "service": settings.PROJECT_NAME,
        "status": "operational",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
        "api_v1": settings.API_V1_STR
    }


@app.get(
    "/health",
    tags=["Health"],
    status_code=status.HTTP_200_OK,
    summary="Service Health Check Endpoint"
)
async def health_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Comprehensive health check probe validating backend runtime and database connectivity.
    """
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"disconnected: {str(exc)}"

    return {
        "status": "healthy" if "connected" == db_status else "degraded",
        "service": "backend-api",
        "database": db_status,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }
