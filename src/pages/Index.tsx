import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ClassesSection from "@/components/ClassesSection";
import MembershipSection from "@/components/MembershipSection";
import TrainersSection from "@/components/TrainersSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Dashboard from "@/pages/Dashboard";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Show loading while checking auth
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

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
