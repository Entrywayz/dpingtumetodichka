from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from ..database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    address = Column(Text)
    phone = Column(String(11))

    orders = relationship(
        "Order",
        back_populates="client",
        cascade="all, delete-orphan",  
    )