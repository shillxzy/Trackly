const API_URL = "http://127.0.0.1:8000/api";

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(API_URL + "/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) throw new Error("Refresh token expired");

  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  return data.access;
}

export async function request(url, options = {}) {
  let token = localStorage.getItem("access_token");


  let headers = {
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...options.headers,
};

if (!(options.body instanceof FormData)) {
  headers["Content-Type"] = "application/json";
}

let res = await fetch(API_URL + url, {
  ...options,
  headers,
});



  if (res.status === 401) {
    try {
      token = await refreshAccessToken();

      res = await fetch(API_URL + url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
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


export async function loginUser({ identifier, password }) {
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

  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);

  return data;
}

