import { Dumbbell, Activity, Flame, Users, Heart, Swords, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";

const classes = [
  {
    name: "Strength Training",
    description: "Build muscle and strength with our state-of-the-art equipment",
    icon: Dumbbell,
    color: "from-red-600 to-orange-600",
  },
  {
    name: "Yoga",
    description: "Find balance and flexibility through mindful movement",
    icon: Heart,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "CrossFit & ABS",
    description: "High-intensity functional training for total body fitness",
    icon: Flame,
    color: "from-orange-600 to-yellow-600",
  },
  {
    name: "Personal Training",
    description: "One-on-one sessions tailored to your specific goals",
    icon: Users,
    color: "from-blue-600 to-cyan-600",
  },
  {
    name: "Cardio",
    description: "Boost your endurance with heart-pumping workouts",
    icon: Activity,
    color: "from-green-600 to-emerald-600",
  },
  {
    name: "MMA/Kickboxing",
    description: "Learn mixed martial arts and kickboxing from professional fighters",
    icon: Swords,
    color: "from-red-700 to-red-600",
  },
  {
    name: "Zumba/Aerobics",
    description: "Dance your way to fitness with high-energy routines",
    icon: Music,
    color: "from-pink-600 to-rose-600",
  },
];

const ClassesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-24 bg-card relative overflow-hidden" ref={ref}>
      {/* Background accent */}
      <motion.div 
        className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-red-600/5 to-transparent"
        initial={{ opacity: 0, x: 100 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <h2 className="font-display text-5xl sm:text-6xl mb-4">
            OUR <span className="text-red-600">CLASSES</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Yoga, Zumba/Aerobics, CrossFit & ABS, MMA/Kickboxing, Personal Training, Strength Training, Cardio and more!
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {classes.map((classItem) => (
            <motion.div
              key={classItem.name}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -8,
                boxShadow: "0 0 30px hsl(0 100% 50% / 0.15)"
              }}
              transition={{ duration: 0.3 }}
              className="group glass-card rounded-xl p-3 sm:p-6 hover:border-red-600/50 transition-colors duration-300 cursor-pointer"
            >
              <motion.div 
                className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${classItem.color} flex items-center justify-center mb-2 sm:mb-4`}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <classItem.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </motion.div>
              <h3 className="font-display text-base sm:text-2xl mb-1 sm:mb-2 group-hover:text-red-600 transition-colors">
                {classItem.name}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">
                {classItem.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Link to="/classes">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button variant="neonOutline" size="lg">
                View All Classes
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ClassesSection;
