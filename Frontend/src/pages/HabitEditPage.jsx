import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/HabitPage.css";
import "../styles/HabitEditPage.css";

import { getHabits, updateHabit } from "../services/habits";
import { updateHabitSchedule, createHabitSchedule } from "../services/habitSchedules";
import { getProfile } from "../services/users";

import HomeLogo from "../assets/HomeLogo.png";
import Avatar from "../components/Avatar";
import ExitButton from "../components/ExitButton";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

import Loading from "../components/Loading";

export default function HabitEditPage({ setIsAuth }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [habit, setHabit] = useState(null);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState(new Set());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const daysLabels = [
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
    { label: "Sun", value: 0 },
  ];

  const dayMap = {
    1: 1,
    2: 2,
    3: 4,
    4: 8,
    5: 16,
    6: 32,
    0: 64,
  };

  const loadData = useCallback(async () => {
    try {
      const profile = await getProfile();
      const habits = await getHabits();

      const foundHabit = habits.find(h => String(h.id) === id);

      setUser(profile);
      setHabit(foundHabit);

      if (!foundHabit) return;

      setName(foundHabit.name || "");
      setDescription(foundHabit.description || "");

      if (foundHabit.schedule && foundHabit.schedule.length > 0) {
        const mask = foundHabit.schedule[0].day_of_week;

        const days = new Set();

        daysLabels.forEach(day => {
          if ((mask & dayMap[day.value]) !== 0) {
            days.add(day.value);
          }
        });

        setSelectedDays(days);
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

    if (newSet.has(day)) {
      newSet.delete(day);
    } else {
      newSet.add(day);
    }

    setSelectedDays(newSet);
  };

  const buildDayOfWeekMask = () => {
    let mask = 0;

    selectedDays.forEach(day => {
      mask += dayMap[day];
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
      setError("Select at least one day");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await updateHabit(habit.id, {
        name,
        description,
      });

      if (habit.schedule && habit.schedule.length > 0) {
        await updateHabitSchedule(habit.schedule[0].id, {
          day_of_week: mask,
        });
      } else {
        await createHabitSchedule({
          habit: habit.id,
          day_of_week: mask,
        });
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
          <Loading />
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
                <button className="logout-item" onClick={handleLogout}>Log out</button>
              </div>
            )}

          </div>

        </div>

        <ExitButton />

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

            <label>Days of the week</label>

            <div className="days-checkboxes">

              {daysLabels.map(day => (
                <label key={day.value} className="day-checkbox">

                  <input
                    type="checkbox"
                    checked={selectedDays.has(day.value)}
                    onChange={() => toggleDay(day.value)}
                  />

                  {day.label}

                </label>
              ))}

            </div>

          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">

            <button
              className="cancel-btn"
              onClick={() => navigate("/habits")}
            >
              Cancel
            </button>

            <button
              className="save-btn"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save changes"}
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}
