
import { useState } from 'react';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, Ticket, Settings, Activity, Crown, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AdminUsersManager from './AdminUsersManager';
import AdminSupportManager from './AdminSupportManager';
import AdminActivityLogs from './AdminActivityLogs';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const { isAdmin, adminRole, loading, hasPermission } = useAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You don't have admin access. If you believe this is an error, please contact a system administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'super_admin': { label: 'Super Admin', variant: 'destructive' as const, icon: Crown },
      'admin': { label: 'Admin', variant: 'default' as const, icon: Shield },
      'moderator': { label: 'Moderator', variant: 'secondary' as const, icon: Users },
      'support_agent': { label: 'Support Agent', variant: 'outline' as const, icon: Ticket }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.support_agent;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, subscriptions, and support tickets
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/links">
              <Button variant="outline" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Go to Links
              </Button>
            </Link>
            {getRoleBadge(adminRole || 'support_agent')}
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Support
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2" disabled={!hasPermission('admin')}>
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2" disabled={!hasPermission('super_admin')}>
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <AdminUsersManager />
        </TabsContent>

        <TabsContent value="support">
          <AdminSupportManager />
        </TabsContent>

        <TabsContent value="activity">
          {hasPermission('admin') ? (
            <AdminActivityLogs />
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You need admin or higher permissions to view activity logs.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="settings">
          {hasPermission('super_admin') ? (
            <AdminSettings />
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You need super admin permissions to access settings.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
