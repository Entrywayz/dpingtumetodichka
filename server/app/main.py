from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from app.routes import auth, client, order, employee, product

app = FastAPI(
    title=settings.app_name,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    openapi_url="/openapi.json" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount('/static', StaticFiles(directory=settings.static_dir), name='static')

app.include_router(auth.router)
app.include_router(client.router)
app.include_router(order.router)
app.include_router(product.router)
app.include_router(employee.router)

@app.on_event('startup')
def on_startup():
    init_db()

@app.get('/')
def root():
    return {
        'message': 'shop server is working!',
        'docs': 'api/docs'
    }

@app.get('/health')
def health_check():
    return {'status': 'healthy'}