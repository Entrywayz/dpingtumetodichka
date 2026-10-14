from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.client import ClientResponse, ClientCreate, ClientUpdate
from app.repositories.client import ClientRepository
from app.dependencies import require_role

router = APIRouter(tags=["clients"])


@router.get("/clients", response_model=list[ClientResponse], dependencies=[Depends(require_role("employee", "admin"))])
def get_clients(db: Session = Depends(get_db)):
    return ClientRepository(db).get_all()


@router.post("/clients", response_model=ClientResponse, status_code=201, dependencies=[Depends(require_role("employee", "admin"))])
def create_client(data: ClientCreate, db: Session = Depends(get_db)):
    return ClientRepository(db).create(data.model_dump())


@router.put("/clients/{id}", response_model=ClientResponse, dependencies=[Depends(require_role("employee", "admin"))])
def update_client(id: int, data: ClientUpdate,
                  db: Session = Depends(get_db)):
    updated = ClientRepository(db).update(
        id,
        data.model_dump(exclude_unset=True),  
    )
    if not updated:
        raise HTTPException(404, "Клиент не найден")
    return updated


@router.delete("/clients/{id}", status_code=204, dependencies=[Depends(require_role("employee", "admin"))])
def delete_client(id: int, db: Session = Depends(get_db)):
    if not ClientRepository(db).delete(id):
        raise HTTPException(404, "Клиент не найден")