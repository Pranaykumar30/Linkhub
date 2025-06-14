
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Plus, UserPlus, Shield, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [newAdminForm, setNewAdminForm] = useState({
    user_id: '',
    admin_role: 'support_agent',
  });
  const [isCreating, setIsCreating] = useState(false);

  const createAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: newAdminForm.user_id,
          admin_role: newAdminForm.admin_role as any,
        });

      if (error) {
        toast({
          title: "Error creating admin user",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Admin user created",
          description: "New admin user has been successfully created.",
        });
        setNewAdminForm({ user_id: '', admin_role: 'support_agent' });
        setIsCreating(false);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: "Error creating admin user",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Settings
          </CardTitle>
          <CardDescription>
            Manage administrative settings and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These settings require super admin permissions. Use with caution as changes can affect system security.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin User Management</CardTitle>
                <CardDescription>
                  Create and manage admin users with different permission levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Admin Role Hierarchy</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Super Admin</Badge>
                      <span className="text-sm text-muted-foreground">Full system access, can manage all admins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Admin</Badge>
                      <span className="text-sm text-muted-foreground">User management, advanced features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Moderator</Badge>
                      <span className="text-sm text-muted-foreground">Content moderation, user support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Support Agent</Badge>
                      <span className="text-sm text-muted-foreground">Support ticket management only</span>
                    </div>
                  </div>
                </div>

                <Dialog open={isCreating} onOpenChange={setIsCreating}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Admin User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Admin User</DialogTitle>
                      <DialogDescription>
                        Grant admin privileges to a user. Make sure you trust this user with admin access.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={createAdminUser} className="space-y-4">
                      <div>
                        <Label htmlFor="user_id">User ID</Label>
                        <Input
                          id="user_id"
                          placeholder="Enter the UUID of the user"
                          value={newAdminForm.user_id}
                          onChange={(e) => setNewAdminForm(prev => ({ ...prev, user_id: e.target.value }))}
                          required
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          You can find the user ID in the User Management section
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="admin_role">Admin Role</Label>
                        <Select
                          value={newAdminForm.admin_role}
                          onValueChange={(value) => setNewAdminForm(prev => ({ ...prev, admin_role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="support_agent">Support Agent</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={isCreating}>
                          {isCreating ? 'Creating...' : 'Create Admin User'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreating(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Security</CardTitle>
                <CardDescription>
                  Security settings and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Row Level Security (RLS) is enabled on all admin tables. Only authenticated admin users can access admin data.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Protected Tables</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• admin_users</li>
                        <li>• admin_activity_logs</li>
                        <li>• All user data tables</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Security Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Activity logging</li>
                        <li>• Role-based permissions</li>
                        <li>• Secure functions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
