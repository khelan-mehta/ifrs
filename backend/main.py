import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from config import get_settings
from database import init_indexes, close_db
from routes import auth, documents, compliance, climate, reports, dashboard, admin, document_analysis

settings = get_settings()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("ifrs")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting IFRS Dashboard API v1.0.0")
    await init_indexes()
    logger.info("Database indexes initialized")
    yield
    await close_db()
    logger.info("Database connection closed")


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


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = round((time.time() - start) * 1000, 2)
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({duration}ms)")
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )


# Register routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(compliance.router, prefix="/analysis", tags=["Compliance"])
app.include_router(climate.router, prefix="/climate", tags=["Climate Risk"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(document_analysis.router, prefix="/document-analysis", tags=["Document Analysis"])


@app.get("/health")
async def health_check():
    from database import client
    try:
        await client.admin.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "version": "1.0.0",
        "database": db_status,
    }
