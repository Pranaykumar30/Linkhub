
-- Create links table for link management
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  icon_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  click_count INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- Create link clicks table for analytics
CREATE TABLE public.link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  country TEXT,
  city TEXT
);

-- Create subscribers table for premium features
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- RLS policies for links
CREATE POLICY "Users can view their own links" ON public.links
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own links" ON public.links
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links" ON public.links
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links" ON public.links
FOR DELETE USING (auth.uid() = user_id);

-- Public access for viewing links by username (for public profiles)
CREATE POLICY "Public can view active links" ON public.links
FOR SELECT USING (is_active = true);

-- RLS policies for link clicks
CREATE POLICY "Users can view their own link analytics" ON public.link_clicks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.links 
    WHERE links.id = link_clicks.link_id 
    AND links.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can create link clicks" ON public.link_clicks
FOR INSERT WITH CHECK (true);

-- RLS policies for subscribers
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Users can update their own subscription" ON public.subscribers
FOR UPDATE USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "System can insert subscriptions" ON public.subscribers
FOR INSERT WITH CHECK (true);

-- Add custom URL field to profiles for public pages
ALTER TABLE public.profiles ADD COLUMN custom_url TEXT UNIQUE;

-- Enable realtime for links table
ALTER TABLE public.links REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.links;

-- Enable realtime for link clicks table  
ALTER TABLE public.link_clicks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.link_clicks;
