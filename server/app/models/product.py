from sqlalchemy import Column, Integer, String, Text, Numeric
from sqlalchemy.orm import relationship
from ..database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    in_stock = Column(Integer, nullable=False, default=0)  # 1 — в наличии, 0 — нет
    price = Column(Numeric(10, 2), nullable=False)

    orders = relationship("Order", back_populates="product")