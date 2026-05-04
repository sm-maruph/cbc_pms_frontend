import React, { useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // =========================
      // DEMO LOGIN (DEV ONLY)
      // =========================
      if (username === "admin" && password === "admin123") {
        const fakeToken = "demo-jwt-token-xyz-123";
        onLogin(fakeToken);
        setLoading(false);
        return;
      }

      // =========================
      // REAL API LOGIN
      // =========================
      const res = await axios.post(`${API_BASE}/admin/login`, {
        username,
        password,
      });

      if (res.data?.token) {
        onLogin(res.data.token);
      } else {
        setError("Login failed: No token received");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            CBC IT Operations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            User Problem Management System
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 dark:text-gray-200">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 rounded-lg border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        {/* DEMO INFO */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          Demo: <span className="font-semibold">admin / admin123</span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;