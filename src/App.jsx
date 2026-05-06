import React, { useState, useEffect } from "react";
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

// Admin Pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminTickets from "./pages/Admin/AdminTickets";
import AdminUsers from "./pages/Admin/AdminUsers";

// Shared Components
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("cbcUser");
    return stored ? JSON.parse(stored) : null;
  });

  // =========================
  // CHECK IF LOGGED IN
  // =========================
  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  // =========================
  // LOGIN HANDLER
  // =========================
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("cbcUser", JSON.stringify(userData));
    
    if (userData.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  // =========================
  // LOGOUT HANDLER
  // =========================
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cbcUser");
    navigate("/");
  };

  // =========================
  // REDIRECT IF NOT LOGGED IN
  // =========================
  useEffect(() => {
    const protectedRoutes = ["/dashboard", "/create-ticket", "/admin", "/admin/tickets", "/admin/users"];
    const currentPath = location.pathname;
    
    if (protectedRoutes.some(route => currentPath.startsWith(route)) && !isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, location.pathname, navigate]);

  return (
    <>
      {/* NAVBAR */}
      {isLoggedIn && <Navbar user={user} onLogout={handleLogout} />}

      <ScrollToTop />

      <main className="w-full">
        <Routes>
          {/* ===================== */}
          {/* AUTH ROUTES */}
          {/* ===================== */}
          <Route path="/" element={<Login onLogin={handleLogin} />} />

          {/* ===================== */}
          {/* USER ROUTES */}
          {/* ===================== */}
          {isLoggedIn && isUser && (
            <>
              <Route path="/dashboard" element={<UserDashboard user={user} />} />
              <Route path="/create-ticket" element={<CreateTicket user={user} />} />
            </>
          )}

          {/* ===================== */}
          {/* ADMIN ROUTES */}
          {/* ===================== */}
          {isLoggedIn && isAdmin && (
            <>
              <Route path="/admin" element={<AdminDashboard user={user} />} />
              <Route path="/admin/tickets" element={<AdminTickets user={user} />} />
              <Route path="/admin/users" element={<AdminUsers user={user} />} />
            </>
          )}

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="p-10 text-center text-red-500 text-xl">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </main>

      {/* FOOTER */}
      {/* {isLoggedIn && <Footer />} */}
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
