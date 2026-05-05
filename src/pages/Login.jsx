import React, { useState } from "react";
import logo from "../../src/components/images/cbc_logo.png";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      setError("Invalid email or password");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden
      bg-gradient-to-br from-green-500 via-blue-600 to-blue-900">

      {/* 🔥 BACKGROUND GLOW EFFECTS */}
      <div className="absolute w-72 h-72 bg-green-400 opacity-30 rounded-full blur-3xl top-10 left-10"></div>
      <div className="absolute w-72 h-72 bg-blue-400 opacity-30 rounded-full blur-3xl bottom-10 right-10"></div>

      {/* 💎 GLASS CARD */}
      <div className="w-full max-w-md p-8 rounded-2xl 
        bg-white/10 backdrop-blur-xl border border-white/20 
        shadow-[0_10px_40px_rgba(0,0,0,0.3)]">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-1">
            <img src={logo} alt="CBC Logo" className="h-32 object-contain drop-shadow-lg" />
          </div>

          <h1 className="text-3xl font-bold text-white tracking-wide">
            IT Support Portal
          </h1>
          <p className="text-sm text-green-100 mt-1">
            Commercial Bank of Ceylon
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMAIL */}
          <div>
            <label className="text-sm text-white/80 mb-1 block">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg 
                bg-white/20 text-white placeholder-white/60
                border border-white/30 
                focus:outline-none focus:ring-2 focus:ring-green-400
                transition"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-white/80 mb-1 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg 
                bg-white/20 text-white placeholder-white/60
                border border-white/30 
                focus:outline-none focus:ring-2 focus:ring-green-400
                transition"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="text-sm text-red-200 bg-red-500/20 border border-red-400/30 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white
              bg-gradient-to-r from-green-500 to-blue-600
              hover:from-green-600 hover:to-blue-700
              transition transform hover:scale-105
              shadow-lg disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* DEMO */}
        <div className="mt-8 border-t border-white/20 pt-5 text-xs text-white/80">
          <p className="font-semibold mb-2">Demo:</p>
          <p>Admin: admin@cbc.com / admin123</p>
          <p>User: user@cbc.com / user123</p>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center text-xs text-white/60">
          © 2026 Commercial Bank of Ceylon
        </div>
      </div>
    </div>
  );
}