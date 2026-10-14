from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from ..config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_HOURS
from ..models import User
from ..repositories import UserRepository

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def login(db: Session, login_name: str, password: str) -> User | None:
    user = UserRepository(db).get_by_login(login_name)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user