
import React, { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from "@/components/layout/Header";
import NavBar from "@/components/layout/NavBar";
import { MoodProvider } from "@/context/MoodContext";
import { useAuth } from "@/context/AuthContext";
import { Crown, Check, Star, Sparkles, Lock, CreditCard, Loader2 } from "lucide-react";
import { cardHoverAnimation, buttonPressAnimation } from "@/utils/animations";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { paymentApi, productsApi } from "@/utils/api";
import StripePaymentWrapper from "@/components/payment/StripePaymentForm";

// Load Stripe outside of the component to avoid recreating it on re-renders
const stripePromise = loadStripe('pk_test_51Qydy14fWM471SM6QekN5hz7Q15wbEWaTFcBtU66YWEO7LHWZ7GJPcP0LUpx7dyd08C5aUTkji8zHfoc5a8nv5hV00mqOSzpfr');

interface ShopItem {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  isPremium: boolean;
  isOwned: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

interface PremiumPlan {
  id: string;
  title: string;
  price: number;
  period: string;
  features: string[];
  recommended?: boolean;
  stripePriceId?: string;
}

const ShopPage = () => {
  const { toast } = useToast();
  const { user, isPremium } = useAuth();
  const [coins, setCoins] = useState(120);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showStripeDialog, setShowStripeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const premiumPlans: PremiumPlan[] = [
    {
      id: "monthly",
      title: "Monthly",
      price: 4.99,
      period: "month",
      features: [
        "All premium themes",
        "Unlimited journal entries",
        "AI mood analysis",
        "Priority support"
      ],
      stripePriceId: "price_monthly_id" // This would come from your backend
    },
    {
      id: "yearly",
      title: "Yearly",
      price: 49.99,
      period: "year",
      features: [
        "All premium themes",
        "Unlimited journal entries",
        "AI mood analysis",
        "Priority support",
        "2 months free"
      ],
      recommended: true,
      stripePriceId: "price_yearly_id" // This would come from your backend
    }
  ];
  
  const shopItems: ShopItem[] = [
    {
      id: "theme-zen",
      title: "Zen Theme",
      description: "Calming blue and white theme for a peaceful experience",
      price: 100,
      icon: <span className="text-2xl">🌊</span>,
      isPremium: false,
      isOwned: true
    },
    {
      id: "theme-forest",
      title: "Forest Theme",
      description: "Green and brown natural theme inspired by forests",
      price: 200,
      icon: <span className="text-2xl">🌳</span>,
      isPremium: false,
      isOwned: false
    },
    {
      id: "theme-night",
      title: "Night Mode Theme",
      description: "Dark theme with blue accents for night owls",
      price: 300,
      icon: <span className="text-2xl">🌙</span>,
      isPremium: false,
      isOwned: false
    },
    {
      id: "premium-mood-ai",
      title: "AI Mood Analysis",
      description: "Get AI-powered insights about your mood patterns",
      price: 0,
      icon: <Sparkles size={24} />,
      isPremium: true,
      isOwned: isPremium
    },
    {
      id: "premium-unlimited",
      title: "Unlimited Journals",
      description: "No limits on your journal entries and history",
      price: 0,
      icon: <Star size={24} />,
      isPremium: true,
      isOwned: isPremium
    }
  ];

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsApi.getAll();
        if (response && response.data && response.data.products) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error Loading Products",
          description: "Could not load products from the server.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [toast]);
  
  const handlePurchase = async (item: ShopItem) => {
    if (item.isPremium) {
      toast({
        title: "Premium Feature",
        description: "Subscribe to Premium to unlock this item!",
        variant: "default",
      });
    } else if (item.price > coins) {
      toast({
        title: "Not enough coins",
        description: "Complete more challenges to earn coins!",
        variant: "destructive",
      });
    } else {
      // For coins purchase, we'd normally call the backend to process the purchase
      // Since this is a front-end implementation, we'll simulate success
      setCoins(prevCoins => prevCoins - item.price);
      
      toast({
        title: "Item Purchased!",
        description: `You've unlocked ${item.title}!`,
        variant: "default",
      });
      
      // Update item to be owned
      const updatedItems = shopItems.map(shopItem => 
        shopItem.id === item.id ? { ...shopItem, isOwned: true } : shopItem
      );
      // Note: In a real app, we'd need to update the state properly
    }
  };
  
  const handlePremiumClick = async (plan: PremiumPlan) => {
    setSelectedPlan(plan);
    setShowPaymentDialog(true);
  };
  
  const handleStripePayment = async () => {
    if (!selectedPlan) return;
    
    setIsProcessingPayment(true);
    setPaymentError(null);
    
    try {
      // Create subscription with the backend
      const response = await paymentApi.createSubscription({
        priceId: selectedPlan.stripePriceId
      });
      
      // Set the client secret from the response
      if (response && response.data && response.data.clientSecret) {
        setClientSecret(response.data.clientSecret);
        setShowPaymentDialog(false);
        setShowStripeDialog(true);
      } else {
        throw new Error("Invalid response from payment server");
      }
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : "Payment processing failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };
  
  const handlePaymentSuccess = async () => {
    setShowStripeDialog(false);
    
    toast({
      title: "Subscription Successful!",
      description: `You've subscribed to the ${selectedPlan?.title} Premium plan!`,
      variant: "default",
    });
    
    // In a real app, we would reload the user profile to reflect premium status
    // For now, we'll just pretend and update the UI accordingly
    window.location.reload();
  };
  
  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };
  
  const handlePaymentCancel = () => {
    setShowStripeDialog(false);
  };
  
  return (
    <div className="pb-24 bg-gray-50">
      <Header />
      
      <main className="container px-4 pt-6 animate-fade-in">
        <h1 className="text-2xl font-bold mb-2">HabitJoy Shop</h1>
        <p className="text-sm text-muted-foreground mb-6">Unlock new themes and features with coins or premium subscription</p>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-yellow-400 text-black rounded-full px-3 py-1">
              <span className="text-xs">🪙</span>
              <span className="font-medium">{coins} coins</span>
            </div>
          </div>
          
          {isPremium && (
            <div className="flex items-center gap-1 bg-indigo-500 text-white rounded-full px-3 py-1">
              <Crown size={14} />
              <span className="font-medium">Premium Member</span>
            </div>
          )}
        </div>
        
        {/* Premium Plans Section */}
        {!isPremium && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Premium Subscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {premiumPlans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`rounded-xl p-4 ${cardHoverAnimation} bg-white shadow-sm border ${
                    plan.recommended ? "border-indigo-400 border-2" : "border-gray-200"
                  }`}
                >
                  {plan.recommended && (
                    <div className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full w-fit mx-auto mb-2">
                      Best Value
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h3 className="font-bold text-lg">{plan.title}</h3>
                    <div className="flex items-end justify-center">
                      <span className="text-2xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground ml-1">/{plan.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button 
                    onClick={() => handlePremiumClick(plan)}
                    className={`w-full px-4 py-2 rounded-md ${
                      plan.recommended 
                        ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    } text-sm font-medium ${buttonPressAnimation}`}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <Crown size={14} />
                      Subscribe Now
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Available Items</h2>
          
          {isLoadingProducts ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shopItems.map((item) => (
                <div 
                  key={item.id}
                  className={`rounded-xl p-4 ${cardHoverAnimation} bg-white shadow-sm border ${
                    item.isPremium ? "border-indigo-400" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center h-12 w-12 rounded-xl ${
                      item.isPremium ? "bg-indigo-500 text-white" : "bg-blue-500 text-white"
                    }`}>
                      {item.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{item.title}</h3>
                        {item.isPremium && (
                          <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Crown size={10} />
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    {item.isOwned ? (
                      <span className="text-sm text-green-500 font-medium flex items-center gap-1 px-3 py-1 bg-green-500/10 rounded-full">
                        <Check size={14} />
                        Owned
                      </span>
                    ) : item.isPremium ? (
                      <button 
                        onClick={() => handlePremiumClick(premiumPlans[0])}
                        className={`text-sm bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-3 py-1 rounded-full flex items-center gap-1 ${buttonPressAnimation}`}
                      >
                        <Lock size={14} />
                        Get Premium
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePurchase(item)}
                        className={`text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 py-1 rounded-full flex items-center gap-1 ${buttonPressAnimation}`}
                      >
                        <span className="text-xs">🪙</span>
                        {item.price}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      
      <NavBar />
      
      {/* Premium Plan Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subscribe to Premium</DialogTitle>
            <DialogDescription>
              {selectedPlan && `${selectedPlan.title} plan - $${selectedPlan.price}/${selectedPlan.period}`}
            </DialogDescription>
          </DialogHeader>
          
          {paymentError && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
          
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Premium Benefits:</h3>
                <ul className="space-y-1">
                  {selectedPlan?.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check size={16} className="text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">
                  You will be charged ${selectedPlan?.price} for the {selectedPlan?.title.toLowerCase()} plan.
                  Your subscription will automatically renew unless canceled.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStripePayment}
              disabled={isProcessingPayment}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              {isProcessingPayment ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                <><CreditCard className="mr-2 h-4 w-4" /> Proceed to Payment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Stripe Payment Dialog */}
      {clientSecret && (
        <Dialog open={showStripeDialog} onOpenChange={setShowStripeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Payment</DialogTitle>
              <DialogDescription>
                {selectedPlan && `${selectedPlan.title} Premium - $${selectedPlan.price}/${selectedPlan.period}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Elements stripe={stripePromise}>
                <StripePaymentWrapper
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                  amount={selectedPlan?.price || 0}
                  productName={`${selectedPlan?.title || ''} Premium Subscription`}
                />
              </Elements>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Wrap with MoodProvider
const Shop = () => (
  <MoodProvider>
    <ShopPage />
  </MoodProvider>
);

export default Shop;
