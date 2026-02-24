const API_URL = "http://127.0.0.1:8000/api";

function getToken(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
}

async function refreshAccessToken() {
  const refresh = getToken("refresh_token");
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(API_URL + "/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) throw new Error("Refresh token expired");

  const data = await res.json();

  // оновлюємо там же, де лежав refresh
  const storage = localStorage.getItem("refresh_token")
    ? localStorage
    : sessionStorage;

  storage.setItem("access_token", data.access);

  return data.access;
}


export async function request(url, options = {}) {
  let token = getToken("access_token");

  let resHeaders = { ...options.headers };

  if (token) {
    resHeaders.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    resHeaders["Content-Type"] = "application/json";
  }

  let res = await fetch(API_URL + url, {
    ...options,
    headers: resHeaders,
  });

  if (res.status === 401) {
    try {
      token = await refreshAccessToken();

      let retryHeaders = { ...options.headers, Authorization: `Bearer ${token}` };

      if (!(options.body instanceof FormData)) {
        retryHeaders["Content-Type"] = "application/json";
      }

      res = await fetch(API_URL + url, {
        ...options,
        headers: retryHeaders,
      });
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      throw new Error("Session expired. Please login again.");
    }
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data?.detail || "Request failed");
  }

  return data;
}



export async function loginUser({ identifier, password }, remember) {
  const res = await fetch(API_URL + "/token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: identifier,
      password: password,
    }),
  });

  const text = await res.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.detail || "Incorrect login or password");
  }

  const storage = remember ? localStorage : sessionStorage;
  
  storage.setItem("access_token", data.access);
  storage.setItem("refresh_token", data.refresh);

  if (remember) {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  } else {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }

  return data;
}

