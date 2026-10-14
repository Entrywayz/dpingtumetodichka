from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Client, Employee, Order, Product
from ..repositories import UserRepository
from .auth import hash_password

def seed_users(db: Session) -> None:
    repo = UserRepository(db)
    if repo.get_by_login("rab"):
        return

    repo.create({"login": "rab",   "password_hash": hash_password("123"), "role": "employee"})
    repo.create({"login": "admin", "password_hash": hash_password("123"), "role": "admin"})

CLIENTS = [
    {"id": 1, "full_name": "Комогорцев Анатолий Ярославович",
     "address": "ул. Гайдара 43, 84", "phone": "89263798473"},
    {"id": 2, "full_name": "Иванов Артем Сергеевич",
     "address": "пр. Победы 26, 78", "phone": "89085678947"},
    {"id": 3, "full_name": "Антипов Петр Иванович",
     "address": "пр. Ленинского Комсомола 38, 92", "phone": "89085678478"},
    {"id": 4, "full_name": "Иванов Иван Иванович",
     "address": "ул. Галкина 14, 47", "phone": "89157379378"},
]

EMPLOYEES = [
    {"id": 1, "full_name": "Лагин Николай Анатольевич", "position": "Продавец",
     "birth_date": date(1997, 3, 12), "address": "пр. Циолковского 38, 14",
     "phone": "89478945747", "note": "женат"},
    {"id": 2, "full_name": "Огурцов Антон Петрович", "position": "Продавец",
     "birth_date": date(1993, 1, 10), "address": "пр. Ленинского Комсомола 42, 15",
     "phone": "89868764536", "note": "холост"},
    {"id": 3, "full_name": "Колокольцев Анатолий Вениаминович", "position": "Продавец",
     "birth_date": date(1994, 11, 12), "address": "пр. Циолковского 48, 16",
     "phone": "89154879134", "note": "женат"},
    {"id": 4, "full_name": "Ратников Антон Игоревич", "position": "Администратор",
     "birth_date": date(1993, 1, 10), "address": "пр. Победы 15, 21",
     "phone": "89154879158", "note": "холост"},
]

