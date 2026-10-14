from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    placed_at = Column(Date)    
    completed_at = Column(Date)   

    product = relationship("Product", back_populates="orders")
    employee = relationship("Employee", back_populates="orders")
    client = relationship("Client", back_populates="orders")