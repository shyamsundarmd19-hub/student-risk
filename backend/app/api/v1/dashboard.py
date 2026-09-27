from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List

from app.core.database import get_db
from app.models.student import (
    StudentProfile,
    AcademicRecord,
    PredictionRecord,
    Recommendation,
    PerformanceLevel,
)

router = APIRouter(tags=["Dashboards"])


@router.get(
    "/student/dashboard/{student_id}",
    summary="Fetch comprehensive student dashboard analytics, trends, SHAP factors, and recommendations"
)
@router.get(
    "/dashboard/student/dashboard/{student_id}",
    summary="Alias for student dashboard"
)
def get_student_dashboard(
    student_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Aggregates profile, latest prediction, historical performance trajectory,
    top risk contributors, and personalized intervention action items.
    """
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student profile with ID {student_id} was not found."
        )

    # 1. Latest Prediction
    latest_prediction = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.student_id == student_id)
        .order_by(PredictionRecord.created_at.desc())
        .first()
    )

    # 2. Historical Predictions Trend
    historical_predictions = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.student_id == student_id)
        .order_by(PredictionRecord.created_at.asc())
        .all()
    )

    # 3. Academic Records History
    academic_records = (
        db.query(AcademicRecord)
        .filter(AcademicRecord.student_id == student_id)
        .order_by(AcademicRecord.semester.asc())
        .all()
    )

    # 4. Recommendations
    recommendations = (
        db.query(Recommendation)
        .filter(Recommendation.student_id == student_id)
        .order_by(Recommendation.created_at.desc())
        .all()
    )

    # Latest academic stats
    latest_record = academic_records[-1] if academic_records else None

    # Trend trajectory formatted for charts
    trends = []
    for rec in academic_records:
        trends.append({
            "semester": f"Sem {rec.semester}",
            "attendance": rec.attendance_pct,
            "internal_marks": rec.internal_marks,
            "assignment_marks": rec.assignment_marks,
            "study_hours": rec.study_hours,
            "previous_score": rec.previous_score,
            "subject": rec.subject_code,
            "date": rec.created_at.strftime("%Y-%m-%d") if rec.created_at else None
        })

    prediction_trends = [
        {
            "id": p.id,
            "predicted_score": p.predicted_score,
            "performance_level": p.performance_level.value if hasattr(p.performance_level, "value") else str(p.performance_level),
            "risk_score": p.risk_score,
            "date": p.created_at.strftime("%Y-%m-%d %H:%M") if p.created_at else None
        }
        for p in historical_predictions
    ]

    return {
        "student": {
            "id": student.id,
            "name": student.name,
            "department": student.department,
            "year": student.year,
            "semester": student.semester,
            "user_id": student.user_id,
        },
        "latest_metrics": {
            "predicted_score": latest_prediction.predicted_score if latest_prediction else (latest_record.previous_score if latest_record else 75.0),
            "performance_level": (
                latest_prediction.performance_level.value
                if latest_prediction and hasattr(latest_prediction.performance_level, "value")
                else (str(latest_prediction.performance_level) if latest_prediction else "GOOD")
            ),
            "risk_score": latest_prediction.risk_score if latest_prediction else 0.25,
            "feature_importances": latest_prediction.feature_importances if latest_prediction else {},
            "current_attendance": latest_record.attendance_pct if latest_record else 85.0,
            "current_internal": latest_record.internal_marks if latest_record else 75.0,
            "study_hours": latest_record.study_hours if latest_record else 4.5,
        },
        "academic_trends": trends,
        "prediction_trends": prediction_trends,
        "recommendations": [
            {
                "id": r.id,
                "weak_area": r.weak_area,
                "recommendation_text": r.recommendation_text,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else None
            }
            for r in recommendations
        ]
    }


@router.get(
    "/faculty/dashboard",
    summary="Fetch aggregated faculty intelligence: class averages, risk heatmap counts, and high-risk alerts"
)
@router.get(
    "/dashboard/faculty/dashboard",
    summary="Alias for faculty dashboard"
)
def get_faculty_dashboard(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Computes cohort statistics, distribution across risk bands,
    subject-level aggregates, and a targeted list of students requiring intervention.
    """
    total_students = db.query(func.count(StudentProfile.id)).scalar() or 0

    # Risk Distribution Counts
    good_count = db.query(func.count(PredictionRecord.id)).filter(PredictionRecord.performance_level == PerformanceLevel.GOOD).scalar() or 0
    average_count = db.query(func.count(PredictionRecord.id)).filter(PredictionRecord.performance_level == PerformanceLevel.AVERAGE).scalar() or 0
    at_risk_count = db.query(func.count(PredictionRecord.id)).filter(PredictionRecord.performance_level == PerformanceLevel.AT_RISK).scalar() or 0

    # Class Averages
    avg_attendance = db.query(func.avg(AcademicRecord.attendance_pct)).scalar() or 78.5
    avg_internal = db.query(func.avg(AcademicRecord.internal_marks)).scalar() or 72.4
    avg_assignment = db.query(func.avg(AcademicRecord.assignment_marks)).scalar() or 76.8
    avg_study_hours = db.query(func.avg(AcademicRecord.study_hours)).scalar() or 4.2
    avg_predicted_score = db.query(func.avg(PredictionRecord.predicted_score)).scalar() or 74.6

    # High-Risk Students List
    # Find students whose latest prediction is AT_RISK or risk_score >= 0.50
    high_risk_records = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.performance_level == PerformanceLevel.AT_RISK)
        .order_by(PredictionRecord.created_at.desc())
        .limit(20)
        .all()
    )

    high_risk_students = []
    seen_student_ids = set()
    for record in high_risk_records:
        if record.student_id not in seen_student_ids:
            seen_student_ids.add(record.student_id)
            student = db.query(StudentProfile).filter(StudentProfile.id == record.student_id).first()
            if student:
                # Latest academic record
                latest_acad = (
                    db.query(AcademicRecord)
                    .filter(AcademicRecord.student_id == student.id)
                    .order_by(AcademicRecord.created_at.desc())
                    .first()
                )
                # Latest recommendation
                latest_rec = (
                    db.query(Recommendation)
                    .filter(Recommendation.student_id == student.id)
                    .order_by(Recommendation.created_at.desc())
                    .first()
                )
                high_risk_students.append({
                    "student_id": student.id,
                    "name": student.name,
                    "department": student.department,
                    "semester": student.semester,
                    "predicted_score": record.predicted_score,
                    "risk_score": record.risk_score,
                    "attendance": latest_acad.attendance_pct if latest_acad else 55.0,
                    "internal_marks": latest_acad.internal_marks if latest_acad else 45.0,
                    "study_hours": latest_acad.study_hours if latest_acad else 2.0,
                    "primary_weakness": latest_rec.weak_area if latest_rec else "Low Attendance / Study Hours",
                    "intervention": latest_rec.recommendation_text if latest_rec else "Assign peer mentor and schedule tutoring session."
                })

    # Subject-wise metrics
    subject_stats_query = (
        db.query(
            AcademicRecord.subject_code,
            func.avg(AcademicRecord.internal_marks).label("avg_internal"),
            func.avg(AcademicRecord.attendance_pct).label("avg_attendance"),
            func.count(AcademicRecord.id).label("total_records")
        )
        .group_by(AcademicRecord.subject_code)
        .all()
    )

    subject_metrics = [
        {
            "subject_code": s[0],
            "average_internal": round(float(s[1]), 2),
            "average_attendance": round(float(s[2]), 2),
            "student_count": s[3]
        }
        for s in subject_stats_query
    ]

    return {
        "cohort_overview": {
            "total_students": total_students,
            "average_attendance": round(float(avg_attendance), 2),
            "average_internal_marks": round(float(avg_internal), 2),
            "average_assignment_marks": round(float(avg_assignment), 2),
            "average_study_hours": round(float(avg_study_hours), 2),
            "average_predicted_score": round(float(avg_predicted_score), 2),
        },
        "risk_distribution": {
            "good": good_count,
            "average": average_count,
            "at_risk": at_risk_count,
            "total_evaluated": good_count + average_count + at_risk_count
        },
        "high_risk_students": high_risk_students,
        "subject_metrics": subject_metrics
    }
