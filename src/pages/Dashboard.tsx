
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProfileEditForm from '@/components/ProfileEditForm';
import LinkManager from '@/components/LinkManager';
import Analytics from '@/components/Analytics';
import SubscriptionManager from '@/components/SubscriptionManager';
import TestUserCreator from '@/components/TestUserCreator';
import { useState } from 'react';
import { ExternalLink, User, Settings, BarChart3, Crown, TestTube } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { subscription, limits, loading: subscriptionLoading } = useSubscription();
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const getGreeting = () => {
    const name = profile?.full_name || user?.email || 'there';
    return `Welcome back, ${name.split(' ')[0]}!`;
  };

  const getPublicUrl = () => {
    if (profile?.custom_url && limits.hasCustomUrl) {
      return `${window.location.origin}/${profile.custom_url}`;
    }
    return `${window.location.origin}/${user?.id}`;
  };

  const getPlanStatus = () => {
    if (subscriptionLoading) return 'Loading...';
    
    if (!subscription.subscribed) {
      return 'Free Plan';
    }
    
    return `${subscription.subscription_tier} Plan`;
  };

  if (profileLoading || subscriptionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{getGreeting()}</h1>
        <div className="flex items-center gap-4">
          <Badge variant={subscription.subscribed ? "default" : "outline"}>
            {getPlanStatus()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(getPublicUrl(), '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Public Profile
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getPlanStatus()}</div>
                <p className="text-xs text-muted-foreground">
                  {limits.maxLinks === -1 ? 'Unlimited links' : `Up to ${limits.maxLinks} links`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile?.full_name ? 'Complete' : 'Incomplete'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile?.full_name ? 'Profile setup complete' : 'Add your name and bio'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Public URL</CardTitle>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono truncate mb-2">
                  {limits.hasCustomUrl && profile?.custom_url 
                    ? `/${profile.custom_url}`
                    : `/${user?.id?.slice(0, 8)}...`
                  }
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(getPublicUrl(), '_blank')}
                  className="w-full"
                >
                  View Live
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get your profile ready
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => setShowProfileEdit(true)}
                className="justify-start gap-2 h-auto p-4"
              >
                <Settings className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Edit Profile</div>
                  <div className="text-sm text-muted-foreground">
                    Update your name, bio, and avatar
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => window.location.hash = '#links'}
                className="justify-start gap-2 h-auto p-4"
              >
                <ExternalLink className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Manage Links</div>
                  <div className="text-sm text-muted-foreground">
                    Add and organize your links
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links">
          <LinkManager />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowProfileEdit(true)} className="gap-2">
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium">
          <SubscriptionManager />
        </TabsContent>

        <TabsContent value="testing">
          <TestUserCreator />
        </TabsContent>
      </Tabs>

      {showProfileEdit && (
        <ProfileEditForm
          profile={profile}
          onClose={() => setShowProfileEdit(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
