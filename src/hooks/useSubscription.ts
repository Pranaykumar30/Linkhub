
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  stripe_customer_id: string | null;
}

export interface SubscriptionLimits {
  maxLinks: number;
  hasAdvancedAnalytics: boolean;
  hasCustomUrl: boolean;
  hasCustomDomain: boolean;
  hasTeamCollaboration: boolean;
  hasWhiteLabel: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
  hasLinkScheduling: boolean;
  hasCustomThemes: boolean;
  hasAnalyticsExport: boolean;
  hasMultipleDomains: boolean;
  hasAdvancedSecurity: boolean;
  hasCustomIntegrations: boolean;
  removeBranding: boolean;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    stripe_customer_id: null,
  });
  const [loading, setLoading] = useState(true);

  const getSubscriptionLimits = (tier: string | null): SubscriptionLimits => {
    switch (tier) {
      case 'Enterprise':
        return {
          maxLinks: -1, // Unlimited
          hasAdvancedAnalytics: true,
          hasCustomUrl: true,
          hasCustomDomain: true,
          hasTeamCollaboration: true,
          hasWhiteLabel: true,
          hasApiAccess: true,
          hasPrioritySupport: true,
          hasLinkScheduling: true,
          hasCustomThemes: true,
          hasAnalyticsExport: true,
          hasMultipleDomains: true,
          hasAdvancedSecurity: true,
          hasCustomIntegrations: true,
          removeBranding: true,
        };
      case 'Premium':
        return {
          maxLinks: 100,
          hasAdvancedAnalytics: true,
          hasCustomUrl: true,
          hasCustomDomain: true,
          hasTeamCollaboration: false,
          hasWhiteLabel: false,
          hasApiAccess: false,
          hasPrioritySupport: true,
          hasLinkScheduling: true,
          hasCustomThemes: true,
          hasAnalyticsExport: false,
          hasMultipleDomains: false,
          hasAdvancedSecurity: false,
          hasCustomIntegrations: false,
          removeBranding: true,
        };
      case 'Basic':
        return {
          maxLinks: 25,
          hasAdvancedAnalytics: false,
          hasCustomUrl: true,
          hasCustomDomain: false,
          hasTeamCollaboration: false,
          hasWhiteLabel: false,
          hasApiAccess: false,
          hasPrioritySupport: false,
          hasLinkScheduling: false,
          hasCustomThemes: false,
          hasAnalyticsExport: false,
          hasMultipleDomains: false,
          hasAdvancedSecurity: false,
          hasCustomIntegrations: false,
          removeBranding: false,
        };
      default: // Free
        return {
          maxLinks: 5,
          hasAdvancedAnalytics: false,
          hasCustomUrl: false,
          hasCustomDomain: false,
          hasTeamCollaboration: false,
          hasWhiteLabel: false,
          hasApiAccess: false,
          hasPrioritySupport: false,
          hasLinkScheduling: false,
          hasCustomThemes: false,
          hasAnalyticsExport: false,
          hasMultipleDomains: false,
          hasAdvancedSecurity: false,
          hasCustomIntegrations: false,
          removeBranding: false,
        };
    }
  };

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
        setSubscription({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          stripe_customer_id: null,
        });
      } else if (data) {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Set up real-time subscription for subscription changes
  useEffect(() => {
    if (!user) return;

    const channelName = `subscription-changes-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscribers',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Subscription changed:', payload);
          if (payload.eventType === 'UPDATE' && payload.new) {
            setSubscription(payload.new as SubscriptionData);
          } else if (payload.eventType === 'INSERT' && payload.new) {
            setSubscription(payload.new as SubscriptionData);
          }
        }
      )
      .subscribe();

    return () => {
      console.log(`Unsubscribing from channel: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const limits = getSubscriptionLimits(subscription.subscription_tier);

  return {
    subscription,
    limits,
    loading,
    refetchSubscription: fetchSubscription,
  };
};
