import { Check, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const plans = [
  {
    id: "monthly",
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
    id: "quarterly",
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
    id: "halfyearly",
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
    id: "annual",
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

const Membership = () => {
  const { isAuthenticated: isLoggedIn } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-12 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl mb-4">
              MEMBERSHIP <span className="neon-text">PLANS</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Choose the plan that fits your goals. All memberships include access to our premium facilities.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative glass-card rounded-2xl p-6 transition-all duration-300 flex flex-col h-full hover:scale-105 hover:shadow-xl ${
                  plan.popular
                    ? "border-2 border-red-600"
                    : "hover:border-red-600/50"
                }`}
              >
                {plan.popular && (
                  <div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                  >
                    <div 
                      className="flex items-center gap-1 px-4 py-1 bg-red-600 rounded-full text-xs font-bold uppercase text-white"
                    >
                      <Zap size={12} />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <h3 className="font-display text-2xl mb-1">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.duration}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-muted-foreground">₹</span>
                    <span 
                      className={`font-display text-5xl ${plan.popular ? "text-red-600" : ""}`}
                    >
                      {plan.price}
                    </span>
                  </div>
                  {plan.oldPrice && (
                    <p 
                      className="text-muted-foreground text-sm line-through"
                    >
                      ₹{plan.oldPrice}
                    </p>
                  )}
                  {plan.savings && (
                    <p 
                      className={`text-sm font-bold mt-2 ${plan.oldPrice ? "text-red-600" : "text-primary"}`}
                    >
                      {plan.savings}
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, i) => (
                    <li 
                      key={i} 
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={isLoggedIn ? `/checkout?plan=${plan.id}` : "/register"} className="block mt-auto">
                  <div>
                    <Button
                      className={plan.popular ? "w-full bg-red-600 hover:bg-red-700" : "w-full"}
                      variant={plan.popular ? undefined : "neonOutline"}
                    >
                      {isLoggedIn ? "Subscribe Now" : "Get Started"}
                    </Button>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ / Additional Info */}
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl text-center mb-8">
              FREQUENTLY <span className="neon-text">ASKED</span>
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "Can I freeze my membership?",
                  a: "Yes, you can freeze your membership for up to 30 days per year with prior notice."
                },
                {
                  q: "Is there a joining fee?",
                  a: "No joining fees! The prices listed are all-inclusive."
                },
                {
                  q: "Can I upgrade my plan mid-term?",
                  a: "Absolutely! You can upgrade anytime and we'll adjust your billing accordingly."
                },
                {
                  q: "Do you offer student discounts?",
                  a: "Yes, students get 10% off on all plans with valid ID."
                },
              ].map((faq, i) => (
                <div key={i} className="glass-card rounded-xl p-6">
                  <h4 className="font-medium mb-2">{faq.q}</h4>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Membership;
