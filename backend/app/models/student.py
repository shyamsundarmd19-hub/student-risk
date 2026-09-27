import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    DateTime,
    Text,
    Enum as SQLEnum,
    JSON,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"


class PerformanceLevel(str, enum.Enum):
    GOOD = "GOOD"
    AVERAGE = "AVERAGE"
    AT_RISK = "AT_RISK"


class User(Base):
    """
    User model for authentication and role-based access control.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(
        SQLEnum(UserRole, name="user_role_enum", native_enum=False),
        default=UserRole.STUDENT,
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # One-to-one relationship with StudentProfile
    student_profile = relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class StudentProfile(Base):
    """
    Student profile containing demographic and departmental context.
    """
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    name = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    academic_records = relationship(
        "AcademicRecord",
        back_populates="student",
        cascade="all, delete-orphan",
        order_by="AcademicRecord.created_at.desc()",
    )
    prediction_records = relationship(
        "PredictionRecord",
        back_populates="student",
        cascade="all, delete-orphan",
        order_by="PredictionRecord.created_at.desc()",
    )
    recommendations = relationship(
        "Recommendation",
        back_populates="student",
        cascade="all, delete-orphan",
        order_by="Recommendation.created_at.desc()",
    )


class AcademicRecord(Base):
    """
    Academic performance indicators and engagement metrics for a student.
    """
    __tablename__ = "academic_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(
        Integer,
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    semester = Column(Integer, nullable=False)
    attendance_pct = Column(Float, nullable=False)
    internal_marks = Column(Float, nullable=False)
    assignment_marks = Column(Float, nullable=False)
    study_hours = Column(Float, nullable=False)
    previous_score = Column(Float, nullable=False)
    subject_code = Column(String(50), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationship back to StudentProfile
    student = relationship("StudentProfile", back_populates="academic_records")


class PredictionRecord(Base):
    """
    Historical machine learning model inference records with explainability metadata.
    """
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(
        Integer,
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    predicted_score = Column(Float, nullable=False)
    performance_level = Column(
        SQLEnum(PerformanceLevel, name="performance_level_enum", native_enum=False),
        nullable=False,
    )
    risk_score = Column(Float, nullable=False)
    feature_importances = Column(JSON, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationship back to StudentProfile
    student = relationship("StudentProfile", back_populates="prediction_records")


class Recommendation(Base):
    """
    Automated intervention action items and tailored recommendations.
    """
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    student_id = Column(
        Integer,
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    weak_area = Column(String(255), nullable=False)
    recommendation_text = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationship back to StudentProfile
    student = relationship("StudentProfile", back_populates="recommendations")
