import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Shared Components
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import ScrollToTop from "./components/ScrollToTop";

// Public Pages
import Landing from "./pages/LandingPage";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Woven from "./pages/services/Woven";
import Knit from "./pages/services/Knit";
import Sample from "./pages/services/Sample";
import Merchandising from "./pages/services/Merchandising";
import Compliance from "./pages/Compliance";

// Admin Pages
import Login from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Banners from "./pages/Admin/Banners";
import Services from "./pages/Admin/Services";
import Clients from "./pages/Admin/Clients";

function AppWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage = location.pathname.startsWith("/admin");

  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));

  // =========================
  // TOKEN VALIDATION
  // =========================
  const isTokenValid = (token) => {
    if (!token) return false;

    // allow demo token
    if (token.startsWith("demo-")) return true;

    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  // =========================
  // LOGIN SUCCESS
  // =========================
  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("adminToken", newToken);

    // ✅ IMPORTANT CHANGE: redirect to HOME after login
    navigate("/home");
  };

  // =========================
  // AUTO LOGOUT IF EXPIRED
  // =========================
  useEffect(() => {
    if (token && !isTokenValid(token)) {
      handleLogout();
    }
  }, [token]);

  return (
    <>
      {/* NAVBAR (PUBLIC ONLY) */}
      {!isAdminPage && <Navbar />}

      <ScrollToTop />

      <main>
        <Routes>
          {/* ===================== */}
          {/* ADMIN ROUTES */}
          {/* ===================== */}
          <Route
            path="/admin"
            element={
              isTokenValid(token) ? (
                <AdminDashboard token={token} onLogout={handleLogout} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          >
            <Route path="banners" element={<Banners />} />
            <Route path="services" element={<Services />} />
            <Route path="clients" element={<Clients />} />
          </Route>

          <Route
            path="/admin/login"
            element={<Login onLogin={handleLogin} />}
          />

          {/* ===================== */}
          {/* PUBLIC ROUTES */}
          {/* ===================== */}
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services/woven" element={<Woven />} />
          <Route path="/services/knit" element={<Knit />} />
          <Route path="/services/sample" element={<Sample />} />
          <Route path="/services/merchandising" element={<Merchandising />} />
          <Route path="/compliance" element={<Compliance />} />

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

      {/* FOOTER ONLY PUBLIC */}
      {!isAdminPage && (
        <>
          <FloatingWhatsApp />
          <Footer />
        </>
      )}
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