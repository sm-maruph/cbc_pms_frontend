import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { HiMenu, HiX } from "react-icons/hi";

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour
const LOGIN_TIME_KEY = "adminLoginTime";

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [remainingTime, setRemainingTime] = useState(SESSION_DURATION);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem(LOGIN_TIME_KEY);
    window.location.href = "/admin/login";
  };

  const sidebarItems = [
    { label: "Banners", to: "/admin/banners" },
    { label: "Strengths", to: "/admin/services" },
    { label: "Clients", to: "/admin/clients" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Session timer
  useEffect(() => {
    let loginTime = localStorage.getItem(LOGIN_TIME_KEY);
    if (!loginTime) {
      loginTime = Date.now();
      localStorage.setItem(LOGIN_TIME_KEY, loginTime);
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - loginTime;
      const timeLeft = SESSION_DURATION - elapsed;
      if (timeLeft <= 0) handleLogout();
      else setRemainingTime(timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const dashboardCards = [
    {
      title: "Banners",
      description: "Manage your homepage and promotional banners.",
      color: "from-indigo-500 to-purple-600",
      path: "/admin/banners",
    },
    {
      title: "Services",
      description: "Manage your strengths and showroom services.",
      color: "from-green-500 to-teal-600",
      path: "/admin/services",
    },
    {
      title: "Clients",
      description: "View and manage client information.",
      color: "from-yellow-500 to-orange-500",
      path: "/admin/clients",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Mobile Hamburger */}
      {!isDesktop && (
        <div className="absolute top-4 left-4 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 focus:outline-none"
          >
            <HiMenu className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || isDesktop) && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed md:relative w-64 bg-gray-800 p-6 flex flex-col shadow-xl z-50 h-full"
          >
            <div className="flex justify-between items-center mb-8 md:mb-0">
              <h2 className="text-2xl font-bold text-center text-white">
                Admin Panel
              </h2>
              {!isDesktop && (
                <button
                  className="p-2 rounded-md bg-gray-700 hover:bg-gray-600"
                  onClick={() => setSidebarOpen(false)}
                >
                  <HiX className="w-6 h-6" />
                </button>
              )}
            </div>

            <nav className="flex flex-col gap-3 mt-4 md:mt-8 flex-1">
              {sidebarItems.map((item, i) => {
                const isActive = location.pathname === item.to;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-lg"
                  >
                    <Link
                      className={`block py-2 px-4 rounded-lg transition-colors duration-300
                        ${
                          isActive
                            ? "bg-indigo-600 text-white shadow"
                            : "text-gray-300 hover:bg-indigo-700 hover:text-white"
                        }`}
                      to={item.to}
                      onClick={() => !isDesktop && setSidebarOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="mt-auto text-center py-2 px-4 bg-gray-700 rounded-lg text-sm font-medium">
                Session ends in: {formatTime(remainingTime)}
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="mt-2 py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow hover:shadow-lg text-white transition-all duration-300"
              >
                Logout
              </motion.button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 p-8 bg-gray-900 overflow-auto md:ml-64"
      >
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {dashboardCards.map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer p-2 rounded-xl shadow-lg bg-gradient-to-r ${card.color}`}
              onClick={() => navigate(card.path)}
            >
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-gray-100">{card.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Optional Outlet for nested routes */}
        <Outlet />
      </motion.main>
    </div>
  );
}
