import enum
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"


class PerformanceLevel(str, enum.Enum):
    GOOD = "GOOD"
    AVERAGE = "AVERAGE"
    AT_RISK = "AT_RISK"


# ---------------------------------------------------------------------------
# Authentication & User Schemas
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Plaintext password for registration")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None


# ---------------------------------------------------------------------------
# Academic Record Schemas
# ---------------------------------------------------------------------------

class AcademicRecordBase(BaseModel):
    semester: int = Field(..., ge=1, le=12, description="Semester number (e.g. 1 to 8)")
    attendance_pct: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage (0 - 100)")
    internal_marks: float = Field(..., ge=0.0, le=100.0, description="Internal assessment marks (0 - 100)")
    assignment_marks: float = Field(..., ge=0.0, le=100.0, description="Assignment score (0 - 100)")
    study_hours: float = Field(..., ge=0.0, le=168.0, description="Average study hours per week")
    previous_score: float = Field(..., ge=0.0, le=100.0, description="Previous semester average score")
    subject_code: str = Field(..., min_length=2, max_length=50, description="Course / Subject identifier")


class AcademicRecordCreate(AcademicRecordBase):
    student_id: Optional[int] = Field(None, description="Target Student Profile ID")


class AcademicRecordUpdate(BaseModel):
    semester: Optional[int] = Field(None, ge=1, le=12)
    attendance_pct: Optional[float] = Field(None, ge=0.0, le=100.0)
    internal_marks: Optional[float] = Field(None, ge=0.0, le=100.0)
    assignment_marks: Optional[float] = Field(None, ge=0.0, le=100.0)
    study_hours: Optional[float] = Field(None, ge=0.0, le=168.0)
    previous_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    subject_code: Optional[str] = Field(None, min_length=2, max_length=50)


class AcademicRecordResponse(AcademicRecordBase):
    id: int
    student_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Prediction Record Schemas
# ---------------------------------------------------------------------------

class PredictionInput(BaseModel):
    semester: int = Field(..., ge=1, le=12, example=4)
    attendance_pct: float = Field(..., ge=0.0, le=100.0, example=82.5)
    internal_marks: float = Field(..., ge=0.0, le=100.0, example=74.0)
    assignment_marks: float = Field(..., ge=0.0, le=100.0, example=80.0)
    study_hours: float = Field(..., ge=0.0, le=168.0, example=15.0)
    previous_score: float = Field(..., ge=0.0, le=100.0, example=78.0)
    subject_code: str = Field(..., example="CS401")
    student_id: Optional[int] = Field(None, description="Optional Student Profile ID for persistence")


class PredictionRecordBase(BaseModel):
    predicted_score: float = Field(..., ge=0.0, le=100.0, description="Predicted final assessment score")
    performance_level: PerformanceLevel
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Calculated failure or attrition probability (0.0 to 1.0)")
    feature_importances: Optional[Dict[str, float]] = Field(
        default=None,
        description="Explainable AI contribution weights (e.g. SHAP values)"
    )


class PredictionRecordCreate(PredictionRecordBase):
    student_id: int


class PredictionRecordResponse(PredictionRecordBase):
    id: int
    student_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Recommendation Schemas
# ---------------------------------------------------------------------------

class RecommendationBase(BaseModel):
    weak_area: str = Field(..., min_length=2, max_length=255, description="Primary bottleneck (e.g. 'Low Attendance')")
    recommendation_text: str = Field(..., min_length=5, description="Actionable early warning guidance")


class RecommendationCreate(RecommendationBase):
    student_id: int


class RecommendationResponse(RecommendationBase):
    id: int
    student_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Student Profile Schemas
# ---------------------------------------------------------------------------

class StudentProfileBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=150, example="Jane Doe")
    department: str = Field(..., min_length=2, max_length=100, example="Computer Science & Engineering")
    year: int = Field(..., ge=1, le=6, example=3)
    semester: int = Field(..., ge=1, le=12, example=5)


class StudentProfileCreate(StudentProfileBase):
    user_id: Optional[int] = Field(None, description="Associated user ID")


class StudentProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    department: Optional[str] = Field(None, min_length=2, max_length=100)
    year: Optional[int] = Field(None, ge=1, le=6)
    semester: Optional[int] = Field(None, ge=1, le=12)


class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)


class StudentProfileDetailResponse(StudentProfileResponse):
    academic_records: List[AcademicRecordResponse] = []
    prediction_records: List[PredictionRecordResponse] = []
    recommendations: List[RecommendationResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Dashboard & Aggregation Schemas
# ---------------------------------------------------------------------------

class RiskDistribution(BaseModel):
    good: int = 0
    average: int = 0
    at_risk: int = 0


class DashboardSummaryResponse(BaseModel):
    total_students: int
    total_predictions: int
    at_risk_count: int
    average_predicted_score: float
    risk_distribution: RiskDistribution
    recent_alerts: List[RecommendationResponse] = []


class StudentDashboardResponse(BaseModel):
    profile: StudentProfileResponse
    latest_academic_record: Optional[AcademicRecordResponse] = None
    latest_prediction: Optional[PredictionRecordResponse] = None
    active_recommendations: List[RecommendationResponse] = []
    historical_predictions: List[PredictionRecordResponse] = []
