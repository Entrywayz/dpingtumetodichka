from sqlalchemy import or_
from ..models import Product
from .base import BaseRepository


class ProductRepository(BaseRepository):
    model = Product

    def search(self, query: str) -> list[Product]:
        pattern = f"%{query}%"
        return (
            self.db.query(Product)
            .filter(or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
            ))
            .all()
        )