import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ClassesSection from "@/components/ClassesSection";
import MembershipSection from "@/components/MembershipSection";
import TrainersSection from "@/components/TrainersSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Dashboard from "@/pages/Dashboard";
import { authAPI } from "@/lib/api";

const Index = () => {
  const isLoggedIn = authAPI.isAuthenticated();

  // Show Dashboard for logged-in users
  if (isLoggedIn) {
    return <Dashboard />;
  }

  // Show landing page for guests
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ClassesSection />
      <MembershipSection />
      <TrainersSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
