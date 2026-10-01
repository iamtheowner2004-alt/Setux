import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="flex min-h-[72px] items-center justify-between border-b border-[#e5e3dc] bg-[#fbfaf6] px-5 sm:px-8 lg:px-20">
      {/* Logo */}
      <Link
        to="/"
        className="text-[30px] font-bold tracking-[-1.5px] text-[#183153]"
      >
        Setu<span className="text-[#3c8d87]">X</span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-3 text-sm font-semibold text-[#5e6871] sm:gap-6">
        <Link
          to="/"
          className="hidden transition hover:text-[#183153] sm:block"
        >
          Home
        </Link>

        <Link
          to="/login"
          className="hidden transition hover:text-[#183153] sm:block"
        >
          Login
        </Link>

        <Link
          to="/admin/login"
          className="rounded-md border border-[#3c8d87]/30 bg-[#edf6f4] px-3 py-1.5 text-xs font-bold text-[#3c8d87] transition hover:bg-[#dcefe9]"
        >
          🔒 Admin
        </Link>

        <Link
          to="/signup"
          className="rounded-md bg-[#183153] px-4 py-2.5 text-xs text-white transition hover:bg-[#102945] sm:text-sm"
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;