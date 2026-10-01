import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PortalAccessSection from "../components/PortalAccessSection";
import HowItWorks from "../components/HowItWorks";
import AudienceSection from "../components/AudienceSection";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <Navbar />

      <main>
        <Hero />

        {/* Direct Portal Access Hub */}
        <PortalAccessSection />

        <HowItWorks />

        <AudienceSection />
      </main>

      <Footer />
    </div>
  );
}

export default Home;