PRODUCTS = [
    {"id": 1, "name": "LG 27MT58VF-PZ", "in_stock": 5, "price": Decimal("17990"),
     "description": (
         "LG 27MT58VF-PZ - это легкий и компактный телевизор, который идеально подойдет "
         "для вашей кухни или небольшого помещения. Он оснащен интерфейсами HDMI и USB, "
         "а встроенный проигрыватель видео, позволит вам смотреть фильмы в превосходном "
         "качестве 1080p. Его экран обладает широкими углами обзора благодаря IPS матрице, "
         "а наличие разъема VGA дает возможность использовать данную модель в качестве монитора."
     )},
    {"id": 2, "name": "LG 32LH590U", "in_stock": 6, "price": Decimal("20390"),
     "description": (
         "LG 32LH590U - это отличный телевизор для вашей семьи, который успешно совместит "
         "в себе все функции, присущие полноценному развлекательному медиацентру. Обладая "
         "большим набором интерфейсов, он с легкостью может взаимодействовать с любыми "
         "информационными носителями, включая просмотр ваших любимых фильмов напрямую "
         "с USB флэшки. Преимущества данной модели: встроенный модуль Wi-Fi, Smart TV, "
         "а также поддержка цифрового телевидения в формате DVB-T2. Диагональ составляет 32 дюйма."
     )},
    {"id": 3, "name": "Philips 40PFT5501/60", "in_stock": 3, "price": Decimal("28990"),
     "description": (
         "Philips 40PFT5501/60 - ультратонкий светодиодный FHD LED TV на базе ОС Android TV "
         "с технологией Pixel Plus HD. Android легко справляется с поставленными задачами, "
         "обеспечивая быстрое перемещение по меню телевизора, удобную работу с приложениями "
         "и легкое воспроизведение видеофайлов, чтобы вы могли в полной мере наслаждаться "
         "любимыми развлечениями. Технология Micro Dimming оптимизирует контрастность "
         "изображения на экране телевизора. Процессор Philips Pixel Plus HD оптимизирует "
         "качество изображения и обеспечивает кристальную четкость и великолепную контрастность. "
         "При потоковой передаче или просмотре дисков вы всегда будете наслаждаться четким "
         "изображением с яркими оттенками белого и глубокими оттенками черного."
     )},
    {"id": 4, "name": "Erisson 32LES76T2", "in_stock": 5, "price": Decimal("13990"),
     "description": (
         "Телевизор Erisson 32LES76T2 - это сочетание превосходного изображения и современных "
         "технологий по доступной цене. Большой выбор интерфейсов позволит без труда подключить "
         "его к большинству медийных устройств, включая компьютеры и игровые приставки. "
         "Благодаря наличию крепления стандарта Vesa вы без труда сможете подобрать кронштейн "
         "для удобного расположения на стене, а возможность воспроизведения файлов напрямую "
         "с USB-носителя способна превратить его в универсальный развлекательный центр, "
         "который будет радовать вас долгое время. Диагональ данной модели составляет 32 дюйма."
     )},
    {"id": 5, "name": "Fusion FLTV-32C12", "in_stock": 4, "price": Decimal("11990"),
     "description": (
         "Fusion FLTV-32C12 - компактный LED-телевизор с диагональю 32 дюйма. "
         "Подходит для кухни и спальни, оснащен разъемами HDMI и USB."
     )},
    {"id": 6, "name": "Panasonic TX-32DSR500", "in_stock": 2, "price": Decimal("24990"),
     "description": (
         "Panasonic TX-32DSR500 - LED-телевизор с диагональю 32 дюйма и поддержкой "
         "цифрового телевидения. Надежная модель для ежедневного просмотра."
     )},
]

ORDERS = [
    (1, 4, 1, 2, date(2017, 4, 19), date(2017, 4, 20)),   # Erisson,   Лагин,        Иванов А.С.
    (2, 1, 3, 3, date(2017, 4, 21), date(2017, 4, 22)),   # LG 27MT,   Колокольцев,  Антипов
    (3, 6, 1, 1, date(2017, 5, 1),  date(2017, 5, 2)),    # Panasonic, Лагин,        Комогорцев
    (4, 3, 1, 1, date(2017, 5, 3),  date(2017, 5, 4)),    # Philips,   Лагин,        Комогорцев
    (5, 5, 1, 2, date(2017, 5, 5),  date(2017, 5, 6)),    # Fusion,    Лагин,        Иванов А.С.
    (6, 3, 2, 3, date(2017, 5, 7),  date(2017, 5, 8)),    # Philips,   Огурцов,      Антипов
    (7, 5, 3, 3, date(2017, 5, 9),  date(2017, 5, 11)),   # Fusion,    Колокольцев,  Антипов
]


def seed_data(db: Session) -> None:
    """Порядок важен: сначала справочники, затем заказы с внешними ключами."""
    for row in CLIENTS:
        db.merge(Client(**row))
    for row in EMPLOYEES:
        db.merge(Employee(**row))
    for row in PRODUCTS:
        db.merge(Product(**row))
    db.flush()  

    for id_, product_id, employee_id, client_id, placed_at, completed_at in ORDERS:
        db.merge(Order(
            id=id_,
            product_id=product_id,
            employee_id=employee_id,
            client_id=client_id,
            placed_at=placed_at,
            completed_at=completed_at,
        ))
    db.commit()


def main() -> None:
    db = SessionLocal()
    try:
        seed_users(db)
        seed_data(db)
        print("Готово: пользователи, клиенты, сотрудники, товары и заказы добавлены.")
    finally:
        db.close()


if __name__ == "__main__":
    main()