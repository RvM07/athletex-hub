import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { contactAPI } from "@/lib/api";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await contactAPI.submit({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: "General Inquiry",
        message: formData.message,
      });
      
      toast({
        title: "✅ Message Sent!",
        description: "😊 We'll get back to you as soon as possible!",
        className: "bg-green-600 text-white border-green-700",
      });
      
      // Reset form
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please try again later.";
      toast({
        title: "❌ Failed to Send",
        description: "😔 " + errorMessage,
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-12 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl mb-4">
              GET IN <span className="neon-text">TOUCH</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              Have questions? We'd love to hear from you. Reach out anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Section - Contact Form (1 col) */}
            <div className="md:col-span-1">
              <h2 className="font-display text-3xl md:text-4xl mb-6 md:mb-8">SEND A MESSAGE</h2>
              
              <form onSubmit={handleSubmit} className="glass-card rounded-xl p-4 md:p-6 space-y-4 md:space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Your Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-10 bg-secondary border-border focus:border-primary text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="h-10 bg-secondary border-border focus:border-primary text-sm"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="h-10 bg-secondary border-border focus:border-primary text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="min-h-28 bg-secondary border-border focus:border-primary resize-none text-sm"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-10 bg-red-600 hover:bg-red-700 text-sm" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Right Section - Contact Info & Map (2 cols) */}
            <div className="md:col-span-1 lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Contact Info */}
              <div>
                <h2 className="font-display text-4xl mb-6">CONTACT INFO</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card rounded-lg p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-2xl">Location</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Vikas Nagar, Dehu Road<br />
                        Pune, Maharashtra
                      </p>
                    </div>
                  </div>

                  <div className="glass-card rounded-lg p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-2xl">Hours</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Open Daily<br />
                        6:00 AM - 11:30 PM
                      </p>
                    </div>
                  </div>

                  <div className="glass-card rounded-lg p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-2xl">Phone</h4>
                      <p className="text-xs text-muted-foreground">+91 98765 43210</p>
                    </div>
                  </div>

                  <div className="glass-card rounded-lg p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-2xl">Email</h4>
                      <p className="text-xs text-muted-foreground">info@athletex.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="glass-card rounded-xl overflow-hidden h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3779.8277393409257!2d73.72916787478162!3d18.67172448245136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b12c2e814157%3A0x1018115382892c38!2sAthleteX!5e0!3m2!1sen!2sin!4v1768240327032!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="AthleteX Location"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
