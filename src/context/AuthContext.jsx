// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { isTokenExpired, getTimeUntilExpiry } from '../utils/jwtUtils';

const AuthContext = createContext();
const API_BASE = import.meta.env.VITE_API_URL || "http://192.168.23.17:5000/api" || "http://localhost:5000/api"; 
const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cbcUser');
    const token = localStorage.getItem('cbcToken');

    if (stored && token && !isTokenExpired(token)) {
      return JSON.parse(stored);
    }

    localStorage.removeItem('cbcUser');
    localStorage.removeItem('cbcToken');
    localStorage.removeItem('cbcSessionToken');
    return null;
  });

  const [tokenExpiryTime, setTokenExpiryTime] = useState(null);
  const [remainingTime, setRemainingTime] = useState(INACTIVITY_TIMEOUT);
  const [showWarning, setShowWarning] = useState(false);
  const sessionToken = localStorage.getItem('cbcSessionToken');

  const expiryTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const activityEventsRef = useRef(['mousemove', 'mousedown', 'keypress', 'scroll', 'click']);
  const isLoggingOutRef = useRef(false);

  // Helper functions to check user role
  const isSuperAdmin = user?.role === 'Super Admin';
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  const isITUser = user?.role === 'IT User';
  const isBranchUser = user?.role === 'Branch User';
  const isLoggedIn = !!user;

  // Call logout API
  const callLogoutAPI = useCallback(async (token, sessToken, reason = 'manual') => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Session-Token': sessToken || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      isLoggingOutRef.current = false;
    }
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    setRemainingTime(INACTIVITY_TIMEOUT);
    setShowWarning(false);

    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      // Inactivity timeout reached
      console.log('⏰ Inactivity timeout reached, logging out...');
      handleLogout(true, true, 'inactivity');
    }, INACTIVITY_TIMEOUT);

    // Set warning timer (1 minute before expiry)
    const warningTimeout = INACTIVITY_TIMEOUT - 60 * 1000;
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      // Dispatch toast event
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
          type: 'warning',
          message: '⚠️ Your session will expire in 1 minute due to inactivity.',
          duration: 10000
        }
      }));
    }, warningTimeout);
  }, []);

  // Track user activity
  // const handleUserActivity = useCallback(() => {
  //   if (!user) return;
  //   resetInactivityTimer();

  //   // Optionally ping backend to reset server-side timer
  //   fetch(`${API_BASE}/auth/ping`, {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${localStorage.getItem('cbcToken')}`,
  //       'Content-Type': 'application/json'
  //     }
  //   }).catch(() => { });
  // }, [user, resetInactivityTimer]);

  // Set up activity listeners
  // useEffect(() => {
  //   if (!user) return;

  //   resetInactivityTimer();

  //   const events = activityEventsRef.current;
  //   events.forEach(event => {
  //     window.addEventListener(event, handleUserActivity);
  //   });

  //   return () => {
  //     events.forEach(event => {
  //       window.removeEventListener(event, handleUserActivity);
  //     });
  //     if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
  //     if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
  //   };
  // }, [user, resetInactivityTimer, handleUserActivity]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Setup token expiry monitoring
  const setupTokenMonitoring = useCallback((token, onExpiry, onWarning) => {
    clearTimers();

    if (!token) return;

    const timeUntilExpiry = getTimeUntilExpiry(token);
    setTokenExpiryTime(timeUntilExpiry);

    if (timeUntilExpiry <= 0) {
      onExpiry();
      return;
    }

    // Set timer for warning (5 minutes before expiry)
    const warningTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
    if (warningTime > 0 && onWarning) {
      warningTimerRef.current = setTimeout(() => {
        onWarning(timeUntilExpiry);
      }, warningTime);
    }

    // Set timer for actual expiry
    expiryTimerRef.current = setTimeout(() => {
      onExpiry();
    }, timeUntilExpiry);
  }, [clearTimers]);

  const handleLogin = useCallback((userData, token, sessionTokenValue) => {
    setUser(userData);
    localStorage.setItem('cbcUser', JSON.stringify(userData));
    localStorage.setItem('cbcToken', token);
    if (sessionTokenValue) {
      localStorage.setItem('cbcSessionToken', sessionTokenValue);
    }
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  const handleLogout = useCallback(async (redirect = true, callAPI = true, reason = 'manual') => {
    clearTimers();

    const currentToken = localStorage.getItem('cbcToken');
    const currentSessionToken = localStorage.getItem('cbcSessionToken');

    if (callAPI && currentToken && !isLoggingOutRef.current) {
      await callLogoutAPI(currentToken, currentSessionToken, reason);
    }

    setUser(null);
    setTokenExpiryTime(null);
    setRemainingTime(INACTIVITY_TIMEOUT);
    setShowWarning(false);
    localStorage.removeItem('cbcUser');
    localStorage.removeItem('cbcToken');
    localStorage.removeItem('cbcSessionToken');

    if (redirect) {
      window.location.href = '/';
    }
  }, [clearTimers, callLogoutAPI]);

  // Monitor token on user change
  useEffect(() => {
    const token = localStorage.getItem('cbcToken');
    if (user && token) {
      if (isTokenExpired(token)) {
        handleLogout(true, true, 'token_expired');
        return;
      }

      setupTokenMonitoring(
        token,
        async () => {
          console.log('Token expired, logging out...');
          await handleLogout(true, true, 'token_expired');
        },
        (timeRemaining) => {
          const minutesLeft = Math.floor(timeRemaining / 60000);
          window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
              type: 'warning',
              message: `Your session will expire in ${minutesLeft} minutes. Please save your work.`,
              duration: 10000
            }
          }));
        }
      );
    }

    return () => clearTimers();
  }, [user, setupTokenMonitoring, handleLogout, clearTimers]);

  // Check token validity on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const token = localStorage.getItem('cbcToken');
        if (user && token && isTokenExpired(token)) {
          handleLogout(true, true, 'token_expired');
        } else if (user) {
          // Reset inactivity timer when page becomes visible again
          resetInactivityTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, handleLogout, resetInactivityTimer]);

  // Periodically update remaining time display
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      setRemainingTime(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [user]);

  const value = {
    user,
    isLoggedIn: !!user,
    isSuperAdmin: user?.role === 'Super Admin',
    isAdmin: user?.role === 'Admin' || user?.role === 'Super Admin',
    isITUser: user?.role === 'IT User',
    isBranchUser: user?.role === 'Branch User',
    isUser: user?.role === 'IT User' || user?.role === 'Branch User',
    // Legacy compatibility (if needed)
    isLegacyAdmin: user?.role === 'admin', // For backward compatibility
    isLegacyUser: user?.role === 'user',
    tokenExpiryTime,
    remainingTime,
    showWarning,
    sessionToken,
    login: handleLogin,
    logout: handleLogout,
    resetTimer: resetInactivityTimer,
    getToken: () => {
      const token = localStorage.getItem('cbcToken');
      if (token && isTokenExpired(token)) {
        handleLogout(true, true, 'token_expired');
        return null;
      }
      return token;
    },
    getSessionToken: () => localStorage.getItem('cbcSessionToken')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};