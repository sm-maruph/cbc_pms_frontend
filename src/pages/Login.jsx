import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Demo users for testing
  const demoUsers = {
    "admin@cbc.com": { password: "admin123", role: "admin", name: "Admin User" },
    "user@cbc.com": { password: "user123", role: "user", name: "John Doe" },
    "user2@cbc.com": { password: "user123", role: "user", name: "Jane Smith" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check demo credentials
      if (demoUsers[email] && demoUsers[email].password === password) {
        const demoUser = demoUsers[email];
        onLogin({
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: demoUser.name,
          role: demoUser.role,
          department: demoUser.role === "admin" ? "IT Management" : "Operations",
          branch: demoUser.role === "admin" ? "Head Office" : "Colombo Branch",
        });
        return;
      }

      // Real API call would go here
      setError("Invalid email or password");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">CBC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            IT Support Portal
          </h1>
          <p className="text-gray-600 text-sm">
            Commercial Bank of Ceylon
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-gray-50 text-gray-900 transition"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-600 focus:outline-none bg-gray-50 text-gray-900 transition"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* DEMO CREDENTIALS */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-semibold mb-3">
            📌 Demo Credentials:
          </p>
          <div className="space-y-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p>
              <span className="font-semibold">Admin:</span> admin@cbc.com / admin123
            </p>
            <p>
              <span className="font-semibold">User:</span> user@cbc.com / user123
            </p>
            <p>
              <span className="font-semibold">User 2:</span> user2@cbc.com / user123
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center text-xs text-gray-500">
          © 2026 Commercial Bank of Ceylon. All rights reserved.
        </div>
      </div>
    </div>
  );
}
