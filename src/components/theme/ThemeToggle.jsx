import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsSunFill, BsMoonStarsFill } from "react-icons/bs";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      if (localStorage.theme === "dark") return true;
      if (
        !("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      )
        return true;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [isDark]);

  return (
    <motion.button
      onClick={() => setIsDark((prev) => !prev)}
      aria-label="Toggle Dark Mode"
      className="relative w-14 h-14 rounded-full flex items-center justify-center 
                 shadow-lg border border-gray-300 dark:border-gray-700 
                 bg-gradient-to-br from-yellow-200 to-yellow-500 
                 dark:from-indigo-900 dark:to-gray-800
                 transition-all duration-300 hover:scale-110 focus:outline-none"
      whileTap={{ scale: 0.9 }}
    >
      {/* Animate icon change */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-yellow-300 text-2xl drop-shadow-lg"
          >
            <BsMoonStarsFill />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-yellow-600 text-2xl drop-shadow-lg"
          >
            <BsSunFill />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl opacity-40"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.1, 0.4],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background: isDark
            ? "rgba(147,197,253,0.5)" // blue glow for dark mode
            : "rgba(253,224,71,0.6)", // yellow glow for light mode
        }}
      />
    </motion.button>
  );
}
