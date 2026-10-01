import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex min-h-[72px] items-center justify-between border-b border-[#e2e8e5] bg-[#f8faf8]/90 px-5 backdrop-blur-md sm:px-8 lg:px-20">
      {/* Logo */}
      <Link
        to="/"
        className="text-[28px] font-extrabold tracking-[-1.5px] text-[#112a24] transition hover:opacity-90"
      >
        Setu<span className="text-[#059669]">X</span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-3 text-sm font-medium text-[#52635d] sm:gap-6">
        <Link
          to="/"
          className="hidden transition hover:text-[#059669] sm:block"
        >
          Home
        </Link>

        <Link
          to="/login"
          className="hidden transition hover:text-[#059669] sm:block"
        >
          Login
        </Link>

        <Link
          to="/admin/login"
          className="rounded-lg border border-[#a7f3d0] bg-[#ecfdf5] px-3.5 py-1.5 text-xs font-bold text-[#065f46] transition hover:bg-[#d1fae5]"
        >
          🔒 Admin
        </Link>

        <Link
          to="/signup"
          className="rounded-lg bg-[#0f5132] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0b3d26] sm:text-sm"
        >
          Get Started
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;