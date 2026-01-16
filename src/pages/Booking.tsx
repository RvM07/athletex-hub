import { useState } from "react";
import { Calendar, Clock, User, Dumbbell, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { bookingsAPI, authAPI } from "@/lib/api";

const bookingTypes = [
  { id: "gym-visit", name: "Gym Visit", icon: Dumbbell, description: "Book a gym slot" },
  { id: "personal-training", name: "Personal Training", icon: User, description: "1-on-1 with trainer" },
  { id: "group-class", name: "Group Class", icon: Calendar, description: "Join a class session" },
];

const timeSlots = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"
];

const groupClasses = [
  { id: "yoga", name: "Morning Yoga", time: "7:00 AM", trainer: "Priya Patel" },
  { id: "crossfit", name: "CrossFit Blast", time: "6:00 PM", trainer: "Raj Sharma" },
  { id: "zumba", name: "Zumba Party", time: "7:00 PM", trainer: "Ananya Desai" },
  { id: "mma", name: "MMA Basics", time: "8:00 PM", trainer: "Vikram Singh" },
];

const trainers = [
  { id: "raj", name: "Raj Sharma", specialty: "Strength & Conditioning" },
  { id: "priya", name: "Priya Patel", specialty: "Yoga & Flexibility" },
  { id: "vikram", name: "Vikram Singh", specialty: "MMA & Combat Sports" },
  { id: "ananya", name: "Ananya Desai", specialty: "Cardio & Zumba" },
];

const Booking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookingType, setBookingType] = useState<string>("");
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [trainer, setTrainer] = useState<string>("");
  const [groupClass, setGroupClass] = useState<string>("");

  // Check if user is logged in
  const isLoggedIn = authAPI.isAuthenticated();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      toast({
        title: "🔒 Login Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
        className: "bg-yellow-600 text-white border-yellow-700",
      });
      navigate("/login");
      return;
    }

    setLoading(true);
    
    try {
      // Determine class name based on booking type
      let className = "";
      let time = timeSlot;
      
      if (bookingType === "gym-visit") {
        className = "Gym Visit";
      } else if (bookingType === "personal-training") {
        const selectedTrainer = trainers.find(t => t.id === trainer);
        className = `Personal Training with ${selectedTrainer?.name || "Trainer"}`;
      } else if (bookingType === "group-class") {
        const selectedClass = groupClasses.find(gc => gc.id === groupClass);
        className = selectedClass?.name || "Group Class";
        time = selectedClass?.time || timeSlot;
      }

      await bookingsAPI.create({
        className,
        date: date!.toISOString(),
        time,
      });
      
      toast({
        title: "✅ Booking Confirmed!",
        description: `🎉 Your ${className} has been booked for ${format(date!, "PPP")} at ${time}.`,
        className: "bg-green-600 text-white border-green-700",
      });
      
      // Reset form
      setBookingType("");
      setDate(undefined);
      setTimeSlot("");
      setTrainer("");
      setGroupClass("");
    } catch (error: any) {
      toast({
        title: "❌ Booking Failed",
        description: "😔 " + (error.message || "Please try again later."),
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-12 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl sm:text-6xl mb-4">
              BOOK YOUR <span className="neon-text">SESSION</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Reserve your spot for gym visits, personal training, or group classes.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Booking Type Selection */}
              <div className="space-y-4">
                <Label className="text-lg">Select Booking Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {bookingTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setBookingType(type.id)}
                      className={cn(
                        "p-6 rounded-xl glass-card text-left transition-all duration-300",
                        bookingType === type.id
                          ? "border-2 border-primary neon-border"
                          : "hover:border-primary/50"
                      )}
                    >
                      <type.icon className={cn(
                        "w-8 h-8 mb-3",
                        bookingType === type.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <h3 className="font-display text-xl mb-1">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4">
                <Label className="text-lg">Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-14 bg-secondary",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Conditional Fields based on Booking Type */}
              {bookingType === "gym-visit" && (
                <div className="space-y-4">
                  <Label className="text-lg">Select Time Slot</Label>
                  <Select onValueChange={setTimeSlot}>
                    <SelectTrigger className="h-14 bg-secondary">
                      <SelectValue placeholder="Choose a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {slot}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {bookingType === "personal-training" && (
                <>
                  <div className="space-y-4">
                    <Label className="text-lg">Select Trainer</Label>
                    <Select onValueChange={setTrainer}>
                      <SelectTrigger className="h-14 bg-secondary">
                        <SelectValue placeholder="Choose a trainer" />
                      </SelectTrigger>
                      <SelectContent>
                        {trainers.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            <div className="flex flex-col">
                              <span>{t.name}</span>
                              <span className="text-xs text-muted-foreground">{t.specialty}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-lg">Select Time</Label>
                    <Select onValueChange={setTimeSlot}>
                      <SelectTrigger className="h-14 bg-secondary">
                        <SelectValue placeholder="Choose a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {slot}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {bookingType === "group-class" && (
                <div className="space-y-4">
                  <Label className="text-lg">Select Class</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupClasses.map((gc) => (
                      <button
                        key={gc.id}
                        type="button"
                        onClick={() => setGroupClass(gc.id)}
                        className={cn(
                          "p-4 rounded-xl glass-card text-left transition-all duration-300",
                          groupClass === gc.id
                            ? "border-2 border-primary neon-border"
                            : "hover:border-primary/50"
                        )}
                      >
                        <h4 className="font-display text-lg">{gc.name}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {gc.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {gc.trainer}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-lg font-medium"
                disabled={!bookingType || !date || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Confirming Your Booking...
                  </>
                ) : (
                  <>
                    Confirm Booking 🎯
                  </>
                )}
              </Button>
              
              {!isLoggedIn && (
                <p className="text-center text-sm text-muted-foreground">
                  You need to{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-primary hover:underline"
                  >
                    log in
                  </button>
                  {" "}to make a booking.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
