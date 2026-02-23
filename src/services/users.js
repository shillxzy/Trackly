import { request } from "./auth";

// GET /api/users/me/profile/
export const getProfile = () => request("/users/me/profile/");

// PUT /api/users/me/profile/
export const updateProfile = (data) =>
  request("/users/me/profile/", { method: "PUT", body: JSON.stringify(data) });

// PATCH /api/users/me/profile/
export const patchProfile = (data) =>
  request("/users/me/profile/", { method: "PATCH", body: JSON.stringify(data) });
