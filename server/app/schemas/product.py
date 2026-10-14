from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    in_stock: int = Field(0, ge=0)          
    price: Decimal = Field(..., gt=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    in_stock: int | None = Field(None, ge=0)
    price: Decimal | None = Field(None, gt=0)


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

class ProductShort(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    price: Decimal