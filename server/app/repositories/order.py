from sqlalchemy.orm import selectinload
from ..models import Order, Product, Employee, Client
from .base import BaseRepository


class OrderRepository(BaseRepository):
    model = Order

    def _with_related(self, query):
        return query.options(
            selectinload(Order.product),
            selectinload(Order.employee),
            selectinload(Order.client),
        )

    def get(self, obj_id: int) -> Order | None:
        return self._with_related(
            self.db.query(Order).filter(Order.id == obj_id)
        ).first()

    def get_all(self) -> list[Order]:
        return self._with_related(self.db.query(Order)).all()

    def related_exist(self, product_id: int, employee_id: int, client_id: int) -> bool:
        product = self.db.get(Product, product_id)
        employee = self.db.get(Employee, employee_id)
        client = self.db.get(Client, client_id)
        return all([product, employee, client])