import { Link, useNavigate } from "react-router-dom";

function PortalAccessSection() {
  const navigate = useNavigate();

  const handleReportProblemClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/report-problem");
    } else {
      navigate("/login?redirect=/report-problem");
    }
  };

  return (
    <section id="portals" className="border-t border-[#e5e3dc] bg-[#f5f6f2] px-5 py-16 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-[1.5px] text-[#3c8d87]">
            Direct Access Hub
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#183153] sm:text-4xl">
            Choose Your SetuX Portal
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6d7780]">
            Seamlessly access the citizen civic problem submission portal or the autonomous AI administrative control center.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 1. CITIZEN PORTAL CARD */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e5e3dc] bg-white p-7 shadow-sm transition hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf6f4] text-2xl">
                  👥
                </div>
                <span className="rounded-full bg-[#edf6f4] px-3 py-1 text-xs font-bold text-[#3c8d87]">
                  Public Access
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#183153]">
                Citizen & Community Portal
              </h3>

              <p className="mt-2 text-xs leading-6 text-[#6d7780]">
                Submit localized societal problems, upload geo-tagged evidence, track real-time 5-stage AI lifecycle progress, and discover matched Indian universities.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-[#35414c]">
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-[#3c8d87]">✓</span> Post Civic & Environmental Issues
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-[#3c8d87]">✓</span> Track Gemini NLP & Severity Scores
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-[#3c8d87]">✓</span> View OpenAlex Ranked University Roster
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#eeeeea] pt-5">
              <Link
                to="/login"
                className="flex-1 rounded-lg bg-[#183153] px-4 py-3 text-center text-xs font-bold text-white transition hover:bg-[#102945]"
              >
                Citizen Login →
              </Link>
              <Link
                to="/dashboard"
                className="rounded-lg border border-[#d8d9d4] bg-white px-4 py-3 text-xs font-bold text-[#183153] transition hover:bg-[#f5f5f0]"
              >
                My Dashboard
              </Link>
              <button
                onClick={handleReportProblemClick}
                className="rounded-lg bg-[#3c8d87] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#2e6d68]"
              >
                + Report
              </button>
            </div>
          </div>

          {/* 2. ADMIN PORTAL CARD */}
          <div className="flex flex-col justify-between rounded-2xl border border-blue-200 bg-white p-7 shadow-sm transition hover:shadow-md ring-1 ring-blue-500/10">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  🔒
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                  Authorized Admin Only
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#183153]">
                Admin Multi-Agent Control Center
              </h3>

              <p className="mt-2 text-xs leading-6 text-[#6d7780]">
                Human-in-the-Loop management for academic candidate selection, automated outreach email dispatch, DuckDuckGo industry commercialization, and government escalation.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-[#35414c]">
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-blue-600">✓</span> Approve Higher Education Institutions (HEIs)
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-blue-600">✓</span> Dispatch Formal Outreach Emails via SMTP
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-blue-600">✓</span> Real-Time Indian Industry Search & Policy Escalation
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#eeeeea] pt-5">
              <Link
                to="/admin/login"
                className="flex-1 rounded-lg bg-[#183153] px-4 py-3 text-center text-xs font-bold text-white transition hover:bg-[#102945]"
              >
                🔒 Admin Login Portal →
              </Link>
              <Link
                to="/admin"
                className="rounded-lg border border-[#183153] bg-white px-4 py-3 text-xs font-bold text-[#183153] transition hover:bg-[#edf3f1]"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PortalAccessSection;
