import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

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
      if (open && menuRef.current && !menuRef.current.contains(e.target) && !burgerRef.current?.contains(e.target)) {
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
        { name: "Manage Tickets", path: "/admin/tickets" },
        { name: "Manage Users", path: "/admin/users" },
      ]
    : [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Create Ticket", path: "/create-ticket" },
      ];

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg sticky top-0 z-50 w-full">
      {/* LEFT: BRAND */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold shadow">
          CBC
        </div>
        <div>
          <Link to={isAdmin ? "/admin" : "/dashboard"} className="text-lg font-bold text-white hover:text-blue-100">
            IT Support Portal
          </Link>
          <p className="text-xs text-blue-100">Commercial Bank of Ceylon</p>
        </div>
      </div>

      {/* CENTER: DESKTOP NAV */}
      <ul className="hidden md:flex items-center gap-8 text-white">
        {navLinks.map((link) => (
          <li key={link.name}>
            <Link 
              to={link.path}
              className="font-medium hover:text-blue-100 transition"
            >
              {link.name}
            </Link>
          </li>
        ))}
      </ul>

      {/* RIGHT: USER INFO & LOGOUT */}
      <div className="flex items-center gap-4">
        {/* USER INFO (Desktop) */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-blue-500 rounded-lg">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="font-bold text-blue-600 text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">{user?.name}</span>
            <span className="text-xs text-blue-100">{user?.role.toUpperCase()}</span>
          </div>
        </div>

        {/* LOGOUT BUTTON (Desktop) */}
        <button
          onClick={handleLogout}
          className="hidden md:inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Logout
        </button>

        {/* MOBILE BUTTON */}
        <button
          ref={burgerRef}
          className="md:hidden flex flex-col gap-1"
          onClick={() => setOpen(!open)}
        >
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-6 h-0.5 bg-white" />
          <span className="w-6 h-0.5 bg-white" />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-3/4 bg-gradient-to-b from-blue-600 to-blue-800 shadow-lg transform transition-transform duration-300 md:hidden z-40 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-4">
          {/* USER INFO (Mobile) */}
          <div className="mb-4 pb-4 border-b border-blue-500">
            <p className="text-sm font-semibold text-white mb-2">
              {user?.name}
            </p>
            <p className="text-xs text-blue-100 mb-3">
              {user?.role.toUpperCase()} - {user?.department}
            </p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          {/* NAV LINKS (Mobile) */}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setOpen(false)}
              className="block py-2 font-medium text-white hover:text-blue-100 transition"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-30"
          onClick={() => setOpen(false)}
        />
      )}
    </nav>
  );
}