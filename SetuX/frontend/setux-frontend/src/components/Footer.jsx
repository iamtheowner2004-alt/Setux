import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-[#e2e8e5] bg-white px-5 py-8 text-xs text-[#62736c]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center sm:flex-row">
        <p>© 2026 SetuX — Connecting societal challenges with innovation.</p>
        <div className="flex items-center gap-5">
          <Link to="/" className="transition hover:text-[#059669]">
            Home
          </Link>
          <Link to="/dashboard" className="transition hover:text-[#059669]">
            Citizen Dashboard
          </Link>
          <Link
            to="/admin/login"
            className="font-bold text-[#059669] transition hover:text-[#047857] hover:underline"
          >
            🔒 Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;