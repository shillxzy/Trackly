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
import { useT } from "../translations/LanguageContext";

const DAY_MAP = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32, 0: 64 };

export default function HabitEditPage({ setIsAuth }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const t = useT();

  const DAY_LABELS = [
    { label: t("charts.days.Mon"), value: 1 },
    { label: t("charts.days.Tue"), value: 2 },
    { label: t("charts.days.Wed"), value: 3 },
    { label: t("charts.days.Thu"), value: 4 },
    { label: t("charts.days.Fri"), value: 5 },
    { label: t("charts.days.Sat"), value: 6 },
    { label: t("charts.days.Sun"), value: 0 },
  ];

  const [habit, setHabit] = useState(null);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const profile = await getProfile();
      const habits = await getHabits();
      const foundHabit = habits.find((h) => String(h.id) === id);

      setUser(profile);
      setHabit(foundHabit);

      if (!foundHabit) return;

      setName(foundHabit.name || "");
      setDescription(foundHabit.description || "");

      if (foundHabit.schedules && foundHabit.schedules.length > 0) {
        const mask = Number(foundHabit.schedules[0].day_of_week || 0);
        const days = new Set(
          DAY_LABELS
            .filter((day) => (mask & DAY_MAP[day.value]) !== 0)
            .map((day) => day.value)
        );
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
    if (newSet.has(day)) newSet.delete(day);
    else newSet.add(day);
    setSelectedDays(newSet);
  };

  const buildMask = () => {
    let mask = 0;
    selectedDays.forEach((day) => { mask += DAY_MAP[day]; });
    return mask;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError(t("habitEdit.errorName"));
      return;
    }

    const mask = buildMask();
    if (mask === 0) {
      setError(t("habitEdit.errorDays"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      await updateHabit(habit.id, { name, description });

      if (habit.schedules && habit.schedules.length > 0) {
        await updateHabitSchedule(habit.schedules[0].id, { day_of_week: mask });
      } else {
        await createHabitSchedule({ habit: habit.id, day_of_week: mask });
      }

      navigate("/habits");
    } catch (e) {
      console.error(e);
      setError(t("habitEdit.errorFailed"));
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
              <img src={dashboard_icon} alt="" className="nav-icon" /> {t("nav.dashboard")}
            </button>
            <button className="nav-item active" onClick={() => navigate("/habits")}>
              <img src={habits_icon} alt="" className="nav-icon" /> {t("nav.habits")}
            </button>
            <button className="nav-item" onClick={() => navigate("/focus-session")}>
              <img src={focussession_icon} alt="" className="nav-icon" /> {t("nav.focusSession")}
            </button>
            <button className="nav-item" onClick={() => navigate("/analytics")}>
              <img src={analytics_icon} alt="" className="nav-icon" /> {t("nav.analytics")}
            </button>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <hr className="sidebar-divider" />
          <button className="logout-btn" onClick={handleLogout}>
            <img src={logout_icon} alt="" className="nav-icon" /> {t("nav.logout")}
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <h1>{t("habitEdit.title")}</h1>
            <p>{t("habitEdit.subtitle")}</p>
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
                <button onClick={() => navigate("/profile")}>{t("profile_menu.profile")}</button>
                <hr className="menu-divider" />
                <button onClick={() => navigate("/settings")}>{t("profile_menu.settings")}</button>
                <hr className="menu-divider" />
                <button className="logout-item" onClick={handleLogout}>{t("profile_menu.logout")}</button>
              </div>
            )}
          </div>
        </div>

        <ExitButton />

        <div className="habit-edit-card">
          <div className="form-group">
            <label>{t("habitEdit.habitName")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t("habitEdit.description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t("habitEdit.daysOfWeek")}</label>
            <div className="days-checkboxes">
              {DAY_LABELS.map((day) => (
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
            <button className="cancel-btn" onClick={() => navigate("/habits")}>
              {t("habitEdit.cancel")}
            </button>
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              {loading ? t("habitEdit.saving") : t("habitEdit.saveChanges")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
