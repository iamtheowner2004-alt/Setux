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
      className="border-t border-[#e2e8e5] bg-white px-5 py-16 sm:px-8 lg:px-20 lg:py-20"
    >

      <div className="mx-auto mb-12 max-w-2xl text-center">

        <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[1.5px] text-[#059669]">
          How SetuX Works
        </div>

        <h2 className="text-3xl font-extrabold tracking-[-1.5px] text-[#112a24] sm:text-4xl">

          One problem.
          <br />

          <span className="text-[#059669]">
            Many possibilities.
          </span>

        </h2>

      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

        {steps.map((step) => (

          <div
            key={step.number}
            className="group rounded-2xl border border-[#e2e8e5] bg-[#fbfdfc] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#a7f3d0] hover:bg-white hover:shadow-[0_12px_35px_rgba(5,150,105,0.06)]"
          >

            <span className="inline-block rounded-md border border-[#a7f3d0] bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-extrabold text-[#065f46]">
              {step.number}
            </span>

            <h3 className="mt-5 text-base font-bold text-[#112a24]">
              {step.title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-[#52635d]">
              {step.text}
            </p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default HowItWorks;