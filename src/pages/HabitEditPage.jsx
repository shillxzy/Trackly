import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/HabitPage.css";
import "../styles/HabitEditPage.css";

import { getHabits, updateHabit } from "../services/habits";
import { updateHabitSchedule, createHabitSchedule } from "../services/habitSchedules";
import { getProfile } from "../services/users";

import HomeLogo from "../components/HomeLogo.png";
import Avatar from "../components/Avatar";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";
import Loading from "../components/Loading";

import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function HabitEditPage({ setIsAuth }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [habit, setHabit] = useState(null);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const profile = await getProfile();
      const habits = await getHabits();
      const foundHabit = habits.find(h => String(h.id) === id);

      setUser(profile);
      setHabit(foundHabit);

      if (foundHabit) {
        setName(foundHabit.name || "");
        setDescription(foundHabit.description || "");
      }
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

  const onCalendarChange = (value) => {
    setDateRange(value);
  };

  const buildDayOfWeekMask = () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return 0;

    const start = dateRange[0];
    const end = dateRange[1];
    let mask = 0;

    const map = {
      1: 1,
      2: 2,
      3: 4,
      4: 8,
      5: 16,
      6: 32,
      0: 64,
    };

    let current = new Date(start);
    const activeDays = new Set();

    while (current <= end) {
      activeDays.add(current.getDay());
      current.setDate(current.getDate() + 1);
    }

    activeDays.forEach(day => {
      mask += map[day];
    });

    return mask;
  };

  const handleSave = async () => {
  if (!name.trim()) {
    setError("Habit name is required");
    return;
  }

  const mask = buildDayOfWeekMask();
  if (mask === 0) {
    setError("Choose at least one day");
    return;
  }

  try {
    setLoading(true);
    setError("");

    await updateHabit(habit.id, { name, description });

    if (habit.schedule) {
      await updateHabitSchedule(habit.schedule.id, { day_of_week: mask });
    } else {
      await createHabitSchedule({ habit: habit.id, day_of_week: mask });
    }

    navigate("/habits");
  } catch (e) {
    console.error(e);
    setError("Failed to update habit");
  } finally {
    setLoading(false);
  }
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
            <h1>Edit Habit</h1>
            <p>Update your habit details</p>
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

        <div style={{ display: "flex", justifyContent: "flex-start", margin: "5px 0 40px 0" }}>
          <button className="exit-btn" onClick={() => navigate(-1)}>
            ⬅ Exit
          </button>
        </div>

        <div className="habit-edit-card">
          <div className="form-group">
            <label>Habit name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Schedule</label>

            <Calendar
              onChange={onCalendarChange}
              value={dateRange}
              selectRange={true}
              tileClassName={({ date, view }) => {
                if (view === "month" && dateRange && dateRange[0] && dateRange[1]) {
                  const start = new Date(dateRange[0]);
                  const end = new Date(dateRange[1]);
                  if (date >= start && date <= end) {
                    return "calendar-day-active-range";
                  }
                }
              }}
            />

            <div className="calendar-hint">
              Click any date to select that weekday
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button className="cancel-btn" onClick={() => navigate("/habits")}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
