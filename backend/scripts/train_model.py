import os
import sys
import json
from pathlib import Path
from datetime import datetime
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import shap

# Safe UTF-8 console output on Windows
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Ensure backend root is on sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
MODELS_DIR = BACKEND_DIR / "ml_models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_COLUMNS = [
    "attendance",
    "internal_marks",
    "assignment_marks",
    "study_hours",
    "previous_score"
]


def generate_synthetic_dataset(num_samples: int = 2500, random_seed: int = 42):
    """
    Generates a realistic synthetic dataset for student academic performance prediction using NumPy.
    Features:
      - attendance: 30% to 100%
      - internal_marks: 0 to 100
      - assignment_marks: 0 to 100
      - study_hours: 0 to 10 hours/day
      - previous_score: 0 to 100
    Target:
      - final_score: Weighted combination of features + non-linear interaction + controlled Gaussian noise.
    """
    np.random.seed(random_seed)

    # 1. Attendance percentage: beta distribution skewed towards realistic attendance (60-95%)
    raw_attendance = np.random.beta(a=5, b=2, size=num_samples)
    attendance = 30.0 + (raw_attendance * 70.0)  # scale to [30, 100]

    # 2. Study hours per day: 0 to 10 hours
    study_hours = np.clip(np.random.gamma(shape=3.0, scale=1.2, size=num_samples), 0.0, 10.0)

    # 3. Previous score: historical performance distribution (mean ~ 65, std ~ 15)
    previous_score = np.clip(np.random.normal(loc=65.0, scale=16.0, size=num_samples), 10.0, 100.0)

    # 4. Internal marks: correlated with attendance, study hours, and previous score
    internal_noise = np.random.normal(0, 7.0, size=num_samples)
    internal_marks = np.clip(
        0.35 * previous_score + 0.35 * attendance + 2.5 * study_hours + internal_noise,
        0.0,
        100.0
    )

    # 5. Assignment marks: correlated with study hours, internal marks, and attendance
    assignment_noise = np.random.normal(0, 6.0, size=num_samples)
    assignment_marks = np.clip(
        0.30 * internal_marks + 0.30 * attendance + 3.0 * study_hours + assignment_noise,
        0.0,
        100.0
    )

    # 6. Target: Final Score (weighted sum + interaction effect + Gaussian noise)
    noise = np.random.normal(loc=0.0, scale=3.5, size=num_samples)
    
    # Base weighted linear combination
    raw_final_score = (
        0.25 * internal_marks +
        0.20 * assignment_marks +
        0.18 * attendance +
        0.25 * previous_score +
        1.20 * study_hours +
        0.02 * (attendance * study_hours) +  # interaction bonus
        noise
    )

    final_score = np.clip(raw_final_score, 0.0, 100.0)

    X = np.column_stack([
        np.round(attendance, 2),
        np.round(internal_marks, 2),
        np.round(assignment_marks, 2),
        np.round(study_hours, 2),
        np.round(previous_score, 2),
    ])
    y = np.round(final_score, 2)

    return X, y


def train_and_save_pipeline():
    """
    Executes end-to-end training pipeline, evaluates metrics, and exports:
      1. rf_model.pkl (RandomForestRegressor)
      2. scaler.pkl (StandardScaler fitted on training features)
      3. shap_explainer.pkl (SHAP TreeExplainer for feature importance & attribution)
      4. model_metadata.json (Metrics, features, training timestamp)
    """
    print("=" * 70)
    print("[INIT] Initializing Student Performance ML Training Pipeline")
    print("=" * 70)

    # Step 1: Generate Dataset
    print("\n[1/5] Generating synthetic academic dataset (2,500 records)...")
    X, y = generate_synthetic_dataset(num_samples=2500, random_seed=42)
    print(f"Dataset generated. Shape: {X.shape}, Target Shape: {y.shape}")

    # Step 2: Split Dataset
    print("[2/5] Splitting data into 80% train and 20% test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # Step 3: Feature Scaler
    print("\n[3/5] Fitting StandardScaler...")
    scaler = StandardScaler()
    scaler.fit(X_train)

    # Step 4: Model Training
    print("[4/5] Training RandomForestRegressor (n_estimators=100, random_state=42)...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Model Evaluation
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)

    print("\n" + "-" * 40)
    print("Model Evaluation Metrics:")
    print(f"   * Mean Absolute Error (MAE) : {mae:.3f}")
    print(f"   * Root Mean Squared Error (RMSE): {rmse:.3f}")
    print(f"   * R2 Determination Score   : {r2:.4f}")
    print("-" * 40)

    # Step 5: SHAP TreeExplainer
    print("\n[5/5] Building SHAP TreeExplainer for Explainable AI...")
    explainer = shap.TreeExplainer(model)

    # Artifact Filepaths
    model_path = MODELS_DIR / "rf_model.pkl"
    scaler_path = MODELS_DIR / "scaler.pkl"
    explainer_path = MODELS_DIR / "shap_explainer.pkl"
    metadata_path = MODELS_DIR / "model_metadata.json"

    print(f"\nExporting artifacts to: {MODELS_DIR}")
    joblib.dump(model, model_path)
    print(f"   [OK] Model saved -> {model_path.name}")

    joblib.dump(scaler, scaler_path)
    print(f"   [OK] Scaler saved -> {scaler_path.name}")

    joblib.dump(explainer, explainer_path)
    print(f"   [OK] SHAP Explainer saved -> {explainer_path.name}")

    # Metadata record
    metadata = {
        "model_type": "RandomForestRegressor",
        "n_estimators": 100,
        "features": FEATURE_COLUMNS,
        "metrics": {
            "mae": round(float(mae), 4),
            "rmse": round(float(rmse), 4),
            "r2_score": round(float(r2), 4)
        },
        "feature_importances": {
            feat: round(float(imp), 4)
            for feat, imp in zip(FEATURE_COLUMNS, model.feature_importances_)
        },
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0"
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"   [OK] Metadata saved -> {metadata_path.name}")

    print("\n" + "=" * 70)
    print("[COMPLETE] ML Model Training & XAI Artifact Generation Complete!")
    print("=" * 70)


if __name__ == "__main__":
    train_and_save_pipeline()
