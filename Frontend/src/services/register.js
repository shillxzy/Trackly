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


export async function registerUser(data) {
  const res = await request("/users/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const tokenRes = await request("/token/", {
    method: "POST",
    body: JSON.stringify({
      username: data.username,
      password: data.password,
    }),
  });

  localStorage.setItem("access_token", tokenRes.access);
  localStorage.setItem("refresh_token", tokenRes.refresh);

  return res; 
}
