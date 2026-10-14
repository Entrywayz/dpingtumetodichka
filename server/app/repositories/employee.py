from ..models import Employee
from .base import BaseRepository


class EmployeeRepository(BaseRepository):
    model = Employee