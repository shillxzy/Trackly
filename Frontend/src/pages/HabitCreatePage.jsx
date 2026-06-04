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
import { useT } from "../translations/LanguageContext";

export default function HabitCreatePage({ setIsAuth }) {
  const navigate = useNavigate();
  const t = useT();

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
      setError(t("habitCreate.errorName"));
      return;
    }

    const mask = buildDayOfWeekMask();
    if (mask === 0) {
      setError(t("habitCreate.errorDays"));
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
      setError(t("habitCreate.errorFailed"));
    } finally {
      setLoading(false);
    }
  };

  const daysLabels = [
    { label: t("charts.days.Mon"), value: 1 },
    { label: t("charts.days.Tue"), value: 2 },
    { label: t("charts.days.Wed"), value: 3 },
    { label: t("charts.days.Thu"), value: 4 },
    { label: t("charts.days.Fri"), value: 5 },
    { label: t("charts.days.Sat"), value: 6 },
    { label: t("charts.days.Sun"), value: 0 },
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
            <h1>{t("habitCreate.title")}</h1>
            <p>{t("habitCreate.subtitle")}</p>
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

        <ExitButton/>

        <div className="habit-create-card">
          <div className="form-group">
            <label>{t("habitCreate.habitName")}</label>
            <input
              type="text"
              placeholder={t("habitCreate.habitNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t("habitCreate.description")}</label>
            <textarea
              placeholder={t("habitCreate.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>{t("habitCreate.daysOfWeek")}</label>
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
            <button className="cancel-btn" onClick={() => navigate("/habits")}>{t("habitCreate.cancel")}</button>
            <button className="save-btn" onClick={handleSave} disabled={loading}>
              {loading ? t("habitCreate.saving") : t("habitCreate.saveHabit")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
