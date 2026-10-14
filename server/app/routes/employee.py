from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.employee import EmployeeResponse, EmployeeCreate, EmployeeUpdate
from app.repositories.employee import EmployeeRepository
from app.dependencies import require_role

router = APIRouter(tags=["employees"], dependencies=[Depends(require_role("admin"))])

@router.get("/employees", response_model=list[EmployeeResponse])
def get_employees(db: Session = Depends(get_db)):
    return EmployeeRepository(db).get_all()


@router.post("/employees", response_model=EmployeeResponse, status_code=201)
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    return EmployeeRepository(db).create(data.model_dump())


@router.put("/employees/{id}", response_model=EmployeeResponse)
def update_employee(id: int, data: EmployeeUpdate, db: Session = Depends(get_db)):
    updated = EmployeeRepository(db).update(id, data.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(404, "Сотрудник не найден")
    return updated


@router.delete("/employees/{id}", status_code=204)
def delete_employee(id: int, db: Session = Depends(get_db)):
    try:
        deleted = EmployeeRepository(db).delete(id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "Нельзя удалить: у сотрудника есть заказы")
    if not deleted:
        raise HTTPException(404, "Сотрудник не найден")