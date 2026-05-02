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

  const [step, setStep] = useState("register"); 
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    await registerUser(form);

    setEmail(form.email); 
    setStep("verify");  

  } catch (err) {
    setError(err.message);
  }
};

const handleVerify = async (e) => {
  e.preventDefault();
  setError(null);

  try {
    await fetch(`${process.env.REACT_APP_API_URL}/accounts/register/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        code,
      }),
    });

    alert("Акаунт підтверджено!");
    navigate("/login");

  } catch (err) {
    setError("Невірний код або він протермінований");
  }
};

  return (
  <div className="login-container">
    <div className="login-card">

      {/* HEADER */}
      <h1>
        {step === "register" ? "Register" : "Verify account"}
      </h1>

      <p className="subtitle">
        {step === "register"
          ? "Create accounts and start planning your habits!"
          : `We sent a code to ${email}`}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ================= REGISTER STEP ================= */}
      {step === "register" && (
        <>
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
        </>
      )}

      {/* ================= VERIFY STEP ================= */}
      {step === "verify" && (
        <form onSubmit={handleVerify}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Verify account
          </button>

          <p className="signup">
            Didn’t receive code?{" "}
            <span
              style={{ cursor: "pointer", color: "#4f46e5" }}
              onClick={() => handleSubmit({ preventDefault: () => {} })}
            >
              Resend
            </span>
          </p>
        </form>
      )}

    </div>
  </div>
);
}