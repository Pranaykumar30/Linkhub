
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionLimits {
  linkLimit: number;
  customDomainEnabled: boolean;
  advancedAnalyticsEnabled: boolean;
  teamCollaborationEnabled: boolean;
  apiAccessEnabled: boolean;
  whiteLabelEnabled: boolean;
  subscriptionTier: string | null;
  subscribed: boolean;
}

export const useSubscriptionLimits = () => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<SubscriptionLimits>({
    linkLimit: 5,
    customDomainEnabled: false,
    advancedAnalyticsEnabled: false,
    teamCollaborationEnabled: false,
    apiAccessEnabled: false,
    whiteLabelEnabled: false,
    subscriptionTier: null,
    subscribed: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchLimits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select(`
          subscribed,
          subscription_tier,
          link_limit,
          custom_domain_enabled,
          advanced_analytics_enabled,
          team_collaboration_enabled,
          api_access_enabled,
          white_label_enabled
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription limits:', error);
        return;
      }

      if (data) {
        setLimits({
          linkLimit: data.link_limit || 5,
          customDomainEnabled: data.custom_domain_enabled || false,
          advancedAnalyticsEnabled: data.advanced_analytics_enabled || false,
          teamCollaborationEnabled: data.team_collaboration_enabled || false,
          apiAccessEnabled: data.api_access_enabled || false,
          whiteLabelEnabled: data.white_label_enabled || false,
          subscriptionTier: data.subscription_tier,
          subscribed: data.subscribed || false,
        });
      } else {
        // No subscription record, use free plan defaults
        setLimits({
          linkLimit: 5,
          customDomainEnabled: false,
          advancedAnalyticsEnabled: false,
          teamCollaborationEnabled: false,
          apiAccessEnabled: false,
          whiteLabelEnabled: false,
          subscriptionTier: null,
          subscribed: false,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const canCreateLink = (currentLinkCount: number): boolean => {
    if (limits.linkLimit === -1) return true; // Unlimited
    return currentLinkCount < limits.linkLimit;
  };

  const getRemainingLinks = (currentLinkCount: number): number => {
    if (limits.linkLimit === -1) return -1; // Unlimited
    return Math.max(0, limits.linkLimit - currentLinkCount);
  };

  useEffect(() => {
    fetchLimits();
  }, [user]);

  return {
    limits,
    loading,
    canCreateLink,
    getRemainingLinks,
    refetchLimits: fetchLimits,
  };
};
