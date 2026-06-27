#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

trap cleanup SIGINT SIGTERM
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Done${NC}"
    exit 0
}

# Backend
echo -e "${YELLOW}Starting backend...${NC}"
cd "$PROJECT_ROOT/backend" || exit 1
./venv/bin/python run.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}Backend PID: $BACKEND_PID${NC} → http://localhost:8000"
echo "  tail -f /tmp/backend.log"

# Frontend
echo -e "${YELLOW}Starting frontend...${NC}"
cd "$PROJECT_ROOT/frontend" || exit 1
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend PID: $FRONTEND_PID${NC} → http://localhost:3000"
echo "  tail -f /tmp/frontend.log"

echo -e "\n${GREEN}Both services running. Ctrl+C to stop.${NC}"
wait $BACKEND_PID $FRONTEND_PID
