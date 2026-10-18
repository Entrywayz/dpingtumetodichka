from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import User
from .repositories import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Недействительный или просроченный токен",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id_raw: str | None = payload.get("sub")
        if user_id_raw is None:
            raise credentials_error
        user_id = int(user_id_raw)
    except (JWTError, ValueError):
        raise credentials_error

    user = UserRepository(db).get(user_id)
    if user is None:
        raise credentials_error

    return user


def require_role(*allowed_roles: str):
    normalized_allowed = {r.lower() for r in allowed_roles}

    def checker(user: User = Depends(get_current_user)) -> User:
        if not user.role or user.role.lower() not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Недостаточно прав. Требуется одна из ролей: {', '.join(allowed_roles)}",
            )
        return user

    return checker