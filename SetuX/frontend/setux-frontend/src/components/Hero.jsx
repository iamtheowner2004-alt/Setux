import { Link, useNavigate } from "react-router-dom";
import AIAnalysisCard from "./AIAnalysisCard";

function Hero() {
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
    <section className="grid min-h-[calc(100vh-72px)] grid-cols-1 items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:px-20 lg:py-20">

      {/* Left */}
      <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">

        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[1.5px] text-[#059669]">
          Societal Innovation Platform
        </div>

        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-2px] text-[#112a24] sm:text-5xl lg:text-6xl">

          From local problems
          <br />

          to{" "}

          <span className="text-[#059669]">
            real solutions.
          </span>

        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#52635d] sm:text-base lg:mx-0">

          SetuX connects citizens, universities and
          industries to transform real-world societal
          challenges into research, innovation and
          deployable solutions.

        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
          <button
            onClick={handleReportProblemClick}
            className="rounded-xl bg-[#0f5132] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0b3d26]"
          >
            + Report a Problem
          </button>

          <Link
            to="/login"
            className="rounded-xl border border-[#d1dbd5] bg-white px-5 py-3.5 text-sm font-semibold text-[#112a24] shadow-sm transition hover:bg-[#f2f6f4]"
          >
            👥 Citizen Login
          </Link>

          <Link
            to="/admin/login"
            className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] px-5 py-3.5 text-sm font-bold text-[#065f46] transition hover:bg-[#d1fae5]"
          >
            🔒 Admin Portal
          </Link>
        </div>

        {/* Trust */}
        <div className="mt-12 grid grid-cols-1 gap-5 text-left sm:grid-cols-3">

          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecfdf5] text-xs font-extrabold text-[#059669]">
              01
            </span>

            <div>
              <strong className="block text-sm font-bold text-[#112a24]">
                Citizens
              </strong>

              <small className="text-xs text-[#62736c]">
                Share real problems
              </small>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecfdf5] text-xs font-extrabold text-[#059669]">
              02
            </span>

            <div>
              <strong className="block text-sm font-bold text-[#112a24]">
                AI Agents
              </strong>

              <small className="text-xs text-[#62736c]">
                Understands & matches
              </small>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ecfdf5] text-xs font-extrabold text-[#059669]">
              03
            </span>

            <div>
              <strong className="block text-sm font-bold text-[#112a24]">
                Institutions
              </strong>

              <small className="text-xs text-[#62736c]">
                Build solutions
              </small>
            </div>
          </div>

        </div>

      </div>

      {/* Right */}
      <div className="relative flex min-h-[350px] items-center justify-center">

        {/* Background soft ambient green circles */}
        <div className="absolute h-64 w-64 rounded-full bg-[#dcfce7]/60 blur-2xl sm:h-80 sm:w-80"></div>

        <div className="absolute bottom-2 left-8 h-36 w-36 rounded-full bg-[#ecfdf5]/80 blur-xl sm:h-52 sm:w-52"></div>

        <AIAnalysisCard />

      </div>

    </section>
  );
}

export default Hero;