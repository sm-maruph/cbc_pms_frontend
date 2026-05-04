import { useState, useEffect, useRef } from "react";

const navLinks = [
  "Home",
  "About",
  "Contact Us",
  "Services",
  "Our Clients",
  "Compliance & Ethics",
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

  const burgerRef = useRef(null);
  const firstLinkRef = useRef(null);
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
    if (open) {
      document.body.style.overflow = "hidden";
      // focus first link in menu for keyboard users
      requestAnimationFrame(() => {
        firstLinkRef.current?.focus();
      });
    } else {
      document.body.style.overflow = "";
      // return focus to hamburger button when menu closes
      burgerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape when mobile menu open
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Close menu when clicking outside (optional extra safety)
  useEffect(() => {
    function onClick(e) {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !burgerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleNavClick = (link) => {
    // perform navigation logic here (e.g., router.push or anchor)
    // then close mobile menu
    setOpen(false);
  };

  return (
    <nav className="relative flex items-center justify-between px-4 md:px-36 py-3 bg-primary dark:bg-accent shadow sticky top-0 z-50">
      {/* Left: Logo */}
      <div className="flex-1 flex items-center">
        <div
          className="text-2xl font-bold text-heading dark:text-heading cursor-pointer"
          aria-label="Grupo Sourcing Ltd"
        >
          Grupo Sourcing Ltd
        </div>
      </div>

      {/* Center: Desktop Nav */}
      {/* Center: Desktop Nav */}
      <div className="flex-1 hidden md:flex justify-center">
        <ul
          className="flex items-center space-x-6 md:space-x-8 text-heading dark:text-heading flex-nowrap"
          role="menubar"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <li
              key={link}
              className="
    group relative cursor-pointer px-3 py-2 rounded-md transition-colors duration-150
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500
    whitespace-nowrap hover:text-text-hover
    after:content-[''] after:absolute after:left-3 after:right-3 after:bottom-1
    after:block after:h-[2px] after:bg-current after:origin-left after:scale-x-0
    after:transition-transform after:duration-200 after:ease-out
    hover:after:scale-x-100
  "
              role="menuitem"
              tabIndex={0}
              onClick={() => handleNavClick(link)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleNavClick(link);
              }}
            >
              {link}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Theme Toggle (Desktop) and Hamburger (Mobile) */}
      <div className="flex-1 flex justify-end items-center">
        {/* Theme Toggle for desktop */}
        <div className="hidden md:block mr-3">
          <button
            aria-label="Toggle Dark Mode"
            onClick={() => setDarkMode((m) => !m)}
            className="relative w-14 h-8 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-300 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-yellow-400 dark:bg-gray-900 shadow-md transform transition-transform duration-300 ${
                darkMode ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>

        {/* Hamburger Icon for mobile */}
        <button
          ref={burgerRef}
          className="flex flex-col items-center justify-center md:hidden ml-2 w-10 h-10 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((s) => !s)}
        >
          <span
            className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-300 rounded transition-transform duration-300 ${
              open ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 my-1 bg-gray-700 dark:bg-gray-300 rounded transition-opacity duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-gray-700 dark:bg-gray-300 rounded transition-transform duration-300 ${
              open ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Nav - slide out menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`fixed top-0 right-0 w-11/12 sm:w-2/3 max-w-xs h-full bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="menu"
        aria-hidden={!open}
      >
        <ul className="flex flex-col pt-20 px-6 gap-4 text-gray-700 dark:text-gray-300 text-lg">
          {navLinks.map((link, i) => (
            <li
              key={link}
              onClick={() => handleNavClick(link)}
              className="hover:text-red-500 cursor-pointer px-4 py-3 rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              role="menuitem"
              tabIndex={0}
              ref={i === 0 ? firstLinkRef : null}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleNavClick(link);
              }}
            >
              {link}
            </li>
          ))}

          {/* Theme Toggle in mobile menu */}
          <li className="mt-2 px-4 py-2">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-800 dark:text-gray-200">
                Theme
              </span>
              <button
                aria-label="Toggle Dark Mode"
                onClick={() => setDarkMode((m) => !m)}
                className="relative w-14 h-8 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-300 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-yellow-400 dark:bg-gray-900 shadow-md transform transition-transform duration-300 ${
                    darkMode ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          </li>
        </ul>
      </div>

      {/* Overlay for mobile nav */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
