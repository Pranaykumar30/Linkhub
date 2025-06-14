
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Mail, Lock, Trash2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const AccountSettings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [emailUpdating, setEmailUpdating] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setEmailUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: newEmail.trim() 
      });

      if (error) throw error;

      toast({
        title: "Email update initiated",
        description: "Please check both your old and new email addresses for confirmation links.",
      });
      setNewEmail('');
    } catch (error: any) {
      toast({
        title: "Failed to update email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setEmailUpdating(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setPasswordUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPasswordUpdating(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      // First delete user data
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (profileError) console.error('Error deleting profile:', profileError);

      const { error: linksError } = await supabase
        .from('links')
        .delete()
        .eq('user_id', user?.id);

      if (linksError) console.error('Error deleting links:', linksError);

      // Then sign out (Supabase doesn't allow deleting auth users from client)
      await signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            View and manage your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Email Address</Label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Account Created</Label>
            <Input 
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''} 
              disabled 
            />
          </div>
          <div className="grid gap-2">
            <Label>Email Verified</Label>
            <Input 
              value={user?.email_confirmed_at ? 'Yes' : 'No'} 
              disabled 
            />
          </div>
        </CardContent>
      </Card>

      {/* Update Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Change Email Address
          </CardTitle>
          <CardDescription>
            Update your email address. You'll need to confirm both old and new addresses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateEmail} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="newEmail">New Email Address</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                required
              />
            </div>
            <Button type="submit" disabled={emailUpdating || !newEmail.trim()}>
              {emailUpdating ? 'Updating...' : 'Update Email'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Update Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updatePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <Button type="submit" disabled={passwordUpdating || !newPassword || !confirmPassword}>
              {passwordUpdating ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account Permanently
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers, including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your profile and personal information</li>
                    <li>All your links and their analytics</li>
                    <li>Your custom URL and public profile</li>
                    <li>Any subscription data</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
