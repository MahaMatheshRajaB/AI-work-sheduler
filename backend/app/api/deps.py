from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models.entities import User, Organization

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: int = payload.get("user_id")
    org_id: str = payload.get("org_id")
    if user_id is None or org_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id, User.org_id == org_id, User.is_active == True).first()
    if user is None:
        raise credentials_exception
    return user

def require_higher_authority(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.role or current_user.role.role_level != "HIGHER_AUTHORITY":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Higher Authority privilege required"
        )
    return current_user

def require_manager_or_higher(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.role or current_user.role.role_level not in ["MANAGER", "HIGHER_AUTHORITY"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Manager or Higher Authority privilege required"
        )
    return current_user
