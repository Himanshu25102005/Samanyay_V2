# Samanyay V2

Samanyay is an end‑to‑end AI co-pilot for legal teams. It blends rich case/document management with AI drafting, multilingual research, and compliance tooling, enabling advocates, analysts, and in‑house counsel to move from intake to filing inside one workspace.

---

## Highlights
- **AI-first workflows**: contextual document Q&A, drafting assistance, multilingual research, and task summarization across practice areas.
- **Full-stack monorepo**: Next.js 15 front-end (`frontend_v2`) and Express/MongoDB back-end (`backend_v2`) with shared auth/session contracts.
- **Secure collaboration**: Passport-based email/password & OAuth logins, session cookies with configurable domain, and granular task/case models.
- **File intelligence**: Multer-powered uploads, preview/download APIs, and analyzer routes that stream AI insights for large documents.
- **Deployment ready**: Render/Node deployment scripts, environment templates, and troubleshooting notes captured in `*_FIX.md` guides.

---

## Repository Layout
```
Samanyay_V2(backup)/
├── backend_v2/            # Express + MongoDB API, auth, file uploads, views
│   ├── models/            # Mongoose schemas for cases, documents, tasks
│   ├── routes/            # REST endpoints (auth, cases, documents, tasks, etc.)
│   ├── uploads/           # Sample uploaded assets (gitignored in production)
│   ├── views/             # EJS templates (health/error pages)
│   ├── env.example        # Backend environment contract
│   └── bin/www            # Express server bootstrap
├── frontend_v2/           # Next.js 15 + React 19 application
│   ├── src/app/           # App Router pages, API routes, feature screens
│   ├── components/        # Shared UI (Navbar, Sidebar, i18n provider)
│   ├── animations/        # Custom shaders/visuals (e.g., Plasma background)
│   ├── public/            # Static assets and logos
│   ├── env.example        # Frontend environment contract
│   └── README.md          # Front-end-specific docs
├── *.md                   # Point-fix guides (CORS, session cookies, etc.)
└── readme.md              # You are here
```

> Tip: the `*_FIX.md` files capture historical production issues (CORS, authentication, cookies, analyzer endpoints, etc.). Keep them handy when debugging.

---

## Technology Stack

| Layer      | Tech & Libraries | Notes |
|------------|------------------|-------|
| Frontend   | Next.js 15 (App Router), React 19, Framer Motion, i18next/react-i18next, Tailwind/PostCSS, `ogl` for shaders | Turbopack dev server (`npm run dev`). Uses `NEXT_PUBLIC_API_URL` for routing all server calls. |
| Backend    | Express 4, MongoDB/Mongoose 8, Passport (local + Google OAuth), Express Session, Multer, CORS, dotenv | Server started via `node ./bin/www` (port 5000 default). Provides REST + file streaming APIs. |
| Auth       | Passport strategies + session cookies | Cookie domain configurable, supports Google OAuth 2.0. |
| Storage    | MongoDB | Connection string configured via `MONGODB_URI` (fallbacks supported). |
| Tooling    | ESLint 9 (frontend), Nodemon (backend dev), Supertest (API smoke tests) | Run lint/tests before commits. |

---

## Feature Modules
- **Legal Research (`src/app/Legal-Research`)**: AI-powered jurisprudence search and multilingual summaries.
- **Drafting Assistant (`src/app/Drafting-Assistant`)**: Draft generation, improvement, uploads, voice chat, and secure downloads.
- **Document Analysis (`src/app/Document-Analysis`)**: Specific-document analysis, chat with documents, risk summaries, and shareable insights.
- **Case Management (`src/app/Case-Management`)**: Dashboard for tasks, client files, and workflow tracking.
- **Authentication & Profile (`src/app/login`, `src/app/profile`)**: Handles onboarding, SSO, profile settings, and privacy/compliance pages.
- **Backend APIs (`backend_v2/routes`)**: REST endpoints mirroring the modules above plus `/api/user`, `/api/tasks`, `/api/documents`, etc., all sharing session-aware middleware.

---

## Prerequisites
- Node.js **>= 18.18** (Next 15 + React 19 requirement) and npm 9+.
- MongoDB instance (local Docker or Atlas cluster).
- Google OAuth credentials (optional) for social login.
- Modern browser for the App Router experience.

---

## Environment Setup
1. **Clone / Download**
   ```bash
   git clone <repo-url>
   cd Samanyay_V2(backup)
   ```
2. **Configure backend env**
   ```bash
   cd backend_v2
   cp env.example .env
   # edit MONGODB_URI, SESSION_SECRET, FRONTEND_URL, COOKIE_DOMAIN, OAuth keys
   ```
3. **Configure frontend env**
   ```bash
   cd ../frontend_v2
   cp env.example .env.local
   # set NEXT_PUBLIC_API_URL to your backend URL (e.g., http://localhost:5000)
   ```

> Ensure `FRONTEND_URL` (backend) and `NEXT_PUBLIC_API_URL` (frontend) point to each other when running locally or in production.

---

## Installation & Local Development

### Backend (`backend_v2`)
```bash
cd backend_v2
npm install
# optional: npm install --global nodemon
npm start            # runs node ./bin/www (PORT defaults to 5000)
# or: npx nodemon ./bin/www for live reload
```

### Frontend (`frontend_v2`)
```bash
cd frontend_v2
npm install
npm run dev          # Next.js dev server on http://localhost:3000
# Production build:
npm run build
npm start            # serves .next output (set PORT or default 3000)
```

### Connecting the apps
- Frontend relies on `NEXT_PUBLIC_API_URL` for all API calls (auth, cases, analyzer, drafting, etc.).
- Backend CORS/session config expects `FRONTEND_URL` and `COOKIE_DOMAIN` to be accurate; mismatches cause login loops or missing cookies.

---

## Testing & Quality
- **Backend API tests**: wire up Supertest suites (see `backend_v2/test-routes.js`) and run via `node test-routes.js` or add an npm script.
- **Frontend linting**: `npm run lint` inside `frontend_v2` (ESLint 9 + Next config).
- **Manual smoke**: `frontend_v2/test-backend.js` and related scripts help validate API URLs in both local and deployed environments.

---

## Deployment Notes
- `render.yaml` outlines a multi-service Render deployment (web service for frontend, Node service for backend, shared environment variables).
- `DEPLOYMENT_GUIDE.md` plus the various `*_FIX.md` docs capture battle-tested fixes for cookies, authentication, analyzer routes, and microservice setups.
- Ensure environment secrets are stored in your hosting provider; never commit `.env` files.

---

## Troubleshooting
- **Sessions not sticking**: verify `COOKIE_DOMAIN`, `FRONTEND_URL`, HTTPS usage, and that both services share the same top-level domain.
- **CORS errors**: align `origin` list in backend CORS middleware with the frontend host; see `CORS_FIX.md`.
- **Analyzer uploads failing**: check Multer limits and ensure `/uploads` directory is writable.
- **OAuth redirect mismatch**: `BACKEND_URL`/`API_URL` must match the callback registered at Google.

---

## Contribution Workflow
1. Fork/branch from `main`.
2. Run lint/tests locally.
3. Document env or infrastructure changes (update `.md` fix guides if relevant).
4. Use conventional commits or descriptive messages.
5. Open PR with screenshots for UI work or sample API responses for backend updates.

---

## License
License information has not been specified. Add `LICENSE` when the project is ready for open distribution and update this section accordingly.

---

Happy building with Samanyay! Reach out to the maintainers with deployment configs, feature requests, or bug reports via your internal channels.
