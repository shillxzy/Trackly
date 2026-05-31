#!/bin/bash
# ================================================================
#  Trackly — Start Dev Environment
#  Запускає Backend (Django) і Frontend (React) одночасно
#  Використання: ./start.sh
# ================================================================

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Шляхи (відносно розташування скрипта)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/Backend"
FRONTEND_DIR="$SCRIPT_DIR/Frontend"

# PID файли для зупинки
BACKEND_PID=""
FRONTEND_PID=""

# ── Cleanup при Ctrl+C ────────────────────────────────────────
cleanup() {
    echo ""
    echo -e "${YELLOW}Зупиняємо сервери...${NC}"

    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        echo -e "${RED}✖ Backend зупинено${NC}"
    fi

    if [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
        kill "$FRONTEND_PID"
        echo -e "${RED}✖ Frontend зупинено${NC}"
    fi

    echo -e "${YELLOW}Bye!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# ── Перевірка директорій ──────────────────────────────────────
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}Помилка: папка Backend не знайдена за шляхом $BACKEND_DIR${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}Помилка: папка Frontend не знайдена за шляхом $FRONTEND_DIR${NC}"
    exit 1
fi

# ── Перевірка .env файлів ─────────────────────────────────────
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}Увага: Backend/.env не знайдено${NC}"
fi

if [ ! -f "$FRONTEND_DIR/.env" ]; then
    echo -e "${YELLOW}Увага: Frontend/.env не знайдено${NC}"
fi

# ── Хедер ────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Trackly Dev Server           ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── Запуск Backend ────────────────────────────────────────────
echo -e "${BLUE}▶ Запускаємо Backend (Django)...${NC}"

cd "$BACKEND_DIR" || exit 1

# Активуємо venv якщо є
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo -e "${GREEN}  ✔ venv активовано${NC}"
elif [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
    echo -e "${GREEN}  ✔ .venv активовано${NC}"
else
    echo -e "${YELLOW}  ⚠ venv не знайдено — використовується системний Python${NC}"
fi

python manage.py runserver 8000 2>&1 | sed "s/^/$(echo -e "${BLUE}[Backend]${NC}") /" &
BACKEND_PID=$!

echo -e "${GREEN}  ✔ Backend запущено (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}  → http://localhost:8000${NC}"
echo -e "${GREEN}  → http://localhost:8000/api/docs/swagger/${NC}"
echo ""

# ── Невелика пауза щоб backend встиг стартувати ───────────────
sleep 2

# ── Запуск Frontend ───────────────────────────────────────────
echo -e "${BLUE}▶ Запускаємо Frontend (React)...${NC}"

cd "$FRONTEND_DIR" || exit 1

# Перевіряємо чи встановлені node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}  node_modules не знайдено — запускаємо npm install...${NC}"
    npm install
fi

npm start 2>&1 | sed "s/^/$(echo -e "${CYAN}[Frontend]${NC}") /" &
FRONTEND_PID=$!

echo -e "${GREEN}  ✔ Frontend запущено (PID: $FRONTEND_PID)${NC}"
echo -e "${GREEN}  → http://localhost:3000${NC}"
echo ""

# ── Статус ───────────────────────────────────────────────────
echo -e "${CYAN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}✔ Обидва сервери запущені!${NC}"
echo ""
echo -e "  ${BLUE}Backend:${NC}  http://localhost:8000"
echo -e "  ${CYAN}Frontend:${NC} http://localhost:3000"
echo -e "  ${BLUE}Swagger:${NC}  http://localhost:8000/api/docs/swagger/"
echo ""
echo -e "${YELLOW}Натисни Ctrl+C щоб зупинити обидва сервери${NC}"
echo -e "${CYAN}══════════════════════════════════════════${NC}"
echo ""

# ── Чекаємо поки обидва процеси живі ─────────────────────────
wait $BACKEND_PID $FRONTEND_PID
