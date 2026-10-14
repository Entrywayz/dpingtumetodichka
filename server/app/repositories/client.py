from ..models import Client
from .base import BaseRepository


class ClientRepository(BaseRepository):
    model = Client