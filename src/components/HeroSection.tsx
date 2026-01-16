import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CalendarDays } from "lucide-react";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { authAPI } from "@/lib/api";

const HeroSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const isLoggedIn = authAPI.isAuthenticated();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const statsVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: { 
        delay: 0.8 + i * 0.15,
        duration: 0.5
      }
    })
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-pattern pt-12 pb-8">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      <motion.div 
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      <div className="container mx-auto px-4 relative z-10" ref={ref}>
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            whileHover="hover"
            initial="initial"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-600/50 bg-red-600/10 mb-8 cursor-pointer transition-all duration-300"
          >
            <motion.span 
              className="w-2 h-2 rounded-full bg-red-600"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.span 
              className="text-sm uppercase tracking-wider font-medium"
              variants={{
                initial: { color: "hsl(var(--muted-foreground))" },
                hover: { color: "hsl(220 14% 96%)" }
              }}
            >
              Pre-Launch Offer: ₹6,999/Year (Was ₹9,999)
            </motion.span>
          </motion.div>
          
          <motion.div 
            className="absolute -inset-2 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 rounded-full blur-lg -z-10 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            className="font-display text-6xl sm:text-7xl lg:text-8xl leading-none mb-6"
          >
            BIGGEST GYM IN
            <br />
            <motion.span 
              className="text-red-600 inline-block"
              animate={{ 
                textShadow: [
                  "0 0 20px rgb(220 38 38 / 0.3)",
                  "0 0 40px rgb(220 38 38 / 0.5)",
                  "0 0 20px rgb(220 38 38 / 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              DEHUROAD
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Unlock your X-Factor with world-class trainers, premium facilities, and a community 
            dedicated to transforming your fitness journey.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={isLoggedIn ? "/booking" : "/register"}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="bg-red-600 hover:bg-red-700" size="xl">
                  {isLoggedIn ? (
                    <>
                      <CalendarDays className="mr-2 h-5 w-5" />
                      BOOK SESSION
                    </>
                  ) : (
                    <>
                      JOIN NOW
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </Link>
            <Link to="/classes">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="neonOutline" size="xl">
                  <Play className="mr-2 h-5 w-5" />
                  VIEW CLASSES
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/50">
            {[
              { value: "7+", label: "Class Types" },
              { value: "15+", label: "Expert Trainers" },
              { value: "Unlimited", label: "Access" }
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                className="text-center"
                custom={i}
                variants={statsVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                whileHover={{ scale: 1.1 }}
              >
                <motion.div 
                  className="font-display text-4xl sm:text-5xl text-red-600"
                  animate={{ 
                    textShadow: [
                      "0 0 10px rgb(220 38 38 / 0.3)",
                      "0 0 20px rgb(220 38 38 / 0.5)",
                      "0 0 10px rgb(220 38 38 / 0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-muted-foreground text-sm uppercase tracking-wider mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
