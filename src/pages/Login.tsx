import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Loader2, AlertCircle, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { login, users } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.error ?? "Login failed.");
    }
  };

  const activeUsers = users.filter((u) => u.status === "Active");

  return (
    <>
      <style>{`
        .login-right {
          background: #1e2d45;
          position: relative;
          overflow: hidden;
        }

        /* ── Blobs ── */
        .lb1, .lb2, .lb3, .lb4 {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          will-change: transform;
        }
        .lb1 {
          width: 600px; height: 600px;
          top: -180px; right: -180px;
          background: radial-gradient(circle at center, rgba(37,99,235,0.75) 0%, rgba(37,99,235,0.3) 40%, transparent 70%);
          filter: blur(40px);
          animation: lb1-anim 12s ease-in-out infinite;
        }
        .lb2 {
          width: 500px; height: 500px;
          bottom: -150px; left: -100px;
          background: radial-gradient(circle at center, rgba(13,148,136,0.7) 0%, rgba(13,148,136,0.25) 40%, transparent 70%);
          filter: blur(40px);
          animation: lb2-anim 15s ease-in-out infinite;
        }
        .lb3 {
          width: 400px; height: 400px;
          top: 40%; left: 30%;
          background: radial-gradient(circle at center, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0.15) 40%, transparent 70%);
          filter: blur(50px);
          animation: lb3-anim 18s ease-in-out infinite;
        }
        .lb4 {
          width: 300px; height: 300px;
          top: 10%; left: 10%;
          background: radial-gradient(circle at center, rgba(20,184,166,0.5) 0%, rgba(20,184,166,0.15) 40%, transparent 70%);
          filter: blur(35px);
          animation: lb4-anim 20s ease-in-out infinite;
        }

        @keyframes lb1-anim {
          0%   { transform: translate(0px,   0px)   scale(1);    }
          30%  { transform: translate(-60px, 40px)  scale(1.1);  }
          60%  { transform: translate(40px,  -50px) scale(0.92); }
          100% { transform: translate(0px,   0px)   scale(1);    }
        }
        @keyframes lb2-anim {
          0%   { transform: translate(0px,   0px)   scale(1);    }
          35%  { transform: translate(70px,  -40px) scale(1.08); }
          70%  { transform: translate(-40px, 30px)  scale(0.95); }
          100% { transform: translate(0px,   0px)   scale(1);    }
        }
        @keyframes lb3-anim {
          0%   { transform: translate(0px,   0px);   }
          40%  { transform: translate(-50px, -60px); }
          80%  { transform: translate(60px,  40px);  }
          100% { transform: translate(0px,   0px);   }
        }
        @keyframes lb4-anim {
          0%   { transform: translate(0px,  0px);  }
          50%  { transform: translate(40px, 60px); }
          100% { transform: translate(0px,  0px);  }
        }

        /* ── Dot grid ── */
        .login-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.35) 2px, transparent 2px);
          background-size: 28px 28px;
          animation: grid-pan 6s linear infinite;
        }
        @keyframes grid-pan {
          from { background-position: 0 0; }
          to   { background-position: 28px 28px; }
        }

        /* ── Vignette ── */
        .login-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, rgba(13,20,36,0.85) 100%);
        }

        /* ── Floating shapes ── */
        .ls1, .ls2, .ls3 {
          position: absolute;
          pointer-events: none;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.03);
        }
        .ls1 {
          width: 80px; height: 80px;
          border-radius: 16px;
          top: 60px; right: 60px;
          transform: rotate(15deg);
          animation: shape-pulse 7s ease-in-out infinite;
        }
        .ls2 {
          width: 56px; height: 56px;
          border-radius: 50%;
          bottom: 80px; left: 48px;
          animation: shape-pulse 10s ease-in-out infinite 2s;
        }
        .ls3 {
          width: 36px; height: 36px;
          border-radius: 8px;
          top: 45%; right: 5%;
          transform: rotate(-10deg);
          animation: shape-pulse 8s ease-in-out infinite 1s;
        }
        @keyframes shape-pulse {
          0%, 100% { opacity: 0.25; transform: scale(1) rotate(15deg); }
          50%       { opacity: 0.65; transform: scale(1.08) rotate(20deg); }
        }

        /* ── Glass card ── */
        .login-card {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.13);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        /* ── Demo box ── */
        .login-demo {
          margin-top: 1rem;
          border-radius: 14px;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* ── Input overrides ── */
        .login-input {
          background: rgba(255,255,255,0.09) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: rgba(255,255,255,0.9) !important;
          height: 40px;
        }
        .login-input::placeholder { color: rgba(255,255,255,0.28) !important; }
        .login-input:focus { border-color: rgba(59,130,246,0.6) !important; outline: none; box-shadow: 0 0 0 2px rgba(59,130,246,0.2) !important; }

        /* ── Sign-in button glow ── */
        .login-btn {
          background: #2563eb !important;
          box-shadow: 0 4px 18px rgba(37,99,235,0.5) !important;
          color: white !important;
          width: 100%;
          height: 40px;
          font-weight: 600;
          border: none !important;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .login-btn:hover:not(:disabled) {
          background: #1d4ed8 !important;
          box-shadow: 0 6px 22px rgba(37,99,235,0.65) !important;
        }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .login-label  { color: rgba(255,255,255,0.7);  font-size: 0.875rem; }
        .login-title  { color: rgba(255,255,255,0.95); }
        .login-sub    { color: rgba(255,255,255,0.45); font-size: 0.875rem; }
        .login-forgot { color: rgba(99,160,255,0.9); font-size: 0.75rem; }
        .login-forgot:hover { text-decoration: underline; }
        .login-eye    { color: rgba(255,255,255,0.35); position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0; }
        .login-eye:hover { color: rgba(255,255,255,0.7); }
        .demo-label   { color: rgba(255,255,255,0.35); font-size: 0.75rem; font-weight: 500; margin-bottom: 6px; }
        .demo-tag     { font-family: monospace; font-size: 0.72rem; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border-radius: 4px; padding: 1px 6px; }
        .demo-sep     { color: rgba(255,255,255,0.25); font-size: 0.72rem; }
        .demo-role    { color: rgba(255,255,255,0.28); font-size: 0.72rem; font-style: italic; flex-shrink: 0; }
        .error-box    { display: flex; align-items: center; gap: 10px; border-radius: 8px; padding: 10px 12px; font-size: 0.875rem; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
      `}</style>

      <div className="min-h-screen flex">

        {/* ── Left brand panel (unchanged) ── */}
        <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col bg-sidebar text-sidebar-foreground relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-sidebar-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative z-10 flex flex-col h-full p-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">One NICO</span>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-8">
              <div>
                <h2 className="text-3xl font-bold leading-snug">
                  Hire smarter,<br />
                  <span className="text-sidebar-primary">faster.</span>
                </h2>
                <p className="mt-3 text-sidebar-foreground/60 text-sm leading-relaxed">
                  Your recruitment pipeline, all in one place. Track applicants, manage job postings, and make better hiring decisions.
                </p>
              </div>
              <ul className="space-y-3">
                {["Manage unlimited job postings", "Track every applicant's journey", "Visual reports & analytics"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-sidebar-foreground/80">
                    <span className="w-5 h-5 rounded-full bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-sidebar-primary" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-sidebar-foreground/30">© {new Date().getFullYear()} One NICO ATS</p>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right flex-1 flex flex-col items-center justify-center px-6 py-12">

          {/* Blobs */}
          <div className="lb1" />
          <div className="lb2" />
          <div className="lb3" />
          <div className="lb4" />

          {/* Dot grid */}
          <div className="login-grid" />

          {/* Floating shapes */}
          <div className="ls1" />
          <div className="ls2" />
          <div className="ls3" />

          {/* Vignette */}
          <div className="login-vignette" />

          {/* Card */}
          <div className="login-card relative z-10 w-full" style={{ maxWidth: "380px" }}>

            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-7">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "#2563eb", boxShadow: "0 4px 14px rgba(37,99,235,0.45)" }}>
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg login-title">One NICO</span>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold login-title">Welcome back</h1>
              <p className="mt-1 login-sub">Sign in to your ATS account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="error-box animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="login-label block">Email address</label>
                <Input id="email" type="email" placeholder="you@codaflem.mw" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading}
                  className="login-input" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="login-label">Password</label>
                  <button type="button" className="login-forgot" tabIndex={-1}>Forgot password?</button>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    autoComplete="current-password" value={password}
                    onChange={(e) => setPassword(e.target.value)} disabled={loading}
                    className="login-input" style={{ paddingRight: "2.5rem" }} />
                  <button type="button" className="login-eye" onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1} aria-label={showPassword ? "Hide" : "Show"}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn mt-2" disabled={loading}>
                {loading
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Signing in…</span>
                  : "Sign in"}
              </button>
            </form>
          </div>

          {/* Demo credentials 
          <div className="login-demo relative z-10 w-full" style={{ maxWidth: "380px" }}>
            <p className="demo-label">Demo credentials</p>
            <div className="space-y-1.5">
              {activeUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="demo-tag truncate">{u.email}</span>
                    <span className="demo-sep">/</span>
                    <span className="demo-tag">{u.password}</span>
                  </div>
                  <span className="demo-role">{u.role}</span>
                </div>
              ))}
            </div>
          </div>
           */}
        </div>
      </div>
    </>
  );
}
