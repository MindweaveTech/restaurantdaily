#!/bin/bash

# Restaurant Daily - Start Development Server
# Usage: ./start_app.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_ROOT/.app.pid"

# Read PORT from .env.local (default: 3002)
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    PORT=$(grep "^PORT=" "$PROJECT_ROOT/.env.local" | cut -d'=' -f2 | tr -d ' ')
fi
PORT=${PORT:-3002}

# Check if server is already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "❌ Server already running (PID: $OLD_PID)"
        echo "Use './stop_app.sh' to stop it first"
        exit 1
    else
        rm -f "$PID_FILE"
    fi
fi

echo "🚀 Starting Restaurant Daily development server..."
echo "📍 URL: http://localhost:$PORT"

cd "$PROJECT_ROOT"

# Start the dev server in background and capture PID
PORT=$PORT npm run dev > .app.log 2>&1 &
APP_PID=$!

# Save PID
echo "$APP_PID" > "$PID_FILE"

echo "✅ Server started (PID: $APP_PID)"
echo "📝 View logs: ./logs_app.sh"
echo ""
echo "Server is running at: http://localhost:$PORT"
