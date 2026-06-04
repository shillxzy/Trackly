import React, { useState } from "react";
import "../styles/LoginPage.css";
import { FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { useT } from "../translations/LanguageContext";

export default function LoginPage({ setIsAuth }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState(null);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const t = useT();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await loginUser(form, remember);
      setIsAuth(true);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/accounts/google/login/?next=http://localhost:3000/home';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>{t("login.title")}</h1>
        <p className="subtitle">
          {t("login.subtitle")}
        </p>

        {error && <p className="input-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>{t("login.emailOrUsername")}</label>
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              name="identifier"
              type="text"
              placeholder={t("login.emailOrUsername")}
              value={form.identifier}
              onChange={handleChange}
              required
            />
          </div>

          <label>{t("login.password")}</label>
          <div className="input-group">
            <FaLock className="icon" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="************"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <a href="/reset-password" className="forgot">
            {t("login.forgotPassword")}
          </a>

          <button type="submit" className="login-btn">
            {t("login.loginBtn")}
          </button>

          <div className="remember">
            <label className="switch">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <span className="slider"></span>
            </label>
            <span>{t("login.rememberMe")}</span>
          </div>

          <div className="divider"></div>

          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <FaGoogle className="google-icon" />
            {t("login.googleLogin")}
          </button>

          <p className="signup">
            {t("login.noAccount")} <Link to="/register">{t("login.signUp")}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
