import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { bookingsAPI } from "@/lib/api";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  trainer?: string;
  defaultType?: string;
  onBookingComplete?: () => void;
}

const BookingDialog = ({
  open,
  onOpenChange,
  className,
  trainer,
  defaultType,
  onBookingComplete,
}: BookingDialogProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [sessionType, setSessionType] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const displayName = className || defaultType || sessionType;

  useEffect(() => {
    if (open) {
      setDate(undefined);
      setSessionType("");
      setTime("");
      setCalendarOpen(false);
    }
  }, [open]);

  const timeSlots = [
    "06:00 AM",
    "07:00 AM",
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
    "08:00 PM",
    "09:00 PM",
  ];

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setCalendarOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !displayName || !time) {
      toast({
        title: "⚠️ Missing Information",
        description: "Please select a date and time slot",
        className: "bg-yellow-600 text-white border-yellow-700",
      });
      return;
    }

    setLoading(true);

    try {
      // Use Supabase bookingsAPI
      await bookingsAPI.create({
        className: displayName,
        date: format(date, 'yyyy-MM-dd'),
        time: time,
        trainer: trainer,
        notes: trainer ? `Session with ${trainer}` : undefined,
      });

      toast({
        title: "✅ Booking Confirmed!",
        description: "Check your bookings section for details.",
        className: "bg-green-600 text-white border-green-700",
      });

      setDate(undefined);
      setSessionType("");
      setTime("");
      onOpenChange(false);
      
      // Call callback to refresh bookings
      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "❌ Booking Failed 😔",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Book {trainer ? `Trainer Session` : className || defaultType || "a Session"}
          </DialogTitle>
          <DialogDescription>
            {trainer
              ? `Session with ${trainer}`
              : "Choose your preferred date and time"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {!className && !defaultType && (
            <div className="space-y-2">
              <Label htmlFor="sessionType">Session Type</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger id="sessionType" className="h-12 bg-secondary">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gym Visit">General Gym Visit</SelectItem>
                  <SelectItem value="Personal Training">
                    Personal Training
                  </SelectItem>
                  <SelectItem value="Yoga">Yoga Class</SelectItem>
                  <SelectItem value="CrossFit">CrossFit</SelectItem>
                  <SelectItem value="Zumba">Zumba</SelectItem>
                  <SelectItem value="MMA & Combat">MMA & Combat</SelectItem>
                  <SelectItem value="Weight Training">Weight Training</SelectItem>
                  <SelectItem value="Cardio Zone">Cardio Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal bg-secondary",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(d) =>
                    d < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Select Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger id="time" className="h-12 bg-secondary">
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {date && displayName && time && (
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium">Booking Summary:</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{displayName}</span>
                {trainer && <span>• with {trainer}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="w-4 h-4" />
                {format(date, "PPP")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {time}
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Confirming...
              </>
            ) : (
              "Confirm Booking 🎯"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
