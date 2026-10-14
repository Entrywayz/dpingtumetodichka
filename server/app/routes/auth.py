from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import login, create_access_token
from app.schemas.auth import LoginRequest, Token

router = APIRouter(tags=["auth"])

@router.post("/login", response_model=Token)
def auth_login(data: LoginRequest, db: Session = Depends(get_db)):
    user = login(db, data.login, data.password)
    if not user:
        raise HTTPException(401, "Неверный логин или пароль")
    return Token(access_token=create_access_token(user))