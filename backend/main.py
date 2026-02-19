from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config import get_settings
from database import init_indexes, close_db
from routes import auth, documents, compliance, climate, reports, dashboard, admin

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_indexes()
    yield
    await close_db()


app = FastAPI(
    title="AI IFRS Sustainability Dashboard",
    description="AI-powered IFRS S1/S2 compliance and climate risk analysis",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(compliance.router, prefix="/analysis", tags=["Compliance"])
app.include_router(climate.router, prefix="/climate", tags=["Climate Risk"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
