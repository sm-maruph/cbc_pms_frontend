import React, { useState } from "react";
import {
  Shield, ShieldCheck, User, Lock, Eye, EyeOff, Loader2, Fingerprint, Activity,
  KeyRound, ScanLine, Network, Server, Binary, Bug, Radar, Cpu, Wifi, LockKeyhole,
} from "lucide-react";
import logo from "../../src/components/images/cbc_logo.png";

export default function Login({ onLogin }) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_URL || "http://192.168.23.17:5000/api" || "http://localhost:5000/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      const { token, user } = data;

      // Store in localStorage
      localStorage.setItem("cbcToken", token);
      localStorage.setItem("cbcUser", JSON.stringify(user));

      // ✅ Pass BOTH user AND token to onLogin
      onLogin(user, token);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-gray-700/60 text-gray-100 placeholder-gray-500 " +
    "border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
  const labelCls =
    "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";

  // Scattered security-tool icons for the background
  const bgTools = [
    { Icon: LockKeyhole,  cls: "top-[8%]  left-[9%]  w-16 h-16 text-indigo-300/[0.07]",  anim: "lp-bd1" },
    { Icon: KeyRound,     cls: "top-[18%] left-[26%] w-10 h-10 text-cyan-300/[0.07]",    anim: "lp-bd2" },
    { Icon: Fingerprint,  cls: "top-[12%] right-[10%] w-20 h-20 text-violet-300/[0.06]", anim: "lp-bd3" },
    { Icon: ScanLine,     cls: "top-[30%] right-[24%] w-12 h-12 text-indigo-300/[0.07]", anim: "lp-bd1" },
    { Icon: Network,      cls: "top-[46%] left-[6%]  w-14 h-14 text-emerald-300/[0.06]", anim: "lp-bd2" },
    { Icon: Server,       cls: "bottom-[20%] left-[16%] w-12 h-12 text-cyan-300/[0.07]", anim: "lp-bd3" },
    { Icon: Binary,       cls: "bottom-[10%] left-[34%] w-12 h-12 text-indigo-300/[0.06]", anim: "lp-bd1" },
    { Icon: Bug,          cls: "bottom-[14%] right-[12%] w-14 h-14 text-fuchsia-300/[0.06]", anim: "lp-bd2" },
    { Icon: Radar,        cls: "bottom-[30%] right-[7%] w-16 h-16 text-violet-300/[0.07]", anim: "lp-spin-slow" },
    { Icon: Cpu,          cls: "top-[58%] right-[30%] w-10 h-10 text-emerald-300/[0.06]", anim: "lp-bd3" },
    { Icon: Wifi,         cls: "top-[40%] left-[30%] w-10 h-10 text-cyan-300/[0.06]",     anim: "lp-bd1" },
    { Icon: Shield,       cls: "bottom-[40%] left-[42%] w-12 h-12 text-indigo-300/[0.05]", anim: "lp-bd2" },
  ];

  return (
    <div className="login-page min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden font-sans
      bg-gradient-to-br from-[#070611] via-slate-950 to-[#10081f]">

      {/* ════════ ABSTRACT SECURITY + TRUST BACKDROP ════════ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* hex / circuit grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="lp-hex" width="56" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.4)">
              <path d="M28 0 L56 16 V40 L28 56 L0 40 V16 Z" fill="none" stroke="#a5b4fc" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#lp-hex)" />
        </svg>

        {/* colorful glows */}
        <div className="lp-glow lp-g1 absolute w-96 h-96 rounded-full bg-indigo-600/30 blur-[110px] top-[-6rem] left-[-6rem]" />
        <div className="lp-glow lp-g2 absolute w-96 h-96 rounded-full bg-violet-600/30 blur-[110px] bottom-[-7rem] right-[-6rem]" />
        <div className="lp-glow lp-g3 absolute w-80 h-80 rounded-full bg-cyan-500/20 blur-[120px] top-[30%] right-[-4rem]" />
        <div className="lp-glow lp-g4 absolute w-72 h-72 rounded-full bg-fuchsia-500/20 blur-[120px] bottom-[10%] left-[-3rem]" />
        <div className="lp-glow lp-g5 absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-[120px] top-[-3rem] right-[28%]" />

        {/* scattered security-tool SVG icons */}
        {bgTools.map(({ Icon, cls, anim }, i) => (
          <Icon key={i} strokeWidth={1} className={`absolute ${cls} ${anim}`} />
        ))}

        {/* depth vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(3,2,12,0.75))]" />
      </div>

      {/* ════════ CARD STACK ════════ */}
      <div className="relative w-full max-w-md">

        {/* rotating colorful secure-aura halo */}
        <div className="lp-halo absolute -inset-3 rounded-[30px] blur-2xl opacity-40
          bg-[conic-gradient(from_0deg,#6366f1,#8b5cf6,#22d3ee,#10b981,#6366f1)]" />

        {/* gradient hairline border wrapper */}
        <div className="lp-card relative rounded-2xl p-px bg-gradient-to-br from-indigo-400/50 via-violet-400/25 to-cyan-300/40 shadow-2xl shadow-black/60">

          {/* inner panel */}
          <div className="relative rounded-[15px] bg-gray-800/90 backdrop-blur-2xl p-8 overflow-hidden">

            {/* shine sweep */}
            <div className="lp-shine pointer-events-none absolute -inset-y-16 -left-1/3 w-1/3 skew-x-12
              bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />

            {/* faint fingerprint motif */}
            <Fingerprint className="pointer-events-none absolute -right-6 -bottom-6 w-44 h-44 text-indigo-400/[0.06]" strokeWidth={0.6} />

            {/* ── HEADER ── */}
            <div className="relative text-center mb-7">

              {/* BIG logo with counter-rotating RECTANGULAR frames */}
              <div className="relative mx-auto mb-4 h-48 w-48 flex items-center justify-center">

                {/* soft glow behind logo */}
                <div className="absolute h-28 w-28 rounded-2xl bg-indigo-500/20 blur-2xl" />

                {/* rotating outer rectangle frame (CW) */}
                <svg className="lp-sq absolute inset-0 w-full h-full text-indigo-400/55" viewBox="0 0 100 100" fill="none">
                  <rect x="17" y="17" width="66" height="66" rx="14" stroke="currentColor" strokeWidth="1.2" strokeDasharray="10 8" />
                </svg>

                {/* rotating inner rectangle frame (CCW) */}
                <svg className="lp-sq-rev absolute inset-0 w-full h-full text-violet-400/45" viewBox="0 0 100 100" fill="none">
                  <rect x="25" y="25" width="50" height="50" rx="10" stroke="currentColor" strokeWidth="1" strokeDasharray="4 9" />
                </svg>

                {/* corner scanner brackets (static, security-viewfinder feel) */}
                <svg className="absolute inset-0 w-full h-full text-cyan-300/40" viewBox="0 0 100 100" fill="none" strokeWidth="1.4" strokeLinecap="round">
                  <path d="M8 20 V8 H20 M80 8 H92 V20 M92 80 V92 H80 M20 92 H8 V80" stroke="currentColor" />
                </svg>

                {/* the logo (bigger), on top */}
                <div className="lp-badge relative h-46 w-46 flex items-center justify-center">
                  {logo
                    ? <img src={logo} alt="CBC Logo" className="relative h-44 w-44 object-contain drop-shadow-[0_4px_14px_rgba(99,102,241,0.45)]" />
                    : <Shield size={56} className="relative text-indigo-300" />}
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white tracking-tight">BD IT Helpdesk</h1>
              <p className="text-sm text-gray-400 mt-1">Commercial Bank of Ceylon · CBC PMS System</p>

              {/* secure-connection pill */}
              <div className="lp-field inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full
                bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-300"
                style={{ animationDelay: "0.04s" }}>
                <ShieldCheck size={12} />
                Encrypted &amp; secure connection
                <span className="lp-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} className="relative space-y-5">

              {/* EMPLOYEE ID */}
              <div className="lp-field group" style={{ animationDelay: "0.08s" }}>
                <label className={labelCls}>Employee ID</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. BD06654"
                    required
                  />
                  <span className="pointer-events-none absolute bottom-0 left-3 right-3 h-px origin-left scale-x-0
                    bg-gradient-to-r from-indigo-500 to-violet-500 transition-transform duration-300 group-focus-within:scale-x-100" />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="lp-field group" style={{ animationDelay: "0.14s" }}>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-indigo-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls + " pr-10"}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <span className="pointer-events-none absolute bottom-0 left-3 right-3 h-px origin-left scale-x-0
                    bg-gradient-to-r from-indigo-500 to-violet-500 transition-transform duration-300 group-focus-within:scale-x-100" />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="lp-shake flex items-start gap-2 text-sm text-red-300 bg-red-500/15 border border-red-500/30 p-3 rounded-xl">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="lp-field lp-btn group relative w-full py-2.5 rounded-xl font-semibold text-sm text-white
                  bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                  shadow-lg shadow-indigo-950/40 overflow-hidden
                  transition-all duration-150 hover:-translate-y-0.5
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0
                  flex items-center justify-center gap-2"
                style={{ animationDelay: "0.20s" }}
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 skew-x-12 bg-white/20
                  transition-transform duration-500 group-hover:translate-x-[450%]" />
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                ) : (
                  <><Lock size={15} /> Sign In</>
                )}
              </button>

              {/* AUDIT-TRAIL NOTICE */}
              <div className="lp-field flex items-start gap-2.5 text-xs text-gray-400 bg-gray-700/40 border border-gray-600/60 p-3 rounded-xl"
                style={{ animationDelay: "0.26s" }}>
                <div className="relative flex-shrink-0 h-7 w-7 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Shield size={14} className="text-indigo-400" />
                  <span className="lp-dot absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-gray-800" />
                </div>
                <p className="leading-relaxed">
                  <span className="font-semibold text-gray-300">Secure session.</span>{" "}
                  All your activity is monitored and stored for audit trail.
                </p>
              </div>

              {/* SECURITY CHIPS */}
              <div className="lp-field flex items-center justify-center gap-2" style={{ animationDelay: "0.32s" }}>
                {[
                  { Icon: ShieldCheck, label: "Active Directory" },
                  { Icon: Lock, label: "Encrypted" },
                  { Icon: Activity, label: "Audit Logged" },
                ].map(({ Icon, label }) => (
                  <span key={label}
                    className="flex items-center gap-1 text-[10px] font-medium text-gray-500
                      bg-gray-700/40 border border-gray-600/50 rounded-lg px-2 py-1">
                    <Icon size={11} className="text-gray-400" /> {label}
                  </span>
                ))}
              </div>
            </form>

            {/* FOOTER */}
            <div className="relative mt-6 text-center text-xs text-gray-500">
              © 2026 Commercial Bank of Ceylon
            </div>
          </div>
        </div>
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes lp-card-in  { from { transform: translateY(14px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes lp-fade-up  { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes lp-shake    { 10%,90%{transform:translateX(-1px)} 20%,80%{transform:translateX(2px)} 30%,50%,70%{transform:translateX(-4px)} 40%,60%{transform:translateX(4px)} }
        @keyframes lp-float-1  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(26px,20px)} }
        @keyframes lp-float-2  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-24px,-22px)} }
        @keyframes lp-float-3  { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,18px)} }
        @keyframes lp-glow     { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
        @keyframes lp-dot      { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(.7)} }
        @keyframes lp-spin     { to { transform: rotate(360deg); } }
        @keyframes lp-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes lp-halo     { to { transform: rotate(360deg); } }
        @keyframes lp-shine    { 0% { transform: translateX(0) skewX(12deg); } 60%,100% { transform: translateX(900%) skewX(12deg); } }
        @keyframes lp-bd1      { 0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(14px,-18px) rotate(8deg)} }
        @keyframes lp-bd2      { 0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(-16px,14px) rotate(-10deg)} }
        @keyframes lp-bd3      { 0%,100%{transform:translate(0,0) rotate(0deg)} 50%{transform:translate(12px,16px) rotate(6deg)} }

        .lp-card     { animation: lp-card-in 0.5s cubic-bezier(.21,.84,.42,1) both; }
        .lp-halo     { animation: lp-halo 14s linear infinite; }
        .lp-shine    { animation: lp-shine 6s ease-in-out 0.6s infinite; }
        .lp-badge    { animation: lp-glow 3s ease-in-out infinite; }
        .lp-field    { animation: lp-fade-up 0.5s ease-out both; }
        .lp-shake    { animation: lp-shake 0.4s ease-in-out both; }
        .lp-dot      { animation: lp-dot 1.8s ease-in-out infinite; }
        .lp-g1       { animation: lp-float-1 9s  ease-in-out infinite; }
        .lp-g2       { animation: lp-float-2 11s ease-in-out infinite; }
        .lp-g3       { animation: lp-float-3 13s ease-in-out infinite; }
        .lp-g4       { animation: lp-float-1 12s ease-in-out infinite; }
        .lp-g5       { animation: lp-float-2 10s ease-in-out infinite; }
        .lp-sq       { animation: lp-spin 22s linear infinite; transform-origin: 50% 50%; }
        .lp-sq-rev   { animation: lp-spin-rev 28s linear infinite; transform-origin: 50% 50%; }
        .lp-spin-slow{ animation: lp-spin 30s linear infinite; transform-origin: 50% 50%; }
        .lp-bd1      { animation: lp-bd1 12s ease-in-out infinite; }
        .lp-bd2      { animation: lp-bd2 15s ease-in-out infinite; }
        .lp-bd3      { animation: lp-bd3 13s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .lp-card,.lp-halo,.lp-shine,.lp-badge,.lp-field,.lp-shake,.lp-dot,
          .lp-g1,.lp-g2,.lp-g3,.lp-g4,.lp-g5,.lp-sq,.lp-sq-rev,.lp-spin-slow,
          .lp-bd1,.lp-bd2,.lp-bd3 { animation: none !important; }
          .lp-card { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
