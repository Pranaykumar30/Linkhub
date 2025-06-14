
-- Create admin roles enum
CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'moderator', 'support_agent');

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  admin_role admin_role NOT NULL DEFAULT 'support_agent',
  permissions JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create admin activity logs
CREATE TABLE public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create function to check admin permissions
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = _user_id AND is_active = true
  );
$$;

-- Create function to get admin role
CREATE OR REPLACE FUNCTION public.get_admin_role(_user_id UUID)
RETURNS admin_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT admin_role FROM public.admin_users 
  WHERE user_id = _user_id AND is_active = true
  LIMIT 1;
$$;

-- RLS policies for admin tables (only admins can access)
CREATE POLICY "Only admins can access admin_users" ON public.admin_users
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can access admin_activity_logs" ON public.admin_activity_logs
  FOR ALL USING (public.is_admin(auth.uid()));

-- Create policies to allow admins to access all user data
CREATE POLICY "Admins can access all profiles" ON public.profiles
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can access all links" ON public.links
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can access all subscribers" ON public.subscribers
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can access all support tickets" ON public.support_tickets
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can access all custom domains" ON public.custom_domains
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can access all API keys" ON public.api_keys
  FOR ALL USING (public.is_admin(auth.uid()));

-- Function to log admin activities
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  _admin_user_id UUID,
  _action TEXT,
  _target_table TEXT DEFAULT NULL,
  _target_id UUID DEFAULT NULL,
  _old_data JSONB DEFAULT NULL,
  _new_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Insert a default super admin (you'll need to replace with your actual user ID)
-- This is commented out - you should run this manually with your user ID
-- INSERT INTO public.admin_users (user_id, admin_role) 
-- VALUES ('your-user-id-here', 'super_admin');
