
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalClicks: number;
  totalLinks: number;
  activeLinks: number;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
  topLinks: Array<{
    id: string;
    title: string;
    click_count: number;
  }>;
  recentClicks: Array<{
    id: string;
    link_title: string;
    clicked_at: string;
    user_agent?: string;
    referer?: string;
  }>;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalClicks: 0,
    totalLinks: 0,
    activeLinks: 0,
    clicksToday: 0,
    clicksThisWeek: 0,
    clicksThisMonth: 0,
    topLinks: [],
    recentClicks: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get basic link stats
      const { data: links, error: linksError } = await supabase
        .from('links')
        .select('id, title, click_count, is_active')
        .eq('user_id', user.id);

      if (linksError) throw linksError;

      // Get click analytics with date filters
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data: clicksToday, error: todayError } = await supabase
        .from('link_clicks')
        .select('id')
        .gte('clicked_at', startOfToday.toISOString())
        .in('link_id', links?.map(l => l.id) || []);

      const { data: clicksThisWeek, error: weekError } = await supabase
        .from('link_clicks')
        .select('id')
        .gte('clicked_at', startOfWeek.toISOString())
        .in('link_id', links?.map(l => l.id) || []);

      const { data: clicksThisMonth, error: monthError } = await supabase
        .from('link_clicks')
        .select('id')
        .gte('clicked_at', startOfMonth.toISOString())
        .in('link_id', links?.map(l => l.id) || []);

      // Get recent clicks with link titles
      const { data: recentClicks, error: recentError } = await supabase
        .from('link_clicks')
        .select(`
          id,
          clicked_at,
          user_agent,
          referer,
          links!inner(title)
        `)
        .in('link_id', links?.map(l => l.id) || [])
        .order('clicked_at', { ascending: false })
        .limit(10);

      if (todayError || weekError || monthError || recentError) {
        throw new Error('Error fetching analytics data');
      }

      const totalClicks = links?.reduce((sum, link) => sum + link.click_count, 0) || 0;
      const activeLinks = links?.filter(link => link.is_active).length || 0;
      const topLinks = links
        ?.sort((a, b) => b.click_count - a.click_count)
        .slice(0, 5)
        .map(link => ({
          id: link.id,
          title: link.title,
          click_count: link.click_count,
        })) || [];

      setAnalytics({
        totalClicks,
        totalLinks: links?.length || 0,
        activeLinks,
        clicksToday: clicksToday?.length || 0,
        clicksThisWeek: clicksThisWeek?.length || 0,
        clicksThisMonth: clicksThisMonth?.length || 0,
        topLinks,
        recentClicks: recentClicks?.map(click => ({
          id: click.id,
          link_title: (click.links as any)?.title || 'Unknown',
          clicked_at: click.clicked_at,
          user_agent: click.user_agent,
          referer: click.referer,
        })) || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return {
    analytics,
    loading,
    refetchAnalytics: fetchAnalytics,
  };
};
