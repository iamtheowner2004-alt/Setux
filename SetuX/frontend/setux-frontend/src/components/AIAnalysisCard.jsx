function AIAnalysisCard() {
  return (
    <div className="relative w-full max-w-[460px] rounded-2xl border border-[#e5e3dc] bg-white p-5 sm:p-6 shadow-[0_10px_35px_rgba(35,48,58,0.08)]">

      {/* Header */}
      <div className="mb-5 flex items-center gap-2 font-bold text-[#183153]">
        <span className="h-2 w-2 rounded-full bg-[#5d9c75]"></span>

        SetuX AI Analysis
      </div>

      {/* Problem */}
      <div className="mb-5 rounded-lg bg-[#f5f5f1] p-4 text-sm leading-6 text-[#626d76]">
        "Farmers in our village are facing
        difficulty accessing irrigation water..."
      </div>

      {/* AI understanding */}
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-[#69737b]">
          Understanding problem
        </span>

        <strong className="text-[#183153]">
          94%
        </strong>
      </div>

      {/* Progress */}
      <div className="h-1.5 overflow-hidden rounded-full bg-[#e8e9e4]">
        <div className="h-full w-[94%] rounded-full bg-[#3c8d87]"></div>
      </div>

      {/* Categories */}
      <div className="my-5 flex flex-wrap gap-2">

        <span className="rounded-md bg-[#edf3f1] px-2.5 py-1.5 text-[11px] font-bold text-[#3f706d]">
          Agriculture
        </span>

        <span className="rounded-md bg-[#edf3f1] px-2.5 py-1.5 text-[11px] font-bold text-[#3f706d]">
          Water Management
        </span>

        <span className="rounded-md bg-[#edf3f1] px-2.5 py-1.5 text-[11px] font-bold text-[#3f706d]">
          Rural Development
        </span>

      </div>

      {/* University Match */}
      <div className="grid grid-cols-[38px_1fr_auto] items-center gap-3 rounded-lg border border-[#e5e3dc] p-3">

        <div className="text-2xl">
          🎓
        </div>

        <div>
          <b className="block text-sm text-[#183153]">
            University Match
          </b>

          <small className="text-xs text-[#7b858d]">
            Research expertise found
          </small>
        </div>

        <strong className="text-sm text-[#4e8a68]">
          92%
        </strong>

      </div>

    </div>
  );
}

export default AIAnalysisCard;