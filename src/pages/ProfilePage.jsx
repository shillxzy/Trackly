import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getProfile, patchProfile } from "../services/users";
import Avatar from "../components/Avatar";
import HomeLogo from "../assets/HomeLogo.png";

import dashboard_icon from "../assets/dashboard_icon.png";
import habits_icon from "../assets/habits_icon.png";
import focussession_icon from "../assets/focussession_icon.png";
import analytics_icon from "../assets/analytics_icon.png";
import logout_icon from "../assets/logout_icon.png";

export default function ProfilePage({ setIsAuth }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    email: "",
  });

 const [passwordData, setPasswordData] = useState({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

const [loadingPassword, setLoadingPassword] = useState(false);

const handleChangePassword = async () => {
  if (passwordData.new_password !== passwordData.confirm_password) {
    alert("Новий пароль і підтвердження не збігаються");
    return;
  }

  try {
    setLoadingPassword(true);

    const token = localStorage.getItem("access_token"); 
    const response = await fetch("http://localhost:8000/api/users/change-password/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Пароль змінено успішно");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } else {
      alert(data.detail || "Щось пішло не так");
    }
  } catch (err) {
    console.error(err);
    alert("Помилка мережі");
  } finally {
    setLoadingPassword(false);
  }
};


  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
      setFormData({
        username: profile.username || "",
        fullname: profile.fullname || "",
        email: profile.email || "",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setIsAuth(false);
    navigate("/login");
  };

  const handleProfileSave = async () => {
  try {
    const data = new FormData();
data.append("username", formData.username);
data.append("fullname", formData.fullname);
data.append("email", formData.email);
if (formData.avatar) data.append("avatar", formData.avatar);

const updatedProfile = await patchProfile(data); 
setUser(updatedProfile);
    alert("Профіль оновлено!");
  } catch (err) {
    console.error(err);
    alert("Не вдалося зберегти зміни");
  }
};




  const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert("Будь ласка, виберіть зображення (jpg/png)");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => setUser((prev) => ({ ...prev, avatar: reader.result }));
  reader.readAsDataURL(file);

  setFormData(prev => ({ ...prev, avatar: file }));
};

  return (
    <div className="home-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-container">
            <img src={HomeLogo} alt="Trackly Logo" className="logo-img" />
          </div>

          <hr className="sidebar-divider" />

          <nav className="nav-menu">
            <button className="nav-item active" onClick={() => navigate("/home")}>
              <img src={dashboard_icon} alt="" className="nav-icon" />
              Dashboard
            </button>
            <button className="nav-item" onClick={() => navigate("/habits")}>
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

      {/* MAIN */}
      <main className="main">
        <div className="topbar">
          <h1>Profile</h1>
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
    <button className="exit-btn" onClick={() => {
      const lastPath = sessionStorage.getItem("lastPath") || "/home";
      navigate(lastPath);
    }}>⬅ Exit</button>
  </div>

        <div className="profile-content-container">
          <div className="profile-card">
          <div className="avatar-section">
  <Avatar src={user?.avatar} username={user?.username || "User"} className="avatar-img" />

  <input
    type="file"
    accept="image/png, image/jpeg"
    id="avatar-upload"
    style={{ display: 'none' }}
    onChange={handleAvatarChange}
  />

  <button
    className="upload-photo-btn"
    onClick={() => document.getElementById('avatar-upload').click()}
  >
    Upload New Photo
  </button>
</div>
            <div className="info-section">
              <div>
                <label>Username</label>
                <input className="profile-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div>
                <label>Full Name</label>
                <input className="profile-input" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
              </div>
              <div>
                <label>Email</label>
                <input className="profile-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          </div>

          {/* PASSWORD SECTION */}
         <div className="password-section">
  <h2>Change Password</h2>

  <div className="password-field">
    <label>Current Password</label>
    <input
      type="text"
      value={passwordData.current_password}
      onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
    />
  </div>

  <div className="password-field">
    <label>New Password</label>
    <input
      type="text"
      value={passwordData.new_password}
      onChange={e => setPasswordData({ ...passwordData, new_password: e.target.value })}
    />
  </div>

  <div className="password-field">
    <label>Confirm Password</label>
    <input
      type="text"
      value={passwordData.confirm_password}
      onChange={e => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
    />
  </div>
</div>

          {/* SAVE BUTTON */}
          <div className="profile-actions">
          <button className="complete-profile" 
          
          onClick={async () => {
            await handleChangePassword();
            handleProfileSave();
          }}
          disabled={loadingPassword}
          >Save Changes</button>
          </div>
        </div>
      </main>
    </div>
  );
}
