from ..models import User
from .base import BaseRepository


class UserRepository(BaseRepository):
    model = User

    def get_by_login(self, login: str) -> User | None:
        return self.db.query(User).filter(User.login == login).first()
    def get_by_id(self, user_id: int) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()