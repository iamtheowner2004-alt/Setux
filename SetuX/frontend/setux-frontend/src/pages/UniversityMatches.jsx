import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { problemsAPI, adminAPI } from "../services/api";

function UniversityMatches() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvedIndex, setApprovedIndex] = useState(null);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const fetchProblemData = async () => {
      setLoading(true);
      setError("");
      try {
        let prob = null;
        // First attempt Node backend
        const res = await problemsAPI.getProblemById(id);
        if (res.success && res.problem) {
          prob = res.problem;
        } else {
          // Direct AI engine fallback
          const aiRes = await problemsAPI.getAIProblemDetails(id);
          if (aiRes.success && aiRes.problem) {
            prob = aiRes.problem;
          }
        }

        if (prob) {
          setProblem(prob);
          if (prob.selected_university_index !== undefined && prob.selected_university_index !== null) {
            setApprovedIndex(prob.selected_university_index);
          }
        } else {
          setError("Problem not found");
        }
      } catch (err) {
        console.error("Fetch problem error:", err);
        setError("Failed to load university recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [id]);

  const handleSelectUniversity = async (idx) => {
    try {
      const res = await adminAPI.approveUniversity(id, idx);
      if (res.success) {
        setApprovedIndex(idx);
        setNotification(`✓ ${res.message || "University candidate approved!"}`);
        setTimeout(() => setNotification(""), 4000);
      }
    } catch (err) {
      alert("Failed to approve university: " + err.message);
    }
  };

  const universities =
    problem?.university_recommendations ||
    problem?.universityMatches ||
    [];

  const ai = problem?.ai_analysis || {};

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      {/* Navbar */}
      <header className="flex items-center justify-between border-b border-[#e5e3dc] bg-white px-5 py-4 sm:px-8 lg:px-16">
        <Link to="/" className="text-2xl font-extrabold text-[#183153]">
          Setu<span className="text-[#3c8d87]">X</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to={`/problem/${id}`}
            className="text-sm font-semibold text-[#6d7780] hover:text-[#183153]"
          >
            ← Problem Details
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-16">
        {notification && (
          <div className="mb-6 rounded-xl border border-green-300 bg-green-50 p-4 text-sm font-bold text-green-800 shadow-sm">
            {notification}
          </div>
        )}

        {/* Heading */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
            Academic Matcher (OpenAlex RAG)
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#183153]">
            University Recommendations
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d7780]">
            Dynamically discovered and scored Indian Higher Education Institutions (HEIs) retrieved via OpenAlex bibliometrics.
          </p>
        </div>

        {/* AI Summary */}
        {ai.summary && (
          <div className="mt-7 rounded-2xl border border-[#dce8e5] bg-[#edf3f1] p-5 sm:p-6">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#183153] text-lg text-white">
                🤖
              </div>

              <div>
                <h2 className="font-bold text-[#183153]">
                  AI Problem Domain: {ai.category || "Societal Challenge"}
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#4f6265]">
                  {ai.summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mt-10 rounded-2xl border border-[#e5e3dc] bg-white p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#3c8d87] border-t-transparent"></div>
            <p className="mt-4 text-sm font-semibold text-[#6d7780]">
              Loading OpenAlex Academic Roster...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-700">{error}</p>
          </div>
        )}

        {/* Universities List */}
        {!loading && !error && (
          <div className="mt-8 space-y-5">
            {universities.length > 0 ? (
              universities.map((university, index) => {
                const isApproved = approvedIndex === index;
                const score = university.match_score || university.score || 90;

                return (
                  <div
                    key={university.name || index}
                    className={`rounded-2xl border p-5 transition sm:p-7 ${
                      isApproved
                        ? "border-[#3c8d87] bg-white ring-2 ring-[#3c8d87]/20 shadow-sm"
                        : "border-[#e5e3dc] bg-white hover:border-[#3c8d87] hover:shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      {/* University info */}
                      <div className="flex gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f1f3ef] text-xl font-bold text-[#3c8d87]">
                          #{index + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-[#183153]">
                              {university.name}
                            </h2>
                            {isApproved && (
                              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
                                Selected Candidate
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-[#7b858d]">
                            📍 {university.location || university.country || "India"}
                            {university.official_website && (
                              <>
                                {" • "}
                                <a
                                  href={university.official_website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#3c8d87] hover:underline font-semibold"
                                >
                                  Visit Website ↗
                                </a>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Match percentage */}
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-[#e8e9e4]">
                          <div
                            className="h-full rounded-full bg-[#3c8d87]"
                            style={{
                              width: `${score}%`,
                            }}
                          />
                        </div>

                        <span className="text-lg font-extrabold text-[#3c8d87]">
                          {score}%
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-6 grid gap-4 border-t border-[#e8e3dc] pt-5 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#89918a]">
                          Relevant Publications & Works
                        </p>

                        <p className="mt-2 text-sm font-semibold leading-6 text-[#35414c]">
                          {university.relevant_papers
                            ? `${university.relevant_papers} relevant research papers indexed on OpenAlex`
                            : university.reason || "High research volume & publication history"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#89918a]">
                          Matched Research Query
                        </p>

                        <p className="mt-2 text-xs font-mono text-[#3c8d87]">
                          "{university.matched_query || "Sustainable Engineering Solutions"}"
                        </p>
                      </div>
                    </div>

                    {/* Admin action */}
                    <div className="mt-5 flex flex-col gap-3 border-t border-[#e5e3dc] pt-5 sm:flex-row sm:justify-end">
                      {university.official_website && (
                        <a
                          href={university.official_website}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-[#d8d9d4] px-5 py-2.5 text-center text-sm font-bold text-[#5e6871] hover:bg-[#f5f5f0]"
                        >
                          View Official Site ↗
                        </a>
                      )}

                      <button
                        onClick={() => handleSelectUniversity(index)}
                        className={`rounded-lg px-5 py-2.5 text-sm font-bold text-white transition ${
                          isApproved
                            ? "bg-green-700 hover:bg-green-800"
                            : "bg-[#183153] hover:bg-[#102945]"
                        }`}
                      >
                        {isApproved ? "✓ Selected for Outreach" : "Select University"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-[#e5e3dc] bg-white p-8 text-center text-sm text-[#89918a]">
                No university recommendations found for this problem.
              </div>
            )}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-7 rounded-xl border border-[#e5e3dc] bg-white p-5 text-center">
          <p className="text-xs leading-5 text-[#89918a]">
            University recommendations are synthesized by the SetuX OpenAlex RAG pipeline and verified by administrators before email outreach.
          </p>
        </div>
      </main>
    </div>
  );
}

export default UniversityMatches;