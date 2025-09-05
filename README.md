# LifelineAI

AI-powered relationship analysis platform that processes multi-modal evidence to generate comprehensive toxicity assessments and professional legal reports.

## Overview

LifelineAI helps users identify and document toxic relationship patterns through AI analysis of uploaded evidence (text, audio, video, images). The platform generates professional PDF reports suitable for legal proceedings and facilitates secure communication with trusted contacts.

## Key Features

- **Multi-Modal Evidence Processing** - Upload and analyze text, audio, video, and image evidence
- **AI Relationship Analysis** - Toxicity scoring (0-100) with attachment style assessment using advanced AI
- **Professional PDF Reports** - Court-ready documentation generated via automated workflow
- **Trusted Contact Network** - Secure sharing with therapists, lawyers, family members
- **Real-time Processing** - Event-driven architecture for immediate evidence analysis

## Tech Stack

### Backend
- **Java 17** with **Spring Boot 3.2** - Main REST API
- **Python 3.11** with **FastAPI** - AI processing service  
- **TiDB Cloud** - MySQL-compatible distributed database
- **JWT Authentication** - Secure user sessions

### AI & Processing
- **Groq API** with **gpt-oss-120b** - Relationship analysis
- **Foxit PDF API** - Professional document generation
- **AWS Transcribe** - Audio/video transcription
- **AWS Rekognition** - Image text extraction

### Cloud Infrastructure
- **AWS Lambda** (5 functions) - Serverless evidence processing
- **AWS S3** - Secure file storage with lifecycle policies
- **AWS DynamoDB** - Processing status tracking
- **AWS EventBridge** - Event-driven orchestration

### Frontend
- **React 19** with **TypeScript** - Modern web interface
- **Vite** - Build tooling
- **EmailJS** - Secure email integration

## Architecture

```
Evidence Upload → S3 → EventBridge → Lambda Processing → AI Analysis → PDF Generation → Trusted Contacts
```

## API Endpoints

### Backend Service (Java/Spring Boot)
- `POST /api/bonds/user/{userId}` - Create relationship bond
- `GET /api/bonds/{id}` - Get bond details
- `GET /api/bonds/user/{userId}` - List user's bonds
- `PUT /api/bonds/{id}` - Update bond
- `DELETE /api/bonds/{id}` - Delete bond

- `POST /api/evidence/relationship-bond/{bondId}` - Upload evidence
- `GET /api/evidence/{id}` - Get evidence details
- `GET /api/evidence/{id}/download-url` - Get download URL

- `POST /api/analysis` - Request toxicity analysis
- `GET /api/analysis/{bondId}` - Get analysis results
- `PUT /api/analysis/pdf-url/{bondId}` - Update PDF URL

- `GET /api/contacts/bond/{bondId}` - List trusted contacts
- `POST /api/contacts/bond/{bondId}` - Add trusted contact
- `DELETE /api/contacts/{contactId}` - Remove contact

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/{id}` - Get user profile

### AI Service (Python/FastAPI)
- `POST /analyze-relationship` - Perform AI relationship analysis
- `POST /generate-pdf-report` - Generate professional PDF report
- `POST /generate-personalized-email` - Create personalized email content

### AWS Lambda Functions
- `POST /presigned-url` - Generate S3 upload URLs
- `GET /evidence/{id}/status` - Check processing status  
- `POST /download-url` - Generate download URLs

## Setup & Configuration

### Backend Setup
1. Configure database profile in `application.properties`:
   - Set `spring.profiles.active=local` to use your own database
   - Update credentials in `application-local.properties`
   - Or use `spring.profiles.active=dev` for TiDB Cloud (credentials provided)
2. Run: `./gradlew bootRun`

### AI Service Setup
1. Create `.env` file in `ai-python/` with:
   ```
   GROQ_API_KEY=your-groq-api-key
   FOXIT_CLIENT_ID=your-foxit-client-id
   FOXIT_CLIENT_SECRET=your-foxit-client-secret
   BACKEND_BASE_URL=http://localhost:8080/api
   ```
2. Install dependencies: `pip install -r requirements.txt`
3. Run: `python main.py`

### Frontend Setup
1. API endpoint is configured in `src/services/api.ts` (defaults to `http://localhost:8080/api`)
2. EmailJS credentials can be set via environment variables or defaults are provided
3. Run: `npm install && npm run dev`

### AWS Setup
Deploy lambda functions: `cd aws-lambda-functions && sam deploy`

## How It Works

1. **Upload Evidence** - Users upload relationship evidence (messages, photos, audio, video)
2. **AI Processing** - Advanced AI analyzes patterns using psychological frameworks
3. **Generate Reports** - Professional PDF reports created via Foxit API workflow
4. **Share Securely** - AI-personalized emails sent to trusted contacts with reports attached