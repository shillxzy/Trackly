import React, { useState } from "react";
import "../styles/LoginPage.css";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Log in</h1>
        <p className="subtitle">
          Log in using your username and password.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input type="email" placeholder="email@example.com" required />
          </div>

          <label>Password</label>
          <div className="input-group">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="************"
              required
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <a href="#" className="forgot">
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
            Don't have an account? <a href="#">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}