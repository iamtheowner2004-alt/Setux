function HowItWorks() {

  const steps = [
    {
      number: "01",
      title: "Report",
      text: "Citizens submit a real societal problem with description, images, videos and location."
    },
    {
      number: "02",
      title: "Understand",
      text: "SetuX AI analyzes the submitted information and identifies the relevant problem domain."
    },
    {
      number: "03",
      title: "Review",
      text: "An administrator validates the problem before it is forwarded to any institution."
    },
    {
      number: "04",
      title: "Match",
      text: "The AI identifies universities with relevant research expertise and capabilities."
    },
    {
      number: "05",
      title: "Collaborate",
      text: "Universities and industry partners work together to develop and deploy a solution."
    }
  ];

  return (
    <section
      id="how-it-works"
      className="border-t border-[#e5e3dc] bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-20"
    >

      <div className="mx-auto mb-12 max-w-2xl text-center">

        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[1.5px] text-[#3c8d87]">
          How SetuX Works
        </div>

        <h2 className="text-3xl font-extrabold tracking-[-1.5px] text-[#183153] sm:text-4xl">

          One problem.
          <br />

          <span className="text-[#3c8d87]">
            Many possibilities.
          </span>

        </h2>

      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

        {steps.map((step) => (

          <div
            key={step.number}
            className="rounded-xl border border-[#e5e3dc] bg-white p-5 transition hover:-translate-y-1 hover:shadow-[0_10px_35px_rgba(35,48,58,0.08)]"
          >

            <span className="text-[11px] font-extrabold text-[#89918a]">
              {step.number}
            </span>

            <h3 className="mt-6 text-lg font-bold text-[#183153]">
              {step.title}
            </h3>

            <p className="mt-2 text-xs leading-6 text-[#6d7780]">
              {step.text}
            </p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default HowItWorks;