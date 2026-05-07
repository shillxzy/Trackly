import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/HabitPage.css";
import "../styles/HabitAboutPage.css";

import { getHabits } from "../services/habits";
import { getProfile } from "../services/users";

import HomeLogo from "../assets/HomeLogo.png";
import Avatar from "../components/Avatar";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";
import Loading from "../components/Loading";

// FIX: таблиця для декодування bitmask у назви днів
const DAY_LABELS = [
  { label: "Mon", mask: 1 },
  { label: "Tue", mask: 2 },
  { label: "Wed", mask: 4 },
  { label: "Thu", mask: 8 },
  { label: "Fri", mask: 16 },
  { label: "Sat", mask: 32 },
  { label: "Sun", mask: 64 },
];

function decodeMask(mask) {
  if (!mask && mask !== 0) return "Not set";
  const days = DAY_LABELS.filter((d) => (mask & d.mask) !== 0).map((d) => d.label);
  return days.length > 0 ? days.join(", ") : "Not set";
}

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
      // FIX: habits тепер повертають schedules всередині об'єкту
      const foundHabit = habits.find((h) => String(h.id) === id);
      setUser(profile);
      setHabit(foundHabit || null);
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
    localStorage.removeItem("profile");
    localStorage.removeItem("habits");
    localStorage.removeItem("completions");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setIsAuth(false);
    navigate("/login");
  };

  if (!habit) {
    return (
      <div className="home-container">
        <main className="main">
          <Loading />
        </main>
      </div>
    );
  }

  // FIX: отримуємо mask з schedules масиву
  const scheduleMask = habit.schedules && habit.schedules.length > 0
    ? habit.schedules[0].day_of_week
    : null;

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
              <img src={dashboard_icon} alt="" className="nav-icon" /> Dashboard
            </button>
            <button className="nav-item active" onClick={() => navigate("/habits")}>
              <img src={habits_icon} alt="" className="nav-icon" /> Habits
            </button>
            <button className="nav-item" onClick={() => navigate("/focus-session")}>
              <img src={focussession_icon} alt="" className="nav-icon" /> Focus Session
            </button>
            <button className="nav-item" onClick={() => navigate("/analytics")}>
              <img src={analytics_icon} alt="" className="nav-icon" /> Analytics
            </button>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <hr className="sidebar-divider" />
          <button className="logout-btn" onClick={handleLogout}>
            <img src={logout_icon} alt="" className="nav-icon" /> Log out
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
                <button className="logout-item" onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        </div>

        <div className="habit-about-card">
          <h2>{habit.name}</h2>

          <div className="habit-about-row">
            <span className="label">Description:</span>
            <span className="value">{habit.description || "No description"}</span>
          </div>

          <div className="habit-about-row">
            <span className="label">Status:</span>
            <span className={`value ${habit.is_active ? "active" : "inactive"}`}>
              {habit.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* FIX: показуємо дні тижня — раніше цього розділу взагалі не було */}
          <div className="habit-about-row">
            <span className="label">Schedule:</span>
            <span className="value">
              {decodeMask(scheduleMask)}
            </span>
          </div>

          <div className="habit-about-row">
            <span className="label">Created:</span>
            <span className="value">
              {habit.created_at ? new Date(habit.created_at).toLocaleDateString() : "—"}
            </span>
          </div>

          <div className="habit-about-actions">
            {/* FIX: виправлено зламаний символ стрілки */}
            <button className="back-btn" onClick={() => navigate("/habits")}>
              &#8592; Back
            </button>
            {/* FIX: виправлено шлях з /habit/edit/ на /habits/edit/ */}
            <button className="edit-btn" onClick={() => navigate(`/habits/edit/${habit.id}`)}>
              Edit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}