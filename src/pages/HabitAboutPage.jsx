import { useCallback,useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/HabitPage.css";
import "../styles/HabitAboutPage.css";

import { getHabits } from "../services/habits";
import { getProfile } from "../services/users";

import HomeLogo from "../components/HomeLogo.png";
import Avatar from "../components/Avatar";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";
import Loading from "../components/Loading";

export default function HabitAboutPage({ setIsAuth }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [habit, setHabit] = useState(null);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadData = useCallback(async () => {
  try {
    const profile = await getProfile();
    const habits = await getHabits();
    const foundHabit = habits.find(h => String(h.id) === id);

    setUser(profile);
    setHabit(foundHabit);
  } catch (e) {
    console.error(e);
  }
}, [id]);

useEffect(() => {
  loadData();
}, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setIsAuth(false);
    navigate("/login");
  };


  if (!habit) {
  return (
    <div className="home-container">
      <main className="main">
        <Loading></Loading>
      </main>
    </div>
  );
}


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
            <button className="nav-item active" onClick={() => navigate("/habits")}>
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
            <h1>Habit Details</h1>
            <p>Information about your habit</p>
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
                <button className="logout-item" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="habit-about-card">
          <h2>{habit.name}</h2>

          <div className="habit-about-row">
            <span className="label">Description:</span>
            <span className="value">
              {habit.description || "No description"}
            </span>
          </div>

          <div className="habit-about-row">
            <span className="label">Status:</span>
            <span className={`value ${habit.is_active ? "active" : "inactive"}`}>
              {habit.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="habit-about-actions">
            <button className="back-btn" onClick={() => navigate("/habits")}>
              ⬅ Back
            </button>
            <button
              className="edit-btn"
              onClick={() => navigate(`/habit/edit/${habit.id}`)}
            >
              Edit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
