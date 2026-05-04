const API_URL = process.env.REACT_APP_API_URL;

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
  const res = await request("/accounts/register/", {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  return res; 
}
