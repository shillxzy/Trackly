import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/SettingsPage.css";

import Avatar from "../components/Avatar";
import HomeLogo from "../assets/HomeLogo.png";
import ExitButton from "../components/ExitButton";
import {getProfile} from "../services/users"

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

export default function SettingsPage({ setIsAuth }) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [settings, setSettings] = useState({
    language: "English",
    darkMode: false,
    habitReminders: false,
    weeklyProgress: false,
    focusAlerts: false,
  });

  useEffect(() => {
      loadData();
    }, []);

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
          <h1>Settings</h1>
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
                <button className="logout-item" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <ExitButton />

        <div className="settings-container">
          <div className="settings-card">
            <h2>Accounts Settings</h2>

            <div className="settings-row">
              <div>
                <h3>Language</h3>
                <p>Select your display language:</p>
              </div>
              <select
                className="language-select"
                value={settings.language}
                onChange={(e) =>
                  setSettings({ ...settings, language: e.target.value })
                }
              >
                <option>English</option>
                <option>Українська</option>
              </select>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <h3>Dark Mode</h3>
                <p>Enable dark mode for low light conditions:</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={() =>
                    setSettings({ ...settings, darkMode: !settings.darkMode })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data:</p>
              </div>
              <button className="delete-btn">Delete Account</button>
            </div>
          </div>

          <div className="settings-card">
            <h2>Notification Settings</h2>

            <div className="settings-row">
              <div>
                <h3>Habit Reminders</h3>
                <p>Receive daily reminders for your habits</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.habitReminders}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      habitReminders: !settings.habitReminders,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <h3>Weekly Progress</h3>
                <p>Get a summary of your weekly progress</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.weeklyProgress}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      weeklyProgress: !settings.weeklyProgress,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <h3>Focus Session Alerts</h3>
                <p>Receive alerts for starting and ending focus sessions</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.focusAlerts}
                  onChange={() =>
                    setSettings({
                      ...settings,
                      focusAlerts: !settings.focusAlerts,
                    })
                  }
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="profile-actions">
            <button className="complete-profile">Save Changes</button>
          </div>
        </div>
      </main>
    </div>
  );
}