from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from .config import SECRET_KEY, ALGORITHM
from .database import get_db
from .models import User
from .repositories import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_error = HTTPException(
        status_code=401,
        detail="Недействительный или просроченный токен",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_error
    except JWTError: 
        raise credentials_error

    user = UserRepository(db).get(int(user_id))
    if user is None:
        raise credentials_error  
    return user


def require_role(*allowed_roles: str):
    def checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Недостаточно прав. Требуется роль: {', '.join(allowed_roles)}",
            )
        return user

    return checker