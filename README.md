# 🚀 Trackly API

Trackly API is a REST API for tracking habits and Pomodoro focus sessions.  
It allows users to monitor their daily habits, focus sessions, and get progress analytics.

---

## 🛠 Tech Stack

- Python 3.11+  
- Django 4.x  
- Django REST Framework  
- PostgreSQL / SQLite  
- JWT Authentication (`djangorestframework-simplejwt`)  
- Swagger / OpenAPI (`drf-spectacular`)  

---

## ⚡ Features (MVP)

### Authentication
- User registration  
- JWT login  
- Refresh token  

### Habits
- CRUD habits (create, edit, delete)  
- Habit schedules (days of the week)  
- Mark completion  
- Completion history  
- Streak (consecutive days)

### Focus Sessions (Pomodoro)
- Start / finish session  
- Track time  
- Session history  

### Analytics
- % habit completion per week  
- Total focus time per day/week  
- Top 3 most consistent habits  

---

## 💾 Database Tables (summary)

| Table               | Stores                                         |
|--------------------|-----------------------------------------------|
| users               | Users, email, password hash, profile settings|
| habits              | Habit name, description, owner, status       |
| habit-schedules     | Days of week / intervals for habits          |
| habit-completions   | Habit completion record, date, status        |
| focus-sessions      | Session start/end time, duration             |
| token               | JWT tokens (access / refresh)                |

---

## 📈 Roadmap

- ☑️JWT Authentication
- ☑️Habit CRUD + schedules + completions
- ☑️Focus sessions + time tracking
- ☑️Progress analytics
- ⬜Docker + deployment
- ⬜Additional metrics / reports
- ⬜AI Integration

##
👨‍💻 Author

**Dmytro Skalskyi**
