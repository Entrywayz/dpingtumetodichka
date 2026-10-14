# schemas/order.py
from datetime import date
from pydantic import BaseModel, ConfigDict
from .product import ProductShort
from .client import ClientShort
from .employee import EmployeeShort

class OrderCreate(BaseModel):
    product_id: int
    employee_id: int
    client_id: int
    placed_at: date | None = None       
    completed_at: date | None = None  


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product: ProductShort      
    employee: EmployeeShort    
    client: ClientShort
    placed_at: date | None = None
    completed_at: date | None = None