#!/usr/bin/env bash
set -e

echo ""
echo "═══════════════════════════════════════════════"
echo "  AI Interview Platform — MVP v1 Setup"
echo "═══════════════════════════════════════════════"
echo ""

# Root .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created root .env"
fi

# Backend .env
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "✅ Created backend/.env"
  echo "⚠️  Fill in CLERK_SECRET_KEY, CLERK_JWT_ISSUER, GEMINI_API_KEY in backend/.env"
fi

# Frontend .env.local
if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.local.example frontend/.env.local
  echo "✅ Created frontend/.env.local"
  echo "⚠️  Fill in NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY in frontend/.env.local"
fi

echo ""
echo "─── Starting PostgreSQL ──────────────────────"
docker-compose up -d
echo "✅ PostgreSQL running on localhost:5432"

echo ""
echo "─── Backend ──────────────────────────────────"
echo "Run these commands in a new terminal:"
echo ""
echo "  cd backend"
echo "  python -m venv venv"
echo "  source venv/bin/activate"
echo "  pip install -r requirements.txt"
echo "  uvicorn app.main:app --reload --port 8000"
echo ""

echo "─── Frontend ─────────────────────────────────"
echo "Run these commands in another terminal:"
echo ""
echo "  cd frontend"
echo "  npm install"
echo "  npm run dev"
echo ""

echo "═══════════════════════════════════════════════"
echo "  Then open http://localhost:3000"
echo "═══════════════════════════════════════════════"
echo ""
