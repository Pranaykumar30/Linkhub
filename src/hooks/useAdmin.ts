
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  user_id: string;
  admin_role: 'super_admin' | 'admin' | 'moderator' | 'support_agent';
  permissions: Record<string, any>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface AdminActivity {
  id: string;
  admin_user_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  old_data: any;
  new_data: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data: adminData, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
      } else if (adminData) {
        setIsAdmin(true);
        setAdminRole(adminData.admin_role);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (action: string, targetTable?: string, targetId?: string, oldData?: any, newData?: any) => {
    if (!user || !isAdmin) return;

    try {
      await supabase.rpc('log_admin_activity', {
        _admin_user_id: user.id,
        _action: action,
        _target_table: targetTable || null,
        _target_id: targetId || null,
        _old_data: oldData || null,
        _new_data: newData || null
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  };

  const hasPermission = (requiredRole: string): boolean => {
    if (!isAdmin || !adminRole) return false;
    
    const roleHierarchy = {
      'super_admin': 4,
      'admin': 3,
      'moderator': 2,
      'support_agent': 1
    };

    const currentLevel = roleHierarchy[adminRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return currentLevel >= requiredLevel;
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  return {
    isAdmin,
    adminRole,
    loading,
    logActivity,
    hasPermission,
    refetchAdminStatus: checkAdminStatus,
  };
};
