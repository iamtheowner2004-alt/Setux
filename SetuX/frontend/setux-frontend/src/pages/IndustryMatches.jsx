import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { industryAPI, problemsAPI } from "../services/api";

function IndustryMatches() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      // Get problem info
      const probRes = await problemsAPI.getProblemById(id);
      if (probRes.success && probRes.problem) {
        setProblem(probRes.problem);
      }

      // Get industry recommendations
      const indRes = await industryAPI.getIndustryRecommendationsForProblem(id);
      if (indRes.success && indRes.latest_recommendation) {
        setRecommendation(indRes.latest_recommendation);
      }
    } catch (err) {
      console.error("Failed to load industry matches:", err);
      setError("Failed to load industry recommendations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleApprove = async (recId, indIndex) => {
    try {
      const res = await industryAPI.approveIndustry(recId, indIndex);
      if (res.success) {
        setNotification(`✓ ${res.message || "Industry partner approved for collaboration!"}`);
        setTimeout(() => setNotification(""), 4000);
        await loadData();
      }
    } catch (err) {
      alert("Failed to approve industry: " + err.message);
    }
  };

  const handleInvite = async (recId) => {
    try {
      const res = await industryAPI.markInvitationSent(recId);
      if (res.success) {
        setNotification("✓ Collaboration request recorded as sent!");
        setTimeout(() => setNotification(""), 4000);
        await loadData();
      }
    } catch (err) {
      alert("Failed to send invitation: " + err.message);
    }
  };

  const industries = recommendation?.recommended_industries || [];

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      {/* ==================================================
          NAVBAR
      ================================================== */}
      <header className="flex items-center justify-between border-b border-[#e5e3dc] bg-white px-5 py-4 sm:px-8 lg:px-16">
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tight text-[#183153]"
        >
          Setu<span className="text-[#3c8d87]">X</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to={`/problem/${id}`}
            className="text-sm font-semibold text-[#6d7780] transition hover:text-[#183153]"
          >
            ← Problem Details
          </Link>
        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}
      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-16">
        {notification && (
          <div className="mb-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm font-bold text-green-800 shadow-sm">
            {notification}
          </div>
        )}

        {/* ==================================================
            HEADING
        ================================================== */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
            Industry Matcher (DuckDuckGo + Gemini Grounding)
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#183153] sm:text-4xl">
            Industry Recommendations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d7780]">
            SetuX AI matches approved university research prototypes with active Indian industry leaders capable of manufacturing, testing, and deployment.
          </p>
        </div>

        {/* ==================================================
            PROBLEM CONTEXT
        ================================================== */}
        {problem && (
          <div className="mt-7 rounded-2xl border border-[#dce8e5] bg-[#edf3f1] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#3c8d87]">
                  Problem & Academic Lead
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#183153]">
                  {problem.title}
                </h2>
                <p className="mt-1 text-xs text-[#5e6871]">
                  Selected HEI:{" "}
                  <strong>
                    {problem.selected_university?.name ||
                      problem.university_recommendations?.[0]?.name ||
                      "Lead Research Institute"}
                  </strong>
                </p>
              </div>
              <span className="text-3xl">🎓</span>
            </div>
          </div>
        )}

        {/* ==================================================
            ADMIN NOTICE
        ================================================== */}
        <div className="mt-5 rounded-2xl border border-[#e5e3dc] bg-white p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#183153] text-lg text-white">
              🛡️
            </div>
            <div>
              <h2 className="font-bold text-[#183153]">
                Human-in-the-Loop Verification
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#6d7780]">
                All recommended Indian enterprises are vetted against live web data. The administrator maintains full discretion before collaboration requests are issued.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            LOADING / ERROR
        ================================================== */}
        {loading && (
          <div className="mt-10 rounded-2xl border border-[#e5e3dc] bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3c8d87] border-t-transparent"></div>
            <p className="mt-4 text-sm font-semibold text-[#6d7780]">
              Loading Indian Industry Roster...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* ==================================================
            INDUSTRY CARDS
        ================================================== */}
        {!loading && !error && (
          <div className="mt-8 space-y-5">
            {industries.length > 0 ? (
              industries.map((industry, index) => {
                const isApproved =
                  recommendation.selected_industry_index === index ||
                  industry.status === "approved";
                const isInvited = industry.status === "invited";
                const score = industry.match_score || 90;

                return (
                  <div
                    key={industry.company_name || industry.name || index}
                    className={`rounded-2xl border p-5 transition sm:p-7 ${
                      isApproved
                        ? "border-[#3c8d87] bg-white ring-2 ring-[#3c8d87]/20 shadow-sm"
                        : "border-[#e5e3dc] bg-white hover:border-[#3c8d87] hover:shadow-sm"
                    }`}
                  >
                    {/* TOP */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f3ef] text-xl font-bold text-[#183153]">
                          🏢
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-[#183153]">
                              {industry.company_name || industry.name}
                            </h3>
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                              🇮🇳 {industry.india_relevance || "High Relevance"}
                            </span>
                            {isApproved && (
                              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
                                Approved Partner
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[#7b858d]">
                            {industry.website ? (
                              <a
                                href={industry.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#3c8d87] hover:underline font-semibold"
                              >
                                {industry.website} ↗
                              </a>
                            ) : (
                              "Verified Indian Enterprise"
                            )}
                          </p>
                        </div>
                      </div>

                      {/* MATCH SCORE */}
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-[#e8e9e4]">
                          <div
                            className="h-full rounded-full bg-[#3c8d87]"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-lg font-extrabold text-[#3c8d87]">
                          {score}%
                        </span>
                      </div>
                    </div>

                    {/* DETAILS */}
                    <div className="mt-6 grid gap-5 border-t border-[#e5e3dc] pt-5 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#89918a]">
                          Why Recommended by AI
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[#35414c]">
                          {industry.why_recommended ||
                            industry.expertise ||
                            "Demonstrated industrial capacity and manufacturing capability"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#89918a]">
                          Potential Contribution & Pilot Support
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#6d7780]">
                          {industry.possible_contribution ||
                            industry.support ||
                            "Prototype scaling, technology integration, and deployment support"}
                        </p>
                      </div>
                    </div>

                    {/* ADMIN ACTIONS */}
                    <div className="mt-6 flex flex-col gap-3 border-t border-[#e5e3dc] pt-5 sm:flex-row sm:justify-end">
                      {!isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleApprove(recommendation._id, index)}
                          className="rounded-lg bg-[#183153] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#102945]"
                        >
                          Approve Industry Partner →
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleInvite(recommendation._id)}
                          className="rounded-lg bg-[#3c8d87] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2e6d68]"
                        >
                          {isInvited ? "✓ Invitation Sent" : "Send Collaboration Request →"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-[#e5e3dc] bg-white p-8 text-center text-sm text-[#89918a]">
                No industry matches available for this problem yet. Visit the Admin Dashboard to propose a university solution and run the live DuckDuckGo agent.
              </div>
            )}
          </div>
        )}

        {/* FINAL INFORMATION */}
        <div className="mt-7 rounded-xl border border-[#e5e3dc] bg-white p-5 text-center">
          <p className="text-xs leading-5 text-[#89918a]">
            SetuX multi-agent workflow links academic R&D with industrial scaling, ensuring civic problems receive tangible technological resolutions.
          </p>
        </div>
      </main>
    </div>
  );
}

export default IndustryMatches;