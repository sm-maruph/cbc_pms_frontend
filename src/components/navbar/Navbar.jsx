import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

import {
  FaTicketAlt,
  FaPlusCircle,
  FaUsers,
  FaChartBar,
  FaUserCircle,
  FaEdit,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaBook,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

import { MdDashboard } from "react-icons/md";

import logo from "../images/cbc_logo.png";
import NotificationBell from "../NotificationBell";

import { logout as logoutApi } from "../../services/api";

// JWT Helper Functions
const decodeToken = (token) => {
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

const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  return currentTime >= expirationTime - 5000;
};

const getTimeUntilExpiry = (token) => {
  if (!token) return 0;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return 0;
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const timeRemaining = expirationTime - currentTime;
  return timeRemaining > 0 ? timeRemaining : 0;
};

const getFormattedTimeUntilExpiry = (token) => {
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

// Inactivity timeout (10 minutes)
const INACTIVITY_TIMEOUT = 11 * 60 * 1000;

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Session timer states
  const [timeUntilExpiry, setTimeUntilExpiry] = useState('');
  const [expiryWarning, setExpiryWarning] = useState(false);
  const [expiryPercentage, setExpiryPercentage] = useState(100);

  // Inactivity timer states
  const [inactivityRemaining, setInactivityRemaining] = useState(INACTIVITY_TIMEOUT);
  const [inactivityWarning, setInactivityWarning] = useState(false);

  const menuRef = useRef(null);
  const burgerRef = useRef(null);
  const profileRef = useRef(null);
  const warningToastShownRef = useRef(false);
  const expiryTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const inactivityIntervalRef = useRef(null);
  const activityEventsRef = useRef(['mousemove', 'mousedown', 'keypress', 'scroll', 'click', 'touchstart']);

  // Check if user has admin access (includes Super Admin and Admin)
  const hasAdminAccess = user?.role === 'Admin' || user?.role === 'Super Admin';
  const isSuperAdmin = user?.role === 'Super Admin';

  // Dynamic navigation based on user role and permissions
  const navLinks = hasAdminAccess
    ? [
        { name: "Dashboard", path: "/dashboard", icon: <MdDashboard />, permission: "dashboard.view" },
        { name: "Create Ticket", path: "/admin/create-ticket", icon: <FaPlusCircle />, permission: "ticket.create" },
        { name: "Users", path: "/admin/users", icon: <FaUsers />, permission: "user.view.all", adminOnly: true },
        { name: "Reports", path: "/admin/report", icon: <FaChartBar />, permission: "report.view" },
        { name: "BB ICT Guideline", path: "/guidelines", icon: <FaBook />, permission: "dashboard.view" },
      ]
    : [
        { name: "Dashboard", path: "/dashboard", icon: <MdDashboard />, permission: "dashboard.view" },
        { name: "My Tickets", path: "/my-tickets", icon: <FaTicketAlt />, permission: "ticket.view.own" },
        { name: "Create Ticket", path: "/create-ticket", icon: <FaPlusCircle />, permission: "ticket.create" },
        { name: "Reports", path: "/report", icon: <FaChartBar />, permission: "report.view" },
        { name: "BB ICT Guideline", path: "/guidelines", icon: <FaBook />, permission: "dashboard.view" },
      ];

  // Clear all timers
  const clearTimers = () => {
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
    if (inactivityIntervalRef.current) {
      clearInterval(inactivityIntervalRef.current);
      inactivityIntervalRef.current = null;
    }
    warningToastShownRef.current = false;
  };

  const handleInactivityLogout = useCallback(async () => {
    clearTimers();

    toast.error('Session expired due to inactivity. Please login again.', {
      duration: 5000,
      position: 'top-center',
    });

    try {
      const token = localStorage.getItem("cbcToken");
      if (token) {
        try {
          await logoutApi(token);
        } catch (e) {
          // Ignore logout API errors during auto-logout
        }
      }
    } catch (error) {
      console.error("Inactivity logout error:", error);
    } finally {
      localStorage.removeItem("cbcToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");
      localStorage.removeItem("cbcUser");
      localStorage.removeItem("cbcSessionToken");

      if (onLogout) onLogout();
      navigate("/");
    }
  }, [navigate, onLogout]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    setInactivityRemaining(INACTIVITY_TIMEOUT);
    setInactivityWarning(false);

    inactivityTimerRef.current = setTimeout(() => {
      handleInactivityLogout();
    }, INACTIVITY_TIMEOUT);

    const warningTimeout = INACTIVITY_TIMEOUT - 10 * 1000;
    warningTimerRef.current = setTimeout(() => {
      setInactivityWarning(true);
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-amber-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <FaExclamationTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">Session expiring soon!</p>
                <p className="mt-1 text-sm text-amber-100">You will be logged out in 10 seconds due to inactivity.</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-amber-500">
            <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-amber-100 focus:outline-none">
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    }, warningTimeout);
  }, [handleInactivityLogout]);

  const handleUserActivity = useCallback(() => {
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  // Update remaining time display every second
  useEffect(() => {
    if (!user) return;

    resetInactivityTimer();

    const events = activityEventsRef.current;
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    inactivityIntervalRef.current = setInterval(() => {
      setInactivityRemaining(prev => {
        if (prev <= 1000) return 0;
        return prev - 1000;
      });
    }, 1000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (inactivityIntervalRef.current) {
        clearInterval(inactivityIntervalRef.current);
        inactivityIntervalRef.current = null;
      }
      clearTimers();
    };
  }, [user]);

  // Update expiry display
  const updateExpiryDisplay = useCallback(() => {
    const token = localStorage.getItem("cbcToken");
    if (!token || isTokenExpired(token)) {
      setTimeUntilExpiry('Expired');
      setExpiryWarning(true);
      setExpiryPercentage(0);
      return;
    }

    const formatted = getFormattedTimeUntilExpiry(token);
    setTimeUntilExpiry(formatted);

    const timeRemaining = getTimeUntilExpiry(token);
    const isWarning = timeRemaining <= 5 * 60 * 1000;
    setExpiryWarning(isWarning);

    if (isWarning && !warningToastShownRef.current && timeRemaining > 0) {
      warningToastShownRef.current = true;
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-amber-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <FaExclamationTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">Session expiring soon!</p>
                <p className="mt-1 text-sm text-amber-100">Your session will expire in {Math.floor(timeRemaining / 60000)} minutes.</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-amber-500">
            <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-amber-100 focus:outline-none">
              Dismiss
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    }

    const decoded = decodeToken(token);
    if (decoded && decoded.exp && decoded.iat) {
      const totalDuration = (decoded.exp - decoded.iat) * 1000;
      const percentage = (timeRemaining / totalDuration) * 100;
      setExpiryPercentage(Math.max(0, Math.min(100, percentage)));
    }
  }, []);

  const setupTokenMonitoring = useCallback(() => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
    }

    const token = localStorage.getItem("cbcToken");
    if (!token) return;

    if (isTokenExpired(token)) {
      handleInactivityLogout();
      return;
    }

    const timeRemaining = getTimeUntilExpiry(token);
    updateExpiryDisplay();

    expiryTimerRef.current = setTimeout(() => {
      handleInactivityLogout();
    }, timeRemaining);
  }, [updateExpiryDisplay, handleInactivityLogout]);

  const formatInactivityTime = (ms) => {
    if (ms <= 0) return 'Expiring...';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    return `${seconds}s`;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const token = localStorage.getItem("cbcToken");
        if (token && isTokenExpired(token)) {
          handleInactivityLogout();
        } else {
          updateExpiryDisplay();
          resetInactivityTimer();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleInactivityLogout, updateExpiryDisplay, resetInactivityTimer]);

  useEffect(() => {
    setupTokenMonitoring();

    const expiryInterval = setInterval(() => {
      const token = localStorage.getItem("cbcToken");
      if (token && !isTokenExpired(token)) {
        updateExpiryDisplay();
      }
    }, 1000);

    return () => {
      clearInterval(expiryInterval);
      clearTimers();
    };
  }, [setupTokenMonitoring, updateExpiryDisplay]);

  useEffect(() => {
    const handleAuthLogout = () => {
      handleInactivityLogout();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [handleInactivityLogout]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !burgerRef.current?.contains(e.target)) {
        setOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    clearTimers();

    try {
      const token = localStorage.getItem("cbcToken");
      if (token) await logoutApi(token);

      localStorage.removeItem("cbcToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");
      localStorage.removeItem("cbcUser");
      localStorage.removeItem("cbcSessionToken");

      setOpen(false);
      setProfileOpen(false);
      if (onLogout) onLogout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("cbcToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userId");
      localStorage.removeItem("cbcUser");
      localStorage.removeItem("cbcSessionToken");
      if (onLogout) onLogout();
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const getRoleDisplay = () => {
    if (user?.role === 'Super Admin') return 'Super Admin';
    if (user?.role === 'Admin') return 'Administrator';
    if (user?.role === 'IT User') return 'IT Member';
    if (user?.role === 'Branch User') return 'Branch User';
    return user?.role || 'User';
  };

  const getRoleBadgeClass = () => {
    if (user?.role === 'Super Admin') return 'bg-red-500/20 text-red-300';
    if (user?.role === 'Admin') return 'bg-violet-500/20 text-violet-300';
    if (user?.role === 'IT User') return 'bg-blue-500/20 text-blue-300';
    if (user?.role === 'Branch User') return 'bg-green-500/20 text-green-300';
    return 'bg-indigo-500/20 text-indigo-300';
  };

  const animationStyles = `
    @keyframes slideInLeft {
      from { transform: translateX(-100%); opacity: 0; }
      to   { transform: translateX(0);     opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes dropdown {
      from { opacity: 0; transform: translateY(-8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }
    @keyframes pulseWarning {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .animate-slideInLeft { animation: slideInLeft 0.3s ease forwards; }
    .animate-fadeIn      { animation: fadeIn 0.2s ease forwards; }
    .animate-dropdown    { animation: dropdown 0.18s ease forwards; }
    .animate-pulse-warning { animation: pulseWarning 1s ease-in-out infinite; }
  `;

  return (
    <>
      <style>{animationStyles}</style>

      <nav className="sticky top-0 z-50 w-full overflow-visible bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 shadow-lg shadow-black/30">
        <div className="h-14 px-3 sm:px-5 lg:px-6 flex items-center">

          {/* LEFT: burger + title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              ref={burgerRef}
              onClick={() => setOpen(!open)}
              className="lg:hidden w-9 h-9 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition flex items-center justify-center flex-shrink-0"
            >
              {open ? <FaTimes className="text-gray-300 text-sm" /> : <FaBars className="text-gray-300 text-sm" />}
            </button>

            <div className="hidden sm:flex flex-col leading-tight">
              <h1 className="text-gray-100 font-bold text-sm tracking-wide">IT Support Portal</h1>
              <p className="text-[10px] text-gray-500">Commercial Bank of Ceylon</p>
            </div>
          </div>

          {/* CENTER: desktop links */}
          <div className="hidden lg:flex items-center gap-1 mx-auto">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200
                    ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
                >
                  <span className={`text-sm transition-transform duration-200 group-hover:scale-110 ${active ? "text-white" : "text-gray-500 group-hover:text-indigo-400"}`}>
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: timers + notifications + profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {/* Inactivity Timer */}
            <div className="relative group">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200
                ${inactivityWarning ? 'bg-orange-500/10 border-orange-500/30 shadow-sm shadow-orange-500/10' : 'bg-gray-800 border-gray-700'}`}>
                <FaClock className={`text-[11px] ${inactivityWarning ? 'text-orange-400 animate-pulse-warning' : 'text-gray-500'}`} />
                <span className={`text-[11px] font-mono font-medium ${inactivityWarning ? 'text-orange-400' : 'text-gray-400'}`}>
                  {formatInactivityTime(inactivityRemaining)}
                </span>
              </div>
              <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 text-white text-xs rounded-xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <p className="font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
                  <FaClock size={10} className="text-orange-400" /> Inactivity Timeout
                </p>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300" style={{ width: `${(inactivityRemaining / INACTIVITY_TIMEOUT) * 100}%` }} />
                </div>
                <p className="text-gray-400 text-[10px]">{inactivityWarning ? '⚠️ Will logout soon. Move mouse to stay logged in.' : `Auto-logout after ${Math.floor(INACTIVITY_TIMEOUT / 60000)} minutes of inactivity`}</p>
              </div>
            </div>

            {/* JWT Expiry Timer */}
            <div className="relative group">
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all duration-200
                ${expiryWarning ? 'bg-amber-500/10 border-amber-500/30 shadow-sm shadow-amber-500/10' : 'bg-gray-800 border-gray-700'}`}>
                <FaExclamationTriangle className={`text-[11px] ${expiryWarning ? 'text-amber-400 animate-pulse-warning' : 'text-gray-500'}`} />
                <span className={`text-[11px] font-mono font-medium ${expiryWarning ? 'text-amber-400' : 'text-gray-400'}`}>
                  {timeUntilExpiry}
                </span>
              </div>
              <div className="absolute top-full right-0 mt-2 w-64 bg-gray-800 border border-gray-700 text-white text-xs rounded-xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <p className="font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
                  <FaExclamationTriangle size={10} className="text-amber-400" /> JWT Token Expiry
                </p>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${expiryWarning ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${expiryPercentage}%` }} />
                </div>
                <p className="text-gray-400 text-[10px]">{expiryWarning ? '⚠️ Token will expire soon. Please save your work.' : 'Token is valid'}</p>
              </div>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <NotificationBell user={user} />
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-1.5 sm:px-2.5 py-1 transition">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-bold">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-gray-900" />
                </div>
                <div className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-xs font-semibold text-gray-100">{user?.name?.split(" ")[0]}</span>
                  <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold">{getRoleDisplay()}</span>
                </div>
                <FaChevronDown className={`text-[9px] text-gray-500 transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-gray-800 border border-gray-700 shadow-2xl shadow-black/50 overflow-hidden animate-dropdown">
                  <div className="relative">
                    <div className={`h-16 bg-gradient-to-r ${expiryWarning || inactivityWarning ? 'from-amber-600 via-amber-500 to-orange-600' : 'from-indigo-600 via-indigo-500 to-violet-600'}`} />
                    <div className="absolute -bottom-7 left-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gray-800 p-1 shadow-lg">
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                          </div>
                        </div>
                        <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-gray-800" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-9 pb-3 px-4 border-b border-gray-700">
                    <h3 className="font-bold text-gray-100 text-sm">{user?.name || "User Name"}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email || "user@example.com"}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {user?.employee_id && <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-700 text-gray-300 text-[10px] font-semibold">ID: {user.employee_id}</span>}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${getRoleBadgeClass()}`}>{getRoleDisplay()}</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-700/50 space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">Inactivity timeout:</span>
                        <span className={`font-mono font-semibold ${inactivityWarning ? 'text-orange-400' : 'text-gray-400'}`}>{formatInactivityTime(inactivityRemaining)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500">Token expires in:</span>
                        <span className={`font-mono font-semibold ${expiryWarning ? 'text-amber-400' : 'text-indigo-400'}`}>{timeUntilExpiry}</span>
                      </div>
                    </div>
                  </div>

                  {(user?.department || user?.branch) && (
                    <div className="px-4 py-3 bg-gray-900/50 border-b border-gray-700 grid grid-cols-2 gap-2.5">
                      {user?.department && <div><p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Department</p><p className="text-xs font-medium text-gray-200 mt-0.5 truncate">{user.department}</p></div>}
                      {user?.branch && <div><p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">Branch</p><p className="text-xs font-medium text-gray-200 mt-0.5 truncate">{user.branch}</p></div>}
                    </div>
                  )}

                  <div className="p-2">
                    <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition group">
                      <div className="w-7 h-7 rounded-lg bg-red-500/15 group-hover:bg-red-500/25 transition flex items-center justify-center"><FaSignOutAlt className="text-red-400 text-xs" /></div>
                      <span className="flex-1 text-left font-semibold">{isLoggingOut ? "Logging out…" : "Logout"}</span>
                    </button>
                  </div>

                  <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-700">
                    <p className="text-[10px] text-center text-gray-500">Logged in as <span className="font-semibold text-gray-400">{getRoleDisplay()}</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center justify-end flex-shrink-0 ml-1 sm:ml-3 z-10">
              <img src={logo} alt="CBC Logo" className="h-28 sm:h-8 md:h-8 lg:h-11 xl:h-10 w-auto object-contain -my-12 drop-shadow-[0_8px_28px_rgba(99,102,241,0.45)] hover:scale-105 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-fadeIn lg:hidden" onClick={() => setOpen(false)} />
            <div ref={menuRef} className="fixed top-0 left-0 h-full w-[82%] max-w-[320px] bg-gray-900 z-50 shadow-2xl animate-slideInLeft lg:hidden border-r border-gray-800">
              <div className="p-5 h-full overflow-y-auto">
                <div className="flex items-center gap-3 pb-5 border-b border-gray-800">
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-gray-900" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-gray-100 font-semibold text-sm truncate">{user?.name}</h2>
                    <p className="text-gray-500 text-xs truncate">{user?.department}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="p-2.5 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><FaClock className={`text-[11px] ${inactivityWarning ? 'text-orange-400' : 'text-gray-500'}`} /><span className="text-[10px] text-gray-400">Inactivity timeout:</span></div>
                      <span className={`text-[11px] font-mono font-semibold ${inactivityWarning ? 'text-orange-400' : 'text-indigo-400'}`}>{formatInactivityTime(inactivityRemaining)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1 overflow-hidden">
                      <div className="h-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300" style={{ width: `${(inactivityRemaining / INACTIVITY_TIMEOUT) * 100}%` }} />
                    </div>
                  </div>
                  <div className="p-2.5 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2"><FaExclamationTriangle className={`text-[11px] ${expiryWarning ? 'text-amber-400' : 'text-gray-500'}`} /><span className="text-[10px] text-gray-400">Token expires in:</span></div>
                      <span className={`text-[11px] font-mono font-semibold ${expiryWarning ? 'text-amber-400' : 'text-indigo-400'}`}>{timeUntilExpiry}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div className={`h-1 rounded-full transition-all duration-300 ${expiryWarning ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${expiryPercentage}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  {navLinks.map((link) => {
                    const active = isActive(link.path);
                    return (
                      <Link key={link.name} to={link.path} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/50" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
                        <span className={`text-base ${active ? "text-white" : "text-gray-500"}`}>{link.icon}</span>
                        {link.name}
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-6 pt-5 border-t border-gray-800 space-y-1">
                  <button onClick={handleLogout} disabled={isLoggingOut} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition">
                    <FaSignOutAlt /> {isLoggingOut ? "Logging out…" : "Logout"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );
}