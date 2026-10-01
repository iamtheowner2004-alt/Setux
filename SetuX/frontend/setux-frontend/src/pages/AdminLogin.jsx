import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("csmuadmin");
  const [password, setPassword] = useState("admin1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Authenticate with backend
      const data = await authAPI.adminLogin(username.trim(), password);

      if (!data.success) {
        throw new Error(data.message || "Invalid administrator credentials");
      }

      // 2. Store dedicated Admin Token & User details
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "adminUser",
        JSON.stringify(data.admin || { username: "csmuadmin", role: "admin" })
      );
      localStorage.setItem(
        "user",
        JSON.stringify(data.admin || { username: "csmuadmin", role: "admin" })
      );

      // 3. Navigate to protected Admin Dashboard
      navigate("/admin");
    } catch (err) {
      console.warn("Backend admin login check:", err);

      // Standalone Fallback for Demo Resilience if backend unreachable
      if (
        (username.trim().toLowerCase() === "csmuadmin" ||
          username.trim().toLowerCase() === "csmuadmin@setux.org") &&
        password === "admin1234"
      ) {
        const mockAdmin = {
          name: "CSMU Admin",
          username: "csmuadmin",
          email: "csmuadmin@setux.org",
          role: "admin",
        };
        const mockToken = "mock_admin_jwt_token_csmuadmin";
        localStorage.setItem("adminToken", mockToken);
        localStorage.setItem("token", mockToken);
        localStorage.setItem("adminUser", JSON.stringify(mockAdmin));
        localStorage.setItem("user", JSON.stringify(mockAdmin));
        navigate("/admin");
        return;
      }

      setError(err.message || "Invalid admin username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#183153] px-5 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        {/* Logo */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="text-3xl font-extrabold tracking-tight text-[#183153]"
          >
            Setu<span className="text-[#3c8d87]">X</span>
          </Link>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#edf6f4] px-3 py-1 text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
            🔒 Admin Control Portal
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[#183153]">
          Administrator Login
        </h1>

        <p className="mt-1 text-xs leading-5 text-[#6d7780]">
          Restricted access. Only authorized administrators can review AI recommendations, dispatch university invitations, and escalate policy briefings.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            ❌ {error}
          </div>
        )}

        {/* Demo Login Access Instructions */}
        <div className="mt-4 rounded-xl border border-[#b8e2dc] bg-[#f0f9f8] p-3.5 text-xs text-[#1e5450]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#2d736e]">
              <span>⚡</span> Demo Login Access
            </span>
            <button
              type="button"
              onClick={() => {
                setUsername("csmuadmin");
                setPassword("admin1234");
              }}
              className="rounded bg-[#3c8d87] px-2 py-0.5 text-[11px] font-bold text-white transition hover:bg-[#2b6d68]"
            >
              Auto Fill
            </button>
          </div>
          <div className="mt-2 space-y-1 font-mono text-[11.5px] text-[#24524e]">
            <div className="flex items-center justify-between rounded border border-[#cbe4e0] bg-white/80 px-2 py-1">
              <span className="font-sans font-bold text-[#55827e]">Admin ID:</span>
              <span className="font-bold text-[#183153]">csmuadmin</span>
            </div>
            <div className="flex items-center justify-between rounded border border-[#cbe4e0] bg-white/80 px-2 py-1">
              <span className="font-sans font-bold text-[#55827e]">Password:</span>
              <span className="font-bold text-[#183153]">admin1234</span>
            </div>
          </div>
          <p className="mt-2 text-[10.5px] leading-4 text-[#55827e]">
            Credentials have been pre-filled for immediate evaluation and demo testing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#35414c]">
              Admin Username / Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
              autoComplete="username"
              className="mt-1.5 w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm text-[#183153] outline-hidden transition focus:border-[#3c8d87] focus:ring-2 focus:ring-[#3c8d87]/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#35414c]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm text-[#183153] outline-hidden transition focus:border-[#3c8d87] focus:ring-2 focus:ring-[#3c8d87]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#183153] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#102945] disabled:opacity-70"
          >
            {loading ? "Authenticating Admin..." : "Access Admin Dashboard →"}
          </button>
        </form>

        <div className="mt-6 border-t border-[#eeeeea] pt-4 text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-[#6d7780] hover:text-[#183153]"
          >
            ← Citizen / Public Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;