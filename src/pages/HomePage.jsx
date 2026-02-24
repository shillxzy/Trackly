import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";

import { getHabits } from "../services/habits";
import { getHabitCompletions } from "../services/habitCompletions";
import { getProfile } from "../services/users";
import { createFocusSession } from "../services/focusSessions";

import HomeLogo from "../components/HomeLogo.png";
import Avatar from "../components/Avatar";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

import HabitsCompletedChart from "../components/charts/HabitsCompletedChart";
import WeeklyProgressChart from "../components/charts/WeeklyProgressChart"; 
import FocusTimeChart from "../components/charts/FocusTimeChart";

export default function HomePage({ setIsAuth }) {
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
      timer = setInterval(() => setFocusTime((prev) => prev - 1), 1000);
    }
    if (focusTime === 0 && isRunning) {
      setIsRunning(false);
      createFocusSession({ duration_minutes: 25, completed: true }).catch(() => {});
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setIsAuth(false); 
    navigate("/login");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="home-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-container">
            <img src={HomeLogo} alt="Trackly Logo" className="logo-img" />
          </div>
          <hr className="sidebar-divider" />
          <nav className="nav-menu">
            <button className="nav-item active" onClick={() => navigate("/home")}>
              <img src={dashboard_icon} alt="" className="nav-icon" />
              Dashboard
            </button>
            <button className="nav-item" onClick={() => navigate("/habits")}>
              <img src={habits_icon} alt="" className="nav-icon" />
              Habits
            </button>
            <button className="nav-item" onClick={() => navigate("/focus-session")}>
              <img src={focussession_icon} alt="" className="nav-icon" />
              Focus Session
            </button>
            <button className="nav-item" onClick={() => navigate("/analytics")}>
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
            <Avatar
              src={user?.avatar}
              username={user?.username || "User"}
              className="profile-icon"
              onClick={() => setMenuOpen(!menuOpen)}
            />

            {menuOpen && (
              <div className="profile-menu">
                <button onClick={() => navigate("/profile")}>Profile</button>
                <hr className="menu-divider" />
                <button onClick={() => navigate("/settings")}>Settings</button>
                <hr className="menu-divider" />
                <button className="logout-item" onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        </div>

        <div className="content-grid">

  <div className="tasks-section">
    <h2>Today’s Tasks</h2>
    <div className="add-habit">+ Add New Habit</div>
  </div>

  <div className="focus-section">
    <h2>Focus Session</h2>
    <div className="timer">{formatTime(focusTime)}</div>
    <button className="focus-btn" onClick={() => setIsRunning(!isRunning)}>
      {isRunning ? "Pause" : "Start Focus Session"}
    </button>
  </div>

  <div className="weekly-section">
    <WeeklyProgressChart completions={completions} />
  </div>

  <div className="wide">
    <HabitsCompletedChart habits={habits} completions={completions} />
  </div>

  <div className="wide">
    <FocusTimeChart focusSessions={[]} />
  </div>
</div>


      </main>
    </div>
  );
}
