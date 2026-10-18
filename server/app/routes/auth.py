from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..schemas.auth import LoginRequest, Token, UserResponse
from ..services.auth import authenticate_user, create_access_token, get_current_user
from ..database import get_db
from ..models import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login_route(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.login, req.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль"
        )
    
    token = create_access_token(user, remember_me=req.remember_me)
    return Token(access_token=token)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user