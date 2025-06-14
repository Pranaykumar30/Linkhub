
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomDomain {
  id: string;
  user_id: string;
  domain: string;
  is_verified: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomDomains = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDomains = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching domains:', error);
        toast({
          title: "Error loading domains",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setDomains(data || []);
      }
    } catch (error) {
      console.error('Error fetching domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const addDomain = async (domain: string) => {
    if (!user) return { error: 'No user found' };

    setUpdating(true);
    try {
      const { data, error } = await supabase
        .from('custom_domains')
        .insert({
          domain: domain.toLowerCase(),
          user_id: user.id,
          is_verified: false,
          is_primary: domains.length === 0, // First domain becomes primary
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error adding domain",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Domain added",
        description: "Your domain has been added. Verification instructions will be provided.",
      });
      
      fetchDomains();
      return { data };
    } catch (error) {
      console.error('Error adding domain:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const removeDomain = async (id: string) => {
    if (!user) return { error: 'No user found' };

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('custom_domains')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error removing domain",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Domain removed",
        description: "Your domain has been successfully removed.",
      });
      
      fetchDomains();
      return { success: true };
    } catch (error) {
      console.error('Error removing domain:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const setPrimaryDomain = async (id: string) => {
    if (!user) return { error: 'No user found' };

    setUpdating(true);
    try {
      // First, set all domains to non-primary
      await supabase
        .from('custom_domains')
        .update({ is_primary: false })
        .eq('user_id', user.id);

      // Then set the selected domain as primary
      const { error } = await supabase
        .from('custom_domains')
        .update({ is_primary: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error setting primary domain",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Primary domain updated",
        description: "Your primary domain has been updated.",
      });
      
      fetchDomains();
      return { success: true };
    } catch (error) {
      console.error('Error setting primary domain:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [user]);

  return {
    domains,
    loading,
    updating,
    addDomain,
    removeDomain,
    setPrimaryDomain,
    refetchDomains: fetchDomains,
  };
};
