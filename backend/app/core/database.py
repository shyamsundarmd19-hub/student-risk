import os
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Adaptive database engine setup
# Connects to PostgreSQL if available, otherwise seamlessly falls back to SQLite for local development
def get_engine():
    db_url = settings.DATABASE_URL
    if "postgresql" in db_url:
        try:
            # Test PostgreSQL reachability
            pg_engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                connect_args={"connect_timeout": 2},
                echo=False
            )
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("[DATABASE] Connected successfully to PostgreSQL instance.")
            return pg_engine
        except Exception as e:
            print(f"[DATABASE] PostgreSQL not available on host ({e}). Falling back to local SQLite database.")
            sqlite_url = "sqlite:///./student_performance.db"
            return create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False},
                echo=False
            )
    else:
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False} if "sqlite" in db_url else {},
            echo=False
        )


engine = get_engine()

# Session factory for transactional database sessions
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base declarative class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a SQLAlchemy database session per request
    and ensures it is closed after request handling is complete.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
