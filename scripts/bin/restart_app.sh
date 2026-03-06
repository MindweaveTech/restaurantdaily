#!/bin/bash

# Restaurant Daily - Restart Development Server
# Usage: ./restart_app.sh

set -e

# Navigate to actual project root (two levels up from scripts/bin/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🔄 Restarting Restaurant Daily server..."
echo ""

# Stop server if running
if [ -f "$PROJECT_ROOT/.app.pid" ]; then
    PID=$(cat "$PROJECT_ROOT/.app.pid")
    if kill -0 "$PID" 2>/dev/null; then
        echo "Stopping existing server (PID: $PID)..."
        bash "$SCRIPT_DIR/stop_app.sh"
        echo ""
        sleep 1
    fi
fi

# Start new server
echo "Starting new server..."
bash "$SCRIPT_DIR/start_app.sh"
