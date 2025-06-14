
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

  const createLink = async (linkData: { title: string; url: string; description?: string; icon_url?: string; slug?: string; is_active?: boolean }) => {
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
      // Increment click count
      await supabase
        .from('links')
        .update({ click_count: links.find(l => l.id === linkId)?.click_count + 1 || 1 })
        .eq('id', linkId);

      // Record click analytics
      await supabase
        .from('link_clicks')
        .insert({
          link_id: linkId,
          ip_address: null, // In a real app, you'd get this from request
          user_agent: navigator.userAgent,
          referer: document.referrer,
        });
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [user]);

  // Set up real-time subscription for links
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `links-changes-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Links changed:', payload);
          fetchLinks();
        }
      )
      .subscribe();

    return () => {
      console.log(`Unsubscribing from channel: ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // Use user.id instead of user to prevent unnecessary re-subscriptions

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
