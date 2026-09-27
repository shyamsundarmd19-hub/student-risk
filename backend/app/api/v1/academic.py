from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app.core.database import get_db
from app.models.student import StudentProfile, AcademicRecord
from app.schemas.student_schema import AcademicRecordCreate, AcademicRecordResponse

router = APIRouter(tags=["Academic Records"])


@router.post(
    "/academic-records",
    response_model=AcademicRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save a new academic performance record for a student"
)
def create_academic_record(
    record_in: AcademicRecordCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Saves an academic semester record with attendance, marks, and engagement metrics.
    If student_id is not explicitly specified, links to the first available student or raises an error.
    """
    student_id = record_in.student_id
    if not student_id:
        # Fallback to the first available student profile if not specified
        student = db.query(StudentProfile).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No student profile found. Please register or create a student profile first."
            )
        student_id = student.id
    else:
        student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile with ID {student_id} not found."
            )

    academic_record = AcademicRecord(
        student_id=student_id,
        semester=record_in.semester,
        attendance_pct=record_in.attendance_pct,
        internal_marks=record_in.internal_marks,
        assignment_marks=record_in.assignment_marks,
        study_hours=record_in.study_hours,
        previous_score=record_in.previous_score,
        subject_code=record_in.subject_code,
    )
    db.add(academic_record)
    db.commit()
    db.refresh(academic_record)

    return academic_record


@router.get(
    "/academic-records/{student_id}",
    response_model=List[AcademicRecordResponse],
    summary="Fetch all historical academic records for a given student ID"
)
def get_student_academic_records(
    student_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieves chronological academic records for a given student.
    """
    student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID {student_id} was not found."
        )

    records = (
        db.query(AcademicRecord)
        .filter(AcademicRecord.student_id == student_id)
        .order_by(AcademicRecord.created_at.desc())
        .all()
    )

    return records
