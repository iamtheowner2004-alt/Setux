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
    <section id="portals" className="border-t border-[#e2e8e5] bg-[#f4f7f5] px-5 py-16 sm:px-8 lg:px-20">
      <div className="mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-[1.5px] text-[#059669]">
            Direct Access Hub
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#112a24] sm:text-4xl">
            Choose Your SetuX Portal
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#52635d]">
            Seamlessly access the citizen civic problem submission portal or the autonomous AI administrative control center.
          </p>
        </div>

        {/* Portal Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 1. CITIZEN PORTAL CARD */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#e2e8e5] bg-white p-7 shadow-sm transition hover:shadow-md">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ecfdf5] text-2xl">
                  👥
                </div>
                <span className="rounded-full border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-1 text-xs font-bold text-[#065f46]">
                  Public Access
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#112a24]">
                Citizen & Community Portal
              </h3>

              <p className="mt-2 text-xs leading-6 text-[#52635d]">
                Submit localized societal problems, upload geo-tagged evidence, track real-time 5-stage AI lifecycle progress, and discover matched Indian universities.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-[#35414c]">
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-[#059669]">✓</span> Post Civic & Environmental Issues
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-[#059669]">✓</span> Track Gemini NLP & Severity Scores
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-[#059669]">✓</span> View OpenAlex Ranked University Roster
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#f0f4f2] pt-5">
              <Link
                to="/login"
                className="flex-1 rounded-xl bg-[#0f5132] px-4 py-3 text-center text-xs font-bold text-white shadow-sm transition hover:bg-[#0b3d26]"
              >
                Citizen Login →
              </Link>
              <Link
                to="/dashboard"
                className="rounded-xl border border-[#d1dbd5] bg-white px-4 py-3 text-xs font-bold text-[#112a24] transition hover:bg-[#f2f6f4]"
              >
                My Dashboard
              </Link>
              <button
                onClick={handleReportProblemClick}
                className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3 text-xs font-bold text-[#065f46] transition hover:bg-[#d1fae5]"
              >
                + Report
              </button>
            </div>
          </div>

          {/* 2. ADMIN PORTAL CARD */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#a7f3d0]/60 bg-white p-7 shadow-sm transition hover:shadow-md ring-1 ring-[#059669]/10">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ecfdf5] text-2xl">
                  🔒
                </div>
                <span className="rounded-full border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-1 text-xs font-bold text-[#065f46]">
                  Authorized Admin Only
                </span>
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#112a24]">
                Admin Multi-Agent Control Center
              </h3>

              <p className="mt-2 text-xs leading-6 text-[#52635d]">
                Human-in-the-Loop management for academic candidate selection, automated outreach email dispatch, DuckDuckGo industry commercialization, and government escalation.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-[#35414c]">
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-[#059669]">✓</span> Approve Higher Education Institutions (HEIs)
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-[#059669]">✓</span> Dispatch Formal Outreach Emails via SMTP
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="text-[#059669]">✓</span> Real-Time Indian Industry Search & Policy Escalation
                </li>
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[#f0f4f2] pt-5">
              <Link
                to="/admin/login"
                className="flex-1 rounded-xl bg-[#112a24] px-4 py-3 text-center text-xs font-bold text-white shadow-sm transition hover:bg-[#0a1c18]"
              >
                🔒 Admin Login Portal →
              </Link>
              <Link
                to="/admin"
                className="rounded-xl border border-[#112a24] bg-white px-4 py-3 text-xs font-bold text-[#112a24] transition hover:bg-[#f2f6f4]"
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
