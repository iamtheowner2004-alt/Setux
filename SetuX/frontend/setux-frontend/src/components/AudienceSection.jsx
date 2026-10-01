function AudienceSection() {

  const users = [
    {
      icon: "👥",
      title: "Citizens",
      text: "Report challenges from their communities."
    },
    {
      icon: "🎓",
      title: "Universities",
      text: "Research and develop solutions."
    },
    {
      icon: "🏭",
      title: "Industry",
      text: "Provide technology, funding and implementation."
    },
    {
      icon: "🏛️",
      title: "Government",
      text: "Monitor challenges and social impact."
    }
  ];

  return (
    <section className="border-t border-[#e2e8e5] bg-[#f8faf8] px-5 py-16 sm:px-8 lg:px-20">

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-[#e2e8e5] bg-[#e2e8e5] sm:grid-cols-2 lg:grid-cols-4">

        {users.map((user) => (

          <div
            key={user.title}
            className="bg-white p-7 transition duration-150 hover:bg-[#fbfdfc] sm:p-8"
          >

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ecfdf5] text-2xl">
              {user.icon}
            </div>

            <b className="block text-base font-bold text-[#112a24]">
              {user.title}
            </b>

            <small className="mt-1.5 block text-xs leading-5 text-[#52635d]">
              {user.text}
            </small>

          </div>

        ))}

      </div>

    </section>
  );
}

export default AudienceSection;