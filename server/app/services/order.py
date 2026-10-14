from datetime import date
from sqlalchemy.orm import Session

from ..models import Order
from ..repositories import OrderRepository
from ..schemas.order import OrderCreate


class OrderValidationError(Exception):
    pass


def create_order(db: Session, data: OrderCreate) -> Order:
    repo = OrderRepository(db)
    if not repo.related_exist(data.product_id, data.employee_id, data.client_id):
        raise OrderValidationError("Товар, сотрудник или клиент не найдены")
    if data.completed_at is not None and data.placed_at is not None \
            and data.completed_at < data.placed_at:
        raise OrderValidationError(
            "Дата исполнения не может быть раньше даты размещения"
        )
    order_data = data.model_dump()
    if order_data["placed_at"] is None:
        order_data["placed_at"] = date.today()

    return repo.create(order_data)