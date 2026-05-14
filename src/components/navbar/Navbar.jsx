import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/cbc_logo.png";
import NotificationBell from '../NotificationBell';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const burgerRef = useRef(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    function onClick(e) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !burgerRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    onLogout();
    navigate("/");
  };

  const navLinks = isAdmin
    ? [
      { name: "Dashboard", path: "/admin" },
      { name: "Create New Tickets", path: "/create-ticket" },
      { name: "Manage Users", path: "/admin/users" },
      { name: "Report", path: "/admin/report" },
    ]
    : [
      { name: "Dashboard", path: "/dashboard" },
      { name: "My Tickets", path: "/my-tickets" },
      { name: "Create Ticket", path: "/create-ticket" },
      { name: "Report", path: "/report" },
    ];

  const animationStyles = `
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    @keyframes slideOut {
      from { transform: translateX(0); }
      to { transform: translateX(100%); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .animate-slide-in { animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .animate-slide-out { animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .animate-fade-in { animation: fadeIn 0.2s ease-in-out forwards; }
    .animate-scale-in { animation: scaleIn 0.2s ease-out forwards; }
  `;

  return (
    <>
      <style>{animationStyles}</style>
      <nav className="flex items-center justify-between px-4 md:px-6 py-2 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-lg sticky top-0 z-50 w-full">
        {/* LEFT: BRAND */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="CBC Logo"
            className="h-16 w-auto md:h-20 bg-transparent rounded-lg transition-transform duration-300 hover:scale-105"
          />
          <div className="hidden sm:block">
            <Link
              to={isAdmin ? "/admin" : "/dashboard"}
              className="text-lg md:text-xl font-bold text-white hover:text-blue-200 transition-colors duration-200"
            >
              IT Support Portal
            </Link>
            <p className="text-[11px] text-blue-200/70">Commercial Bank of Ceylon</p>
          </div>
        </div>

        {/* CENTER: DESKTOP NAV */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className="block px-3 py-1.5 text-sm font-medium text-gray-200 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2">
          {/* USER INFO */}
          <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="font-bold text-white text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white leading-tight">
                {user?.name?.split(' ')[0]}
              </span>
              <span className="text-[10px] text-blue-200 leading-tight">
                {user?.role.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell user={user} />
            {/* Existing user menu/dropdown */}
          </div>
          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-1.5 bg-red-500/90 hover:bg-red-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>

          {/* MOBILE MENU BUTTON */}
          <button
            ref={burgerRef}
            className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
            onClick={() => setOpen(!open)}
          >
            <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-white rounded-full transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* MOBILE MENU SLIDEOUT */}
        <div
          ref={menuRef}
          className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 shadow-2xl md:hidden z-40 ${open ? "animate-slide-in" : "animate-slide-out"
            }`}
        >
          <div className="p-5 pt-20">
            <div className="mb-5 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="font-bold text-white text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-[11px] text-blue-200">
                    {user?.role.toUpperCase()} • {user?.department}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500/90 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-gray-200 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* OVERLAY */}
        {open && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden z-30 animate-fade-in"
            onClick={() => setOpen(false)}
          />
        )}
      </nav>
    </>
  );
}