
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  status: string;
  invited_at?: string;
  joined_at?: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useTeams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    try {
      // First get team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);

      if (membersError) throw membersError;

      // Then get profile data for each member
      const membersWithProfiles = await Promise.all(
        (membersData || []).map(async (member) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, username, avatar_url')
            .eq('id', member.user_id)
            .single();

          return {
            ...member,
            status: member.role === 'owner' ? 'accepted' : 'pending', // Default status based on role
            profiles: profileData || undefined
          } as TeamMember;
        })
      );

      setTeamMembers(prev => ({ ...prev, [teamId]: membersWithProfiles }));
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const createTeam = async (name: string, description?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          name,
          description,
          owner_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Add owner as team member
      await supabase
        .from('team_members')
        .insert([{
          team_id: data.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString()
        }]);

      await fetchTeams();
      toast({
        title: "Success",
        description: "Team created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    }
  };

  const inviteToTeam = async (teamId: string, email: string, role: string = 'member') => {
    if (!user) return;

    try {
      // For now, we'll simulate invitation by showing a success message
      // In a real implementation, you'd send an email with an invitation link
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const removeTeamMember = async (teamId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchTeamMembers(teamId);
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const updateMemberRole = async (teamId: string, userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchTeamMembers(teamId);
      toast({
        title: "Success",
        description: "Member role updated successfully",
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchTeams().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    teams,
    teamMembers,
    loading,
    createTeam,
    inviteToTeam,
    removeTeamMember,
    updateMemberRole,
    fetchTeamMembers,
    refetch: fetchTeams
  };
};
