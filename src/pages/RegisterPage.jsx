import React, { useState } from "react";
import "../styles/LoginPage.css";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { registerUser } from "../services/register";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await registerUser(form); 
      alert("Успішна реєстрація!");
      navigate("/login"); 
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Register</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="button" className="google-btn">
          Sign in with Google
        </button>

        <div className="divider"></div>

        <form onSubmit={handleSubmit}>
          <label>Username</label>
          <div className="input-group">
            <FaUser className="icon" />
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <label>Email</label>
          <div className="input-group">
            <FaEnvelope className="icon" />
            <input
              name="email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
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
              placeholder="*************"
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

          <button type="submit" className="login-btn">
            Sign up
          </button>

          <p className="signup">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </form>
      </div>
    </div>
  );
}
