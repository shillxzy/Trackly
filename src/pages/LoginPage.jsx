import React, { useState } from "react";
import "../styles/LoginPage.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage({ setIsAuth }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState(null);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();


 const handleChange = (e) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  try {
    await loginUser(form); 
    alert("Успішний вхід!");
    setIsAuth(true);
    navigate("/");
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Log in</h1>
        <p className="subtitle">
          Log in using your email and password.
        </p>

        {error && <p className="input-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Email or Username</label>
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              name="identifier"          
              type="text"                
              placeholder="Email or Username"
              value={form.identifier}   
              onChange={handleChange}
              required
            />
          </div>

          <label>Password</label>
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

          <a href="/refresh-password" className="forgot">
            Forgot your password?
          </a>

          <button type="submit" className="login-btn">
            Log in
          </button>

          <div className="remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={() => setRemember(!remember)}
            />
            <span>Remember me</span>
          </div>

          <div className="divider"></div>

          <button type="button" className="google-btn">
            Sign in with Google
          </button>

          <p className="signup">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
