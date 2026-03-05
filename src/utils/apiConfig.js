/**
 * Shared API base URL. Use empty string in dev to hit Vite proxy (/api -> localhost:3000).
 * Set VITE_API_BASE_URL in production when frontend and backend are on different origins.
 */
export const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
