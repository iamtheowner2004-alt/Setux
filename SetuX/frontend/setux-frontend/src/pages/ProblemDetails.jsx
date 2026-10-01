import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { NODE_API_BASE } from "../services/api";

function ProblemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH THIS USER'S PROBLEM
  // =====================================================

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${NODE_API_BASE}/problems/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch problem"
          );
        }

        setProblem(data.problem);
      } catch (err) {
        console.error("Problem details error:", err);
        setError(
          err.message || "Unable to load problem."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, navigate]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfaf6]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3c8d87] border-t-transparent"></div>
          <p className="mt-4 text-sm font-semibold text-[#6d7780]">
            Loading problem details...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] px-5 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold text-red-700">
            {error}
          </p>
          <Link
            to="/dashboard"
            className="mt-5 inline-block rounded-lg bg-[#183153] px-5 py-3 text-sm font-bold text-white"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // =====================================================
  // NO PROBLEM
  // =====================================================

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfaf6]">
        <div className="text-center">
          <p className="text-sm font-semibold text-[#6d7780]">
            Problem not found.
          </p>
          <Link
            to="/dashboard"
            className="mt-4 inline-block text-xs font-bold text-[#3c8d87] hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ai = problem.ai_analysis || {};
  const universities = problem.university_recommendations || problem.universityMatches || [];
  const status = problem.status || "pending_admin_review";

  const submittedDate = problem.createdAt
    ? new Date(problem.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  // Lifecycle Stepper calculation
  const getStepStatus = (stepIndex) => {
    // step 0: Ingested & Analyzed
    if (stepIndex === 0) return "completed";

    // step 1: Admin Review
    if (stepIndex === 1) {
      if (status === "pending_admin_review" || status === "Pending Review") return "in_progress";
      if (status === "Rejected" || status === "all_universities_declined") return "declined";
      return "completed";
    }

    // step 2: University Outreach & Decision
    if (stepIndex === 2) {
      if (status === "approved_for_university_outreach") return "in_progress";
      if (status === "university_contacted") return "in_progress";
      if (status === "university_accepted" || status?.includes("industry") || status === "escalated_to_government") return "completed";
      return "pending";
    }

    // step 3: Solution & Industry Match
    if (stepIndex === 3) {
      if (status === "university_accepted" || status === "industry_approved" || status === "industry_invited") return "in_progress";
      if (status === "industry_collaboration_started") return "completed";
      if (status === "escalated_to_government" || status === "industry_declined") return "escalated";
      return "pending";
    }

    // step 4: Deployment / Government Resolution
    if (stepIndex === 4) {
      if (status === "industry_collaboration_started") return "completed";
      if (status === "escalated_to_government") return "completed";
      return "pending";
    }

    return "pending";
  };

  const getStatusBadgeStyle = (currentStatus) => {
    switch (currentStatus) {
      case "university_accepted":
      case "industry_collaboration_started":
      case "Approved":
        return "bg-green-100 text-green-700 border-green-200";

      case "all_universities_declined":
      case "Rejected":
        return "bg-red-100 text-red-700 border-red-200";

      case "escalated_to_government":
        return "bg-purple-100 text-purple-700 border-purple-200";

      case "approved_for_university_outreach":
      case "university_contacted":
      case "industry_approved":
      case "industry_invited":
        return "bg-blue-100 text-blue-700 border-blue-200";

      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const formatStatus = (s) => {
    const map = {
      pending_admin_review: "Pending Review",
      "Pending Review": "Pending Review",
      approved_for_university_outreach: "Approved for University Outreach",
      university_contacted: "University Contacted (Email Sent)",
      university_accepted: "University Accepted Challenge",
      pending_next_university: "Pending Next University Review",
      all_universities_declined: "All Universities Declined",
      industry_approved: "Industry Partner Approved",
      industry_invited: "Industry Invited",
      industry_collaboration_started: "Active Industry Collaboration",
      pending_next_industry: "Pending Next Industry",
      industry_declined: "Industry Declined",
      escalated_to_government: "Escalated to Government Authority",
    };
    return map[s] || s || "Pending Review";
  };

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      {/* =================================================
          NAVBAR
      ================================================= */}
      <header className="flex items-center justify-between border-b border-[#e5e3dc] bg-white px-5 py-4 sm:px-8 lg:px-16">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-[#183153]"
        >
          Setu<span className="text-[#3c8d87]">X</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-[#6d7780] transition hover:text-[#183153]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}
      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-16">
        {/* =================================================
            PROBLEM HEADER
        ================================================= */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
              Civic Challenge #{id?.slice(-6) || id}
            </p>
            {ai.category && (
              <span className="rounded-full bg-[#edf3f1] px-2.5 py-0.5 text-xs font-bold text-[#3c8d87]">
                🏷️ {ai.category}
              </span>
            )}
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#183153] sm:text-4xl">
            {problem.title}
          </h1>

          {(problem.address || problem.location) && (
            <p className="mt-2 text-sm text-[#6d7780]">
              📍 {problem.address || problem.location}
            </p>
          )}
        </div>

        {/* =================================================
            STATUS & LIFECYCLE STEPPER
        ================================================= */}
        <div className="rounded-2xl border border-[#e5e3dc] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#3c8d87]">
                Current Lifecycle State
              </p>
              <h2 className="mt-1 text-xl font-bold text-[#183153]">
                {formatStatus(status)}
              </h2>
            </div>

            <span
              className={`w-fit rounded-full border px-3.5 py-1.5 text-xs font-bold ${getStatusBadgeStyle(status)}`}
            >
              {formatStatus(status)}
            </span>
          </div>

          {/* 5-Stage Stepper */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {[
              ["01", "AI Pre-Analysis", "NLP & OpenAlex RAG", getStepStatus(0)],
              ["02", "Admin Review", "HEI Candidate Selection", getStepStatus(1)],
              ["03", "University Outreach", "Dean / R&D Contact", getStepStatus(2)],
              ["04", "Industry Match", "DuckDuckGo & DDGS", getStepStatus(3)],
              ["05", "Deployment / Gov", "Action & Policy Escalation", getStepStatus(4)],
            ].map(([num, title, subtitle, stepState]) => {
              const isDone = stepState === "completed";
              const isInProgress = stepState === "in_progress";
              const isEscalated = stepState === "escalated";

              return (
                <div key={title} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      isDone
                        ? "bg-[#3c8d87] text-white shadow-sm"
                        : isInProgress
                        ? "border-2 border-[#183153] bg-[#183153] text-white animate-pulse"
                        : isEscalated
                        ? "bg-purple-700 text-white"
                        : "bg-[#edf0ed] text-[#89918a]"
                    }`}
                  >
                    {isDone ? "✓" : num}
                  </div>

                  <p className="mt-3 text-xs font-bold text-[#183153]">
                    {title}
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-[#89918a]">
                    {subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================
            AI PROBLEM ANALYSIS (GEMINI + RAG)
        ================================================= */}
        {ai.summary && (
          <div className="mt-6 rounded-2xl border border-[#dce8e5] bg-[#edf3f1] p-6 shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#183153] text-lg text-white">
                  🤖
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#3c8d87]">
                    SetuX AI Intelligence
                  </p>
                  <h2 className="text-lg font-bold text-[#183153]">
                    Semantic Problem Analysis
                  </h2>
                </div>
              </div>

              {ai.priority_score && (
                <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 shadow-xs">
                  <span className="text-xs text-[#6d7780]">Priority Score:</span>
                  <span className="text-base font-extrabold text-[#3c8d87]">
                    {ai.priority_score} / 100
                  </span>
                </div>
              )}
            </div>

            {/* AI Summary */}
            <div className="mt-5 rounded-xl bg-white p-5 border border-[#dce8e5]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#89918a]">
                Executive AI Summary
              </p>
              <p className="mt-2 text-sm leading-6 text-[#35414c]">
                {ai.summary}
              </p>
            </div>

            {/* AI Metric Cards */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white p-4 border border-[#dce8e5]">
                <p className="text-xs text-[#89918a]">Domain Category</p>
                <p className="mt-1 font-bold text-[#183153]">
                  {ai.category || "General"}
                </p>
                {ai.subcategory && (
                  <p className="text-xs text-[#6d7780]">{ai.subcategory}</p>
                )}
              </div>

              <div className="rounded-xl bg-white p-4 border border-[#dce8e5]">
                <p className="text-xs text-[#89918a]">Assessed Severity</p>
                <p className={`mt-1 font-bold ${
                  ai.severity === "Critical" ? "text-red-700" :
                  ai.severity === "High" ? "text-amber-700" : "text-blue-700"
                }`}>
                  {ai.severity || "Normal"}
                </p>
              </div>
            </div>

            {/* Required Expertise */}
            {ai.required_expertise?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#89918a] mb-2">
                  Required Academic & Technical Expertise
                </p>
                <div className="flex flex-wrap gap-2">
                  {ai.required_expertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-white border border-[#dce8e5] px-3 py-1 text-xs font-semibold text-[#183153]"
                    >
                      🔬 {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Research Queries */}
            {ai.research_queries?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#89918a] mb-2">
                  Generated Bibliographic Search Queries
                </p>
                <div className="flex flex-wrap gap-2">
                  {ai.research_queries.map((q, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-[#edf6f4] px-3 py-1 text-xs font-mono text-[#3c8d87]"
                    >
                      🔍 "{q}"
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            DESCRIPTION
        ================================================= */}
        <div className="mt-6 rounded-2xl border border-[#e5e3dc] bg-white p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#3c8d87]">
            Citizen Report
          </p>

          <h2 className="mt-1 text-lg font-bold text-[#183153]">
            Problem Description
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#5e6871]">
            {problem.description}
          </p>
        </div>

        {/* =================================================
            MEDIA & EVIDENCE
        ================================================= */}
        {problem.images?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#e5e3dc] bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#3c8d87]">
              Supporting Evidence
            </p>
            <h2 className="mt-1 text-lg font-bold text-[#183153] mb-4">
              Photos ({problem.images.length})
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {problem.images.map((image, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-[#e5e3dc] bg-[#f5f6f2]"
                >
                  {typeof image === "string" && image.startsWith("http") ? (
                    <img
                      src={image}
                      alt={`Problem evidence ${index + 1}`}
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center text-sm font-semibold text-[#6d7780]">
                      📷 {image}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================
            SUBMISSION METADATA
        ================================================= */}
        <div className="mt-6 rounded-2xl border border-[#e5e3dc] bg-white p-6 sm:p-8">
          <h2 className="text-lg font-bold text-[#183153]">
            Submission Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-[#89918a]">Submitted By</p>
              <p className="mt-1 text-sm font-semibold text-[#35414c]">
                {problem.submittedBy?.name || "Citizen"}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#89918a]">Location</p>
              <p className="mt-1 text-sm font-semibold text-[#35414c]">
                {problem.address || problem.location || "India"}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#89918a]">Submission Date</p>
              <p className="mt-1 text-sm font-semibold text-[#35414c]">
                {submittedDate}
              </p>
            </div>

            <div>
              <p className="text-xs text-[#89918a]">Unique ID</p>
              <p className="mt-1 text-sm font-mono text-[#35414c]">
                {problem._id}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            BACK BUTTON
        ================================================= */}
        <div className="mt-8 text-center">
          <Link
            to="/dashboard"
            className="text-sm font-bold text-[#3c8d87] hover:text-[#183153]"
          >
            ← Back to My Problems Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default ProblemDetails;