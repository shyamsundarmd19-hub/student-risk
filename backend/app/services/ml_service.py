import os
import json
from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
import joblib
import shap

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "ml_models"

MODEL_PATH = MODELS_DIR / "rf_model.pkl"
SCALER_PATH = MODELS_DIR / "scaler.pkl"
EXPLAINER_PATH = MODELS_DIR / "shap_explainer.pkl"
METADATA_PATH = MODELS_DIR / "model_metadata.json"

FEATURE_COLUMNS = [
    "attendance",
    "internal_marks",
    "assignment_marks",
    "study_hours",
    "previous_score"
]

# Cache singleton for loaded models
_artifacts: Dict[str, Any] = {
    "model": None,
    "scaler": None,
    "explainer": None,
    "metadata": None,
}


def _ensure_artifacts_loaded():
    """
    Lazy loads serialized ML model artifacts and SHAP explainer into memory cache.
    If artifacts are not present, triggers the training script.
    """
    global _artifacts

    if _artifacts["model"] is not None and _artifacts["explainer"] is not None:
        return

    # Check if files exist; if not, trigger training
    if not (MODEL_PATH.exists() and EXPLAINER_PATH.exists()):
        from scripts.train_model import train_and_save_pipeline
        train_and_save_pipeline()

    # Load artifacts
    _artifacts["model"] = joblib.load(MODEL_PATH)
    if SCALER_PATH.exists():
        _artifacts["scaler"] = joblib.load(SCALER_PATH)
    _artifacts["explainer"] = joblib.load(EXPLAINER_PATH)

    if METADATA_PATH.exists():
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _artifacts["metadata"] = json.load(f)
    else:
        _artifacts["metadata"] = {"version": "1.0.0", "features": FEATURE_COLUMNS}


def _normalize_input_dict(data: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, float]]:
    """
    Extracts and normalizes features into a 2D NumPy array matching the model's schema.
    Handles field name aliases (e.g. attendance_pct -> attendance).
    """
    attendance = float(data.get("attendance", data.get("attendance_pct", 75.0)))
    internal_marks = float(data.get("internal_marks", 70.0))
    assignment_marks = float(data.get("assignment_marks", 70.0))
    study_hours = float(data.get("study_hours", 4.0))
    previous_score = float(data.get("previous_score", 65.0))

    # Clamp features to realistic physical bounds
    features_dict = {
        "attendance": max(0.0, min(100.0, attendance)),
        "internal_marks": max(0.0, min(100.0, internal_marks)),
        "assignment_marks": max(0.0, min(100.0, assignment_marks)),
        "study_hours": max(0.0, min(24.0, study_hours)),
        "previous_score": max(0.0, min(100.0, previous_score)),
    }

    feature_array = np.array([[
        features_dict["attendance"],
        features_dict["internal_marks"],
        features_dict["assignment_marks"],
        features_dict["study_hours"],
        features_dict["previous_score"]
    ]], dtype=np.float64)

    return feature_array, features_dict


def calculate_risk(predicted_score: float) -> Tuple[str, float]:
    """
    Computes qualitative risk level and normalized risk probability score (0.0 to 1.0).
    Thresholds:
      - Score >= 70.0: 'LOW' Risk
      - 50.0 <= Score < 70.0: 'MEDIUM' Risk
      - Score < 50.0: 'HIGH' Risk
    """
    # Inverse relationship: lower predicted score leads to higher failure risk
    risk_score = round(max(0.0, min(1.0, (100.0 - predicted_score) / 100.0)), 4)

    if predicted_score >= 70.0:
        risk_level = "LOW"
    elif predicted_score >= 50.0:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    return risk_level, risk_score


