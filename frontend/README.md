# InterviewIQ.AI — Next.js + PostgreSQL

AI-powered mock interview platform, migrated from Vite/React + Express/MongoDB to **Next.js 15 App Router + PostgreSQL (Prisma)**.

## Stack

| Layer | Before | After |
|---|---|---|
| Frontend | Vite + React | Next.js 15 App Router |
| Routing | react-router-dom | Next.js file-based routing |
| Backend | Express.js | Next.js API Route Handlers |
| Database | MongoDB (Mongoose) | **PostgreSQL (Prisma ORM)** |
| Sessions | express-session / cookie | **iron-session** (edge-compatible) |
| Assets | Vite imports | Next.js `Image` + `/public` folder |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.local` and fill in your values:
```bash
cp .env.local .env.local   # already exists — just edit it
```

Required variables:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/interviewiq"
NEXT_PUBLIC_FIREBASE_APIKEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
OPENAI_API_KEY=...
SESSION_SECRET=<random 32+ char string>
```

### 3. Set up the PostgreSQL database
```bash
# Push schema to your DB (dev / first time)
npm run db:push

# Or run proper migrations
npm run db:migrate
```

### 4. Generate Prisma client
```bash
npm run db:generate
```

### 5. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.jsx              # Root layout (Providers, Razorpay script)
│   ├── page.jsx                # Home (/)
│   ├── auth/page.jsx           # /auth
│   ├── interview/page.jsx      # /interview
│   ├── history/page.jsx        # /history
│   ├── pricing/page.jsx        # /pricing
│   ├── report/[id]/page.jsx    # /report/:id
│   └── api/
│       ├── auth/
│       │   ├── google/route.js  # POST  — Google OAuth upsert + session
│       │   └── logout/route.js  # GET   — destroy session
│       ├── user/
│       │   └── current-user/route.js  # GET — read session user from DB
│       ├── interview/
│       │   ├── resume/route.js          # POST — parse PDF + AI extraction
│       │   ├── generate-questions/route.js  # POST — AI questions + deduct credits
│       │   ├── submit-answer/route.js   # POST — AI evaluation per answer
│       │   ├── finish/route.js          # POST — aggregate scores + mark complete
│       │   ├── get-interview/route.js   # GET  — list user's interviews
│       │   └── report/[id]/route.js     # GET  — single interview report
│       └── payment/
│           ├── order/route.js   # POST — create Razorpay order
│           └── verify/route.js  # POST — verify signature + credit user
├── components/                  # All client components ("use client")
│   ├── Providers.jsx            # Redux Provider wrapper
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── AuthForm.jsx
│   ├── AuthModal.jsx
│   ├── HomeClient.jsx
│   ├── InterviewPageClient.jsx
│   ├── InterviewHistory.jsx
│   ├── InterviewReport.jsx
│   ├── PricingClient.jsx
│   ├── Step1SetUp.jsx
│   ├── Step2Interview.jsx
│   ├── Step3Report.jsx
│   └── Timer.jsx
├── lib/
│   ├── prisma.js    # Prisma singleton
│   ├── session.js   # iron-session config
│   └── firebase.js  # Firebase Auth client
└── redux/
    ├── store.js
    └── userSlice.js

prisma/
└── schema.prisma   # PostgreSQL schema (User, Interview, Payment)

public/
└── videos/
    ├── male-ai.mp4
    └── female-ai.mp4
```

---

## Database Schema (PostgreSQL)

### User
| Column | Type |
|---|---|
| id | String (cuid, PK) |
| name | String |
| email | String (unique) |
| credits | Int (default 100) |
| createdAt | DateTime |
| updatedAt | DateTime |

### Interview
| Column | Type |
|---|---|
| id | String (cuid, PK) |
| userId | String (FK → User) |
| role | String |
| experience | String |
| mode | String |
| status | String (ongoing/completed) |
| finalScore | Float? |
| confidence | Float? |
| communication | Float? |
| correctness | Float? |
| questions | Json |
| answers | Json |
| questionWiseScore | Json |

### Payment
| Column | Type |
|---|---|
| id | String (cuid, PK) |
| userId | String (FK → User) |
| planId | String |
| amount | Int |
| credits | Int |
| orderId | String (unique) |
| paymentId | String? |
| status | String |

---

## Key Migration Notes

- **No more `ServerUrl`** — all API calls use relative paths (`/api/...`)
- **`react-router-dom` → `next/navigation`** — `useNavigate` → `useRouter`, `<Route>` → file-based routing
- **`import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`** — env prefix changed
- **Videos** moved to `public/videos/` and referenced as `/videos/male-ai.mp4`
- **`motion` package** → `framer-motion` (standard import in Next.js)
- **MongoDB `_id`** → Prisma `id` (string cuid); API responses include both `id` and `_id` for compatibility
- **Sessions** use `iron-session` (cookie-based, no Redis needed)
