
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalClicks: number;
  totalLinks: number;
  activeLinks: number;
  topPerformingLinks: Array<{
    id: string;
    title: string;
    url: string;
    click_count: number;
  }>;
  clicksByDate: Array<{
    date: string;
    clicks: number;
  }>;
  clicksByCountry: Array<{
    country: string;
    clicks: number;
  }>;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClicks: 0,
    totalLinks: 0,
    activeLinks: 0,
    topPerformingLinks: [],
    clicksByDate: [],
    clicksByCountry: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get user's links
      const { data: links, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id);

      if (linksError) throw linksError;

      const totalLinks = links?.length || 0;
      const activeLinks = links?.filter(link => link.is_active).length || 0;
      const totalClicks = links?.reduce((sum, link) => sum + link.click_count, 0) || 0;

      // Get top performing links
      const topPerformingLinks = links
        ?.sort((a, b) => b.click_count - a.click_count)
        .slice(0, 5)
        .map(link => ({
          id: link.id,
          title: link.title,
          url: link.url,
          click_count: link.click_count,
        })) || [];

      // Get clicks by date (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: clickData, error: clickError } = await supabase
        .from('link_clicks')
        .select('clicked_at, country')
        .in('link_id', links?.map(link => link.id) || [])
        .gte('clicked_at', thirtyDaysAgo.toISOString());

      if (clickError) throw clickError;

      // Process clicks by date
      const clicksByDate = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const clicks = clickData?.filter(click => 
          click.clicked_at.startsWith(dateStr)
        ).length || 0;
        return { date: dateStr, clicks };
      }).reverse();

      // Process clicks by country
      const countryClickCounts = clickData?.reduce((acc, click) => {
        if (click.country) {
          acc[click.country] = (acc[click.country] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const clicksByCountry = Object.entries(countryClickCounts)
        .map(([country, clicks]) => ({ country, clicks }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 10);

      setAnalytics({
        totalClicks,
        totalLinks,
        activeLinks,
        topPerformingLinks,
        clicksByDate,
        clicksByCountry,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error loading analytics",
        description: "Failed to load analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  // Set up real-time subscriptions for analytics updates
  useEffect(() => {
    if (!user?.id) return;

    let linksChannel: any = null;
    let clicksChannel: any = null;
    
    const setupRealtimeSubscriptions = () => {
      console.log('Setting up analytics realtime subscriptions');
      
      const timestamp = Date.now();
      
      // Listen for link changes (click count updates)
      linksChannel = supabase
        .channel(`analytics-links-${user.id}-${timestamp}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'links',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Analytics: Link updated:', payload);
            fetchAnalytics();
          }
        )
        .subscribe((status) => {
          console.log(`Analytics links subscription status: ${status}`);
        });

      // Listen for new click records
      clicksChannel = supabase
        .channel(`analytics-clicks-${user.id}-${timestamp}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'link_clicks'
          },
          (payload) => {
            console.log('Analytics: New click recorded:', payload);
            // Check if this click belongs to user's links by fetching fresh data
            fetchAnalytics();
          }
        )
        .subscribe((status) => {
          console.log(`Analytics clicks subscription status: ${status}`);
        });
    };

    setupRealtimeSubscriptions();

    return () => {
      if (linksChannel) {
        console.log('Cleaning up analytics links subscription');
        supabase.removeChannel(linksChannel);
      }
      if (clicksChannel) {
        console.log('Cleaning up analytics clicks subscription');
        supabase.removeChannel(clicksChannel);
      }
    };
  }, [user?.id]);

  return {
    analytics,
    loading,
    refetchAnalytics: fetchAnalytics,
  };
};
