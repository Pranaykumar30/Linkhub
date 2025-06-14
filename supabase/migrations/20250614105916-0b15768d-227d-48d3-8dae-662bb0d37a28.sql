
-- Add subscription limits tracking to the subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS link_limit INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS custom_domain_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS advanced_analytics_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS team_collaboration_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS api_access_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS white_label_enabled BOOLEAN DEFAULT false;

-- Create a function to update subscription limits based on tier
CREATE OR REPLACE FUNCTION public.update_subscription_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Set limits based on subscription tier
  CASE NEW.subscription_tier
    WHEN 'Basic' THEN
      NEW.link_limit := 25;
      NEW.custom_domain_enabled := false;
      NEW.advanced_analytics_enabled := false;
      NEW.team_collaboration_enabled := false;
      NEW.api_access_enabled := false;
      NEW.white_label_enabled := false;
    WHEN 'Premium' THEN
      NEW.link_limit := 100;
      NEW.custom_domain_enabled := true;
      NEW.advanced_analytics_enabled := true;
      NEW.team_collaboration_enabled := false;
      NEW.api_access_enabled := false;
      NEW.white_label_enabled := true;
    WHEN 'Enterprise' THEN
      NEW.link_limit := -1; -- -1 means unlimited
      NEW.custom_domain_enabled := true;
      NEW.advanced_analytics_enabled := true;
      NEW.team_collaboration_enabled := true;
      NEW.api_access_enabled := true;
      NEW.white_label_enabled := true;
    ELSE
      -- Free plan (null or any other value)
      NEW.link_limit := 5;
      NEW.custom_domain_enabled := false;
      NEW.advanced_analytics_enabled := false;
      NEW.team_collaboration_enabled := false;
      NEW.api_access_enabled := false;
      NEW.white_label_enabled := false;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update limits when subscription tier changes
DROP TRIGGER IF EXISTS update_subscription_limits_trigger ON public.subscribers;
CREATE TRIGGER update_subscription_limits_trigger
  BEFORE INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_limits();

-- Update existing records to have proper limits
UPDATE public.subscribers 
SET subscription_tier = COALESCE(subscription_tier, 'Free')
WHERE subscription_tier IS NULL OR subscription_tier = '';
