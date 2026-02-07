# Samanyay V2

**An end-to-end AI co-pilot for legal teams**, blending rich case/document management with AI drafting, multilingual research, and compliance tooling, enabling advocates, analysts, and in-house counsel to move from intake to filing inside one workspace.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Service Architecture & Ports](#service-architecture--ports)
- [API Endpoints Documentation](#api-endpoints-documentation)
- [Environment Configuration](#environment-configuration)
- [Installation & Setup](#installation--setup)
- [Development Guide](#development-guide)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)
- [Technology Stack](#technology-stack)

---

## Architecture Overview

Samanyay V2 is a **full-stack monorepo** with a microservices architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                             │
│                  (https://samanyay.com)                      │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend Service (Next.js 15)                    │
│              Port: 3000 (dev) / Production                    │
│              Domain: https://samanyay.com                     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js API Routes (Proxy Layer)                   │   │
│  │  - /api/user          → Backend API                  │   │
│  │  - /api/cases         → Backend API                  │   │
│  │  - /api/tasks         → Backend API                  │   │
│  │  - /api/documents     → Backend API                  │   │
│  │  - /api/analyzer/*    → Analyzer Microservice        │   │
│  │  - /api/legal-research/* → Legal Research Service    │   │
│  │  - /api/drafting/*    → Drafting Microservice        │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────┬───────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌──────────────┐ ┌──────────────┐
│ Backend API   │ │  Analyzer    │ │ Legal        │
│ (Express)     │ │  Service     │ │ Research     │
│ Port: 5000    │ │  Port: 8001  │ │ Port: 8000   │
│               │ │              │ │              │
│ - Auth        │ │ - Document   │ │ - Query      │
│ - Cases       │ │   Analysis   │ │ - Search     │
│ - Tasks       │ │ - Chat       │ │ - Summaries  │
│ - Documents   │ │ - Upload     │ │              │
└───────┬───────┘ └──────────────┘ └──────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Database                                │
│              Port: 27017 (default)                           │
│              Connection: MONGODB_URI                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Service Architecture & Ports

### Core Services

| Service | Technology | Port (Dev) | Port (Prod) | Domain/URL | Purpose |
|---------|-----------|------------|-------------|------------|---------|
| **Frontend** | Next.js 15 + React 19 | `3000` | `3000` (or env) | `https://samanyay.com` | Main web application, UI, and API proxy layer |
| **Backend API** | Express 4 + MongoDB | `5000` | `5000` (or env) | `https://samanyay.com/api/*` | Core REST API, authentication, session management |
| **MongoDB** | MongoDB | `27017` | `27017` | Connection string | Primary database for users, cases, tasks, documents |

### Microservices

| Service | Technology | Port | Default URL | Environment Variable | Purpose |
|---------|-----------|------|-------------|---------------------|---------|
| **Analyzer Service** | FastAPI/Python | `8001` | `http://34.180.5.50:8001` | `ANALYZER_BASE_URL` | Document analysis, chat, upload, voice chat |
| **Legal Research Service** | FastAPI/Python | `8000` | `http://34.180.51.246:8000` | `LEGAL_RESEARCH_BASE_URL` | Legal research queries, multilingual summaries |
| **Drafting Service** | FastAPI/Python | `8002` | `http://34.180.5.50:8002` | `DRAFTING_BASE_URL` | Document drafting, improvement, upload, text-to-docx |

### Service Communication Flow

```
Browser Request
    ↓
Frontend (Next.js) - Port 3000
    ├─→ /api/user, /api/cases, /api/tasks, /api/documents
    │   └─→ Backend API (Express) - Port 5000
    │       └─→ MongoDB - Port 27017
    │
    ├─→ /api/analyzer/*
    │   └─→ Analyzer Microservice - Port 8001
    │
    ├─→ /api/legal-research/*
    │   └─→ Legal Research Microservice - Port 8000
    │
    └─→ /api/drafting/*
        └─→ Drafting Microservice - Port 8002
```

---

## API Endpoints Documentation

### Backend API (Express) - Port 5000

**Base URL**: `https://samanyay.com/api` (production) or `http://localhost:5000/api` (development)

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login with email/password | No |
| `POST` | `/api/auth/logout` | Logout current user | Yes |
| `GET` | `/api/auth/google` | Initiate Google OAuth | No |
| `GET` | `/api/auth/google/callback` | Google OAuth callback | No |
| `GET` | `/api/user` | Get current authenticated user | Yes |
| `GET` | `/api/test` | Health check endpoint | No |

#### Case Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `GET` | `/api/cases` | Get all cases for authenticated user | Yes |
| `GET` | `/api/cases/:caseId` | Get specific case by ID | Yes |
| `POST` | `/api/cases` | Create new case | Yes |
| `PUT` | `/api/cases/:caseId` | Update case | Yes |
| `DELETE` | `/api/cases/:caseId` | Delete case | Yes |

#### Task Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `GET` | `/api/cases/:caseId/tasks` | Get all tasks for a case | Yes |
| `POST` | `/api/cases/:caseId/tasks` | Create new task | Yes |
| `PUT` | `/api/tasks/:taskId` | Update task | Yes |
| `PATCH` | `/api/tasks/:taskId/complete` | Mark task as completed | Yes |
| `PATCH` | `/api/tasks/:taskId/incomplete` | Mark task as incomplete | Yes |
| `DELETE` | `/api/tasks/:taskId` | Delete task | Yes |
| `POST` | `/api/tasks/:taskId/comments` | Add comment to task | Yes |

#### Document Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| `GET` | `/api/cases/:caseId/documents` | Get all documents for a case | Yes |
| `POST` | `/api/cases/:caseId/documents` | Upload document (multipart/form-data) | Yes |
| `PUT` | `/api/documents/:docId` | Update document metadata | Yes |
| `DELETE` | `/api/documents/:docId` | Delete document | Yes |
| `GET` | `/api/documents/:docId/download` | Download document file | Yes |

#### Drafting Service Proxy (Backend)

| Method | Endpoint | Description | Proxies To |
|--------|----------|-------------|-----------|
| `*` | `/api/drafting/*` | All drafting requests | `DRAFTING_BASE_URL/drafting/*` |

---

### Frontend API Routes (Next.js Proxy) - Port 3000

**Base URL**: `https://samanyay.com/api` (production) or `http://localhost:3000/api` (development)

These routes act as proxies, forwarding requests to backend services while handling CORS, cookies, and authentication.

#### User & Cases Proxy Routes

| Method | Endpoint | Proxies To | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/user` | Backend `/api/user` | Get current user (with cookie normalization) |
| `GET` | `/api/cases` | Backend `/api/cases` | Get all cases |
| `POST` | `/api/cases` | Backend `/api/cases` | Create case |
| `GET` | `/api/cases/[...path]` | Backend `/api/cases/*` | Dynamic case routes |
| `GET` | `/api/tasks/[...path]` | Backend `/api/tasks/*` | Dynamic task routes |
| `GET` | `/api/documents/[...path]` | Backend `/api/documents/*` | Dynamic document routes |
| `GET` | `/api/documents/[docId]/preview` | Backend `/api/documents/:docId/preview` | Preview document |
| `GET` | `/api/documents/[docId]/download` | Backend `/api/documents/:docId/download` | Download document |

#### Analyzer Service Proxy Routes

**Base**: `ANALYZER_BASE_URL` (default: `http://34.180.5.50:8001`)

| Method | Endpoint | Proxies To | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/analyzer/health` | `{ANALYZER_BASE_URL}/health` | Health check |
| `POST` | `/api/analyzer/upload` | `{ANALYZER_BASE_URL}/analyzer/upload` | Upload document for analysis |
| `POST` | `/api/analyzer/analyze` | `{ANALYZER_BASE_URL}/analyzer/analyze` | Analyze document |
| `POST` | `/api/analyzer/chat` | `{ANALYZER_BASE_URL}/analyzer/chat` | Chat with document |
| `POST` | `/api/analyzer/voice-chat` | `{ANALYZER_BASE_URL}/analyzer/voice-chat` | Voice chat with document |
| `*` | `/api/analyzer/[...slug]` | `{ANALYZER_BASE_URL}/analyzer/*` | Dynamic analyzer routes |

**Note**: The Case Management Smart Modal uses `/api/analyzer/upload` and `/api/analyzer/chat` for document analysis. Documents are automatically uploaded to the analyzer service before analysis.

#### Legal Research Service Proxy Routes

**Base**: `LEGAL_RESEARCH_BASE_URL` (default: `http://34.180.51.246:8000`)

| Method | Endpoint | Proxies To | Description |
|--------|----------|------------|-------------|
| `POST` | `/api/legal-research/query` | `{LEGAL_RESEARCH_BASE_URL}/legal-research/query` | Legal research query |
| `*` | `/api/legal-research/[...slug]` | `{LEGAL_RESEARCH_BASE_URL}/*` | Dynamic legal research routes |

#### Drafting Service Proxy Routes

**Base**: `DRAFTING_BASE_URL` (default: `http://34.180.5.50:8002`)

| Method | Endpoint | Proxies To | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/drafting/health` | `{DRAFTING_BASE_URL}/health` | Health check |
| `POST` | `/api/drafting/new` | `{DRAFTING_BASE_URL}/drafting/new` | Create new draft |
| `POST` | `/api/drafting/improve` | `{DRAFTING_BASE_URL}/drafting/improve` | Improve existing draft |
| `POST` | `/api/drafting/upload` | `{DRAFTING_BASE_URL}/drafting/upload` | Upload document for drafting |
| `POST` | `/api/drafting/voice-chat` | `{DRAFTING_BASE_URL}/drafting/voice-chat` | Voice chat for drafting |
| `POST` | `/api/drafting/text-to-docx` | `{DRAFTING_BASE_URL}/drafting/text-to-docx` | Convert text to DOCX |
| `GET` | `/api/drafting/download/[filename]` | `{DRAFTING_BASE_URL}/drafting/download/[filename]` | Download drafted document |

**Note**: The Case Management Smart Modal uses `/api/drafting/upload` and `/api/drafting/new` for document drafting, and `/api/drafting/improve` for refining results. Source documents are automatically uploaded to the drafting service when available.

---

## Environment Configuration

### Frontend Environment Variables

**File**: `frontend_v2/.env.local` (development) or deployment platform settings (production)

| Variable | Description | Default (Dev) | Production Example |
|----------|-------------|---------------|-------------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000` | `https://samanyay.com` |
| `ANALYZER_BASE_URL` | Analyzer microservice URL | `http://34.180.5.50:8001` | `http://34.180.5.50:8001` |
| `LEGAL_RESEARCH_BASE_URL` | Legal research microservice URL | `http://34.180.51.246:8000` | `http://34.180.51.246:8000` |
| `DRAFTING_BASE_URL` | Drafting microservice URL | `http://34.180.5.50:8002` | `http://34.180.5.50:8002` |
| `LEGAL_RESEARCH_TIMEOUT_MS` | Legal research request timeout | `300000` (5 min) | `300000` |

### Backend Environment Variables

**File**: `backend_v2/.env`

| Variable | Description | Default (Dev) | Production Example |
|----------|-------------|---------------|-------------------|
| `PORT` | Backend server port | `5000` | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/samanyay` | `mongodb+srv://...` |
| `MONGO_URL` | Alternative MongoDB URI (fallback) | Same as `MONGODB_URI` | Same as `MONGODB_URI` |
| `DB_SAMANYAY` | Alternative MongoDB URI (fallback) | Same as `MONGODB_URI` | Same as `MONGODB_URI` |
| `SESSION_SECRET` | Session encryption secret | `your-super-secret-session-key-here` | Strong random string |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` | `https://samanyay.com` |
| `BACKEND_URL` | Backend API URL (for OAuth) | `http://localhost:5000` | `https://samanyay.com` |
| `API_URL` | Alternative backend URL (fallback) | Same as `BACKEND_URL` | Same as `BACKEND_URL` |
| `COOKIE_DOMAIN` | Session cookie domain | `undefined` (dev) | `.samanyay.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - | From Google Console |
| `DRAFTING_BASE_URL` | Drafting microservice URL | `http://34.180.5.50:8002` | `http://34.180.5.50:8002` |
| `NODE_ENV` | Environment mode | `development` | `production` |

### Environment Setup Checklist

#### Frontend Setup
```bash
cd frontend_v2
cp env.example .env.local
# Edit .env.local with your values
```

#### Backend Setup
```bash
cd backend_v2
cp env.example .env
# Edit .env with your values
```

**Critical Production Settings**:
- ✅ `COOKIE_DOMAIN` must be `.samanyay.com` (with leading dot) for subdomain cookie sharing
- ✅ `SESSION_SECRET` must be a strong, random string (use `openssl rand -base64 32`)
- ✅ `NODE_ENV=production` for production deployments
- ✅ All URLs must use HTTPS in production
- ✅ `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` must match your production domain

---

## Installation & Setup

### Prerequisites

- **Node.js** >= 18.18 (required for Next.js 15 + React 19)
- **npm** >= 9.0
- **MongoDB** instance (local or Atlas)
- **Google OAuth credentials** (optional, for social login)

### Quick Start

#### 1. Clone Repository
```bash
git clone <repo-url>
cd Samanyay_V2(backup)
```

#### 2. Backend Setup
```bash
cd backend_v2
npm install
cp env.example .env
# Edit .env with your configuration
npm start
# Backend runs on http://localhost:5000
```

#### 3. Frontend Setup
```bash
cd frontend_v2
npm install
cp env.example .env.local
# Edit .env.local with your configuration
npm run dev
# Frontend runs on http://localhost:3000
```

### Development Mode

**Backend** (with auto-reload):
```bash
cd backend_v2
npx nodemon ./bin/www
```

**Frontend** (with Turbopack):
```bash
cd frontend_v2
npm run dev
```

---

## Development Guide

### Project Structure

```
Samanyay_V2(backup)/
├── backend_v2/                 # Express + MongoDB Backend
│   ├── bin/www                 # Server bootstrap (port 5000)
│   ├── app.js                   # Express app configuration
│   ├── routes/                  # API route handlers
│   │   ├── index.js            # Auth routes (/api/auth/*, /api/user)
│   │   ├── cases.js            # Case/Task/Document routes
│   │   └── users.js            # User model (Passport)
│   ├── models/                  # Mongoose schemas
│   │   ├── Case.js
│   │   ├── Task.js
│   │   └── Document.js
│   ├── uploads/                 # File uploads directory
│   └── views/                   # EJS templates (error pages)
│
├── frontend_v2/                 # Next.js 15 Frontend
│   ├── src/app/                 # App Router pages & API routes
│   │   ├── api/                 # Next.js API route proxies
│   │   │   ├── user/           # User proxy
│   │   │   ├── cases/          # Cases proxy
│   │   │   ├── tasks/          # Tasks proxy
│   │   │   ├── documents/     # Documents proxy
│   │   │   ├── analyzer/       # Analyzer microservice proxy
│   │   │   ├── legal-research/ # Legal research proxy
│   │   │   └── drafting/       # Drafting microservice proxy
│   │   ├── Case-Management/    # Case management UI with Smart Modal (Analysis & Drafting)
│   │   ├── Document-Analysis/ # Document analysis UI
│   │   ├── Drafting-Assistant/ # Drafting UI
│   │   └── Legal-Research/    # Legal research UI
│   ├── components/              # Shared React components
│   ├── lib/                     # Utilities (api.js, userUtils.js)
│   └── public/                  # Static assets
│
└── Fixes/                       # Production fix documentation
    ├── CORS_FIX.md
    ├── COOKIE_FIX_FINAL.md
    ├── ANALYZER_ROUTE_FIX.md
    └── ...
```

### API Request Flow

1. **Browser** → Makes request to `/api/cases`
2. **Frontend (Next.js)** → Intercepts at `src/app/api/cases/route.js`
3. **Next.js API Route** → Proxies to `NEXT_PUBLIC_API_URL/api/cases` (Backend)
4. **Backend (Express)** → Handles at `routes/cases.js`
5. **MongoDB** → Queries database
6. **Response** → Flows back through the chain

### Testing

**Backend API Tests**:
```bash
cd backend_v2
node test-routes.js
```

**Frontend Linting**:
```bash
cd frontend_v2
npm run lint
```

---

## Deployment Guide

### Production Architecture

In production, all services are typically deployed behind a reverse proxy (Nginx) on the same domain:

```
Internet
    ↓
Nginx (Port 443/80)
    ├─→ Frontend (Next.js) - Port 3000
    ├─→ Backend API (Express) - Port 5000
    └─→ Static Assets
```

### Deployment Checklist

#### Frontend Deployment
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Set `ANALYZER_BASE_URL` (if different from default)
- [ ] Set `LEGAL_RESEARCH_BASE_URL` (if different from default)
- [ ] Set `DRAFTING_BASE_URL` (if different from default)
- [ ] Run `npm run build` to create production build
- [ ] Deploy `.next` directory or use platform-specific deployment

#### Backend Deployment
- [ ] Set `MONGODB_URI` to production database
- [ ] Set `SESSION_SECRET` to strong random string
- [ ] Set `FRONTEND_URL` to production frontend URL
- [ ] Set `BACKEND_URL` to production backend URL
- [ ] Set `COOKIE_DOMAIN` to `.yourdomain.com`
- [ ] Set `NODE_ENV=production`
- [ ] Configure Google OAuth credentials
- [ ] Ensure MongoDB is accessible from deployment environment

#### Microservices
- [ ] Ensure microservices are running and accessible
- [ ] Verify firewall rules allow communication
- [ ] Update environment variables if microservice URLs change

### Platform-Specific Notes

**Render.com**: See `Fixes/render.yaml` for multi-service configuration

**Vercel**: Frontend deployment with serverless functions for API routes

**GCP Cloud Run**: Both frontend and backend can be deployed as Cloud Run services

---

## Troubleshooting

### Common Issues

#### 1. Sessions Not Sticking
**Symptoms**: Users logged out immediately, authentication fails

**Solutions**:
- Verify `COOKIE_DOMAIN` is set to `.yourdomain.com` (with leading dot)
- Ensure `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` match production domain
- Check that both services share the same top-level domain
- Verify HTTPS is used in production (cookies require secure in production)
- Check `sameSite` cookie setting (should be `none` in production with cross-domain)

**Reference**: See `Fixes/COOKIE_FIX_FINAL.md`

#### 2. CORS Errors
**Symptoms**: Browser blocks API requests, "CORS policy" errors

**Solutions**:
- Verify `FRONTEND_URL` is in backend CORS allowed origins
- Check `NEXT_PUBLIC_API_URL` matches backend URL
- Ensure credentials are included in requests (`credentials: 'include'`)

**Reference**: See `Fixes/CORS_FIX.md`

#### 3. 431 Request Header Too Large
**Symptoms**: "Request Header Fields Too Large" error

**Solutions**:
- Clear browser cookies for the domain
- Check for cookie accumulation (multiple `connect.sid` cookies)
- Verify cookie cleanup in OAuth callback routes

**Reference**: See `Fixes/NGINX_431_FIX.md`

#### 4. Microservice Connection Failures
**Symptoms**: 502 Bad Gateway, service unavailable

**Solutions**:
- Verify microservice is running: `curl http://34.180.5.50:8001/health`
- Check environment variables are set correctly
- Verify network connectivity and firewall rules
- Check microservice logs for errors

**Reference**: See `Fixes/MICROSERVICES_DEPLOYMENT_FIX.md`

#### 5. Analyzer/Drafting Upload Failures
**Symptoms**: File uploads fail, FormData errors

**Solutions**:
- Verify `Content-Type` header is not manually set for FormData (let browser set it)
- Check file size limits (Multer default: 10MB)
- Ensure `/uploads` directory is writable
- Verify microservice accepts multipart/form-data

**Reference**: See `Fixes/ANALYZER_ROUTE_FIX.md`

### Debugging Tools

**Backend Health Check**:
```bash
curl http://localhost:5000/api/test
```

**Frontend API Test**:
```bash
cd frontend_v2
node test-backend.js
```

**MongoDB Connection Test**:
```bash
# In backend_v2 directory
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(e => console.error(e))"
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4, PostCSS
- **Animations**: Framer Motion
- **i18n**: i18next, react-i18next
- **Shaders**: `ogl` for WebGL effects
- **Markdown**: react-markdown, remark-gfm, rehype-highlight

### Backend
- **Framework**: Express 4.16.1
- **Database**: MongoDB with Mongoose 8
- **Authentication**: Passport.js (Local + Google OAuth 2.0)
- **Sessions**: express-session with connect-mongo
- **File Uploads**: Multer
- **CORS**: cors middleware
- **View Engine**: EJS (for error pages)

### Infrastructure
- **Database**: MongoDB (local or Atlas)
- **Session Store**: MongoDB (via connect-mongo)
- **File Storage**: Local filesystem (`backend_v2/uploads/`)
- **Reverse Proxy**: Nginx (production)

### Microservices
- **Analyzer**: FastAPI/Python (Port 8001)
- **Legal Research**: FastAPI/Python (Port 8000)
- **Drafting**: FastAPI/Python (Port 8002)

---

## Repository Layout

```
Samanyay_V2(backup)/
├── backend_v2/            # Express + MongoDB API
│   ├── models/            # Mongoose schemas (Case, Task, Document, User)
│   ├── routes/            # REST endpoints (auth, cases, users)
│   ├── uploads/         # Uploaded files (gitignored)
│   ├── views/             # EJS templates (error pages)
│   ├── bin/www            # Server bootstrap
│   ├── app.js             # Express app configuration
│   ├── env.example        # Environment template
│   └── package.json
│
├── frontend_v2/           # Next.js 15 application
│   ├── src/app/           # App Router (pages + API routes)
│   │   ├── api/           # Next.js API route proxies
│   │   ├── Case-Management/    # Smart Modal for document analysis & drafting
│   │   ├── Document-Analysis/
│   │   ├── Drafting-Assistant/
│   │   └── Legal-Research/
│   ├── components/        # Shared React components
│   ├── lib/               # Utilities (api.js, userUtils.js)
│   ├── animations/        # Custom shaders (Plasma.jsx)
│   ├── public/            # Static assets
│   ├── env.example        # Environment template
│   └── package.json
│
├── Fixes/                 # Production fix documentation
│   ├── CORS_FIX.md
│   ├── COOKIE_FIX_FINAL.md
│   ├── ANALYZER_ROUTE_FIX.md
│   ├── MICROSERVICES_DEPLOYMENT_FIX.md
│   ├── NGINX_431_FIX.md
│   └── render.yaml
│
└── readme.md              # This file
```

---

## Feature Modules

- **Legal Research** (`/Legal-Research`): AI-powered jurisprudence search and multilingual summaries
- **Drafting Assistant** (`/Drafting-Assistant`): Draft generation, improvement, uploads, voice chat, secure downloads
- **Document Analysis** (`/Document-Analysis`): Document-specific analysis, chat with documents, risk summaries
- **Case Management** (`/Case-Management`): Dashboard for tasks, client files, workflow tracking, **Smart Modal for document analysis and drafting**
- **Authentication** (`/login`, `/profile`): Email/password and Google OAuth login, profile management

### Case Management - Smart Modal Features

The Case Management module now includes a **Smart Modal** system that provides seamless document analysis and drafting capabilities directly from the case file view, without navigating away from the case context.

#### Key Features

1. **Document Analysis Modal**
   - **Trigger**: Click the "Analyze" button (🔍) on any document card
   - **Quick Prompts**: Pre-set analysis options:
     - Summarize Key Facts
     - Identify Legal Risks
     - Extract Dates/Timeline
     - Find Contradictions
   - **Custom Analysis**: Dropdown selector with document analysis products or free-form question input
   - **Output**: Rich text editor with citation linking (dates and key terms are highlighted with hover tooltips showing source snippets)
   - **Actions**:
     - Copy to Clipboard
     - Save as New Document (saves AI output to case documents)
     - Refine Result (improve analysis with follow-up instructions)

2. **Drafting Assistant Modal**
   - **Trigger**: Click the "Draft" button (✒️) on any document card
   - **Document Type Selector**: Choose from:
     - Legal Notice
     - Reply Affidavit
     - Client Summary
     - Brief
   - **Drafting Instructions**: Free-form text input for custom drafting requirements
   - **Source Document**: Automatically uses the selected document as context
   - **Output**: Rich text editor with citation linking
   - **Actions**:
     - Copy to Clipboard
     - Save as New Document (saves draft to case documents)
     - Refine Result (improve draft with follow-up instructions)

#### Technical Implementation

**API Integration**:
- **Analysis**: Uses `/api/analyzer/upload` and `/api/analyzer/chat` endpoints
- **Drafting**: Uses `/api/drafting/upload` and `/api/drafting/new` endpoints
- **Refinement**: Uses `/api/drafting/improve` endpoint

**Parameters**:
- All API calls include required parameters: `document_id`, `user_id`, `language` (code format), `document_type` (backend format)
- Language is automatically converted from UI format to API code (e.g., "English" → "en")
- Document types are converted from UI labels to backend format (e.g., "Legal Notice" → "legal_notice")

**User Experience**:
- Modal stays open during processing to maintain context
- Results are editable directly in the modal
- Citation links provide source document context on hover
- Seamless integration with existing case document workflow

---

## Security Considerations

### Production Security Checklist

- [ ] Use strong `SESSION_SECRET` (32+ character random string)
- [ ] Enable HTTPS for all services
- [ ] Set secure cookie flags (`httpOnly`, `secure`, `sameSite`)
- [ ] Configure `COOKIE_DOMAIN` correctly for subdomain sharing
- [ ] Use environment variables for all secrets (never commit `.env`)
- [ ] Enable MongoDB authentication
- [ ] Configure CORS to only allow trusted origins
- [ ] Implement rate limiting for API endpoints
- [ ] Validate and sanitize all user inputs
- [ ] Use parameterized queries (Mongoose handles this)
- [ ] Set appropriate file upload limits (Multer: 10MB default)

---

## License

License information has not been specified. Add `LICENSE` when the project is ready for open distribution.

---

## Support & Contribution

For deployment configurations, feature requests, or bug reports, reach out via your internal channels.

**Key Documentation Files**:
- `Fixes/*.md` - Production troubleshooting guides
- `frontend_v2/DEPLOYMENT_GUIDE.md` - Frontend-specific deployment
- `backend_v2/test-routes.js` - API testing utilities

---

**Last Updated**: 2024  
**Version**: 2.0  
**Status**: Production Ready
