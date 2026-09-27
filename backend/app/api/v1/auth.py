from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.student import User, StudentProfile, UserRole
from app.schemas.student_schema import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user and create student profile if applicable"
)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Register a new user account with bcrypt password hashing
    and return an initial JWT access token.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # Create User record
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If role is student, initialize default profile
    if user.role == UserRole.STUDENT:
        student_profile = StudentProfile(
            user_id=user.id,
            name=user.email.split("@")[0].capitalize(),
            department="Computer Science & Engineering",
            year=1,
            semester=1
        )
        db.add(student_profile)
        db.commit()

    # Generate JWT Token
    access_token = create_access_token(
        subject=user.id,
        role=user.role.value if hasattr(user.role, "value") else str(user.role)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate user and retrieve JWT access token"
)
def login(login_data: UserLogin, db: Session = Depends(get_db)) -> Any:
    """
    Validate credentials with bcrypt and return a signed JWT token.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=user.id,
        role=user.role.value if hasattr(user.role, "value") else str(user.role)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get profile of currently logged-in user"
)
def get_me(current_user: User = Depends(get_current_user)) -> Any:
    """Returns the currently authenticated user's metadata."""
    return current_user
