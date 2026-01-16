import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

const plans = [
  {
    name: "Starter",
    duration: "1 Month",
    price: "3,000",
    features: [
      "Full gym access",
      "All equipment usage",
      "Locker facility",
      "Fitness assessment",
    ],
    popular: false,
  },
  {
    name: "Committed",
    duration: "3 Months",
    price: "7,500",
    savings: "Save ₹1,500",
    features: [
      "Full gym access",
      "All equipment & classes",
      "2 Personal training sessions",
      "Locker facility",
      "Diet consultation",
      "Group classes included",
    ],
    popular: false,
  },
  {
    name: "Dedicated",
    duration: "6 Months",
    price: "13,500",
    savings: "Save ₹4,500",
    features: [
      "Unlimited gym access",
      "All equipment & amenities",
      "4 Personal training sessions",
      "Premium locker",
      "Monthly diet plan",
      "All group classes",
      "Body composition analysis",
    ],
    popular: false,
  },
  {
    name: "Elite",
    duration: "12 Months",
    price: "6,999",
    oldPrice: "9,999",
    savings: "PRE-LAUNCH OFFER",
    features: [
      "Unlimited gym access",
      "All facilities & amenities",
      "8 Personal training sessions",
      "Premium locker",
      "Weekly diet consultation",
      "All group classes",
      "Priority booking",
      "Guest passes (2/month)",
      "Merchandise discount",
    ],
    popular: true,
  },
];

const MembershipSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { isAuthenticated: isLoggedIn } = useAuth();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden" ref={ref}>
      {/* Background accents */}
      <motion.div 
        className="absolute top-1/2 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] -translate-y-1/2"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px]"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-5xl sm:text-6xl mb-4">
            MEMBERSHIP <span className="text-red-600">PLANS</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your goals. Yoga, Cardio, CrossFit, MMA, Personal Training, and much more!
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { duration: 0.3 }
              }}
              className={`relative glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6 transition-colors duration-300 flex flex-col h-full ${
                plan.popular
                  ? "border-2 border-red-600"
                  : "hover:border-red-600/50"
              }`}
            >
              {plan.popular && (
                <motion.div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 hidden sm:block"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <motion.div 
                    className="flex items-center gap-1 px-4 py-1 bg-red-600 rounded-full text-xs font-bold uppercase text-white"
                    animate={{ 
                      boxShadow: [
                        "0 0 10px rgb(220 38 38 / 0.3)",
                        "0 0 20px rgb(220 38 38 / 0.5)",
                        "0 0 10px rgb(220 38 38 / 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap size={12} />
                    Most Popular
                  </motion.div>
                </motion.div>
              )}

              <div className="text-center mb-3 sm:mb-6 pt-2">
                <h3 className="font-display text-lg sm:text-3xl mb-0.5 sm:mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{plan.duration}</p>
              </div>

              <div className="text-center mb-3 sm:mb-6">
                <div className="flex items-baseline justify-center gap-0.5 sm:gap-1">
                  <span className="text-muted-foreground text-xs sm:text-base">₹</span>
                  <motion.span 
                    className={`font-display text-xl sm:text-5xl ${plan.popular ? "text-red-600" : ""}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  >
                    {plan.price}
                  </motion.span>
                </div>
                {plan.oldPrice && (
                  <motion.p 
                    className="text-muted-foreground text-xs sm:text-sm line-through hidden sm:block"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    ₹{plan.oldPrice}
                  </motion.p>
                )}
                {plan.savings && (
                  <motion.p 
                    className={`text-xs sm:text-sm font-bold mt-1 sm:mt-2 ${plan.oldPrice ? "text-red-600" : "text-primary"} hidden sm:block`}
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    {plan.savings}
                  </motion.p>
                )}
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-3 sm:mb-6 flex-grow hidden sm:block">
                {plan.features.map((feature, i) => (
                  <motion.li 
                    key={i} 
                    className="flex items-start gap-2 sm:gap-3 text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ delay: 0.5 + index * 0.1 + i * 0.05 }}
                  >
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-xs sm:text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <Link to={isLoggedIn ? "/booking" : "/register"} className="block mt-auto">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className={plan.popular ? "w-full bg-red-600 hover:bg-red-700 text-xs sm:text-sm py-1.5 sm:py-2 h-auto" : "w-full text-xs sm:text-sm py-1.5 sm:py-2 h-auto"}
                    variant={plan.popular ? undefined : "neonOutline"}
                  >
                    {isLoggedIn ? "Book Now" : "Get Started"}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MembershipSection;
