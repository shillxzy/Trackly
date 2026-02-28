import { request } from "./auth";

// GET /api/habit-completions/
export const getHabitCompletions = () => request("/habit-completions/");

// POST /api/habit-completions/
export const createHabitCompletion = (data) =>
  request("/habit-completions/", { method: "POST", body: JSON.stringify(data) });

// GET /api/habit-completions/{id}/
export const getHabitCompletionById = (id) =>
  request(`/habit-completions/${id}/`);

// PUT /api/habit-completions/{id}/
export const updateHabitCompletion = (id, data) =>
  request(`/habit-completions/${id}/`, { method: "PUT", body: JSON.stringify(data) });

// PATCH /api/habit-completions/{id}/
export const patchHabitCompletion = (id, data) =>
  request(`/habit-completions/${id}/`, { method: "PATCH", body: JSON.stringify(data) });

// DELETE /api/habit-completions/{id}/
export const deleteHabitCompletion = (id) =>
  request(`/habit-completions/${id}/`, { method: "DELETE" });
