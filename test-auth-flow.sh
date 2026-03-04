#!/bin/bash

# ==========================================
# Auth Flow Manual Test Script
# ==========================================
#
# This script helps you test the auth flow manually by:
# 1. Opening the app in a browser
# 2. Watching logs for OTP codes
#
# Usage: ./test-auth-flow.sh
# ==========================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Read PORT from .env.local (default: 3002)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/.env.local" ]; then
    PORT=$(grep "^PORT=" "$SCRIPT_DIR/.env.local" | cut -d'=' -f2 | tr -d ' ')
fi
PORT=${PORT:-3002}

echo -e "${CYAN}========================================"
echo "🧪 Auth Flow Manual Test"
echo -e "========================================${NC}"

# Check if server is running
if ! lsof -i :$PORT > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Server not running on port $PORT${NC}"
    echo "Starting server..."
    ./start_app.sh &
    sleep 5
fi

echo ""
echo -e "${GREEN}✅ Server running on http://localhost:$PORT${NC}"
echo ""
echo -e "${YELLOW}📱 Test Flow:${NC}"
echo "1. Open: http://localhost:$PORT/auth/phone"
echo "2. Enter phone: 8826175074"
echo "3. Click 'Send Verification Code'"
echo "4. Watch the OTP appear below"
echo "5. Enter OTP on verify page"
echo "6. Select a role"
echo ""
echo -e "${CYAN}========================================"
echo "🔍 Watching for OTP codes..."
echo -e "========================================${NC}"
echo ""
echo "(Press Ctrl+C to stop)"
echo ""

# Watch logs for OTP
tail -f .app.log 2>/dev/null | grep --line-buffered -E "OTP generated|📱|🔍|✅|❌" | while read line; do
    # Highlight OTP code
    if echo "$line" | grep -q "OTP generated"; then
        echo -e "${GREEN}$line${NC}"
    else
        echo "$line"
    fi
done
