import { request } from "./auth"; 

// GET /api/habit-schedules/
export const getHabitSchedules = () => request("/habit-schedules/");

// POST /api/habit-schedules/
export const createHabitSchedule = (data) =>
  request("/habit-schedules/", { method: "POST", body: JSON.stringify(data) });

// GET /api/habit-schedules/{id}/
export const getHabitScheduleById = (id) =>
  request(`/habit-schedules/${id}/`);

// PUT /api/habit-schedules/{id}/
export const updateHabitSchedule = (id, data) =>
  request(`/habit-schedules/${id}/`, { method: "PUT", body: JSON.stringify(data) });

// PATCH /api/habit-schedules/{id}/
export const patchHabitSchedule = (id, data) =>
  request(`/habit-schedules/${id}/`, { method: "PATCH", body: JSON.stringify(data) });

// DELETE /api/habit-schedules/{id}/
export const deleteHabitSchedule = (id) =>
  request(`/habit-schedules/${id}/`, { method: "DELETE" });
