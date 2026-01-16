import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-12 relative overflow-hidden" ref={ref}>
      {/* Dramatic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <motion.div 
          className="bg-gradient-to-br from-red-600/20 via-transparent to-transparent absolute inset-0 rounded-3xl"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      
      {/* Animated border */}
      <motion.div 
        className="absolute inset-4 md:inset-8 rounded-3xl border border-red-600/30"
        animate={{ 
          boxShadow: [
            "0 0 20px rgb(220 38 38 / 0.2)",
            "0 0 40px rgb(220 38 38 / 0.4)",
            "0 0 20px rgb(220 38 38 / 0.2)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center py-8"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="font-display text-5xl sm:text-6xl lg:text-7xl mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            READY TO
            <br />
            <motion.span 
              className="text-red-600 inline-block"
              animate={{ 
                textShadow: [
                  "0 0 30px rgb(220 38 38 / 0.3)",
                  "0 0 60px rgb(220 38 38 / 0.5)",
                  "0 0 30px rgb(220 38 38 / 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              TRANSFORM?
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Join the AthleteX family today and start your journey towards becoming the best version of yourself.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="bg-red-600 hover:bg-red-700" size="lg">
                  UNLOCK YOUR X-FACTOR
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/booking">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="neonOutline" size="lg">
                  Book a Free Trial
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.p 
            className="text-muted-foreground text-sm mt-8"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Pre-Launch Offer: ₹6,999/Year (Was ₹9,999)
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
