import { useState, useEffect } from "react";
import { 
  Calendar, Clock, Dumbbell, CreditCard, 
  ArrowRight, User, ChevronRight, Activity, Plus, X,
  Flame, Heart, Swords, Music, Users
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { bookingsAPI, membershipAPI } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Booking {
  _id: string;
  type: string;
  className?: string;
  trainerName?: string;
  date: string;
  timeSlot?: string;
  time?: string;
  status: string;
  trainer?: {
    name?: string;
  } | string;
}

interface Membership {
  plan: string;
  endDate: string;
  status: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: profile?.role || 'user'
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  // Class data mapping - each class has its designated trainer
  const classData: Record<string, { icon: any; color: string; trainer: string }> = {
    "Weight Training": { icon: Dumbbell, color: "from-red-500 to-orange-500", trainer: "Marcus Johnson" },
    "Yoga": { icon: Heart, color: "from-purple-500 to-pink-500", trainer: "Elena Santos" },
    "CrossFit": { icon: Flame, color: "from-orange-500 to-yellow-500", trainer: "Jake Morrison" },
    "Personal Training": { icon: Users, color: "from-blue-500 to-cyan-500", trainer: "" },
    "Cardio Zone": { icon: Activity, color: "from-green-500 to-emerald-500", trainer: "" },
    "MMA & Combat": { icon: Swords, color: "from-red-600 to-red-500", trainer: "Alex Chen" },
    "Zumba": { icon: Music, color: "from-pink-500 to-rose-500", trainer: "Sofia Rodriguez" },
    "class": { icon: Dumbbell, color: "from-red-500 to-orange-500", trainer: "" },
    "personal_training": { icon: Users, color: "from-blue-500 to-cyan-500", trainer: "" },
    "visit": { icon: Activity, color: "from-green-500 to-emerald-500", trainer: "" },
  };

  // Map booking type to display name
  const getDisplayName = (booking: Booking) => {
    if (booking.className) return booking.className;
    switch (booking.type) {
      case 'personal_training': return 'Personal Training';
      case 'class': return 'Gym Class';
      case 'visit': return 'Gym Visit';
      default: return booking.type;
    }
  };

  const getClassInfo = (booking: Booking) => {
    const name = booking.className || booking.type;
    return classData[name] || { icon: Dumbbell, color: "from-red-600/10 to-red-600/10", trainer: "TBA" };
  };

  const getTrainerName = (booking: Booking, classInfo: { trainer: string }): string | null => {
    // For personal training, show the trainer name booked with
    if (booking.type === 'personal_training') {
      if (booking.trainerName) return booking.trainerName;
      if (booking.trainer) {
        if (typeof booking.trainer === 'object' && booking.trainer.name) {
          return booking.trainer.name;
        }
        if (typeof booking.trainer === 'string') return booking.trainer;
      }
      return null;
    }
    
    // For gym visit/cardio zone - no trainer
    if (booking.type === 'visit' || booking.className === 'Cardio Zone') {
      return null;
    }
    
    // For classes, show the class trainer from our mapping
    if (classInfo.trainer) {
      return classInfo.trainer;
    }
    
    return null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user's bookings
        const bookingsData = await bookingsAPI.getMyBookings();
        // Filter out cancelled bookings and show all
        const activeBookings = bookingsData.filter((b: Booking) => b.status !== 'cancelled');
        setBookings(activeBookings);
      } catch (error) {
        console.log("No bookings found");
        setBookings([]);
      }

      try {
        // Fetch membership status
        const membershipData = await membershipAPI.getStatus();
        if (membershipData.active) {
          setMembership(membershipData.membership);
        }
      } catch (error) {
        console.log("No active membership");
      }

      setLoading(false);
    };

    fetchData();
  }, [location.key]);

  const quickActions = [
    { name: "Book a Session", icon: Calendar, path: "/booking", color: "bg-blue-500" },
    { name: "View Classes", icon: Dumbbell, path: "/classes", color: "bg-green-500" },
    { name: "Our Trainers", icon: User, path: "/trainers", color: "bg-purple-500" },
    { name: "Membership", icon: CreditCard, path: "/membership", color: "bg-red-600" },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleCancelBooking = async (bookingId: string, className: string) => {
    try {
      await bookingsAPI.cancel(bookingId);
      setBookings(bookings.filter(b => b._id !== bookingId));
      toast({
        title: "Booking Cancelled",
        description: `Your ${className} session has been cancelled.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="mb-10">
            <h1 className="font-display text-4xl sm:text-5xl mb-2">
              {getGreeting()}, <span className="text-red-600">{user?.name?.split(' ')[0] || 'Athlete'}!</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Ready to crush your fitness goals today?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Section - Membership & Motivation */}
            <div className="space-y-6">
              {/* Membership Status */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl">MEMBERSHIP</h2>
                  <CreditCard className="w-5 h-5 text-red-600" />
                </div>
                
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-secondary rounded w-3/4"></div>
                    <div className="h-4 bg-secondary rounded w-1/2"></div>
                  </div>
                ) : membership ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-500 font-medium">Active</span>
                    </div>
                    <p className="text-2xl font-display text-red-600 capitalize mb-1">{membership.plan}</p>
                    <p className="text-sm text-muted-foreground">
                      Valid until: {format(new Date(membership.endDate), "PPP")}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      <span className="text-yellow-500 font-medium">No Active Plan</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get started with a membership to unlock all features.
                    </p>
                    <Link to="/membership">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        View Plans <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Motivational Banner */}
              <div className="glass-card rounded-xl p-8 bg-gradient-to-r from-red-600/10 to-transparent border-red-600/30">
                <h3 className="font-display text-2xl mb-2">
                  KEEP PUSHING YOUR <span className="text-red-600">LIMITS!</span>
                </h3>
                <p className="text-muted-foreground">
                  Consistency is key. Stay on track with your fitness journey.
                </p>
              </div>
            </div>

            {/* Right Section - Upcoming Bookings */}
            <div className="lg:col-span-2 glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl">YOUR BOOKINGS</h2>
                <Link to="/classes" className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors" title="Book New Session">
                  <Plus className="w-5 h-5 text-white" />
                </Link>
              </div>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-secondary/50">
                      <div className="w-12 h-12 rounded-lg bg-secondary"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-1/2"></div>
                        <div className="h-3 bg-secondary rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                <div className="scrollable-bookings space-y-3">
                  {bookings.map((booking) => {
                    const classInfo = getClassInfo(booking);
                    const ClassIcon = classInfo.icon;
                    const displayName = getDisplayName(booking);
                    const trainerName = getTrainerName(booking, classInfo);
                    const timeDisplay = booking.timeSlot || booking.time || 'TBA';
                    return (
                      <div key={booking._id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors relative">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${classInfo.color} flex items-center justify-center shrink-0`}>
                          <ClassIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-lg">{displayName}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap bg-green-500/20 text-green-500 capitalize">
                              {booking.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(booking.date), "MMM d, yyyy")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeDisplay}
                            </span>
                            {trainerName && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {trainerName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-600/10"
                            onClick={() => handleCancelBooking(booking._id, displayName)}
                            title="Cancel booking"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No bookings yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
