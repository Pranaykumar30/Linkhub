
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  user_id: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

export const useApiKeys = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchApiKeys = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching API keys:', error);
        toast({
          title: "Error loading API keys",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setApiKeys(data || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'lh_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createApiKey = async (keyName: string, expiresIn?: number) => {
    if (!user) return { error: 'No user found' };

    setUpdating(true);
    try {
      const apiKey = generateApiKey();
      const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString() : null;

      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          key_name: keyName,
          api_key: apiKey,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) {
        toast({
          title: "Error creating API key",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "API key created",
        description: "Your new API key has been generated. Make sure to copy it now as you won't be able to see it again.",
      });
      
      fetchApiKeys();
      return { data };
    } catch (error) {
      console.error('Error creating API key:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!user) return { error: 'No user found' };

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error deleting API key",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "API key deleted",
        description: "Your API key has been successfully deleted.",
      });
      
      fetchApiKeys();
      return { success: true };
    } catch (error) {
      console.error('Error deleting API key:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const toggleApiKey = async (id: string, isActive: boolean) => {
    if (!user) return { error: 'No user found' };

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: isActive })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error updating API key",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: `API key ${isActive ? 'activated' : 'deactivated'}`,
        description: `Your API key has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
      
      fetchApiKeys();
      return { success: true };
    } catch (error) {
      console.error('Error updating API key:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  return {
    apiKeys,
    loading,
    updating,
    createApiKey,
    deleteApiKey,
    toggleApiKey,
    refetchApiKeys: fetchApiKeys,
  };
};
