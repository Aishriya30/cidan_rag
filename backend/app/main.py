import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import health, documents, chat, compliance
from app.services.seed_data import seed_database_if_empty

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cidan")

import asyncio

async def _bg_seed():
    await asyncio.sleep(1)
    try:
        seed_database_if_empty()
    except Exception as e:
        logger.warning(f"Notice during startup seeding: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CIDAN Backend successfully started and ready for requests.")
    asyncio.create_task(_bg_seed())
    yield
    logger.info("CIDAN Backend shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Regulatory Compliance RAG Chatbot for Commercial Banking",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for local development and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cidan.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(documents.router, prefix=settings.API_V1_STR, tags=["Documents"])
app.include_router(chat.router, prefix=settings.API_V1_STR, tags=["Chat"])
app.include_router(compliance.router, prefix=settings.API_V1_STR, tags=["Compliance"])

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
