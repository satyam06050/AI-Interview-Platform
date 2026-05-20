# AI Interview Platform — MVP v1

A full-stack AI-powered mock interview platform built with **Next.js 14**, **FastAPI**, **PostgreSQL** (Docker), **Clerk** (Google OAuth), and **Google Gemini**.

---

## Tech Stack

| Layer | Tech | Version |
|-------|------|---------|
| Frontend | Next.js + Tailwind CSS | 14.2.3 / 3.4.4 |
| Auth | Clerk (Google Sign-in) | 5.1.6 |
| Backend | FastAPI + Uvicorn | 0.111.0 / 0.30.1 |
| Database | PostgreSQL (Docker) | 16-alpine |
| ORM | SQLAlchemy (async) | 2.0.30 |
| AI | Google Gemini Flash | 1.5-flash |
| Animation | Framer Motion | 11.2.10 |

---

## Project Structure

```
ai-interview-platform/
├── docker-compose.yml          # PostgreSQL container
├── UI_GUIDE.md                 # Design system reference
├── .env.example                # Root env vars
│
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── config.py           # Settings (pydantic-settings)
│   │   ├── database.py         # Async SQLAlchemy engine
│   │   ├── models/models.py    # ORM models
│   │   ├── schemas/schemas.py  # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── users.py        # /api/v1/users
│   │   │   ├── resumes.py      # /api/v1/resumes
│   │   │   └── interviews.py   # /api/v1/interviews
│   │   ├── services/
│   │   │   ├── gemini.py       # Q-gen + eval via Gemini
│   │   │   └── resume_parser.py# PDF text extraction
│   │   └── middleware/auth.py  # Clerk JWT verification
│   ├── sql/init.sql            # DB schema (auto-run by Docker)
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx       # Root layout + Clerk provider
    │   │   ├── page.tsx         # Landing page
    │   │   ├── globals.css
    │   │   ├── sign-in/         # Clerk sign-in page
    │   │   ├── dashboard/       # Main dashboard
    │   │   ├── interview/[id]/  # Live interview chat
    │   │   └── report/[id]/     # Score report
    │   ├── components/
    │   │   ├── layout/Topbar.tsx
    │   │   └── ui/
    │   │       ├── ResumeUpload.tsx
    │   │       └── NewInterviewModal.tsx
    │   ├── lib/api.ts           # Axios client
    │   ├── middleware.ts        # Clerk route protection
    │   └── types/index.ts
    ├── tailwind.config.js
    ├── package.json
    └── Dockerfile
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker + Docker Compose
- [Clerk account](https://clerk.com) (free)
- [Google AI Studio](https://aistudio.google.com) API key (free)

---

### Step 1 — Start PostgreSQL

```bash
# From project root
cp .env.example .env
docker-compose up -d

# Verify it's running
docker-compose ps
```

The `init.sql` schema runs automatically on first start.

---

### Step 2 — Backend setup

```bash
cd backend

# Copy and fill env
cp .env.example .env
# Edit .env — add your CLERK_SECRET_KEY, CLERK_JWT_ISSUER, GEMINI_API_KEY

# Create virtualenv
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install deps
pip install -r requirements.txt

# Run
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

#### Backend .env values to fill:
```
CLERK_SECRET_KEY=sk_test_...       # Clerk Dashboard → API Keys
CLERK_JWT_ISSUER=https://...       # Clerk Dashboard → API Keys → JWT Issuer
GEMINI_API_KEY=AIzaSy...           # aistudio.google.com → Get API key
```

---

### Step 3 — Frontend setup

```bash
cd frontend

# Copy and fill env
cp .env.local.example .env.local
# Edit .env.local — add your Clerk publishable key

# Install deps
npm install

# Run
npm run dev
```

App: http://localhost:3000

#### Frontend .env.local values to fill:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...   # Clerk Dashboard → API Keys
CLERK_SECRET_KEY=sk_test_...                     # same as backend
```

---

### Clerk Setup (Google Sign-in)

1. Create app at [clerk.com](https://clerk.com)
2. In Clerk Dashboard → **User & Authentication → Social Connections** → enable **Google**
3. Copy keys to both `.env` files
4. Set **Allowed redirect URLs**:
   - `http://localhost:3000`
   - `http://localhost:3000/dashboard`

---

## Core User Flow

```
1. User visits /  →  lands on marketing page
2. Clicks "Get started"  →  Clerk Google sign-in modal
3. After sign-in  →  redirected to /dashboard
4. Dashboard calls POST /api/v1/users/sync  →  user upserted in DB
5. User uploads resume PDF  →  parsed + skills extracted via Gemini
6. User clicks "New interview"  →  picks role + difficulty
7. POST /api/v1/interviews/  →  interview created
8. Redirected to /interview/[id]  →  clicks "Begin"
9. POST /api/v1/interviews/[id]/start  →  AI generates opening question
10. User types answer  →  POST /api/v1/interviews/[id]/answer
11. Answer evaluated + next question generated  →  repeat 6×
12. On last answer  →  interview marked complete
13. Redirected to /report/[id]  →  full scorecard shown
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/sync` | Upsert user from Clerk token |
| GET | `/api/v1/users/me` | Get current user |
| POST | `/api/v1/resumes/upload` | Upload PDF resume |
| GET | `/api/v1/resumes/` | List all resumes |
| GET | `/api/v1/resumes/active` | Get active resume |
| POST | `/api/v1/interviews/` | Create interview |
| POST | `/api/v1/interviews/{id}/start` | Start + get first question |
| POST | `/api/v1/interviews/{id}/answer` | Submit answer + get next Q |
| GET | `/api/v1/interviews/` | List all interviews |
| GET | `/api/v1/interviews/{id}/report` | Full report with scores |
| GET | `/health` | Health check |

---

## Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL async URL |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_JWT_ISSUER` | Clerk JWT issuer URL |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `MAX_QUESTIONS_PER_INTERVIEW` | Default: 6 |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | Backend URL (default: http://localhost:8000) |

---

## V2 Roadmap (not in MVP)

- [ ] WebSocket real-time streaming
- [ ] PDF report export
- [ ] Judge0 code execution (for technical interviews)
- [ ] Mobile-responsive polish
- [ ] Interview history search/filter
- [ ] Multiple resume management
- [ ] Email report delivery
