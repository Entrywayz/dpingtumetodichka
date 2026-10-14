from sqlalchemy.orm import Session


class BaseRepository:
    model = None  

    def __init__(self, db: Session):
        self.db = db

    def get(self, obj_id: int):
        return self.db.get(self.model, obj_id)

    def get_all(self) -> list:
        return self.db.query(self.model).all()

    def create(self, data: dict):
        obj = self.model(**data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj_id: int, data: dict):
        obj = self.db.get(self.model, obj_id)
        if not obj:
            return None
        for field, value in data.items():
            setattr(obj, field, value)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj_id: int) -> bool:
        obj = self.db.get(self.model, obj_id)
        if not obj:
            return False
        self.db.delete(obj)
        self.db.commit()
        return True