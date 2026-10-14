from sqlalchemy import or_
from ..models import Product
from .base import BaseRepository


class ProductRepository(BaseRepository):
    model = Product

    def search(self, query: str | None = None) -> list[Product]:
        q = self.db.query(Product)
        if query:
            pattern = f"%{query}%"
            q = q.filter(or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
            ))
        return q.order_by(Product.id).all()