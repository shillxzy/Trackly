# 🎯 Trackly

Trackly is a Habit & Focus Tracker web application with a REST API backend (Django + DRF) and a React frontend. It helps users track their habits, focus sessions (Pomodoro), and view analytics on their progress. The UI design is inspired by Figma designs.

[Figma Design](https://www.figma.com/design/341ThVAtcpaLtnzu5l9qMn/Trackly?node-id=0-1&p=f&t=bv9BzcKABEIMYhnR-0)

---

## 🚀 Features

### Authentication
- User registration and login
- JWT authentication
- Refresh tokens

### Habits
- Create, read, update, delete habits
- Habit schedules (days of the week)
- Mark habits as completed
- Track streaks and completion history

### Focus Sessions (Pomodoro)
- Start and end focus sessions
- Track duration of sessions
- View history of sessions

### Analytics
- Weekly habit completion percentage
- Total focus time per day/week
- Top 3 most consistent habits

---

## 🏗 Tech Stack

### Backend
- Python 3.11+
- Django
- Django REST Framework
- PostgreSQL / SQLite
- JWT Authentication (`djangorestframework-simplejwt`)
- DRF Spectacular for API documentation (Swagger)

### Frontend
- React
- fetch for API calls
- Figma-based design

---

## 📊 Database Overview
- users – user accounts
- habits – user's habits
- habit-schedules – when habits should occur
- habit-completions – which habits were completed
- focus-sessions – tracked focus time

---

## 🛠 Roadmap
- ✅Authentication (JWT)
- ✅Habit CRUD
- ✅Habit schedules
- ✅Habit completion tracking
- ✅Focus sessions tracking
- ✅Analytics endpoints
- ⬜Dockerize backend + frontend
- ⬜Deploy to cloud (Heroku / Railway / Render)
- ⬜Enhance frontend UI with charts and filters
- ⬜AI assistant integration

---

## 📌 Developer
**Dmytro Skalskyi**
