
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  custom_url: string | null;
  created_at: string;
  updated_at: string;
}

interface UserSubscription {
  id: string;
  user_id: string;
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  link_limit: number | null;
  created_at: string;
  updated_at: string;
}

interface UserLinks {
  id: string;
  user_id: string;
  title: string;
  url: string;
  click_count: number;
  is_active: boolean;
  created_at: string;
}

export const useAdminUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchAllUsers = async () => {
    if (!user) return;

    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching users:', profilesError);
        toast({
          title: "Error loading users",
          description: profilesError.message,
          variant: "destructive",
        });
      } else {
        setUsers(profilesData || []);
      }

      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
      } else {
        setSubscriptions(subscriptionsData || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No admin user found' };

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error updating user",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "User updated",
        description: "User profile has been successfully updated.",
      });
      
      fetchAllUsers();
      return { data };
    } catch (error) {
      console.error('Error updating user:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const updateUserSubscription = async (userId: string, updates: Partial<UserSubscription>) => {
    if (!user) return { error: 'No admin user found' };

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error updating subscription",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Subscription updated",
        description: "User subscription has been successfully updated.",
      });
      
      fetchAllUsers();
      return { data };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const getUserLinks = async (userId: string): Promise<UserLinks[]> => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user links:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user links:', error);
      return [];
    }
  };

  const deleteUserLink = async (linkId: string) => {
    if (!user) return { error: 'No admin user found' };

    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);

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
        description: "User link has been successfully deleted.",
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting link:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, [user]);

  return {
    users,
    subscriptions,
    loading,
    updating,
    updateUserProfile,
    updateUserSubscription,
    getUserLinks,
    deleteUserLink,
    refetchUsers: fetchAllUsers,
  };
};
