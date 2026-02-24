import { refreshToken } from "./auth";

const API_URL = "http://127.0.0.1:8000/api";

export async function request(url, options = {}) {
  let token = localStorage.getItem("access_token");

  let res = await fetch(API_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });


  if (res.status === 401) {
    try {
      token = await refreshToken(); 
      res = await fetch(API_URL + url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });
    } catch (e) {
      throw new Error("Token expired, please login again");
    }
  }

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
}
