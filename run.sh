#!/usr/bin/env bash
# ==============================================================================
# PantryPulse - Smart Grocery and Shopping Manager
# Local-first, zero credentials, zero PII, no Docker required.
# ==============================================================================

set -e

# Resolve repository root
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo "🥑 Starting PantryPulse - Smart Grocery & Shopping Manager..."

# 1. Setup / activate virtual environment for Python Backend
if [ ! -d "backend/venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install --upgrade pip
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# 2. Setup Frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    (cd frontend && npm install)
fi

# Function to cleanly stop child processes on exit (Ctrl+C)
cleanup() {
    echo ""
    echo "Stopping PantryPulse services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 3. Start Python FastAPI Backend
echo "Starting FastAPI backend on http://127.0.0.1:8000..."
(cd backend && ./venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --reload) &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

# 4. Start TypeScript React Frontend
echo "Starting Vite TypeScript frontend on http://localhost:5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  PantryPulse is running!"
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://127.0.0.1:8000"
echo "  API Docs : http://127.0.0.1:8000/docs"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."
echo ""

# Keep running
wait
