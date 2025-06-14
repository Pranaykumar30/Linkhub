
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export const useAdminSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchAllTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        toast({
          title: "Error loading tickets",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setTickets(data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string, priority?: string) => {
    if (!user) return { error: 'No admin user found' };

    setUpdating(true);
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (priority) updates.priority = priority;

      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error updating ticket",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Ticket updated",
        description: "Support ticket has been successfully updated.",
      });
      
      fetchAllTickets();
      return { data };
    } catch (error) {
      console.error('Error updating ticket:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    if (!user) return { error: 'No admin user found' };

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);

      if (error) {
        toast({
          title: "Error deleting ticket",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Ticket deleted",
        description: "Support ticket has been successfully deleted.",
      });
      
      fetchAllTickets();
      return { success: true };
    } catch (error) {
      console.error('Error deleting ticket:', error);
      return { error };
    } finally {
      setUpdating(false);
    }
  };

  const getTicketsByStatus = (status: string) => {
    return tickets.filter(ticket => ticket.status === status);
  };

  const getTicketsByPriority = (priority: string) => {
    return tickets.filter(ticket => ticket.priority === priority);
  };

  useEffect(() => {
    fetchAllTickets();
  }, [user]);

  return {
    tickets,
    loading,
    updating,
    updateTicketStatus,
    deleteTicket,
    getTicketsByStatus,
    getTicketsByPriority,
    refetchTickets: fetchAllTickets,
  };
};
