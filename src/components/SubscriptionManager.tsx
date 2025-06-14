
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Zap, Star, Loader2, Sparkles, Shield } from 'lucide-react';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  isAdmin?: boolean;
}

const SubscriptionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      // Check if user is admin first
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('admin_role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // If user is admin, set Enterprise subscription
      if (adminData) {
        setSubscription({
          subscribed: true,
          subscription_tier: 'Enterprise',
          subscription_end: null,
          isAdmin: true,
        });
        setLoading(false);
        return;
      }

      // First try to fetch from database
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription from DB:', error);
      } else if (data) {
        setSubscription({
          ...data,
          isAdmin: false,
        });
      }
      
      // Then call the edge function to verify with Stripe and update if needed
      try {
        setLoading(true);
        const { data: stripeData, error: stripeError } = await supabase.functions.invoke('check-subscription');
        
        if (stripeError) {
          console.error('Error checking subscription with Stripe:', stripeError);
          toast({
            title: "Error",
            description: "Failed to verify subscription status. Please try again.",
            variant: "destructive",
          });
        } else if (stripeData && !adminData) {
          setSubscription({
            ...stripeData,
            isAdmin: false,
          });
        }
      } catch (stripeCheckError) {
        console.error('Error invoking check-subscription function:', stripeCheckError);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCheckout = async (plan: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const manageSubscription = async () => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to access customer portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Check for URL params after successful checkout
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const checkoutStatus = queryParams.get('checkout');
    
    if (checkoutStatus === 'success') {
      toast({
        title: "Success!",
        description: "Your subscription has been activated successfully.",
      });
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, document.title, url.toString());
      
      // Refresh subscription data
      fetchSubscription();
    } else if (checkoutStatus === 'cancel') {
      toast({
        title: "Checkout Cancelled",
        description: "You can complete your subscription anytime.",
        variant: "default",
      });
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Set up periodic refresh of subscription data
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchSubscription();
    }, 60000); // Check every minute when the tab is active
    
    return () => clearInterval(interval);
  }, [user]);

  const plans = [
    {
      name: 'Basic',
      price: '$7.99',
      description: 'Perfect for getting started',
      features: [
        'Up to 25 links',
        'Basic analytics',
        'Custom profile URL', 
        'Email support',
        'LinkHub branding'
      ],
      icon: Zap,
      popular: false,
    },
    {
      name: 'Premium',
      price: '$19.99',
      description: 'Most popular choice',
      features: [
        'Up to 100 links',
        'Advanced analytics',
        'Custom domain support',
        'Priority support',
        'Link scheduling',
        'Custom themes',
        'Remove LinkHub branding'
      ],
      icon: Crown,
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$49.99',
      description: 'For power users and teams',
      features: [
        'Unlimited links',
        'Advanced analytics & exports',
        'Multiple custom domains',
        'Team collaboration',
        'White-label solution',
        'API access',
        'Dedicated support',
        'Custom integrations',
        'Advanced security features'
      ],
      icon: Star,
      popular: false,
    },
  ];

  const getCurrentPlanPrice = () => {
    const currentPlan = plans.find(p => p.name === subscription.subscription_tier);
    return currentPlan?.price || 'Custom';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      {subscription.subscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {subscription.isAdmin ? (
                <Shield className="h-5 w-5 text-destructive" />
              ) : (
                <Crown className="h-5 w-5 text-primary" />
              )}
              Current Subscription
            </CardTitle>
            <CardDescription>
              {subscription.isAdmin ? 'Admin Enterprise Plan' : 'Manage your active subscription'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="text-sm">
                    {subscription.subscription_tier} Plan
                  </Badge>
                  {subscription.isAdmin ? (
                    <Badge variant="destructive">Admin</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
                {subscription.subscription_end && (
                  <p className="text-sm text-muted-foreground">
                    Next billing: {new Date(subscription.subscription_end).toLocaleDateString()}
                  </p>
                )}
                <div className="mt-2">
                  <p className="text-lg font-semibold">
                    {getCurrentPlanPrice()}/month
                  </p>
                </div>
              </div>
              {!subscription.isAdmin && (
                <Button 
                  onClick={manageSubscription}
                  disabled={actionLoading}
                  variant="outline"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Manage Subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Free Plan Info */}
      {!subscription.subscribed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              Free Plan
            </CardTitle>
            <CardDescription>You're currently on our free plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-muted-foreground" />
                Up to 5 links
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-muted-foreground" />
                Basic profile customization
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-muted-foreground" />
                LinkHub public URL (linkhub.app/yourname)
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-muted-foreground" />
                Basic analytics
              </li>
            </ul>
            <div className="mb-4">
              <p className="text-lg font-semibold">$0/month</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Upgrade to a paid plan to unlock more features and remove limitations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = subscription.subscription_tier === plan.name;
          
          return (
            <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-3 py-1">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold">{plan.price}</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                  onClick={() => createCheckout(plan.name.toLowerCase())}
                  disabled={actionLoading || isCurrentPlan || subscription.isAdmin}
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {isCurrentPlan ? 'Current Plan' : subscription.isAdmin ? 'Admin Plan' : `Choose ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Manual Refresh Button */}
      <div className="flex justify-center">
        <Button 
          variant="ghost" 
          onClick={fetchSubscription}
          disabled={loading}
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Refresh Subscription Status
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionManager;
