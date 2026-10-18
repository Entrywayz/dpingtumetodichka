from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from ..config import settings
from ..models import User
from ..repositories import UserRepository
from ..database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

from datetime import datetime, timezone, timedelta
from jose import jwt
from ..config import settings
from ..models import User

def create_access_token(user: User, remember_me: bool = False) -> str:
    now = datetime.now(timezone.utc)
    
    if remember_me:
        expires_delta = timedelta(days=30)
    else:
        expires_delta = timedelta(hours=settings.access_token_expire_hours)

    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": now + expires_delta,
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def authenticate_user(db: Session, login_name: str, password: str) -> User | None:
    user = UserRepository(db).get_by_login(login_name)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Недействительный или просроченный токен",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    user = UserRepository(db).get_by_id(user_id)
    if not user:
        raise credentials_exception
    return user