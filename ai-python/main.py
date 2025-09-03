"""
LifelineAI - AI-Powered Relationship Analysis API
Main application entry point with clean architecture
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from config import APP_TITLE, APP_VERSION, APP_HOST, APP_PORT, LOG_LEVEL
from utils import setup_logging
from routers import analysis, health

# Setup logging
setup_logging(LOG_LEVEL)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="AI-powered relationship analysis and PDF report generation for domestic violence support"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router, prefix="", tags=["Analysis"])
app.include_router(health.router, prefix="", tags=["Health"])


@app.get("/", tags=["Root"])
def root():
    """Root endpoint - service status"""
    return {
        "service": APP_TITLE,
        "version": APP_VERSION,
        "status": "running",
        "description": "AI-powered relationship analysis for domestic violence support"
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "service": APP_TITLE}


if __name__ == "__main__":
    logger.info(f"Starting {APP_TITLE} v{APP_VERSION}")
    uvicorn.run(
        app,
        host=APP_HOST,
        port=APP_PORT,
        log_level=LOG_LEVEL.lower()
    )