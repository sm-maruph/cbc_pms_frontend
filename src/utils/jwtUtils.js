// src/utils/jwtUtils.js

/**
 * Decode JWT token and extract expiration time
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired or invalid, false if valid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  
  // Add 5 seconds buffer to handle network delays
  return currentTime >= expirationTime - 5000;
};

/**
 * Get time remaining until token expires (in milliseconds)
 * @param {string} token - JWT token
 * @returns {number} - Milliseconds remaining, 0 if expired/invalid
 */
export const getTimeUntilExpiry = (token) => {
  if (!token) return 0;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const timeRemaining = expirationTime - currentTime;
  
  return timeRemaining > 0 ? timeRemaining : 0;
};

/**
 * Get formatted time until expiration
 * @param {string} token - JWT token
 * @returns {string} - Formatted time string (e.g., "2h 15m" or "30s")
 */
export const getFormattedTimeUntilExpiry = (token) => {
  const ms = getTimeUntilExpiry(token);
  if (ms <= 0) return 'Expired';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};