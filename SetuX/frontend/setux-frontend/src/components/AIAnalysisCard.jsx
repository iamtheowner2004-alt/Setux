function AIAnalysisCard() {
  return (
    <div className="relative w-full max-w-[460px] rounded-2xl border border-[#e2e8e5] bg-white p-6 shadow-[0_12px_40px_rgba(15,81,50,0.06)]">

      {/* Header */}
      <div className="mb-5 flex items-center gap-2 text-sm font-bold text-[#112a24]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] animate-pulse"></span>
        SetuX AI Analysis
      </div>

      {/* Problem */}
      <div className="mb-5 rounded-xl border border-[#e2e8e5] bg-[#f8faf8] p-4 text-xs leading-relaxed text-[#52635d]">
        "Farmers in our village are facing
        difficulty accessing irrigation water..."
      </div>

      {/* AI understanding */}
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-[#62736c]">
          Understanding problem
        </span>

        <strong className="text-[#112a24]">
          94%
        </strong>
      </div>

      {/* Progress */}
      <div className="h-2 overflow-hidden rounded-full bg-[#e8ecea]">
        <div className="h-full w-[94%] rounded-full bg-[#059669]"></div>
      </div>

      {/* Categories */}
      <div className="my-5 flex flex-wrap gap-2">

        <span className="rounded-lg border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-1 text-[11px] font-bold text-[#065f46]">
          Agriculture
        </span>

        <span className="rounded-lg border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-1 text-[11px] font-bold text-[#065f46]">
          Water Management
        </span>

        <span className="rounded-lg border border-[#a7f3d0] bg-[#ecfdf5] px-3 py-1 text-[11px] font-bold text-[#065f46]">
          Rural Development
        </span>

      </div>

      {/* University Match */}
      <div className="grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-xl border border-[#e2e8e5] bg-[#f8faf8] p-3.5">

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ecfdf5] text-xl">
          🎓
        </div>

        <div>
          <b className="block text-xs font-bold text-[#112a24]">
            University Match
          </b>

          <small className="text-[11px] text-[#62736c]">
            Research expertise found
          </small>
        </div>

        <strong className="text-sm font-bold text-[#059669]">
          92%
        </strong>

      </div>

    </div>
  );
}

export default AIAnalysisCard;