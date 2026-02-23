import { request } from "./auth";

// GET /api/focus-sessions/
export const getFocusSessions = () => {
  return request("/focus-sessions/");
};

// POST /api/focus-sessions/
export const createFocusSession = (data) => {
  return request("/focus-sessions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// GET /api/focus-sessions/{id}/
export const getFocusSessionById = (id) => {
  return request(`/focus-sessions/${id}/`);
};

// PUT /api/focus-sessions/{id}/
export const updateFocusSession = (id, data) => {
  return request(`/focus-sessions/${id}/`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// PATCH /api/focus-sessions/{id}/
export const patchFocusSession = (id, data) => {
  return request(`/focus-sessions/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

// DELETE /api/focus-sessions/{id}/
export const deleteFocusSession = (id) => {
  return request(`/focus-sessions/${id}/`, {
    method: "DELETE",
  });
};
