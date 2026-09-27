from sqlalchemy.orm import Session
from app.models.student import (
    User,
    StudentProfile,
    AcademicRecord,
    PredictionRecord,
    Recommendation,
    UserRole,
    PerformanceLevel
)
from app.core.security import hash_password


def seed_database_if_empty(db: Session):
    """
    Populates default demo users, student profiles, historical academic records,
    and ML prediction records if database is fresh.
    """
    if db.query(User).first():
        return

    print("[SEEDER] Populating demo accounts and student cohort records...")

    # 1. Demo Student
    student_user = User(
        email="student@university.edu",
        hashed_password=hash_password("StudentPass123!"),
        role=UserRole.STUDENT
    )
    db.add(student_user)
    db.commit()
    db.refresh(student_user)

    student_profile = StudentProfile(
        user_id=student_user.id,
        name="Alex Morgan",
        department="Computer Science & Engineering",
        year=3,
        semester=5
    )
    db.add(student_profile)
    db.commit()
    db.refresh(student_profile)

    # Academic Records for Alex Morgan
    semesters = [
        {"sem": 1, "att": 78.0, "int_m": 68.0, "ass_m": 70.0, "study": 3.0, "prev": 65.0, "sub": "CS101"},
        {"sem": 2, "att": 82.0, "int_m": 72.0, "ass_m": 74.0, "study": 4.0, "prev": 70.0, "sub": "CS202"},
        {"sem": 3, "att": 85.0, "int_m": 76.0, "ass_m": 78.0, "study": 4.5, "prev": 74.0, "sub": "CS303"},
        {"sem": 4, "att": 88.0, "int_m": 80.0, "ass_m": 82.0, "study": 5.0, "prev": 78.0, "sub": "CS404"},
        {"sem": 5, "att": 90.0, "int_m": 84.0, "ass_m": 86.0, "study": 5.5, "prev": 82.0, "sub": "CS505"},
    ]
    for s in semesters:
        rec = AcademicRecord(
            student_id=student_profile.id,
            semester=s["sem"],
            attendance_pct=s["att"],
            internal_marks=s["int_m"],
            assignment_marks=s["ass_m"],
            study_hours=s["study"],
            previous_score=s["prev"],
            subject_code=s["sub"]
        )
        db.add(rec)

    # Prediction Record for Alex
    alex_pred = PredictionRecord(
        student_id=student_profile.id,
        predicted_score=86.4,
        performance_level=PerformanceLevel.GOOD,
        risk_score=0.136,
        feature_importances={
            "internal_marks": 8.45,
            "attendance": 5.20,
            "study_hours": 3.10,
            "previous_score": 2.15,
            "assignment_marks": -1.50
        }
    )
    db.add(alex_pred)

    # Recommendation for Alex
    alex_rec = Recommendation(
        student_id=student_profile.id,
        weak_area="Attendance Optimization",
        recommendation_text="Maintain attendance above 85% to preserve positive SHAP grade contribution (+5.2 pts)."
    )
    db.add(alex_rec)

    # 2. Demo Faculty
    faculty_user = User(
        email="faculty@university.edu",
        hashed_password=hash_password("FacultyPass123!"),
        role=UserRole.FACULTY
    )
    db.add(faculty_user)

    # 3. Additional Cohort Students for Faculty Heatmap
    cohort_data = [
        {
            "email": "marcus.v@university.edu",
            "name": "Marcus Vance",
            "dept": "Computer Science",
            "year": 3,
            "sem": 5,
            "att": 52.0,
            "int_m": 46.0,
            "pred": 48.2,
            "perf": PerformanceLevel.AT_RISK,
            "risk": 0.518,
            "weak": "Attendance & Continuous Assessment",
            "rec": "Immediate academic counseling and mandatory TA review sessions."
        },
        {
            "email": "elena.r@university.edu",
            "name": "Elena Rostova",
            "dept": "Computer Science",
            "year": 3,
            "sem": 5,
            "att": 58.5,
            "int_m": 50.0,
            "pred": 52.4,
            "perf": PerformanceLevel.AT_RISK,
            "risk": 0.476,
            "weak": "Study Hours Deficit",
            "rec": "Schedule 3 weekly structured tutoring blocks."
        },
        {
            "email": "david.c@university.edu",
            "name": "David Chen",
            "dept": "Information Technology",
            "year": 2,
            "sem": 3,
            "att": 64.0,
            "int_m": 52.0,
            "pred": 55.0,
            "perf": PerformanceLevel.AT_RISK,
            "risk": 0.450,
            "weak": "Continuous Assessment",
            "rec": "Assignment resubmission and instructor check-in."
        },
        {
            "email": "sarah.j@university.edu",
            "name": "Sarah Jenkins",
            "dept": "Computer Science",
            "year": 3,
            "sem": 5,
            "att": 72.0,
            "int_m": 68.0,
            "pred": 69.5,
            "perf": PerformanceLevel.AVERAGE,
            "risk": 0.305,
            "weak": "Midterm Preparation",
            "rec": "Recommend practice mock problem sets."
        },
        {
            "email": "aiden.p@university.edu",
            "name": "Aiden Patel",
            "dept": "Artificial Intelligence",
            "year": 3,
            "sem": 5,
            "att": 92.0,
            "int_m": 88.0,
            "pred": 90.2,
            "perf": PerformanceLevel.GOOD,
            "risk": 0.098,
            "weak": "High Achiever",
            "rec": "Nominate for undergraduate honors research fellowship."
        },
        {
            "email": "chloe.d@university.edu",
            "name": "Chloe Dubois",
            "dept": "Artificial Intelligence",
            "year": 2,
            "sem": 3,
            "att": 88.0,
            "int_m": 82.0,
            "pred": 84.5,
            "perf": PerformanceLevel.GOOD,
            "risk": 0.155,
            "weak": "On Track",
            "rec": "Maintain consistent coursework study routine."
        }
    ]

    for student in cohort_data:
        u = User(
            email=student["email"],
            hashed_password=hash_password("StudentPass123!"),
            role=UserRole.STUDENT
        )
        db.add(u)
        db.commit()
        db.refresh(u)

        prof = StudentProfile(
            user_id=u.id,
            name=student["name"],
            department=student["dept"],
            year=student["year"],
            semester=student["sem"]
        )
        db.add(prof)
        db.commit()
        db.refresh(prof)

        acad = AcademicRecord(
            student_id=prof.id,
            semester=student["sem"],
            attendance_pct=student["att"],
            internal_marks=student["int_m"],
            assignment_marks=student["int_m"] + 5,
            study_hours=3.5,
            previous_score=student["int_m"] - 2,
            subject_code="CS301" if student["dept"] == "Computer Science" else "AI201"
        )
        db.add(acad)

        pr = PredictionRecord(
            student_id=prof.id,
            predicted_score=student["pred"],
            performance_level=student["perf"],
            risk_score=student["risk"],
            feature_importances={"attendance": 4.0, "internal_marks": 5.0}
        )
        db.add(pr)

        r = Recommendation(
            student_id=prof.id,
            weak_area=student["weak"],
            recommendation_text=student["rec"]
        )
        db.add(r)

    db.commit()
    print("[SEEDER] Database seed complete! Demo accounts ready.")
