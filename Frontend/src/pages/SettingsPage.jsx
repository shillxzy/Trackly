import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/SettingsPage.css";

import Avatar from "../components/Avatar";
import HomeLogo from "../assets/HomeLogo.png";
import ExitButton from "../components/ExitButton";
import { getProfile, deleteAccount } from "../services/users";
import { request } from "../services/auth";
import { useLanguage } from "../translations/LanguageContext";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

export default function SettingsPage({ setIsAuth }) {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError]     = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const cached = localStorage.getItem("profile");
    if (cached) { setUser(JSON.parse(cached)); return; }
    getProfile().then(p => {
      setUser(p);
      localStorage.setItem("profile", JSON.stringify(p));
    }).catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsAuth(false);
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t("settings.deleteConfirm"))) return;
    try {
      await deleteAccount();
      localStorage.clear();
      sessionStorage.clear();
      setIsAuth(false);
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.current_password || !passwordData.new_password) {
      setPasswordError(t("settings.errorFields"));
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError(t("settings.errorMatch"));
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError(t("settings.errorLength"));
      return;
    }

    try {
      setPasswordLoading(true);
      await request("/accounts/change-password/", {
        method: "POST",
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password:     passwordData.new_password,
        }),
      });
      setPasswordSuccess(t("settings.passwordChanged"));
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPasswordError(err.message || t("settings.errorGeneric"));
    } finally {
      setPasswordLoading(false);
    }
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
              <img src={dashboard_icon} alt="" className="nav-icon" /> {t("nav.dashboard")}
            </button>
            <button className="nav-item" onClick={() => navigate("/habits")}>
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
          <h1>{t("settings.title")}</h1>
          <div className="profile-wrapper">
            <Avatar
              src={user?.avatar}
              username={user?.username || "User"}
              className="profile-icon"
              onClick={() => setMenuOpen(o => !o)}
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

        <div className="settings-container">

          <div className="settings-card">
            <h2>{t("settings.accountSettings")}</h2>

            <div className="settings-row">
              <div>
                <h3>{t("settings.language")}</h3>
                <p>{t("settings.languageDesc")}</p>
              </div>
              <select
                className="language-select"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="en">English</option>
                <option value="uk">Українська</option>
              </select>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <h3>{t("settings.deleteAccount")}</h3>
                <p>{t("settings.deleteAccountDesc")}</p>
              </div>
              <button className="delete-btn" onClick={handleDeleteAccount}>
                {t("settings.deleteAccount")}
              </button>
            </div>
          </div>

          <div className="settings-card">
            <h2>{t("settings.changePassword")}</h2>

            <div className="password-field">
              <label>{t("settings.currentPassword")}</label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={e => setPasswordData(p => ({ ...p, current_password: e.target.value }))}
                placeholder={t("settings.currentPasswordPlaceholder")}
              />
            </div>

            <div className="settings-divider" />

            <div className="password-field">
              <label>{t("settings.newPassword")}</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))}
                placeholder={t("settings.newPasswordPlaceholder")}
              />
            </div>

            <div className="password-field">
              <label>{t("settings.confirmPassword")}</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={e => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))}
                placeholder={t("settings.confirmPasswordPlaceholder")}
              />
            </div>

            {passwordError   && <p className="settings-error">{passwordError}</p>}
            {passwordSuccess && <p className="settings-success">{passwordSuccess}</p>}

            <div>
              <button
                className="settings-save-btn"
                onClick={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? t("settings.changing") : t("settings.changePasswordBtn")}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
