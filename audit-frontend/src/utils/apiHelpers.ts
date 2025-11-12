import config from '../config/config';

const ensureLeadingSlash = (path: string) => {
  if (!path) return '';
  return path.startsWith('/') ? path : `/${path}`;
};

/**
 * Build a fully-qualified API URL using the configured base URL.
 * Accepts either "/resource" or "resource" style paths.
 */
export const buildApiUrl = (path: string) => {
  const base = config.apiBaseUrl?.replace(/\/$/, '') || '';
  return `${base}${ensureLeadingSlash(path)}`;
};

/**
 * Helper to apply authentication headers consistently.
 */
export const withAuthHeaders = (headers: Record<string, string> = {}) => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
};

