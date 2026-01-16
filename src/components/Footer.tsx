import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import Logo from "./Logo";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/ATHLETEX.ATX", label: "Instagram" },
    { icon: Phone, href: "tel:+917218758306", label: "WhatsApp" },
    { icon: MapPin, href: "https://maps.google.com/?q=Behind+Vitthal+rukmai+mandir,+Dangat+Wasti,+Vikas+nagar,+Dehuroad,+Pune", label: "Location" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <footer className="bg-card border-t border-border" ref={ref}>
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Brand */}
          <motion.div className="space-y-6" variants={itemVariants}>
            <Logo size="lg" variant="text" />
            <p className="text-muted-foreground text-base">
              Transform your body, mind, and spirit with AthleteX - the biggest gym in Dehuroad.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <motion.a 
                  key={i}
                  href={social.href}
                  target={social.href.startsWith('http') ? "_blank" : undefined}
                  rel={social.href.startsWith('http') ? "noopener noreferrer" : undefined}
                  title={social.label}
                  className="text-muted-foreground hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h4 className="font-display text-xl tracking-wider">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { name: "Classes", path: "/classes" },
                { name: "Trainers", path: "/trainers" },
                { name: "Membership", path: "/membership" },
                { name: "Book a Session", path: "/booking" },
              ].map((link, i) => (
                <motion.div
                  key={link.name}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    to={link.path} 
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h4 className="font-display text-xl tracking-wider">Contact</h4>
            <div className="flex flex-col gap-3">
              <motion.div 
                className="flex items-start gap-3 text-sm text-muted-foreground"
                whileHover={{ x: 5 }}
              >
                <MapPin size={18} className="text-red-600 shrink-0 mt-0.5" />
                <span>Behind Vitthal rukmai mandir, Dangat Wasti, Vikas Nagar, Dehuroad, Kiwale, Pune - 412101</span>
              </motion.div>
              <motion.a 
                href="tel:+917218758306"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-red-600 transition-colors"
                whileHover={{ x: 5 }}
              >
                <Phone size={18} className="text-red-600 shrink-0" />
                <span>7218758306</span>
              </motion.a>
              <motion.a 
                href="tel:+917588325999"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-red-600 transition-colors"
                whileHover={{ x: 5 }}
              >
                <Phone size={18} className="text-red-600 shrink-0" />
                <span>7588325999</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Hours */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <h4 className="font-display text-xl tracking-wider">Hours</h4>
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <Clock size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Open Daily</p>
                <p>6:00 AM - 11:30 PM</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p>© {new Date().getFullYear()} AthleteX. All rights reserved. Unlock your X factor.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
