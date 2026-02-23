import { request } from "./auth";

// GET /api/habits/
export const getHabits = () => request("/habits/");

// POST /api/habits/
export const createHabit = (data) =>
  request("/habits/", { method: "POST", body: JSON.stringify(data) });

// GET /api/habits/{id}/
export const getHabitById = (id) => request(`/habits/${id}/`);

// PUT /api/habits/{id}/
export const updateHabit = (id, data) =>
  request(`/habits/${id}/`, { method: "PUT", body: JSON.stringify(data) });

// PATCH /api/habits/{id}/
export const patchHabit = (id, data) =>
  request(`/habits/${id}/`, { method: "PATCH", body: JSON.stringify(data) });

// DELETE /api/habits/{id}/
export const deleteHabit = (id) =>
  request(`/habits/${id}/`, { method: "DELETE" });
