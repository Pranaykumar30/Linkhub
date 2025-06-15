
-- Fix the search_path parameter for all functions to make them immutable
-- This resolves the "Function Search Path Mutable" warnings

-- Fix update_subscription_limits function
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix auto_publish_scheduled_links function
CREATE OR REPLACE FUNCTION public.auto_publish_scheduled_links()
RETURNS void AS $$
BEGIN
  UPDATE public.links
  SET is_active = true, is_scheduled = false
  WHERE scheduled_at <= now() 
    AND is_scheduled = true 
    AND is_active = false;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = _user_id AND is_active = true
  );
$$;

-- Fix get_admin_role function
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id uuid)
RETURNS admin_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT admin_role FROM public.admin_users 
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1;
$$;

-- Fix log_admin_activity function
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  _admin_user_id uuid,
  _action text,
  _target_table text DEFAULT NULL,
  _target_id uuid DEFAULT NULL,
  _old_data jsonb DEFAULT NULL,
  _new_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_activity_logs (
    admin_user_id, action, target_table, target_id, old_data, new_data
  ) VALUES (
    _admin_user_id, _action, _target_table, _target_id, _old_data, _new_data
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Fix increment_click_count function
CREATE OR REPLACE FUNCTION public.increment_click_count(link_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.links
  SET click_count = click_count + 1,
      updated_at = now()
  WHERE id = link_id;
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'username'
  );
  RETURN new;
END;
$$;
