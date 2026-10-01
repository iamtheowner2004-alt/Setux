import { useState } from "react";

function TutorialModal({ onClose }) {
  const [language, setLanguage] = useState(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#183153]/60 px-4">

      <div className="relative w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl sm:p-9">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f3ef] text-lg text-[#5e6871] hover:bg-[#e5e7e2]"
        >
          ×
        </button>

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf3f1] text-2xl">
          🎥
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold tracking-tight text-[#183153] sm:text-3xl">
          Welcome to SetuX
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#6d7780]">
          New to SetuX? Learn how to create an account
          and report a problem.
        </p>

        {/* Language buttons */}
        <div className="mt-7 grid gap-3">

          <a
            href="YOUR_HINDI_YOUTUBE_LINK"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-[#183153] px-5 py-3 font-semibold text-white transition hover:bg-[#102945]"
          >
            🇮🇳 हिंदी में देखें
          </a>

          <a
            href="YOUR_ENGLISH_YOUTUBE_LINK"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[#d8d9d4] bg-white px-5 py-3 font-semibold text-[#183153] transition hover:bg-[#f5f5f0]"
          >
            🇬🇧 Watch in English
          </a>

        </div>

        {/* Skip */}
        <button
          onClick={onClose}
          className="mt-4 border-0 bg-transparent text-sm font-semibold text-[#747d84] hover:text-[#183153]"
        >
          Skip
        </button>

      </div>

    </div>
  );
}

export default TutorialModal;