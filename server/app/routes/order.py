from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.order import OrderResponse, OrderCreate
from app.repositories.order import OrderRepository
from app.dependencies import require_role

router = APIRouter(tags=["orders"])

@router.get("/orders", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return OrderRepository(db).get_all()

@router.post("/orders", response_model=OrderResponse, status_code=201, dependencies=[Depends(require_role("employee", "admin"))])
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    return OrderRepository(db).create(data.model_dump())

@router.delete("/orders/{id}", status_code=204, dependencies=[Depends(require_role("employee", "admin"))])
def delete_order(id: int, db: Session = Depends(get_db)):
    if not OrderRepository(db).delete(id):
        raise HTTPException(404, "Заказ не найден")