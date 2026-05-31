import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import "../styles/SettingsPage.css";

import Avatar from "../components/Avatar";
import HomeLogo from "../assets/HomeLogo.png";
import ExitButton from "../components/ExitButton";
import { getProfile, deleteAccount } from "../services/users";
import { request } from "../services/auth";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

export default function SettingsPage({ setIsAuth }) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Зміна пароля
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
    if (!window.confirm("Are you sure you want to permanently delete your account?")) return;
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
      setPasswordError("Please fill in all fields.");
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
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
      setPasswordSuccess("Password changed successfully!");
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPasswordError(err.message || "Something went wrong.");
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
              <img src={dashboard_icon} alt="" className="nav-icon" /> Dashboard
            </button>
            <button className="nav-item" onClick={() => navigate("/habits")}>
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
          <h1>Settings</h1>
          <div className="profile-wrapper">
            <Avatar
              src={user?.avatar}
              username={user?.username || "User"}
              className="profile-icon"
              onClick={() => setMenuOpen(o => !o)}
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

        <div className="settings-container">

          {/* ── Account Settings ── */}
          <div className="settings-card">
            <h2>Account Settings</h2>

            <div className="settings-row">
              <div>
                <h3>Language</h3>
                <p>Select your display language</p>
              </div>
              <select className="language-select">
                <option>English</option>
                <option>Українська</option>
              </select>
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <h3>Delete Account</h3>
                <p>Permanently delete your account and all associated data</p>
              </div>
              <button className="delete-btn" onClick={handleDeleteAccount}>
                Delete Account
              </button>
            </div>
          </div>

          {/* ── Change Password ── */}
          <div className="settings-card">
            <h2>Change Password</h2>

            <div className="password-field">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={e => setPasswordData(p => ({ ...p, current_password: e.target.value }))}
                placeholder="Enter current password"
              />
            </div>

            <div className="settings-divider" />

            <div className="password-field">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={e => setPasswordData(p => ({ ...p, new_password: e.target.value }))}
                placeholder="At least 8 characters"
              />
            </div>

            <div className="password-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={e => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))}
                placeholder="Repeat new password"
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
                {passwordLoading ? "Saving..." : "Change Password"}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
