import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createFocusSession } from "../services/focusSessions";
import "../styles/HomePage.css";
import "../styles/HabitPage.css";

import { getProfile } from "../services/users";

import HomeLogo from "../assets/HomeLogo.png";
import Avatar from "../components/Avatar";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

export default function FocusSessionPage({ setIsAuth })
{
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };


  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setIsAuth(false);
    navigate("/login");
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
            <button className="nav-item" onClick={() => navigate("/home")}>
              <img src={dashboard_icon} alt="" className="nav-icon" />
              Dashboard
            </button>
            <button className="nav-item" onClick={() => navigate("/habits")}>
              <img src={habits_icon} alt="" className="nav-icon" />
              Habits
            </button>
            <button className="nav-item active" onClick={() => navigate("/focus-session")}>
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
    <div className="topbar-text">
      <h1>Focus Session</h1>
      <p>The best way to focus - Focus session</p>
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

  <div className="focus-content-wrapper">
    <div className="focus-card">
      <div className="focus-card-header">
        <h2>Focus Session</h2>
      </div>
      <div className="timer-display">{formatTime(focusTime)}</div>
      <button className="start-btn" onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? "Pause" : "Start Focus Session"}
      </button>
    </div>
    
    <button className="history-btn" onClick={() => navigate("/focus-session/history")}>
      History
    </button>
  </div>
</main>
    </div>
  )
}