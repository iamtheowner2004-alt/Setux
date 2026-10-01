import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  // =====================================================
  // FETCH LOGGED-IN USER'S PROBLEMS
  // =====================================================

  const fetchMyProblems = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (storedUser) setUser(storedUser);
      } catch {}

      const response = await fetch(
        "http://localhost:5000/api/problems/my-problems",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load your submitted problems.");
      }

      setProblems(data.problems || []);
    } catch (err) {
      console.error("Fetch my problems error:", err);
      setError(err.message || "Unable to load your problems. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProblems();
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/");
  };

  // =====================================================
  // STATUS STYLING
  // =====================================================

  const formatStatus = (status) => {
    if (!status) return "Pending Review";
    const map = {
      pending_admin_review: "Pending Review",
      "Pending Review": "Pending Review",
      approved_for_university_outreach: "University Approved",
      university_contacted: "University Contacted",
      university_accepted: "University Accepted",
      pending_next_university: "Next HEI Pending",
      all_universities_declined: "All HEIs Declined",
      industry_approved: "Industry Approved",
      industry_invited: "Industry Invited",
      industry_collaboration_started: "Collaboration Active",
      pending_next_industry: "Next Industry Pending",
      industry_declined: "Industry Declined",
      escalated_to_government: "Government Escalated",
      Approved: "Approved",
      Rejected: "Rejected",
    };
    return map[status] || status;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "university_accepted":
      case "industry_collaboration_started":
      case "Approved":
        return "bg-green-100 text-green-700";

      case "all_universities_declined":
      case "Rejected":
        return "bg-red-100 text-red-700";

      case "escalated_to_government":
        return "bg-purple-100 text-purple-700";

      case "approved_for_university_outreach":
      case "university_contacted":
      case "industry_approved":
      case "industry_invited":
        return "bg-blue-100 text-blue-700";

      case "pending_next_university":
      case "pending_next_industry":
      case "Under Review":
        return "bg-yellow-100 text-yellow-700";

      case "pending_admin_review":
      case "Pending Review":
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      {/* =================================================
          NAVBAR
      ================================================= */}
      <nav className="border-b border-[#e5e5df] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-[#183153]"
          >
            Setu<span className="text-[#6bb5ae]">X</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <span className="hidden text-sm font-semibold text-[#6d7780] sm:block">
              {user?.name || "Citizen"}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-[#d8d9d4] px-4 py-2 text-sm font-semibold text-[#35414c] transition hover:border-[#183153] hover:text-[#183153]"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* =================================================
          MAIN
      ================================================= */}
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
              My Citizen Portal
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#183153] sm:text-4xl">
              Welcome, {user?.name || "Citizen"} 👋
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#6d7780]">
              Track your reported societal challenges and monitor real-time AI university & industry resolutions.
            </p>
          </div>

          <Link
            to="/report-problem"
            className="inline-flex w-fit items-center rounded-lg bg-[#183153] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102945]"
          >
            + Report a Problem
          </Link>
        </div>

        {/* =================================================
            STATS
        ================================================= */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[#e3e3dd] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8a9298]">
              Total Problems
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[#183153]">
              {problems.length}
            </p>
          </div>

          <div className="rounded-xl border border-[#e3e3dd] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8a9298]">
              Pending Review
            </p>
            <p className="mt-2 text-3xl font-extrabold text-amber-700">
              {
                problems.filter(
                  (p) =>
                    p.status === "pending_admin_review" ||
                    p.status === "Pending Review"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-[#e3e3dd] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8a9298]">
              University / Active
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[#3c8d87]">
              {
                problems.filter(
                  (p) =>
                    p.status?.includes("university") ||
                    p.status?.includes("industry") ||
                    p.status === "Approved"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-[#e3e3dd] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#8a9298]">
              Gov Escalations
            </p>
            <p className="mt-2 text-3xl font-extrabold text-purple-700">
              {
                problems.filter((p) => p.status === "escalated_to_government")
                  .length
              }
            </p>
          </div>
        </div>

        {/* =================================================
            PROBLEMS SECTION
        ================================================= */}
        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#183153]">
                My Reported Problems
              </h2>
              <p className="mt-1 text-sm text-[#6d7780]">
                Problems submitted and processed through SetuX AI Multi-Agent Pipeline.
              </p>
            </div>

            <span className="rounded-full bg-[#edf3f1] px-3 py-1.5 text-xs font-bold text-[#3c8d87]">
              {problems.length} {problems.length === 1 ? "Problem" : "Problems"}
            </span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-xl border border-[#e3e3dd] bg-white p-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3c8d87] border-t-transparent"></div>
              <p className="mt-4 text-sm font-semibold text-[#6d7780]">
                Loading your problems...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <button
                onClick={fetchMyProblems}
                className="mt-4 rounded-lg bg-[#183153] px-4 py-2 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {/* EMPTY */}
          {!loading && !error && problems.length === 0 && (
            <div className="rounded-xl border border-[#e3e3dd] bg-white p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf6f4] text-2xl">
                📍
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#183153]">
                No problems reported yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6d7780]">
                Have you noticed a problem in your community? Report it and let SetuX AI connect it with top Indian researchers and industry partners.
              </p>
              <Link
                to="/report-problem"
                className="mt-5 inline-block rounded-lg bg-[#183153] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#102945]"
              >
                Report a Problem
              </Link>
            </div>
          )}

          {/* PROBLEM CARDS */}
          {!loading && !error && problems.length > 0 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {problems.map((problem) => {
                const category =
                  problem.ai_analysis?.category ||
                  problem.aiAnalysis?.primaryDomain ||
                  problem.domain ||
                  "Societal Issue";

                const severity =
                  problem.ai_analysis?.severity ||
                  problem.aiAnalysis?.priority ||
                  "Normal";

                return (
                  <Link
                    key={problem._id}
                    to={`/problem/${problem._id}`}
                    className="group flex flex-col justify-between rounded-xl border border-[#e3e3dd] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cbd8d5] hover:shadow-sm"
                  >
                    <div>
                      {/* TOP */}
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="line-clamp-2 text-lg font-bold text-[#183153] group-hover:text-[#3c8d87]">
                          {problem.title}
                        </h3>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                            problem.status
                          )}`}
                        >
                          {formatStatus(problem.status)}
                        </span>
                      </div>

                      {/* DESCRIPTION */}
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6d7780]">
                        {problem.description}
                      </p>

                      {/* ADDRESS */}
                      {(problem.address || problem.location) && (
                        <div className="mt-4 flex items-start gap-2">
                          <span className="text-sm">📍</span>
                          <p className="line-clamp-1 text-xs leading-5 text-[#6d7780]">
                            {problem.address || problem.location}
                          </p>
                        </div>
                      )}

                      {/* AI BADGES */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-[#edf6f4] px-2.5 py-1 text-xs font-bold text-[#3c8d87]">
                          🏷️ {category}
                        </span>

                        <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                          ⚡ Priority: {severity}
                        </span>
                      </div>
                    </div>

                    {/* DATE */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#eeeeea] pt-4">
                      <p className="text-xs text-[#8a9298]">
                        Submitted{" "}
                        {problem.createdAt
                          ? new Date(problem.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Recently"}
                      </p>

                      <span className="text-xs font-bold text-[#3c8d87] group-hover:underline">
                        View Progress →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;