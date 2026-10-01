import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectParam = new URLSearchParams(location.search).get("redirect");
  const redirectPath = redirectParam || "/dashboard";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  useEffect(() => {
    if (redirectParam === "/report-problem") {
      setInfoMessage("Please log in to submit your civic problem report.");
    }
  }, [redirectParam]);

  // ==============================
  // HANDLE INPUT
  // ==============================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  // ==============================
  // LOGIN SUBMIT
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = formData.email.trim();
    const cleanPassword = formData.password;

    if (!cleanEmail || !cleanPassword) {
      setError("Please provide both email/username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Clear any prior stale tokens before writing fresh credentials
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");

      const data = await authAPI.login(cleanEmail, cleanPassword);

      if (!data || !data.success) {
        throw new Error(data?.message || "Invalid credentials. Please try again.");
      }

      // Save JWT & user information
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Admin → Admin Dashboard
      if (data.user?.role === "admin") {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify(data.user));
        navigate("/admin");
      } else {
        // Normal citizen → Redirect path (e.g. /report-problem or /dashboard)
        navigate(redirectPath);
      }
    } catch (err) {
      console.error("Citizen Login error:", err);
      setError(
        err.message ||
          "Unable to connect to login server. Please verify services are running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* ==============================
            LEFT BRAND SECTION
        ============================== */}
        <div className="flex flex-col justify-between bg-[#183153] px-6 py-8 text-white sm:px-10 lg:px-16">
          <Link
            to="/"
            className="text-3xl font-extrabold tracking-tight text-white"
          >
            Setu<span className="text-[#6bb5ae]">X</span>
          </Link>

          <div className="mx-auto max-w-xl py-14 lg:mx-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-[#6bb5ae]">
              Citizen Innovation Hub
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-[-1.5px] sm:text-5xl">
              Continue turning
              <br />
              problems into
              <br />
              <span className="text-[#6bb5ae]">solutions.</span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[#d4dfdf] sm:text-base">
              Log in to track your reported civic challenges and see how SetuX
              autonomous agents connect them with research universities and
              industrial partners.
            </p>
          </div>

          <p className="text-xs text-[#aebfc1]">
            SetuX — Societal Innovation Collaboration Platform
          </p>
        </div>

        {/* ==============================
            RIGHT LOGIN FORM
        ============================== */}
        <div className="flex items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-8 inline-block text-sm font-semibold text-[#6d7780] hover:text-[#183153]"
            >
              ← Back to home
            </Link>

            <h2 className="text-3xl font-bold tracking-tight text-[#183153]">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6d7780]">
              Log in to access your SetuX Citizen Dashboard.
            </p>

            {/* INFO BANNER */}
            {infoMessage && (
              <div className="mt-4 rounded-lg border border-[#3c8d87]/30 bg-[#edf6f4] px-4 py-3 text-xs font-semibold text-[#183153]">
                ℹ️ {infoMessage}
              </div>
            )}

            {/* ERROR BANNER */}
            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                ❌ {error}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* EMAIL / USERNAME */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#35414c]">
                  Email Address or Username
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. citizen@setux.org"
                  required
                  autoComplete="username"
                  disabled={loading}
                  className="mt-1.5 w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm text-[#183153] outline-hidden transition focus:border-[#3c8d87] focus:ring-2 focus:ring-[#3c8d87]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#35414c]">
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="mt-1.5 w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm text-[#183153] outline-hidden transition focus:border-[#3c8d87] focus:ring-2 focus:ring-[#3c8d87]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#183153] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#102945] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log In to Citizen Dashboard →"}
              </button>
            </form>

            {/* SIGNUP LINK */}
            <p className="mt-6 text-center text-sm text-[#6d7780]">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-bold text-[#3c8d87] hover:underline"
              >
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;