import { Instagram, Award, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingDialog from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { authAPI } from "@/lib/api";

const trainers = [
  {
    name: "Raj Sharma",
    specialty: "Strength & Conditioning",
    experience: "8+ years",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop",
    certifications: ["NSCA-CPT", "CrossFit L2"],
    bio: "Former national-level powerlifter with a passion for helping clients build strength and confidence.",
    rating: 4.9,
    clients: 200,
  },
  {
    name: "Priya Patel",
    specialty: "Yoga & Flexibility",
    experience: "10+ years",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop",
    certifications: ["RYT-500", "Yin Yoga", "Prenatal Yoga"],
    bio: "Certified yoga instructor specializing in Vinyasa and therapeutic yoga for all ages and abilities.",
    rating: 5.0,
    clients: 350,
  },
  {
    name: "Vikram Singh",
    specialty: "MMA & Combat Sports",
    experience: "12+ years",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop",
    certifications: ["MMA Pro", "Boxing Coach", "Krav Maga"],
    bio: "Professional MMA fighter turned coach, dedicated to teaching self-defense and combat sports.",
    rating: 4.8,
    clients: 150,
  },
  {
    name: "Ananya Desai",
    specialty: "Cardio & Zumba",
    experience: "6+ years",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop",
    certifications: ["ZIN", "AFAA", "Les Mills"],
    bio: "High-energy instructor who makes every workout feel like a party while delivering serious results.",
    rating: 4.9,
    clients: 280,
  },
  {
    name: "Arjun Mehta",
    specialty: "CrossFit & HIIT",
    experience: "7+ years",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop",
    certifications: ["CrossFit L3", "Kettlebell Specialist"],
    bio: "CrossFit Games competitor dedicated to pushing limits and achieving peak performance.",
    rating: 4.7,
    clients: 180,
  },
  {
    name: "Kavitha Rao",
    specialty: "Weight Loss & Nutrition",
    experience: "9+ years",
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop",
    certifications: ["ACE-CPT", "Nutrition Coach", "TRX"],
    bio: "Holistic fitness coach combining exercise science with nutrition for sustainable transformations.",
    rating: 4.9,
    clients: 320,
  },
];

const Trainers = () => {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const isLoggedIn = authAPI.isAuthenticated();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBookTrainer = (trainerName: string) => {
    if (!isLoggedIn) {
      window.location.href = "/login?redirect=/trainers";
      return;
    }
    setSelectedTrainer(trainerName);
    setBookingDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-12 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl mb-4">
              OUR <span className="neon-text">TRAINERS</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Meet our certified professionals dedicated to helping you achieve your fitness goals.
            </p>
          </div>

          {/* Trainers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainers.map((trainer) => (
              <div
                key={trainer.name}
                className="group glass-card rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500"
              >
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={trainer.image}
                    alt={trainer.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  
                  {/* Social */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Instagram size={18} />
                    </button>
                  </div>

                  {/* Rating */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{trainer.rating}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="font-display text-2xl mb-1 group-hover:text-primary transition-colors">
                    {trainer.name}
                  </h3>
                  <p className="text-primary text-sm font-medium mb-2">
                    {trainer.specialty}
                  </p>
                  <p className="text-muted-foreground text-sm mb-4">
                    {trainer.bio}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span>{trainer.experience}</span>
                    <span>•</span>
                    <span>{trainer.clients}+ clients</span>
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trainer.certifications.map((cert, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs text-muted-foreground"
                      >
                        <Award size={10} />
                        {cert}
                      </span>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleBookTrainer(trainer.name)}
                    variant="neonOutline" 
                    className="w-full"
                  >
                    Book Session
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BookingDialog 
        open={bookingDialogOpen} 
        onOpenChange={setBookingDialogOpen}
        trainer={selectedTrainer}
        defaultType="Trainer Session"
      />

      <Footer />
    </div>
  );
};

export default Trainers;
