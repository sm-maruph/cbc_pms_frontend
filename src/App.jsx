import React, { useState, useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import NotificationsPage from './pages/Notifications';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

// Auth Pages
import Login from "./pages/Login";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import CreateTicket from "./pages/user/CreateTicket";
import MyTickets from "./pages/user/MyTickets";
import Report from "./pages/user/Report";

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminReport from "./pages/user/Report";

// Shared Components
import Navbar from "./components/navbar/Navbar";
import ScrollToTop from "./components/ScrollToTop";

function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("cbcUser");
    return stored ? JSON.parse(stored) : null;
  });

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("cbcUser", JSON.stringify(userData));
    if (userData.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cbcUser");
    navigate("/");
  };

  useEffect(() => {
    const protectedRoutes = [
      "/dashboard",
      "/create-ticket",
      "/my-tickets",
      "/report",
      "/admin",
      "/admin/tickets",
      "/admin/users",
      "/admin/report",
    ];
    const currentPath = location.pathname;
    if (protectedRoutes.some(route => currentPath.startsWith(route)) && !isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, location.pathname, navigate]);

  return (
    <>
      {isLoggedIn && <Navbar user={user} onLogout={handleLogout} />}
      <Toaster position="top-right" />
      <ScrollToTop />
      <main className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Routes>
          {/* Auth Route */}
          <Route path="/" element={<Login onLogin={handleLogin} />} />

          {/* ============================== */}
          {/* Common Authenticated Routes (both user & admin) */}
          {/* ============================== */}
          {isLoggedIn && (
            <>
              <Route path="/notifications" element={<NotificationsPage user={user} />} />

              <Route path="/create-ticket" element={<CreateTicket user={user} />} />
            </>
          )}

          {/* ============================== */}
          {/* User‑only Routes */}
          {/* ============================== */}
          {isLoggedIn && isUser && (
            <>
              <Route path="/dashboard" element={<UserDashboard user={user} />} />
              <Route path="/my-tickets" element={<MyTickets user={user} />} />
              <Route path="/report" element={<Report user={user} />} />
            </>
          )}

          {/* ============================== */}
          {/* Admin‑only Routes */}
          {/* ============================== */}
          {isLoggedIn && isAdmin && (
            <>
              <Route path="/admin" element={<AdminDashboard user={user} />} />
              <Route path="/admin/tickets" element={<CreateTicket user={user} />} />
              <Route path="/admin/users" element={<AdminUsers user={user} />} />
              <Route path="/admin/report" element={<Report user={user} />} />
            </>
          )}

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
                  <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist or has been moved.
                  </p>
                  <button
                    onClick={() =>
                      navigate(isLoggedIn ? (isAdmin ? "/admin" : "/dashboard") : "/")
                    }
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}