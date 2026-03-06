#!/bin/bash

# Restaurant Daily - Start Development Server
# Usage: ./start_app.sh

set -e

# Navigate to actual project root (two levels up from scripts/bin/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/.app.pid"

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
echo "📍 URL: http://localhost:3002"

cd "$PROJECT_ROOT"

# Start the dev server in background and capture PID
npm run dev > .app.log 2>&1 &
APP_PID=$!

# Save PID
echo "$APP_PID" > "$PID_FILE"

echo "✅ Server started (PID: $APP_PID)"
echo "📝 View logs: ./logs_app.sh"
echo ""
echo "Server is running at: http://localhost:3002"
