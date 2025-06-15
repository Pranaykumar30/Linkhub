
import { useState } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, Settings, Crown, Shield, User, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TeamCollaboration = () => {
  const { user } = useAuth();
  const { teams, teamMembers, loading, createTeam, inviteToTeam, removeTeamMember, updateMemberRole, fetchTeamMembers } = useTeams();
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [inviteData, setInviteData] = useState({ email: '', role: 'member' });

  const handleCreateTeam = async () => {
    if (!newTeam.name.trim()) return;
    
    await createTeam(newTeam.name, newTeam.description);
    setNewTeam({ name: '', description: '' });
    setShowCreateDialog(false);
  };

  const handleInviteUser = async () => {
    if (!inviteData.email.trim() || !selectedTeam) return;
    
    await inviteToTeam(selectedTeam, inviteData.email, inviteData.role);
    setInviteData({ email: '', role: 'member' });
    setShowInviteDialog(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default' as const;
      case 'admin':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const canManageTeam = (team: any) => {
    return team.owner_id === user?.id;
  };

  const canManageMember = (team: any, member: any) => {
    if (team.owner_id === user?.id) return true;
    
    const currentUserMember = teamMembers[team.id]?.find(m => m.user_id === user?.id);
    return currentUserMember?.role === 'admin' && member.role === 'member';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">Team Collaboration</h2>
          <p className="text-muted-foreground">Manage your teams and collaborate with others</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to collaborate with others on your links.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="team-description">Description (Optional)</Label>
                <Textarea
                  id="team-description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Enter team description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam}>Create Team</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-card-foreground">No Teams Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first team to start collaborating with others.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Users className="h-4 w-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={selectedTeam} onValueChange={setSelectedTeam} className="space-y-6">
          <TabsList className="grid w-full grid-cols-auto">
            {teams.map((team) => (
              <TabsTrigger key={team.id} value={team.id}>
                {team.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {teams.map((team) => (
            <TabsContent key={team.id} value={team.id}>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                          <Users className="h-5 w-5" />
                          {team.name}
                        </CardTitle>
                        <CardDescription>
                          {team.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      {canManageTeam(team) && (
                        <Badge variant="default">Owner</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Created: {new Date(team.created_at).toLocaleDateString()}
                        </span>
                        {canManageTeam(team) && (
                          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  setSelectedTeam(team.id);
                                  fetchTeamMembers(team.id);
                                }}
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Member
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Invite Team Member</DialogTitle>
                                <DialogDescription>
                                  Invite someone to join {team.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="invite-email">Email Address</Label>
                                  <Input
                                    id="invite-email"
                                    type="email"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                                    placeholder="Enter email address"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="invite-role">Role</Label>
                                  <Select 
                                    value={inviteData.role} 
                                    onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="member">Member</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={handleInviteUser}>Send Invitation</Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Team Members</CardTitle>
                    <CardDescription>
                      {teamMembers[team.id]?.length || 0} members in this team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teamMembers[team.id]?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={member.profiles?.avatar_url || ''} />
                              <AvatarFallback>
                                {member.profiles?.full_name?.[0] || member.profiles?.username?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-card-foreground">
                                {member.profiles?.full_name || member.profiles?.username || 'Unknown User'}
                              </p>
                              <div className="flex items-center gap-2">
                                {getRoleIcon(member.role)}
                                <Badge variant={getRoleBadgeVariant(member.role)}>
                                  {member.role}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          {canManageMember(team, member) && member.user_id !== user?.id && (
                            <div className="flex items-center gap-2">
                              <Select 
                                value={member.role} 
                                onValueChange={(value) => updateMemberRole(team.id, member.user_id, value)}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeTeamMember(team.id, member.user_id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {(!teamMembers[team.id] || teamMembers[team.id].length === 0) && (
                        <p className="text-muted-foreground text-center py-4">
                          No members found. Click "Invite Member" to add team members.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default TeamCollaboration;
