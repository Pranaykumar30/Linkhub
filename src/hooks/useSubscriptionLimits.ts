
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
  linkSchedulingEnabled: boolean;
  customProfileUrlEnabled: boolean;
  emailSupportEnabled: boolean;
  prioritySupportEnabled: boolean;
  customThemesEnabled: boolean;
  removeBrandingEnabled: boolean;
  analyticsExportEnabled: boolean;
  multipleDomainsEnabled: boolean;
  dedicatedSupportEnabled: boolean;
  customIntegrationsEnabled: boolean;
  advancedSecurityEnabled: boolean;
  isAdmin?: boolean;
}

// Test subscription data for different plans
const getTestSubscriptionLimits = (tier: string | null): SubscriptionLimits => {
  switch (tier) {
    case 'Basic':
      return {
        linkLimit: 25,
        customDomainEnabled: false,
        advancedAnalyticsEnabled: false,
        teamCollaborationEnabled: false,
        apiAccessEnabled: false,
        whiteLabelEnabled: false,
        subscriptionTier: 'Basic',
        subscribed: true,
        linkSchedulingEnabled: false,
        customProfileUrlEnabled: true,
        emailSupportEnabled: true,
        prioritySupportEnabled: false,
        customThemesEnabled: false,
        removeBrandingEnabled: false,
        analyticsExportEnabled: false,
        multipleDomainsEnabled: false,
        dedicatedSupportEnabled: false,
        customIntegrationsEnabled: false,
        advancedSecurityEnabled: false,
      };
    case 'Premium':
      return {
        linkLimit: 100,
        customDomainEnabled: true,
        advancedAnalyticsEnabled: true,
        teamCollaborationEnabled: false,
        apiAccessEnabled: false,
        whiteLabelEnabled: true,
        subscriptionTier: 'Premium',
        subscribed: true,
        linkSchedulingEnabled: true,
        customProfileUrlEnabled: true,
        emailSupportEnabled: true,
        prioritySupportEnabled: true,
        customThemesEnabled: true,
        removeBrandingEnabled: true,
        analyticsExportEnabled: false,
        multipleDomainsEnabled: false,
        dedicatedSupportEnabled: false,
        customIntegrationsEnabled: false,
        advancedSecurityEnabled: false,
      };
    case 'Enterprise':
      return {
        linkLimit: -1, // Unlimited
        customDomainEnabled: true,
        advancedAnalyticsEnabled: true,
        teamCollaborationEnabled: true,
        apiAccessEnabled: true,
        whiteLabelEnabled: true,
        subscriptionTier: 'Enterprise',
        subscribed: true,
        linkSchedulingEnabled: true,
        customProfileUrlEnabled: true,
        emailSupportEnabled: true,
        prioritySupportEnabled: true,
        customThemesEnabled: true,
        removeBrandingEnabled: true,
        analyticsExportEnabled: true,
        multipleDomainsEnabled: true,
        dedicatedSupportEnabled: true,
        customIntegrationsEnabled: true,
        advancedSecurityEnabled: true,
      };
    default:
      return {
        linkLimit: 5,
        customDomainEnabled: false,
        advancedAnalyticsEnabled: false,
        teamCollaborationEnabled: false,
        apiAccessEnabled: false,
        whiteLabelEnabled: false,
        subscriptionTier: null,
        subscribed: false,
        linkSchedulingEnabled: false,
        customProfileUrlEnabled: false,
        emailSupportEnabled: false,
        prioritySupportEnabled: false,
        customThemesEnabled: false,
        removeBrandingEnabled: false,
        analyticsExportEnabled: false,
        multipleDomainsEnabled: false,
        dedicatedSupportEnabled: false,
        customIntegrationsEnabled: false,
        advancedSecurityEnabled: false,
      };
  }
};

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
    linkSchedulingEnabled: false,
    customProfileUrlEnabled: false,
    emailSupportEnabled: false,
    prioritySupportEnabled: false,
    customThemesEnabled: false,
    removeBrandingEnabled: false,
    analyticsExportEnabled: false,
    multipleDomainsEnabled: false,
    dedicatedSupportEnabled: false,
    customIntegrationsEnabled: false,
    advancedSecurityEnabled: false,
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchLimits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Check if user is admin first
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('admin_role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      // If user is admin, automatically grant Enterprise privileges
      if (adminData) {
        const enterpriseLimits = getTestSubscriptionLimits('Enterprise');
        setLimits({
          ...enterpriseLimits,
          isAdmin: true,
        });
        setLoading(false);
        return;
      }

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
        const tierLimits = getTestSubscriptionLimits(data.subscription_tier);
        setLimits({
          ...tierLimits,
          linkLimit: data.link_limit || tierLimits.linkLimit,
          customDomainEnabled: data.custom_domain_enabled || tierLimits.customDomainEnabled,
          advancedAnalyticsEnabled: data.advanced_analytics_enabled || tierLimits.advancedAnalyticsEnabled,
          teamCollaborationEnabled: data.team_collaboration_enabled || tierLimits.teamCollaborationEnabled,
          apiAccessEnabled: data.api_access_enabled || tierLimits.apiAccessEnabled,
          whiteLabelEnabled: data.white_label_enabled || tierLimits.whiteLabelEnabled,
          subscribed: data.subscribed || false,
          isAdmin: false,
        });
      } else {
        // No subscription record, use free plan defaults
        setLimits({
          ...getTestSubscriptionLimits(null),
          isAdmin: false,
        });
      }
    } catch (error) {
      console.error('Error fetching subscription limits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a test mode function that can simulate different subscription tiers
  const setTestMode = (testTier: string | null) => {
    const testLimits = getTestSubscriptionLimits(testTier);
    setLimits(testLimits);
    console.log(`Test mode activated: ${testTier || 'Free'} plan`, testLimits);
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
    setTestMode, // Expose test mode function
  };
};
