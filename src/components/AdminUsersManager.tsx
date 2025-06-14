
import { useState } from 'react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Edit, Trash2, Eye, Link as LinkIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const AdminUsersManager = () => {
  const { users, subscriptions, loading, updating, updateUserProfile, updateUserSubscription, getUserLinks, deleteUserLink } = useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLinks, setUserLinks] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserSubscription = (userId: string) => {
    return subscriptions.find(sub => sub.user_id === userId);
  };

  const handleEditProfile = async (userId: string, updates: any) => {
    await updateUserProfile(userId, updates);
    setEditingProfile(false);
  };

  const handleEditSubscription = async (userId: string, updates: any) => {
    await updateUserSubscription(userId, updates);
    setEditingSubscription(false);
  };

  const handleViewUserDetails = async (user: any) => {
    setSelectedUser(user);
    const links = await getUserLinks(user.id);
    setUserLinks(links);
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) return <Badge variant="outline">Free</Badge>;
    
    const config = {
      'Basic': { variant: 'secondary' as const },
      'Premium': { variant: 'default' as const },
      'Enterprise': { variant: 'destructive' as const }
    };
    
    const tierConfig = config[tier as keyof typeof config] || { variant: 'outline' as const };
    return <Badge variant={tierConfig.variant}>{tier}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage all user accounts, profiles, and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search users by name, username, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const subscription = getUserSubscription(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback>
                            {user.full_name?.[0] || user.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.username || 'No username'}</TableCell>
                    <TableCell>
                      {subscription ? getTierBadge(subscription.subscription_tier) : getTierBadge(null)}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewUserDetails(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                              <DialogDescription>
                                Manage user profile and subscription
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                {/* Profile Section */}
                                <Card>
                                  <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Profile Information</CardTitle>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingProfile(true)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                  </CardHeader>
                                  <CardContent>
                                    {editingProfile ? (
                                      <ProfileEditForm 
                                        user={selectedUser}
                                        onSave={(updates) => handleEditProfile(selectedUser.id, updates)}
                                        onCancel={() => setEditingProfile(false)}
                                      />
                                    ) : (
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Full Name</Label>
                                          <p className="font-medium">{selectedUser.full_name || 'Not set'}</p>
                                        </div>
                                        <div>
                                          <Label>Username</Label>
                                          <p className="font-medium">{selectedUser.username || 'Not set'}</p>
                                        </div>
                                        <div>
                                          <Label>Custom URL</Label>
                                          <p className="font-medium">{selectedUser.custom_url || 'Not set'}</p>
                                        </div>
                                        <div>
                                          <Label>Website</Label>
                                          <p className="font-medium">{selectedUser.website || 'Not set'}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <Label>Bio</Label>
                                          <p className="font-medium">{selectedUser.bio || 'Not set'}</p>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Subscription Section */}
                                <Card>
                                  <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Subscription</CardTitle>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setEditingSubscription(true)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                  </CardHeader>
                                  <CardContent>
                                    {editingSubscription ? (
                                      <SubscriptionEditForm 
                                        subscription={getUserSubscription(selectedUser.id)}
                                        onSave={(updates) => handleEditSubscription(selectedUser.id, updates)}
                                        onCancel={() => setEditingSubscription(false)}
                                      />
                                    ) : (
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Plan</Label>
                                          <p className="font-medium">
                                            {getUserSubscription(selectedUser.id)?.subscription_tier || 'Free'}
                                          </p>
                                        </div>
                                        <div>
                                          <Label>Status</Label>
                                          <p className="font-medium">
                                            {getUserSubscription(selectedUser.id)?.subscribed ? 'Active' : 'Inactive'}
                                          </p>
                                        </div>
                                        <div>
                                          <Label>Link Limit</Label>
                                          <p className="font-medium">
                                            {getUserSubscription(selectedUser.id)?.link_limit || 'Not set'}
                                          </p>
                                        </div>
                                        <div>
                                          <Label>End Date</Label>
                                          <p className="font-medium">
                                            {getUserSubscription(selectedUser.id)?.subscription_end 
                                              ? new Date(getUserSubscription(selectedUser.id)!.subscription_end!).toLocaleDateString()
                                              : 'Not set'
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Links Section */}
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <LinkIcon className="h-5 w-5" />
                                      User Links ({userLinks.length})
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    {userLinks.length === 0 ? (
                                      <p className="text-muted-foreground">No links found</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {userLinks.map((link) => (
                                          <div key={link.id} className="flex items-center justify-between p-3 border rounded">
                                            <div>
                                              <h4 className="font-medium">{link.title}</h4>
                                              <p className="text-sm text-muted-foreground">{link.url}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {link.click_count} clicks • {link.is_active ? 'Active' : 'Inactive'}
                                              </p>
                                            </div>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => deleteUserLink(link.id)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

const ProfileEditForm = ({ user, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    username: user.username || '',
    bio: user.bio || '',
    website: user.website || '',
    custom_url: user.custom_url || '',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="custom_url">Custom URL</Label>
          <Input
            id="custom_url"
            value={formData.custom_url}
            onChange={(e) => setFormData(prev => ({ ...prev, custom_url: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
        />
      </div>
      <div className="flex gap-3">
        <Button onClick={() => onSave(formData)}>Save Changes</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

const SubscriptionEditForm = ({ subscription, onSave, onCancel }: any) => {
  const [formData, setFormData] = useState({
    subscription_tier: subscription?.subscription_tier || '',
    subscribed: subscription?.subscribed || false,
    link_limit: subscription?.link_limit || 5,
    subscription_end: subscription?.subscription_end || '',
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subscription_tier">Plan</Label>
          <Select
            value={formData.subscription_tier}
            onValueChange={(value) => setFormData(prev => ({ ...prev, subscription_tier: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Free</SelectItem>
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="link_limit">Link Limit</Label>
          <Input
            id="link_limit"
            type="number"
            value={formData.link_limit}
            onChange={(e) => setFormData(prev => ({ ...prev, link_limit: parseInt(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="subscription_end">End Date</Label>
          <Input
            id="subscription_end"
            type="date"
            value={formData.subscription_end ? formData.subscription_end.split('T')[0] : ''}
            onChange={(e) => setFormData(prev => ({ ...prev, subscription_end: e.target.value }))}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => onSave(formData)}>Save Changes</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

export default AdminUsersManager;
