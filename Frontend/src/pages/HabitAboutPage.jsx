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
import { useT } from "../translations/LanguageContext";

const DAY_MASKS = [
  { mask: 1,  key: "Mon" },
  { mask: 2,  key: "Tue" },
  { mask: 4,  key: "Wed" },
  { mask: 8,  key: "Thu" },
  { mask: 16, key: "Fri" },
  { mask: 32, key: "Sat" },
  { mask: 64, key: "Sun" },
];

export default function HabitAboutPage({ setIsAuth }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const t = useT();

  const [habit, setHabit] = useState(null);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const decodeMask = (mask) => {
    if (!mask && mask !== 0) return t("habitAbout.notSet");
    const days = DAY_MASKS.filter((d) => (mask & d.mask) !== 0).map((d) => t(`charts.days.${d.key}`));
    return days.length > 0 ? days.join(", ") : t("habitAbout.notSet");
  };

  const loadData = useCallback(async () => {
    try {
      const profile = await getProfile();
      const habits = await getHabits();
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
            <h1>{t("habitAbout.title")}</h1>
            <p>{t("habitAbout.subtitle")}</p>
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

        <div className="habit-about-card">
          <h2>{habit.name}</h2>

          <div className="habit-about-row">
            <span className="label">{t("habitAbout.description")}</span>
            <span className="value">{habit.description || t("habitAbout.noDescription")}</span>
          </div>

          <div className="habit-about-row">
            <span className="label">{t("habitAbout.status")}</span>
            <span className={`value ${habit.is_active ? "active" : "inactive"}`}>
              {habit.is_active ? t("habitAbout.active") : t("habitAbout.inactive")}
            </span>
          </div>

          <div className="habit-about-row">
            <span className="label">{t("habitAbout.schedule")}</span>
            <span className="value">
              {decodeMask(scheduleMask)}
            </span>
          </div>

          <div className="habit-about-row">
            <span className="label">{t("habitAbout.created")}</span>
            <span className="value">
              {habit.created_at ? new Date(habit.created_at).toLocaleDateString() : "—"}
            </span>
          </div>

          <div className="habit-about-actions">
            <button className="back-btn" onClick={() => navigate("/habits")}>
              {t("habitAbout.back")}
            </button>
            <button className="edit-btn" onClick={() => navigate(`/habits/edit/${habit.id}`)}>
              {t("habitAbout.edit")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
