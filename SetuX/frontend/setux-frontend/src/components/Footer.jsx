import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-[#e5e3dc] bg-white px-5 py-7 text-xs text-[#8a918f]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row">
        <p>© 2026 SetuX — Connecting societal challenges with innovation.</p>
        <div className="flex items-center gap-4">
          <Link to="/" className="transition hover:text-[#183153]">
            Home
          </Link>
          <Link to="/dashboard" className="transition hover:text-[#183153]">
            Citizen Dashboard
          </Link>
          <Link
            to="/admin/login"
            className="font-bold text-[#3c8d87] transition hover:underline"
          >
            🔒 Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;