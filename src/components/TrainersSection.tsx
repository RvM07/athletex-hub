import { Instagram, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

const trainers = [
  {
    name: "Raj Sharma",
    specialty: "Strength & Conditioning",
    experience: "8+ years",
    image: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop",
    certifications: ["NSCA-CPT", "CrossFit L2"],
  },
  {
    name: "Priya Patel",
    specialty: "Yoga & Flexibility",
    experience: "10+ years",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop",
    certifications: ["RYT-500", "Yin Yoga"],
  },
  {
    name: "Vikram Singh",
    specialty: "MMA & Combat Sports",
    experience: "12+ years",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop",
    certifications: ["MMA Pro", "Boxing Coach"],
  },
  {
    name: "Ananya Desai",
    specialty: "Cardio & Zumba",
    experience: "6+ years",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=500&fit=crop",
    certifications: ["ZIN", "AFAA"],
  },
];

const TrainersSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 60, rotateY: -15 },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateY: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-24 bg-card relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-5xl sm:text-6xl mb-4">
            MEET OUR <span className="text-red-600">TRAINERS</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our certified professionals are dedicated to helping you achieve your fitness goals with personalized guidance.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {trainers.map((trainer, index) => (
            <motion.div
              key={trainer.name}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl glass-card"
            >
              {/* Image */}
              <div className="relative h-48 sm:h-80 overflow-hidden">
                <motion.img
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.7 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                
                {/* Social overlay */}
                <motion.div 
                  className="absolute top-4 right-4 hidden sm:block"
                  initial={{ opacity: 0, x: 20 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button 
                    className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Instagram size={18} />
                  </motion.button>
                </motion.div>
              </div>

              {/* Info */}
              <div className="p-3 sm:p-6 text-center">
                <h3 className="font-display text-sm sm:text-2xl mb-0.5 sm:mb-1 group-hover:text-red-600 transition-colors">
                  {trainer.name}
                </h3>
                <p className="text-red-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2 hidden sm:block">
                  {trainer.specialty}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-4 hidden sm:block">
                  {trainer.experience} Experience
                </p>
                
                {/* Certifications */}
                <div className="flex flex-wrap gap-2 hidden sm:flex">
                  {trainer.certifications.map((cert, i) => (
                    <motion.span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs text-muted-foreground"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                      transition={{ delay: 0.5 + index * 0.1 + i * 0.1 }}
                    >
                      <Award size={10} />
                      {cert}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Link to="/trainers">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button variant="neonOutline" size="lg">
                View All Trainers
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TrainersSection;
