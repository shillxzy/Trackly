import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

import { getHabits } from "../services/habits";
import { createHabitCompletion, getHabitCompletions } from "../services/habitCompletions";
import { getProfile } from "../services/users";
import { createFocusSession } from "../services/focusSessions";
import HomeLogo from "../components/HomeLogo.png";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

export default function HomePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let timer;
    if (isRunning && focusTime > 0) {
      timer = setInterval(() => {
        setFocusTime((prev) => prev - 1);
      }, 1000);
    }

    if (focusTime === 0 && isRunning) {
      setIsRunning(false);
      createFocusSession({
        duration_minutes: 25,
        completed: true,
      }).catch(() => {});
    }

    return () => clearInterval(timer);
  }, [isRunning, focusTime]);

  const loadData = async () => {
    try {
      const profile = await getProfile();
      const habitsData = await getHabits();
      const completionsData = await getHabitCompletions();

      setUser(profile);
      setHabits(habitsData);
      setCompletions(completionsData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (habitId) => {
    try {
      await createHabitCompletion({
        habit: habitId,
        date: new Date().toISOString().slice(0, 10),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const today = new Date().toISOString().slice(0, 10);

  const completedToday = completions.filter((c) => c.date === today);

  return (
    <div className="home-container">
        <aside className="sidebar">
  <div className="sidebar-top">
    <div className="logo-container">
      <img src={HomeLogo} alt="Trackly Logo" className="logo-img" />
    </div>

    <hr className="sidebar-divider" />

    <nav className="nav-menu">
      <button className="nav-item active">
        <img src={dashboard_icon} alt="" className="nav-icon" />
        Dashboard
      </button>
      <button className="nav-item">
        <img src={habits_icon} alt="" className="nav-icon" />
        Habits
      </button>
      <button className="nav-item">
        <img src={focussession_icon} alt="" className="nav-icon" />
        Focus Session
      </button>
      <button className="nav-item">
        <img src={analytics_icon} alt="" className="nav-icon" />
        Analytics
      </button>
    </nav>
  </div>

  <div className="sidebar-bottom">
    <hr className="sidebar-divider" />
    <button className="logout-btn" onClick={handleLogout}>
      <img src={logout_icon} alt="" className="nav-icon" />
      Log out
    </button>
  </div>
</aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>Welcome back, {user?.username || "User"}!</h1>
            <p>Here is your progress today!</p>
          </div>

        <div className="profile-wrapper">
  <div className="profile-icon" onClick={() => setMenuOpen(!menuOpen)}></div>

    {menuOpen && (
        <div className="profile-menu">
            <button onClick={() => navigate("/pages/ProfilePage")}>Profile</button>
            <hr className="menu-divider" />
            <button onClick={() => navigate("/pages/SettingsPage")}>Settings</button>
            <hr className="menu-divider" />
            <button className="logout-item" onClick={handleLogout}>Log out</button>
    </div>
    )}
    </div>  
        </div>

        <div className="content-grid">
          <div className="tasks-section">
            <h2>Today’s Tasks</h2>

            {habits.map((habit) => {
              const isCompleted = completedToday.some(
                (c) => c.habit === habit.id
              );

              return (
                <div key={habit.id} className="habit-card">
                  <div>
                    <h3>{habit.name}</h3>
                    <p>Streak: {habit.streak || 0}</p>
                  </div>

                  <button
                    disabled={isCompleted}
                    className="complete-btn"
                    onClick={() => handleComplete(habit.id)}
                  >
                    {isCompleted ? "Completed" : "Mark as Done"}
                  </button>
                </div>
              );
            })}

            <div className="add-habit">+ Add New Habit</div>
          </div>

          <div className="focus-section">
            <h2>Focus Session</h2>
            <div className="timer">{formatTime(focusTime)}</div>

            <button
              className="focus-btn"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? "Pause" : "Start Focus Session"}
            </button>
          </div>

          <div className="stats-section">
            <div className="stat-card">
              <h3>Habits Completed</h3>
              <p className="stat-number">{completedToday.length}</p>
            </div>

            <div className="stat-card">
              <h3>Focus Time Today</h3>
              <p className="stat-number">
                {Math.floor((25 * 60 - focusTime) / 60)} min
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}