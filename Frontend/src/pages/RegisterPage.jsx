import React, { useState } from "react";
import "../styles/LoginPage.css";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { registerUser } from "../services/register";
import { useNavigate } from "react-router-dom";
import { useT } from "../translations/LanguageContext";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const t = useT();

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
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/accounts/register/verify/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Verification failed");
      }

      alert(t("register.accountVerified"));
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/accounts/register/resend/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data?.detail || "Failed to resend");

      alert("Code resent!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1>
          {step === "register" ? t("register.title") : t("register.verifyTitle")}
        </h1>

        <p className="subtitle">
          {step === "register"
            ? t("register.subtitle")
            : t("register.verifySubtitle", { email })}
        </p>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {step === "register" && (
          <>
            <button type="button" className="google-btn">
              {t("register.signUp")}
            </button>

            <div className="divider"></div>

            <form onSubmit={handleSubmit}>
              <label>{t("register.username")}</label>
              <div className="input-group">
                <FaUser className="icon" />
                <input
                  name="username"
                  type="text"
                  placeholder={t("register.username")}
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <label>{t("register.email")}</label>
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

              <label>{t("register.password")}</label>
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
                {t("register.signUp")}
              </button>

              <p className="signup">
                {t("register.alreadyAccount")} <a href="/login">{t("register.logIn")}</a>
              </p>
            </form>
          </>
        )}

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
              {t("register.verifyBtn")}
            </button>

            <p className="signup">
              {t("register.noCode")}{" "}
              <span
                style={{ cursor: "pointer", color: "#4f46e5" }}
                onClick={handleResend}
              >
                {t("register.resend")}
              </span>
            </p>
          </form>
        )}

      </div>
    </div>
  );
}
