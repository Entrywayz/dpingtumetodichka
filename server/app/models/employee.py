from sqlalchemy import Column, Integer, String, Text, Date
from sqlalchemy.orm import relationship
from ..database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    position = Column(String(100))
    birth_date = Column(Date)
    address = Column(Text)
    phone = Column(String(11))
    note = Column(Text)

    orders = relationship("Order", back_populates="employee")