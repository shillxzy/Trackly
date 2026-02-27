import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css"; 
import "../styles/ResetPassword.css"

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); 
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState(null); 
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Помилка відправки email");
      setStep("code");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/password-reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Невірний код");
      setToken(data.token); 
      setStep("newPassword");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setError("Паролі не співпадають");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8000/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: passwords.new }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Помилка зміни пароля");
      alert("Пароль успішно змінено!");
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="reset-container">
    <div className="reset-card">
      <h1 className="reset-title">Reset Password</h1>
      {error && <p className="reset-error">{error}</p>}

      {step === "email" && (
        <div className="reset-step">
          <label className="reset-label">Email</label>
          <input
            className="reset-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button
            className="reset-button"
            onClick={handleSendEmail}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Code"}
          </button>
        </div>
      )}

      {step === "code" && (
        <div className="reset-step">
          <label className="reset-label">Verification Code</label>
          <input
            className="reset-input"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            required
          />
          <button
            className="reset-button"
            onClick={handleVerifyCode}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      )}

      {step === "newPassword" && (
        <div className="reset-step">
          <label className="reset-label">New Password</label>
          <input
            className="reset-input"
            type="password"
            value={passwords.new}
            onChange={e => setPasswords({ ...passwords, new: e.target.value })}
            placeholder="Enter new password"
            required
          />
          <label className="reset-label">Confirm Password</label>
          <input
            className="reset-input"
            type="password"
            value={passwords.confirm}
            onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
            placeholder="Confirm new password"
            required
          />
          <button
            className="reset-button"
            onClick={handleChangePassword}
            disabled={loading}
          >
            {loading ? "Saving..." : "Change Password"}
          </button>
        </div>
      )}
    </div>
  </div>
);

}
