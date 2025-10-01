// Simple API client for the backend server

// Automatically detect API base URL based on environment
const getApiBase = () => {
  // If VITE_API_BASE is set, use it
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  // In production (Vercel), use relative path to same domain
  if (import.meta.env.PROD) {
    return '/api';
  }

  // In development, use localhost
  return 'http://localhost:3001/api';
};

const API_BASE = getApiBase();

async function http(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Shooters
export const listShooters = () => http('GET', '/shooters');
export const getShooter = (id) => http('GET', `/shooters/${id}`);
export const getShooterHistory = (name) => {
  // Add cache-busting parameter to ensure fresh data
  const cacheBuster = `?_t=${Date.now()}`;
  return http('GET', `/shooters/${encodeURIComponent(name)}/history${cacheBuster}`);
};
export const getShooterById = (id) => {
  // Add cache-busting parameter to ensure fresh data
  const cacheBuster = `?_t=${Date.now()}`;
  return http('GET', `/shooters/id/${id}${cacheBuster}`);
};
export const createShooter = (data) => http('POST', '/shooters', data);
export const deleteShooter = (id) => http('DELETE', `/shooters/${id}`);

// Sessions
export const createSession = ({ shooter_name, shooter_id, force_new_shooter, lane_id, session_name }) =>
  http('POST', '/sessions', { shooter_name, shooter_id, force_new_shooter, lane_id, session_name });
export const getSessionDetails = (sessionId) => {
  // Add cache-busting parameter to ensure fresh data
  const cacheBuster = `?_t=${Date.now()}`;
  return http('GET', `/sessions/${sessionId}${cacheBuster}`);
};
export const completeSession = (sessionId) => http('POST', `/sessions/${sessionId}/complete`);

// Parameters
export const saveParameters = (sessionId, params) => http('POST', `/sessions/${sessionId}/parameters`, params);

// Bullseye
export const saveBullseye = (sessionId, { x, y }) => http('POST', `/sessions/${sessionId}/bullseye`, { x, y });

// Shots
export const saveShots = (sessionId, shots) => http('POST', `/sessions/${sessionId}/shots`, Array.isArray(shots) ? shots : [shots]);

// Analytics
export const saveAnalytics = (sessionId, analytics) => http('POST', `/sessions/${sessionId}/analytics`, analytics);

// Final Report
export const saveFinalReport = (sessionId, report) => http('POST', `/sessions/${sessionId}/final-report`, report);

// Health
export const health = () => http('GET', '/health');

