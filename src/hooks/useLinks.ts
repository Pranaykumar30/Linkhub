
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  slug?: string;
  description?: string;
  icon_url?: string;
  is_active: boolean;
  is_scheduled?: boolean;
  scheduled_at?: string;
  click_count: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export const useLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchLinks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching links:', error);
        toast({
          title: "Error loading links",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setLinks(data || []);
      }
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (linkData: { 
    title: string; 
    url: string; 
    description?: string; 
    icon_url?: string; 
    slug?: string; 
    is_active?: boolean;
    scheduled_at?: string;
    is_scheduled?: boolean;
  }) => {
    if (!user) return { error: 'No user found' };

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('links')
        .insert({
          title: linkData.title,
          url: linkData.url,
          description: linkData.description || null,
          icon_url: linkData.icon_url || null,
          slug: linkData.slug || null,
          is_active: linkData.is_active ?? true,
          is_scheduled: linkData.is_scheduled || false,
          scheduled_at: linkData.scheduled_at || null,
          user_id: user.id,
          position: links.length,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error creating link",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Link created",
        description: "Your link has been successfully created.",
      });
      
      return { data };
    } catch (error) {
      console.error('Error creating link:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const updateLink = async (id: string, updates: Partial<Link>) => {
    if (!user) return { error: 'No user found' };

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error updating link",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Link updated",
        description: "Your link has been successfully updated.",
      });
      
      return { data };
    } catch (error) {
      console.error('Error updating link:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const deleteLink = async (id: string) => {
    if (!user) return { error: 'No user found' };

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error deleting link",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Link deleted",
        description: "Your link has been successfully deleted.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting link:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const recordClick = async (linkId: string) => {
    try {
      const currentLink = links.find(l => l.id === linkId);
      const newClickCount = (currentLink?.click_count || 0) + 1;

      // Optimistically update the local state
      setLinks(prev => prev.map(link => 
        link.id === linkId 
          ? { ...link, click_count: newClickCount }
          : link
      ));

      // Update the database
      const { error: updateError } = await supabase
        .from('links')
        .update({ click_count: newClickCount })
        .eq('id', linkId);

      if (updateError) {
        console.error('Error updating click count:', updateError);
        // Revert optimistic update on error
        fetchLinks();
        return;
      }

      // Record click analytics
      await supabase
        .from('link_clicks')
        .insert({
          link_id: linkId,
          ip_address: null,
          user_agent: navigator.userAgent,
          referer: document.referrer,
        });
    } catch (error) {
      console.error('Error recording click:', error);
      // Revert optimistic update on error
      fetchLinks();
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [user]);

  // Set up real-time subscription for links with improved reliability
  useEffect(() => {
    if (!user?.id) return;

    let channel: any = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    
    const setupRealtimeSubscription = () => {
      // Clean up existing channel if any
      if (channel) {
        supabase.removeChannel(channel);
      }

      const timestamp = Date.now();
      const channelName = `links-realtime-${user.id}-${timestamp}`;
      
      console.log(`Setting up links realtime subscription: ${channelName}`);
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'links',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Links realtime update received:', payload);
            // Always refetch to ensure data consistency
            fetchLinks();
          }
        )
        .subscribe((status) => {
          console.log(`Links subscription status: ${status}`);
          
          // Handle subscription failures and timeouts
          if (status === 'TIMED_OUT' || status === 'CLOSED') {
            console.log('Links subscription failed, attempting reconnect in 5 seconds...');
            reconnectTimeout = setTimeout(() => {
              setupRealtimeSubscription();
            }, 5000);
          }
        });
    };

    setupRealtimeSubscription();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (channel) {
        console.log(`Cleaning up links subscription: ${channel.topic}`);
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  return {
    links,
    loading,
    updating,
    createLink,
    updateLink,
    deleteLink,
    recordClick,
    refetchLinks: fetchLinks,
  };
};
