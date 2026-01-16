import { Dumbbell, Activity, Flame, Users, Heart, Swords, Music, Clock, Calendar, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingDialog from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authAPI } from "@/lib/api";

const classes = [
  {
    name: "Weight Training",
    description: "Build strength and muscle mass with our comprehensive weight training program. Access to free weights, machines, and expert guidance.",
    icon: Dumbbell,
    color: "from-red-500 to-orange-500",
    schedule: "Mon, Wed, Fri - 6AM to 10PM",
    duration: "60-90 mins",
    level: "All Levels",
    trainer: "Marcus Johnson",
    experience: "12 years",
  },
  {
    name: "Yoga",
    description: "Find balance, flexibility, and inner peace through various yoga styles including Hatha, Vinyasa, and Power Yoga.",
    icon: Heart,
    color: "from-purple-500 to-pink-500",
    schedule: "Daily - 7AM, 5PM",
    duration: "60 mins",
    level: "All Levels",
    trainer: "Elena Santos",
    experience: "8 years",
  },
  {
    name: "CrossFit",
    description: "High-intensity functional training that combines weightlifting, cardio, and bodyweight exercises for total fitness.",
    icon: Flame,
    color: "from-orange-500 to-yellow-500",
    schedule: "Mon-Sat - 6AM, 7PM",
    duration: "45 mins",
    level: "Intermediate+",
    trainer: "Jake Morrison",
    experience: "10 years",
  },
  {
    name: "Personal Training",
    description: "One-on-one sessions with certified trainers who create customized programs tailored to your specific goals.",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    schedule: "By Appointment",
    duration: "60 mins",
    level: "All Levels",
    trainer: "Multiple Trainers",
    experience: "5-15 years",
  },
  {
    name: "Cardio Zone",
    description: "State-of-the-art cardio equipment including treadmills, ellipticals, bikes, and rowing machines.",
    icon: Activity,
    color: "from-green-500 to-emerald-500",
    schedule: "Open Hours",
    duration: "Flexible",
    level: "All Levels",
    trainer: "Self-guided",
    experience: "24/7 access",
  },
  {
    name: "MMA & Combat",
    description: "Learn mixed martial arts, boxing, and kickboxing from professional fighters and certified coaches.",
    icon: Swords,
    color: "from-red-600 to-red-500",
    schedule: "Tue, Thu, Sat - 8PM",
    duration: "90 mins",
    level: "All Levels",
    trainer: "Alex Chen",
    experience: "15 years",
  },
  {
    name: "Zumba",
    description: "Dance-fitness classes that combine Latin rhythms with easy-to-follow moves for a full-body workout.",
    icon: Music,
    color: "from-pink-500 to-rose-500",
    schedule: "Mon, Wed, Fri - 7PM",
    duration: "45 mins",
    level: "All Levels",
    trainer: "Sofia Rodriguez",
    experience: "7 years",
  },
];

const Classes = () => {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const isLoggedIn = authAPI.isAuthenticated();

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleBookClass = (className: string) => {
    if (!isLoggedIn) {
      window.location.href = "/login?redirect=/classes";
      return;
    }
    setSelectedClass(className);
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
              OUR <span className="neon-text">CLASSES</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From high-intensity workouts to mindful yoga sessions, we offer diverse programs to match every fitness goal.
            </p>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {classes.map((classItem, index) => (
              <div
                key={classItem.name}
                className="group glass-card rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-500 flex flex-col"
              >
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-start gap-6 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${classItem.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <classItem.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-3xl mb-2 group-hover:text-primary transition-colors">
                        {classItem.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 flex-1">
                    {classItem.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm mb-6">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={16} className="text-primary" />
                      {classItem.schedule}
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock size={16} className="text-primary" />
                      {classItem.duration}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                      {classItem.level}
                    </span>
                  </div>

                  {/* Trainer Info */}
                  <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-secondary/30">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {classItem.trainer.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{classItem.trainer}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Award size={12} className="text-primary" />
                        {classItem.experience} experience
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleBookClass(classItem.name)}
                    variant="neonOutline" 
                    className="w-full"
                  >
                    Book Now
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
        className={selectedClass}
        defaultType={selectedClass}
      />

      <Footer />
    </div>
  );
};

export default Classes;
