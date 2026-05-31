"""
Backend/TracklyApp/apps/habits/keep_alive.py

Додай виклик start_keep_alive() в apps.py поруч з scheduler.start()

Render Free tier "засипає" після 15 хв неактивності → cold start 30-50 сек.
Цей скрипт пінгує сервіс кожні 10 хв щоб він не засипав.
"""

import logging
import requests

logger = logging.getLogger(__name__)

BACKEND_URL  = "https://trackly-0xg3.onrender.com/api/schema/"
FRONTEND_URL = "https://trackly-frontend-f4ri.onrender.com"


def ping_services():
    for url in [BACKEND_URL, FRONTEND_URL]:
        try:
            r = requests.get(url, timeout=10)
            logger.info(f"[keep_alive] {url} → {r.status_code}")
        except Exception as e:
            logger.warning(f"[keep_alive] {url} failed: {e}")


def start_keep_alive(scheduler):
    """Передай вже існуючий scheduler з scheduler.py"""
    from apscheduler.triggers.interval import IntervalTrigger

    scheduler.add_job(
        ping_services,
        trigger=IntervalTrigger(minutes=10),
        id="keep_alive",
        name="Keep Render services warm",
        replace_existing=True,
    )
    logger.info("[keep_alive] Ping job scheduled every 10 minutes")
