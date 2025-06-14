
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

const SubscriptionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const handleUpgrade = async (tier: string) => {
    if (!user) return;
    
    setUpgrading(true);
    try {
      // In a real app, this would integrate with Stripe
      // For now, we'll just update the database directly
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

      const { error } = await supabase
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email!,
          subscribed: true,
          subscription_tier: tier,
          subscription_end: subscriptionEnd.toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Subscription updated",
        description: `You've successfully upgraded to ${tier}!`,
      });

      // Refresh subscription data
      const { data } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setSubscription(data);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast({
        title: "Upgrade failed",
        description: "Failed to upgrade subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(false);
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      tier: 'free',
      features: [
        'Up to 5 links',
        'Basic analytics',
        'Standard support',
      ],
      limitations: [
        'No custom domain',
        'LinkHub branding',
        'Limited customization',
      ]
    },
    {
      name: 'Pro',
      price: '$9',
      tier: 'pro',
      features: [
        'Unlimited links',
        'Advanced analytics',
        'Custom domain',
        'Remove branding',
        'Priority support',
        'Custom themes',
      ],
      limitations: []
    },
    {
      name: 'Business',
      price: '$29',
      tier: 'business',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'API access',
        'White-label solution',
        'Dedicated support',
        'Custom integrations',
      ],
      limitations: []
    }
  ];

  const currentTier = subscription?.subscription_tier || 'free';
  const isSubscribed = subscription?.subscribed || false;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Your current plan and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold capitalize">{currentTier} Plan</h3>
                <Badge variant={isSubscribed ? "default" : "secondary"}>
                  {isSubscribed ? 'Active' : 'Free'}
                </Badge>
              </div>
              {subscription?.subscription_end && (
                <p className="text-sm text-muted-foreground">
                  {isSubscribed 
                    ? `Renews on ${formatDate(subscription.subscription_end)}`
                    : `Expired on ${formatDate(subscription.subscription_end)}`
                  }
                </p>
              )}
            </div>
            {currentTier !== 'free' && (
              <Button variant="outline" size="sm">
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.tier} 
            className={`relative ${currentTier === plan.tier ? 'ring-2 ring-primary' : ''}`}
          >
            {currentTier === plan.tier && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                Current Plan
              </Badge>
            )}
            
            <CardHeader className="text-center">
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price}
                {plan.tier !== 'free' && <span className="text-base font-normal">/month</span>}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">{limitation}</span>
                  </div>
                ))}
              </div>
              
              {currentTier === plan.tier ? (
                <Button disabled className="w-full">
                  Current Plan
                </Button>
              ) : plan.tier === 'free' ? (
                <Button variant="outline" disabled className="w-full">
                  Downgrade
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={upgrading}
                >
                  {upgrading ? 'Processing...' : 'Upgrade'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>See what's included in each plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Free:</strong> Perfect for personal use with basic link management
            </p>
            <p className="mb-2">
              <strong>Pro:</strong> Ideal for creators and professionals who need advanced features
            </p>
            <p>
              <strong>Business:</strong> Best for teams and organizations requiring enterprise features
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;
