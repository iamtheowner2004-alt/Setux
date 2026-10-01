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
    <section className="border-t border-[#e5e3dc] bg-white px-5 py-12 sm:px-8 lg:px-20">

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px overflow-hidden rounded-xl bg-[#e5e3dc] sm:grid-cols-2 lg:grid-cols-4">

        {users.map((user) => (

          <div
            key={user.title}
            className="bg-[#f7f7f3] p-6 sm:p-8"
          >

            <div className="mb-4 text-2xl">
              {user.icon}
            </div>

            <b className="block text-base text-[#183153]">
              {user.title}
            </b>

            <small className="mt-1 block text-xs leading-5 text-[#6d7780]">
              {user.text}
            </small>

          </div>

        ))}

      </div>

    </section>
  );
}

export default AudienceSection;