def extract_top_features_shap(explainer: Any, X_array: np.ndarray, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Uses SHAP TreeExplainer to compute exact local attributions for the prediction,
    ranking the top influential features with impact magnitude and direction.
    """
    try:
        shap_values = explainer.shap_values(X_array)
        if isinstance(shap_values, list):
            values = shap_values[0]
        else:
            values = shap_values[0] if len(shap_values.shape) > 1 else shap_values

        feature_impacts = []
        for feature_name, value, shap_val in zip(FEATURE_COLUMNS, X_array[0], values):
            val_float = float(shap_val)
            direction = "positive" if val_float > 0 else ("negative" if val_float < 0 else "neutral")
            feature_impacts.append({
                "feature": feature_name,
                "current_value": float(round(value, 2)),
                "shap_value": float(round(val_float, 4)),
                "impact_direction": direction,
                "importance_magnitude": float(round(abs(val_float), 4))
            })

        # Sort by highest absolute SHAP impact
        feature_impacts.sort(key=lambda x: x["importance_magnitude"], reverse=True)
        return feature_impacts[:top_k]

    except Exception:
        # Fallback to model global feature importances if SHAP calculation encounters any issue
        model = _artifacts["model"]
        importances = model.feature_importances_
        feature_impacts = [
            {
                "feature": feat,
                "current_value": float(round(X_array[0][idx], 2)),
                "shap_value": float(round(imp, 4)),
                "impact_direction": "positive",
                "importance_magnitude": float(round(imp, 4))
            }
            for idx, (feat, imp) in enumerate(zip(FEATURE_COLUMNS, importances))
        ]
        feature_impacts.sort(key=lambda x: x["importance_magnitude"], reverse=True)
        return feature_impacts[:top_k]


def predict_student_performance(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Inference endpoint:
    1. Loads artifacts.
    2. Feeds normalized input into the Random Forest model.
    3. Calculates predicted_score, risk_level, and risk_score.
    4. Computes SHAP explainability attributions and returns top 3 influential factors.
    """
    _ensure_artifacts_loaded()

    model = _artifacts["model"]
    explainer = _artifacts["explainer"]

    # Normalize feature payload
    X_array, features_dict = _normalize_input_dict(data)

    # Make prediction
    raw_prediction = float(model.predict(X_array)[0])
    predicted_score = round(max(0.0, min(100.0, raw_prediction)), 2)

    # Determine risk
    risk_level, risk_score = calculate_risk(predicted_score)

    # Explainability: Top 3 SHAP features
    top_features = extract_top_features_shap(explainer, X_array, top_k=3)

    # Create dictionary of all SHAP values for database persistence
    all_shap_dict = {
        item["feature"]: item["shap_value"] for item in top_features
    }

    return {
        "predicted_score": predicted_score,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "top_features": top_features,
        "feature_importances": all_shap_dict,
        "input_features": features_dict
    }


def run_what_if_simulation(original_data: Dict[str, Any], updated_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    What-If Counterfactual Simulation:
    Evaluates original vs modified academic inputs, calculating exact score deltas,
    risk shifts, and quantitative efficacy of planned academic interventions.
    """
    original_pred = predict_student_performance(original_data)
    updated_pred = predict_student_performance(updated_data)

    score_delta = round(updated_pred["predicted_score"] - original_pred["predicted_score"], 2)
    risk_score_delta = round(updated_pred["risk_score"] - original_pred["risk_score"], 4)

    # Calculate feature differences
    orig_features = original_pred["input_features"]
    upd_features = updated_pred["input_features"]
    feature_deltas = {
        feat: round(upd_features[feat] - orig_features[feat], 2)
        for feat in FEATURE_COLUMNS
    }

    # Transition description
    orig_risk = original_pred["risk_level"]
    upd_risk = updated_pred["risk_level"]
    if orig_risk != upd_risk:
        risk_transition = f"{orig_risk} ➔ {upd_risk}"
    else:
        risk_transition = f"STABLE ({orig_risk})"

    # Summary generator
    if score_delta > 0:
        impact_summary = (
            f"Intervention yields an estimated performance boost of +{score_delta:.2f} points, "
            f"reducing failure risk by {abs(risk_score_delta)*100:.1f}%."
        )
    elif score_delta < 0:
        impact_summary = (
            f"Parameters indicate a potential performance decline of {score_delta:.2f} points, "
            f"increasing risk by {abs(risk_score_delta)*100:.1f}%."
        )
    else:
        impact_summary = "Simulated parameter adjustments show no net variation in expected outcome."

    return {
        "original_prediction": original_pred,
        "simulated_prediction": updated_pred,
        "differential_analysis": {
            "score_delta": score_delta,
            "risk_score_delta": risk_score_delta,
            "risk_transition": risk_transition,
            "is_improved": score_delta > 0,
            "feature_deltas": feature_deltas,
            "impact_summary": impact_summary
        }
    }


def get_model_metadata() -> Dict[str, Any]:
    """Returns metadata regarding active model version, metrics, and training timestamp."""
    _ensure_artifacts_loaded()
    return _artifacts["metadata"] or {"status": "metadata not loaded"}
