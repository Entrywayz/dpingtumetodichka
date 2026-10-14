from sqlalchemy.orm import Session

from ..repositories import UserRepository
from .auth import hash_password


def seed_users(db: Session) -> None:
    repo = UserRepository(db)
    if repo.get_by_login("rab"):     
        return

    repo.create({"login": "rab",   "password_hash": hash_password("123"), "role": "employee"})
    repo.create({"login": "admin", "password_hash": hash_password("123"), "role": "admin"})