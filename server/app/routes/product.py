from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.product import ProductResponse, ProductUpdate, ProductCreate
from app.repositories.product import ProductRepository
from app.dependencies import require_role

router = APIRouter(tags=["products"])

@router.get("/products", response_model=list[ProductResponse])
def get_products(q: str | None = None, db: Session = Depends(get_db)):
    return ProductRepository(db).search(q)


@router.post("/products", response_model=ProductResponse, status_code=201, dependencies=[Depends(require_role("employee", "admin"))])
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    return ProductRepository(db).create(data.model_dump())


@router.put("/products/{id}", response_model=ProductResponse, dependencies=[Depends(require_role("employee", "admin"))])
def update_product(id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    updated = ProductRepository(db).update(id, data.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(404, "Товар не найден")
    return updated


@router.delete("/products/{id}", status_code=204, dependencies=[Depends(require_role("employee", "admin"))])
def delete_product(id: int, db: Session = Depends(get_db)):
    try:
        deleted = ProductRepository(db).delete(id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Товар нельзя удалить: он есть в заказах")
    if not deleted:
        raise HTTPException(404, "Товар не найден")