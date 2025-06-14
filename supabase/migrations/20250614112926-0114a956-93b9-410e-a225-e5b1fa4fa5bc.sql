
-- Add tables for link scheduling
CREATE TABLE public.scheduled_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add custom domains table
CREATE TABLE public.custom_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add team collaboration tables
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add API keys table for Enterprise users
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  key_name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add branding settings to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS show_branding BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_branding_text TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_branding_url TEXT;

-- Add scheduled_at column to links table for scheduling
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.scheduled_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies for scheduled_links
CREATE POLICY "Users can manage their own scheduled links" ON public.scheduled_links
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for custom_domains
CREATE POLICY "Users can manage their own domains" ON public.custom_domains
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for teams
CREATE POLICY "Team owners can manage their teams" ON public.teams
  FOR ALL USING (auth.uid() = owner_id);

-- RLS policies for team_members
CREATE POLICY "Team members can view their memberships" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT owner_id FROM public.teams WHERE id = team_id
  ));

CREATE POLICY "Team owners can manage members" ON public.team_members
  FOR ALL USING (auth.uid() IN (
    SELECT owner_id FROM public.teams WHERE id = team_id
  ));

-- RLS policies for api_keys
CREATE POLICY "Users can manage their own API keys" ON public.api_keys
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for support_tickets
CREATE POLICY "Users can manage their own support tickets" ON public.support_tickets
  FOR ALL USING (auth.uid() = user_id);

-- Create function to auto-publish scheduled links
CREATE OR REPLACE FUNCTION auto_publish_scheduled_links()
RETURNS void AS $$
BEGIN
  UPDATE public.links
  SET is_active = true, is_scheduled = false
  WHERE scheduled_at <= now() 
    AND is_scheduled = true 
    AND is_active = false;
END;
$$ LANGUAGE plpgsql;
