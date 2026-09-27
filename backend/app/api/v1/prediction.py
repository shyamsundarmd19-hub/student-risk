from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.student import StudentProfile, PredictionRecord, Recommendation, PerformanceLevel
from app.schemas.student_schema import (
    PredictionInput,
    PredictionRecordResponse,
)
from app.services.ml_service import (
    predict_student_performance,
    run_what_if_simulation,
    get_model_metadata,
)

router = APIRouter(tags=["ML Predictions & Explainability"])


class WhatIfRequest(BaseModel):
    baseline_data: Dict[str, Any] = Field(
        ...,
        description="Original student performance inputs",
        example={
            "attendance": 65.0,
            "internal_marks": 50.0,
            "assignment_marks": 55.0,
            "study_hours": 2.5,
            "previous_score": 58.0
        }
    )
    simulated_data: Dict[str, Any] = Field(
        ...,
        description="Proposed intervention parameter modifications",
        example={
            "attendance": 85.0,
            "internal_marks": 75.0,
            "assignment_marks": 80.0,
            "study_hours": 6.0,
            "previous_score": 58.0
        }
    )


@router.post(
    "/predict",
    summary="Generate real-time student performance forecast and SHAP feature attributions"
)
def predict_performance(
    payload: PredictionInput,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Executes Random Forest inference and SHAP Explainable AI analysis.
    If student_id is provided or exists, persists the prediction to `prediction_records`.
    """
    # 1. Format payload for ML service
    input_dict = {
        "attendance": payload.attendance_pct,
        "internal_marks": payload.internal_marks,
        "assignment_marks": payload.assignment_marks,
        "study_hours": payload.study_hours,
        "previous_score": payload.previous_score,
    }

    # 2. Run ML prediction & SHAP attribution
    prediction_result = predict_student_performance(input_dict)

    # 3. Map performance level to Model Enum
    raw_level = prediction_result["risk_level"]
    if raw_level == "LOW":
        db_perf_level = PerformanceLevel.GOOD
    elif raw_level == "MEDIUM":
        db_perf_level = PerformanceLevel.AVERAGE
    else:
        db_perf_level = PerformanceLevel.AT_RISK

    # 4. If student_id is provided or a student exists, persist record
    student_id = payload.student_id
    if student_id is None:
        first_student = db.query(StudentProfile).first()
        if first_student:
            student_id = first_student.id

    saved_record_id = None
    if student_id:
        student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        if student:
            pred_record = PredictionRecord(
                student_id=student.id,
                predicted_score=prediction_result["predicted_score"],
                performance_level=db_perf_level,
                risk_score=prediction_result["risk_score"],
                feature_importances=prediction_result["feature_importances"],
            )
            db.add(pred_record)
            db.commit()
            db.refresh(pred_record)
            saved_record_id = pred_record.id

            # Auto-generate recommendation if student is at risk or medium risk
            if db_perf_level in [PerformanceLevel.AT_RISK, PerformanceLevel.AVERAGE]:
                # Identify the most negative or lowest contributing factor
                top_issue = prediction_result["top_features"][0]["feature"]
                rec_text = (
                    f"Recommended intervention: Boost {top_issue.replace('_', ' ')} "
                    f"through targeted mentoring and structured weekly study blocks."
                )
                recommendation = Recommendation(
                    student_id=student.id,
                    weak_area=top_issue.replace("_", " ").title(),
                    recommendation_text=rec_text
                )
                db.add(recommendation)
                db.commit()

    return {
        "prediction_id": saved_record_id,
        "student_id": student_id,
        "predicted_score": prediction_result["predicted_score"],
        "performance_level": db_perf_level.value,
        "risk_level": prediction_result["risk_level"],
        "risk_score": prediction_result["risk_score"],
        "top_features": prediction_result["top_features"],
        "feature_importances": prediction_result["feature_importances"],
        "input_features": prediction_result["input_features"],
    }


@router.post(
    "/what-if",
    summary="Perform counterfactual What-If simulation comparing baseline vs modified metrics"
)
@router.post(
    "/prediction/what-if",
    summary="Alias for counterfactual What-If simulation"
)
def what_if_analysis(request: WhatIfRequest) -> Dict[str, Any]:
    """
    Executes dual-model inference to quantify score delta, risk probability change,
    and visual shifts resulting from academic intervention adjustments.
    """
    simulation_output = run_what_if_simulation(
        original_data=request.baseline_data,
        updated_data=request.simulated_data
    )
    return simulation_output


@router.get(
    "/model-info",
    summary="Get active Machine Learning model metadata and training metrics"
)
def get_model_info() -> Dict[str, Any]:
    """Returns training parameters, $R^2$, MAE, and feature weighting."""
    return get_model_metadata()
