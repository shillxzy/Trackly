import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/HabitPage.css";

import { createHabit } from "../services/habits";
import { createHabitSchedule } from "../services/habitSchedules";
import { getProfile } from "../services/users";

import HomeLogo from "../assets/HomeLogo.png";
import Avatar from "../components/Avatar";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

import ExitButton from "../components/ExitButton";

export default function HabitCreatePage({ setIsAuth }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState(new Set()); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

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
    localStorage.removeItem("profile");
    localStorage.removeItem("habits");
    localStorage.removeItem("completions");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setIsAuth(false); 
    navigate("/login");
  };

  const toggleDay = (day) => {
    const newSet = new Set(selectedDays);
    if (newSet.has(day)) newSet.delete(day);
    else newSet.add(day);
    setSelectedDays(newSet);
  };

  const buildDayOfWeekMask = () => {
    if (selectedDays.size === 0) return 0;
    const map = { 1:1, 2:2, 3:4, 4:8, 5:16, 6:32, 0:64 };
    let mask = 0;
    selectedDays.forEach(day => { mask += map[day]; });
    return mask;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Habit name is required");
      return;
    }

    const mask = buildDayOfWeekMask();
    if (mask === 0) {
      setError("Select at least one day");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const habit = await createHabit({
        name,
        description,
        is_active: true,
      });

      await createHabitSchedule({
        habit: habit.id,
        day_of_week: mask,
      });

      navigate("/habits");
    } catch (e) {
      console.error(e);
      setError("Failed to create habit");
    } finally {
      setLoading(false);
    }
  };

  const daysLabels = [
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
    { label: "Sun", value: 0 },
  ];

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
            <h1>Create Habit</h1>
            <p>Add a new habit to your routine</p>
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

        <ExitButton/>

        <div className="habit-create-card">
          <div className="form-group">
            <label>Habit name</label>
            <input
              type="text"
              placeholder="Read 20 minutes"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Why is this habit important?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Days of the week</label>
            <div className="days-checkboxes">
              {daysLabels.map(day => (
               <label key={day.value} className="day-checkbox">
  <input
    type="checkbox"
    checked={selectedDays.has(day.value)}
    onChange={() => toggleDay(day.value)}
  />
  <span>{day.label}</span>
</label>

              ))}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button className="cancel-btn" onClick={() => navigate("/habits")}>Cancel</button>
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save habit"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
