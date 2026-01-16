import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, UserCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUserProfile({
            name: profile?.name || session.user.user_metadata?.name || 'User',
            email: session.user.email || '',
            role: profile?.role || 'user',
          });
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUserProfile(null);
      
      toast({
        title: "😢 Logged Out",
        description: "You have been successfully logged out. See you soon!",
        className: "bg-red-600 text-white border-red-700",
      });
      navigate("/");
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const isLoggedIn = !!userProfile;
  const user = userProfile;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Classes", path: "/classes" },
    { name: "Trainers", path: "/trainers" },
    { name: "Membership", path: "/membership" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const menuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { 
      opacity: 1, 
      height: "auto",
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <>
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 bg-background/40 backdrop-blur-[16px] shadow-2xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
          <Link to="/">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Logo size="sm" variant="main" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                <Link
                  to={link.path}
                  className={`relative text-sm font-medium uppercase tracking-wider transition-colors duration-300 ${
                    isActive(link.path)
                      ? "text-red-600 font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red-600"
                      layoutId="activeNav"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Admin Dashboard Button - Only for admins */}
                {user?.role === 'admin' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/admin">
                      <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin
                      </Button>
                    </Link>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/">
                    <Button variant="ghost" size="sm">
                      <UserCircle className="mr-2 h-4 w-4" />
                      {user?.name?.split(' ')[0] || 'Profile'}
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-red-600 hover:bg-red-700" size="sm">
                      Join Now
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden py-4 border-t border-border overflow-hidden"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <motion.div key={link.name} variants={itemVariants}>
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`text-sm font-medium uppercase tracking-wider transition-colors duration-300 ${
                        isActive(link.path)
                          ? "text-red-600 font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div 
                  className="flex flex-col gap-2 pt-4 border-t border-border"
                  variants={itemVariants}
                >
                  {isLoggedIn ? (
                    <>
                      {/* Admin Dashboard Button - Only for admins */}
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="w-full" onClick={() => setIsOpen(false)}>
                          <Button variant="default" className="w-full bg-primary hover:bg-primary/90">
                            <Settings className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}
                      <div className="flex gap-2">
                        <Link to="/" className="flex-1" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full">
                            <UserCircle className="mr-2 h-4 w-4" />
                            Profile
                          </Button>
                        </Link>
                        <Button variant="outline" className="flex-1" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="flex-1">
                        <Button variant="ghost" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link to="/register" className="flex-1">
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          Join Now
                        </Button>
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </motion.nav>
      <div className="h-20" aria-hidden="true" />
    </>
  );
};

export default Navbar;
