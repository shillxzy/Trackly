const API_URL = "http://127.0.0.1:8000/api";


export async function request(url, options = {}) {
  const token = localStorage.getItem("access_token");

  const res = await fetch(API_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
}


export async function loginUser(data) {
  const res = await fetch(API_URL + "/token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: data.identifier, 
      password: data.password
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.detail || "Невірний логін або пароль");
  }

  const tokens = await res.json();
  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);

  return tokens;
}

