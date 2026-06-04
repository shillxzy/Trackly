import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getProfile, patchProfile } from "../services/users";
import Avatar from "../components/Avatar";
import HomeLogo from "../assets/HomeLogo.png";
import ExitButton from "../components/ExitButton";
import { useT } from "../translations/LanguageContext";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

export default function ProfilePage({ setIsAuth }) {
  const navigate = useNavigate();
  const t = useT();

  const [user, setUser]     = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
    avatar: null,
  });

  useEffect(() => {
    const cached = localStorage.getItem("profile");
    if (cached) {
      const p = JSON.parse(cached);
      setUser(p);
      setFormData({ username: p.username || "", fullname: p.fullname || "", email: p.email || "", avatar: null });
      return;
    }
    getProfile().then(p => {
      setUser(p);
      setFormData({ username: p.username || "", fullname: p.fullname || "", email: p.email || "", avatar: null });
      localStorage.setItem("profile", JSON.stringify(p));
    }).catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsAuth(false);
    navigate("/login");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (jpg/png)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setUser(prev => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
    setFormData(prev => ({ ...prev, avatar: file }));
  };

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      setSaveMsg("");
      const data = new FormData();
      data.append("username", formData.username);
      data.append("fullname", formData.fullname);
      data.append("email",    formData.email);
      if (formData.avatar) data.append("avatar", formData.avatar);

      const updated = await patchProfile(data);
      setUser(updated);
      localStorage.setItem("profile", JSON.stringify(updated));
      setSaveMsg(t("profile.savedSuccess"));
    } catch (err) {
      console.error(err);
      setSaveMsg(t("profile.savedError"));
    } finally {
      setSaving(false);
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
          <h1>{t("profile.title")}</h1>
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

        <div className="profile-content-container">

          <div className="profile-card">
            <div className="avatar-section">
              <Avatar
                src={user?.avatar}
                username={user?.username || "User"}
                className="avatar-img"
              />
              <input
                type="file"
                accept="image/png, image/jpeg"
                id="avatar-upload"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <button
                className="upload-photo-btn"
                onClick={() => document.getElementById("avatar-upload").click()}
              >
                {t("profile.uploadPhoto")}
              </button>
            </div>

            <div className="info-section">
              <div>
                <label>{t("profile.username")}</label>
                <input
                  className="profile-input"
                  value={formData.username}
                  onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                />
              </div>
              <div>
                <label>{t("profile.fullName")}</label>
                <input
                  className="profile-input"
                  value={formData.fullname}
                  onChange={e => setFormData(p => ({ ...p, fullname: e.target.value }))}
                />
              </div>
              <div>
                <label>{t("profile.email")}</label>
                <input
                  className="profile-input"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div style={{
                marginTop: "8px",
                padding: "12px 16px",
                background: "linear-gradient(135deg, #1D406F, #3D6FDB)",
                borderRadius: "12px",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ fontSize: "24px" }}>🔥</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "18px" }}>
                    {user?.streak_days || 0} {t("profile.streakBadge")}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>
                    {t("profile.streakHint")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {saveMsg && (
            <p style={{
              textAlign: "center",
              color: saveMsg.includes("success") || saveMsg.includes("оновлено") ? "#2e7d32" : "#c62828",
              margin: 0,
            }}>
              {saveMsg}
            </p>
          )}

          <div className="profile-actions">
            <button
              className="complete-profile"
              onClick={handleProfileSave}
              disabled={saving}
            >
              {saving ? t("profile.saving") : t("profile.saveChanges")}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
