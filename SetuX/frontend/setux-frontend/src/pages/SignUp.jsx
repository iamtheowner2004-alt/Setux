import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TutorialModal from "../components/TutorialModal";
import { NODE_API_BASE } from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [showTutorial, setShowTutorial] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // SIGNUP
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        `${NODE_API_BASE}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Signup failed"
        );
      }

      // Save JWT
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setSuccess(
        "Account created successfully! Redirecting..."
      );

      // Go to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6]">

      {/* =================================================
          MAIN
      ================================================= */}

      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">

        {/* =================================================
            LEFT INFORMATION SECTION
        ================================================= */}

        <div className="flex flex-col justify-between bg-[#183153] px-6 py-8 text-white sm:px-10 lg:px-16">

          <Link
            to="/"
            className="text-3xl font-extrabold tracking-tight"
          >
            Setu<span className="text-[#6bb5ae]">X</span>
          </Link>

          <div className="mx-auto max-w-xl py-14 lg:mx-0">

            <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-[#6bb5ae]">
              Join SetuX
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-[-1.5px] sm:text-5xl">
              Turn the problems
              <br />
              around you into
              <br />

              <span className="text-[#6bb5ae]">
                real solutions.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-[#d4dfdf] sm:text-base">
              Share a problem from your community.
              SetuX connects it with the right academic
              and industry expertise.
            </p>

          </div>

          <p className="text-xs text-[#aebfc1]">
            SetuX — Societal Innovation Collaboration Portal
          </p>

        </div>


        {/* =================================================
            SIGNUP FORM
        ================================================= */}

        <div className="flex items-center justify-center px-5 py-12 sm:px-10">

          <div className="w-full max-w-md">

            <Link
              to="/"
              className="mb-10 inline-block text-sm font-semibold text-[#6d7780] hover:text-[#183153]"
            >
              ← Back to home
            </Link>

            <h2 className="text-3xl font-bold tracking-tight text-[#183153]">
              Create your account
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6d7780]">
              Sign up to report and track your community
              problems.
            </p>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>

              </div>
            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">

                <p className="text-sm font-semibold text-green-700">
                  {success}
                </p>

              </div>
            )}


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-4"
            >

              {/* NAME */}

              <div>

                <label className="text-sm font-semibold text-[#35414c]">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3c8d87] focus:ring-2 focus:ring-[#3c8d87]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

              </div>


              {/* EMAIL */}

              <div>

                <label className="text-sm font-semibold text-[#35414c]">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3c8d87] focus:ring-2 focus:ring-[#3c8d87]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label className="text-sm font-semibold text-[#35414c]">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  minLength={6}
                  disabled={loading}
                  className="mt-2 w-full rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3c8d87] focus:ring-2 focus:ring-[#3c8d87]/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full rounded-lg bg-[#183153] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#102945] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}
              </button>

            </form>


            {/* =================================================
                LOGIN
            ================================================= */}

            <p className="mt-6 text-center text-sm text-[#6d7780]">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-bold text-[#3c8d87] hover:text-[#183153]"
              >
                Login
              </Link>

            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          TUTORIAL MODAL
      ================================================= */}

      {showTutorial && (
        <TutorialModal
          onClose={() => setShowTutorial(false)}
        />
      )}

    </div>
  );
}

export default Signup;