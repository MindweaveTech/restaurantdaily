#!/bin/bash

# Restaurant Daily - Check Server Status
# Usage: ./status_app.sh

# Navigate to actual project root (two levels up from scripts/bin/)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/.app.pid"
LOG_FILE="$PROJECT_ROOT/.app.log"

# Read PORT from .env.local (default: 3002)
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    PORT=$(grep "^PORT=" "$PROJECT_ROOT/.env.local" | cut -d'=' -f2 | tr -d ' ')
fi
PORT=${PORT:-3002}

echo "📊 Restaurant Daily Server Status"
echo "=================================="
echo ""

if [ ! -f "$PID_FILE" ]; then
    echo "Status: ❌ NOT RUNNING"
    exit 1
fi

PID=$(cat "$PID_FILE")

if kill -0 "$PID" 2>/dev/null; then
    echo "Status:     ✅ RUNNING"
    echo "Process ID: $PID"
    echo "Port:       $PORT"
    echo "URL:        http://localhost:$PORT"
    echo ""
    echo "Memory Usage:"
    ps aux | grep "$PID" | grep -v grep | awk '{print "  " $6 "KB"}'
    echo ""
    echo "Recent Logs:"
    if [ -f "$LOG_FILE" ]; then
        tail -5 "$LOG_FILE"
    else
        echo "  (No logs found)"
    fi
else
    echo "Status: ❌ NOT RUNNING"
    echo "Process ID in file: $PID (process not found)"
    rm -f "$PID_FILE"
    exit 1
fi
