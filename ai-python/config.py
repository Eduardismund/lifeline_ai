"""Configuration module for LifelineAI API settings"""

import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables from .env file
load_dotenv()

# API Keys and URLs
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "openai/gpt-oss-120b"

# Spring Boot backend configuration
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8080/api")

# Foxit PDF API configuration
FOXIT_BASE_URL = "https://na1.fusion.foxit.com/pdf-services/api"
FOXIT_CLIENT_ID = os.getenv("FOXIT_CLIENT_ID")
FOXIT_CLIENT_SECRET = os.getenv("FOXIT_CLIENT_SECRET")

if not FOXIT_CLIENT_ID or not FOXIT_CLIENT_SECRET:
    print("Warning: FOXIT_CLIENT_ID or FOXIT_CLIENT_SECRET not set. PDF generation may not work.")

# Application settings
APP_TITLE = "Lifeline AI"
APP_VERSION = "1.0.0"
APP_HOST = "0.0.0.0"
APP_PORT = 8002

# Logging configuration
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# AI Analysis settings
MAX_TOKENS_ANALYSIS = 2500
MAX_TOKENS_NARRATIVE = 3000
TEMPERATURE = 0.3
EVIDENCE_TEXT_LIMIT = 2000  # Characters to include from each evidence file

# PDF Generation settings
PDF_TIMEOUT = 60  # seconds
PDF_CHECK_INTERVAL = 2  # seconds
PDF_MAX_ATTEMPTS = 20