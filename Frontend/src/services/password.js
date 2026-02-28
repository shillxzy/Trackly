// password.js
const API_BASE = "http://localhost:8000/api/users/password-reset"; 

export async function sendResetCode(email) {
  const res = await fetch(`${API_BASE}/request/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Помилка відправки коду");
  return data;
}

export async function verifyResetCode(email, code) {
  const res = await fetch(`${API_BASE}/verify/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Невірний код");
  return data.token;
}

export async function confirmNewPassword(token, newPassword) {
  const res = await fetch(`${API_BASE}/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Помилка зміни пароля");
  return data;
}
