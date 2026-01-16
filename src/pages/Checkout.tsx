import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Check, Lock, ArrowLeft, CreditCard, Calendar, Loader2, Shield, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { membershipAPI } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

const plans: Record<string, any> = {
  monthly: { id: 'monthly', name: 'Monthly', price: 3000, duration: '1 Month', features: ["Full gym access", "All equipment usage", "Locker facility", "Fitness assessment"] },
  quarterly: { id: 'quarterly', name: 'Quarterly', price: 7500, duration: '3 Months', savings: 1500, features: ["Full gym access", "All equipment & classes", "2 Personal training sessions", "Locker facility", "Diet consultation", "Group classes"] },
  halfyearly: { id: 'halfyearly', name: 'Half Yearly', price: 13500, duration: '6 Months', savings: 4500, features: ["Unlimited gym access", "All equipment & amenities", "4 Personal training sessions", "Premium locker", "Monthly diet plan", "All group classes", "Body composition analysis"] },
  annual: { id: 'annual', name: 'Elite Annual', price: 6999, oldPrice: 9999, duration: '12 Months', savings: 3000, badge: 'PRE-LAUNCH OFFER', features: ["Unlimited gym access", "All facilities & amenities", "8 Personal training sessions", "Premium locker", "Weekly diet consultation", "All group classes", "Priority booking", "Guest passes (2/month)", "Merchandise discount"] },
};

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || 'monthly';
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { isAuthenticated: isLoggedIn, user, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingZip: '',
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      toast({
        title: "🔒 Login Required",
        description: "Please log in to continue with your purchase.",
        className: "bg-yellow-600 text-white border-yellow-700",
      });
      navigate(`/login?redirect=/checkout?plan=${planId}`);
    }
  }, [isLoggedIn, isLoading, navigate, planId, toast]);

  const selectedPlan = plans[planId as keyof typeof plans] || plans.monthly;

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return;
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) return;
    }
    
    // Limit CVV to 3-4 digits
    if (field === 'cvv' && value.length > 4) return;
    
    // Limit ZIP to 6 digits
    if (field === 'billingZip' && value.length > 6) return;
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Subscribe to membership
      await membershipAPI.subscribe(selectedPlan.id);
      
      toast({
        title: "🎉 Payment Successful!",
        description: `Welcome to ${selectedPlan.name} plan! Your membership is now active.`,
        className: "bg-green-600 text-white border-green-700",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "❌ Payment Failed",
        description: "😔 " + (error.message || "Something went wrong. Please try again."),
        variant: "destructive",
        className: "bg-red-600 text-white border-red-700",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-8 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Link to="/membership" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={20} />
            Back to Plans
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-3">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-2xl font-display">Payment Details</CardTitle>
                  <CardDescription>Complete your membership purchase securely</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Lock size={16} />
                        <span>Your payment information is secure and encrypted</span>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="cardNumber"
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                            className="pl-10 h-12 bg-secondary"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.cardName}
                          onChange={(e) => handleInputChange('cardName', e.target.value)}
                          className="h-12 bg-secondary"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="expiryDate"
                              type="text"
                              placeholder="MM/YY"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                              className="pl-10 h-12 bg-secondary"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange('cvv', e.target.value)}
                            className="h-12 bg-secondary"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="billingZip">Billing ZIP Code</Label>
                        <Input
                          id="billingZip"
                          type="text"
                          placeholder="400001"
                          value={formData.billingZip}
                          onChange={(e) => handleInputChange('billingZip', e.target.value)}
                          className="h-12 bg-secondary"
                          required
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Security Badges */}
                    <div className="flex items-center justify-center gap-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield size={20} className="text-green-500" />
                        <span>SSL Secured</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Lock size={20} className="text-green-500" />
                        <span>256-bit Encryption</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-14 bg-red-600 hover:bg-red-700 text-lg font-medium"
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Pay ₹{selectedPlan.price.toLocaleString()}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By completing your purchase, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Plan Details */}
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-display text-lg">{selectedPlan.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedPlan.duration}</p>
                        </div>
                        {selectedPlan.badge && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white flex items-center gap-1">
                            <Zap size={12} />
                            {selectedPlan.badge}
                          </span>
                        )}
                      </div>
                      
                      <ul className="space-y-2">
                        {selectedPlan.features.slice(0, 5).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-red-600 shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                        {selectedPlan.features.length > 5 && (
                          <li className="text-sm text-muted-foreground pl-6">
                            +{selectedPlan.features.length - 5} more benefits
                          </li>
                        )}
                      </ul>
                    </div>

                    <Separator />

                    {/* Billing Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">₹{selectedPlan.price.toLocaleString()}</span>
                      </div>
                      
                      {selectedPlan.oldPrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Regular Price</span>
                          <span className="line-through text-muted-foreground">₹{selectedPlan.oldPrice.toLocaleString()}</span>
                        </div>
                      )}
                      
                      {selectedPlan.savings && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">You Save</span>
                          <span className="text-green-600 font-medium">-₹{selectedPlan.savings.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">GST (18%)</span>
                        <span className="font-medium">₹{Math.round(selectedPlan.price * 0.18).toLocaleString()}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <span className="font-display text-lg">Total Due</span>
                      <span className="font-display text-2xl text-red-600">
                        ₹{Math.round(selectedPlan.price * 1.18).toLocaleString()}
                      </span>
                    </div>

                    {/* Billing Info */}
                    <div className="bg-secondary rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium">Billing to:</p>
                      <p className="text-sm text-muted-foreground">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>

                    {/* Money Back Guarantee */}
                    <div className="bg-green-600/10 border border-green-600/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-600">7-Day Money Back Guarantee</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Not satisfied? Get a full refund within 7 days, no questions asked.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
