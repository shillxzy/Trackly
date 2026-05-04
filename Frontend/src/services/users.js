import { request } from "./auth";

// GET /api/accounts/me/profile/
export const getProfile = () => request("/accounts/me/profile/");

// PUT /api/accounts/me/profile/
export const updateProfile = (data) =>
  request("/accounts/me/profile/", { method: "PUT", body: data, headers: {} });

// PATCH /api/accounts/me/profile/
export const patchProfile = (data) =>
  request("/accounts/me/profile/", { method: "PATCH", body: data });

// DELETE /api/accounts/me/
export const deleteAccount = () =>
  request("/accounts/me/", { method: "DELETE" });
