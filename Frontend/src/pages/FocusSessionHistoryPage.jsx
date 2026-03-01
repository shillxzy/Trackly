import { useEffect, useState, useCallback  } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/FocusSessionHistory.css";

import { getProfile } from "../services/users";
import { getFocusSessions } from "../services/focusSessions";

import HomeLogo from "../assets/HomeLogo.png";
import Avatar from "../components/Avatar";
import ExitButton from "../components/ExitButton";

import clock_icon from "../assets/clock-icon.png";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

export default function FocusSessionHistoryPage({ setIsAuth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewMode] = useState("week"); 

  const [historyData, setHistoryData] = useState([]);

const groupSessionsByDay = (sessions, viewMode) => {
  const daysCount = viewMode === "week" ? 7 : 30;
  const today = new Date();
  const map = new Map();

  // Стандартний ключ YYYY-MM-DD
  const formatKey = (date) => date.toISOString().split("T")[0];

  // Ініціалізація днів з 0 хвилин
  for (let i = 0; i < daysCount; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = formatKey(d);

    map.set(key, {
      day: d.toLocaleDateString("en-US", { weekday: "long" }),
      date: key,
      minutes: 0,
    });
  }

  // Групування сесій
  sessions.forEach((s) => {
    const startedAt = new Date(s.started_at || s.created_at || s.date);
    const key = formatKey(startedAt);

    if (map.has(key)) {
      const minutes =
        typeof s.duration_minutes === "number"
          ? s.duration_minutes
          : typeof s.actual_duration_minutes === "number"
          ? s.actual_duration_minutes
          : Math.round((s.duration_seconds || 0) / 60);

      map.get(key).minutes += minutes;
    }
  });

  return Array.from(map.values());
};



const generateHistoryFromApi = useCallback(async () => {
  try {
    const sessions = await getFocusSessions();
    const data = groupSessionsByDay(sessions, viewMode);
    setHistoryData(data);
  } catch (e) {
    console.error("Failed to load focus sessions", e);
  }
}, [viewMode]);

  useEffect(() => {
  loadData();
}, []);

useEffect(() => {
  generateHistoryFromApi();
}, [generateHistoryFromApi]);

  const loadData = async () => {
    try {
      const cachedProfile = localStorage.getItem("profile");

      if (cachedProfile) {
        setUser(JSON.parse(cachedProfile));
        return;
      }

      const profile = await getProfile();
      setUser(profile);
      localStorage.setItem("profile", JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  };

  
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsAuth(false);
    navigate("/login");
  };

  const totalMinutes = historyData.reduce((acc, item) => acc + item.minutes, 0);
  const averageMinutes =
    historyData.length > 0 ? Math.round(totalMinutes / historyData.length) : 0;

  return (
    <div className="home-container">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-container">
            <img src={HomeLogo} alt="Trackly Logo" className="logo-img" />
          </div>
          <hr className="sidebar-divider" />

          <nav className="nav-menu">
            <button className="nav-item" onClick={() => navigate("/home")}>
              <img src={dashboard_icon} alt="" className="nav-icon" />
              Dashboard
            </button>
            <button className="nav-item" onClick={() => navigate("/habits")}>
              <img src={habits_icon} alt="" className="nav-icon" />
              Habits
            </button>
            <button
              className="nav-item active"
              onClick={() => navigate("/focus-session")}
            >
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
            <h1>Focus History</h1>
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
                <button onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        </div>

       <ExitButton/>

        <div className="history-list">
          {historyData.map((item, index) => (
            <div key={index} className="history-item">
              <div className="history-left">
                <img src={clock_icon} alt="" className="history-icon" />
                <div className="history-info">
                  <span className="history-day">{item.day}</span>
                  <span className="history-date">{item.date}</span>
                </div>
              </div>

              <div className="history-time">
                {item.minutes} min
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="history-summary">
          <div className="summary-row">
            <span>
              {viewMode === "week" ? "This Week" : "This Month"}:
            </span>
            <span>{totalMinutes} min</span>
          </div>

          <div className="summary-row">
            <span>Average per day:</span>
            <span>{averageMinutes} min</span>
          </div>

          <div className="summary-bar">
            <div
              className="summary-progress"
              style={{ width: `${Math.min(totalMinutes / 10, 100)}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}