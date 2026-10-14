from datetime import date
from pydantic import BaseModel, Field, ConfigDict


class EmployeeBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    position: str | None = None
    birth_date: date | None = None       
    address: str | None = None
    phone: str | None = Field(None, max_length=11)
    note: str | None = None               


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=255)
    position: str | None = None
    birth_date: date | None = None
    address: str | None = None
    phone: str | None = Field(None, max_length=11)
    note: str | None = None


class EmployeeResponse(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

class EmployeeShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    position: str | None = None