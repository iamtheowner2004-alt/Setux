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

        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[1.5px] text-[#3c8d87]">
          Societal Innovation Platform
        </div>

        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-2px] text-[#183153] sm:text-5xl lg:text-6xl">

          From local problems
          <br />

          to{" "}

          <span className="text-[#3c8d87]">
            real solutions.
          </span>

        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#6d7780] sm:text-base lg:mx-0">

          SetuX connects citizens, universities and
          industries to transform real-world societal
          challenges into research, innovation and
          deployable solutions.

        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
          <button
            onClick={handleReportProblemClick}
            className="rounded-lg bg-[#183153] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#102945]"
          >
            + Report a Problem
          </button>

          <Link
            to="/login"
            className="rounded-lg border border-[#d8d9d4] bg-white px-5 py-3 text-sm font-bold text-[#183153] transition hover:bg-[#f5f5f0]"
          >
            👥 Citizen Login
          </Link>

          <Link
            to="/admin/login"
            className="rounded-lg border border-[#3c8d87]/30 bg-[#edf6f4] px-5 py-3 text-sm font-bold text-[#3c8d87] transition hover:bg-[#dcefe9]"
          >
            🔒 Admin Portal
          </Link>
        </div>

        {/* Trust */}
        <div className="mt-10 grid grid-cols-1 gap-5 text-left sm:grid-cols-3">

          <div className="flex items-center gap-3">
            <b className="text-lg text-[#3c8d87]">01</b>

            <div>
              <strong className="block text-sm text-[#183153]">
                Citizens
              </strong>

              <small className="text-xs text-[#737c84]">
                Share real problems
              </small>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <b className="text-lg text-[#3c8d87]">02</b>

            <div>
              <strong className="block text-sm text-[#183153]">
                AI
              </strong>

              <small className="text-xs text-[#737c84]">
                Understands & matches
              </small>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <b className="text-lg text-[#3c8d87]">03</b>

            <div>
              <strong className="block text-sm text-[#183153]">
                Institutions
              </strong>

              <small className="text-xs text-[#737c84]">
                Build solutions
              </small>
            </div>
          </div>

        </div>

      </div>

      {/* Right */}
      <div className="relative flex min-h-[350px] items-center justify-center">

        {/* Background circles */}
        <div className="absolute h-64 w-64 rounded-full bg-[#e9eeea] sm:h-80 sm:w-80"></div>

        <div className="absolute bottom-2 left-8 h-36 w-36 rounded-full bg-[#e7efee] sm:h-52 sm:w-52"></div>

        <AIAnalysisCard />

      </div>

    </section>
  );
}

export default Hero;