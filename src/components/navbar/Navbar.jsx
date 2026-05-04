import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const navLinks = [
  { name: "Home", path: "/home" },
  { name: "Incidents", path: "/incidents" },
  { name: "Dashboard", path: "/admin" },
  {
    name: "IT Services",
    dropdown: [
      { label: "Incident Management", path: "/services/incidents" },
      { label: "Ticketing System", path: "/services/tickets" },
      { label: "Asset Tracking", path: "/services/assets" },
      { label: "User Support", path: "/services/support" },
    ],
  },
  { name: "Reports", path: "/reports" },
  { name: "Support", path: "/support" },
];

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const burgerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [darkMode]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    function onClick(e) {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-3 bg-primary dark:bg-accent shadow sticky top-0 z-50">
      {/* LEFT: BRAND */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
          IT
        </div>
        <Link to="/" className="text-lg font-bold text-heading dark:text-heading">
          Incident Manager
        </Link>
      </div>

      {/* CENTER: DESKTOP NAV */}
      <ul className="hidden md:flex items-center gap-6 text-heading dark:text-heading">
        {navLinks.map((link) => (
          <li key={link.name} className="relative group cursor-pointer">
            {link.dropdown ? (
              <div className="flex items-center gap-1">
                {link.name}
                <span>▼</span>
              </div>
            ) : (
              <Link to={link.path}>{link.name}</Link>
            )}

            {link.dropdown && (
              <ul className="absolute left-0 mt-2 w-52 bg-white dark:bg-gray-800 shadow rounded-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition">
                {link.dropdown.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* RIGHT CONTROLS */}
      <div className="flex items-center gap-3">
        {/* DARK MODE (UNCHANGED LOGIC) */}
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="relative w-14 h-7 rounded-full bg-gradient-to-r from-yellow-300 to-gray-800 dark:from-gray-700 dark:to-gray-900 flex items-center px-1"
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transform transition-all duration-300 flex items-center justify-center ${
              darkMode ? "translate-x-7" : ""
            }`}
          >
            {darkMode ? "🌙" : "☀️"}
          </div>
        </button>

        {/* MOBILE BUTTON */}
        <button
          ref={burgerRef}
          className="md:hidden flex flex-col gap-1"
          onClick={() => setOpen(!open)}
        >
          <span className="w-6 h-0.5 bg-gray-800 dark:bg-gray-200" />
          <span className="w-6 h-0.5 bg-gray-800 dark:bg-gray-200" />
          <span className="w-6 h-0.5 bg-gray-800 dark:bg-gray-200" />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-3/4 bg-primary dark:bg-primary shadow-lg transform transition-transform duration-300 md:hidden z-50 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-4">
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link
                to={link.path || "#"}
                onClick={() => setOpen(false)}
                className="block py-2 font-medium"
              >
                {link.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </nav>
  );
}