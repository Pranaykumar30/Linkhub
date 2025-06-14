
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, Globe, Edit, Settings, Activity, Bell, UserPlus, ExternalLink, Home } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileEditForm from '@/components/ProfileEditForm';
import AccountSettings from '@/components/AccountSettings';
import ActivityHistory from '@/components/ActivityHistory';
import NotificationSettings from '@/components/NotificationSettings';
import ExtendedProfileForm from '@/components/ExtendedProfileForm';
import AuthButton from '@/components/AuthButton';
import LinkManager from '@/components/LinkManager';
import Analytics from '@/components/Analytics';
import SubscriptionManager from '@/components/SubscriptionManager';

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, loading, refetchProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <AuthButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return user.email?.[0]?.toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Mock subscription data - will be replaced with real data when Stripe is integrated
  const mockSubscription = {
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  };

  const getPublicProfileUrl = () => {
    if (profile?.custom_url) {
      // For paid plans, use custom domain (when available)
      if (mockSubscription.subscribed) {
        return `/${profile.custom_url}`;
      }
    }
    // For free plan, always use LinkHub subdomain
    return `https://linkhub.app/${profile?.custom_url || user.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">L</span>
              </div>
              <h1 className="text-xl font-semibold">LinkHub Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/links">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {loading ? (
                    <Skeleton className="h-20 w-20 rounded-full" />
                  ) : (
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="text-lg">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-xl">
                      {profile?.full_name || 'No name set'}
                    </CardTitle>
                    <CardDescription>
                      @{profile?.username || 'no-username'}
                    </CardDescription>
                    {(profile?.custom_url || !mockSubscription.subscribed) && (
                      <div className="mt-2">
                        <Badge variant={mockSubscription.subscribed ? "default" : "secondary"} className="text-xs">
                          {mockSubscription.subscribed ? `/${profile?.custom_url}` : 'LinkHub URL'}
                        </Badge>
                      </div>
                    )}
                  </>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : (
                  <>
                    {profile?.bio && (
                      <p className="text-sm text-muted-foreground text-center">
                        {profile.bio}
                      </p>
                    )}
                    
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      
                      {profile?.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                      
                      {profile?.created_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Joined {formatDate(profile.created_at)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>

                    {(profile?.custom_url || !mockSubscription.subscribed) && (
                      <Button 
                        asChild
                        className="w-full"
                        variant="secondary"
                      >
                        <a 
                          href={getPublicProfileUrl()} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Public Profile
                        </a>
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="subscription">Premium</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Welcome Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!</CardTitle>
                    <CardDescription>
                      Manage your links and track their performance from your LinkHub dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="font-medium">Account Status</h4>
                        <Badge variant="secondary">
                          {user.email_confirmed_at ? 'Email Verified' : 'Email Pending'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Current Plan</h4>
                        <Badge variant={mockSubscription.subscribed ? "default" : "outline"}>
                          {mockSubscription.subscription_tier || 'Free'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common tasks and features you might need.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('links')}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Manage Links
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('analytics')}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('subscription')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Upgrade Plan
                      </Button>
                    </div>
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
                <ExtendedProfileForm />
              </TabsContent>

              <TabsContent value="notifications">
                <NotificationSettings />
              </TabsContent>

              <TabsContent value="subscription">
                <SubscriptionManager />
              </TabsContent>

              <TabsContent value="settings">
                <AccountSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {isEditing && (
        <ProfileEditForm 
          profile={profile}
          onClose={() => setIsEditing(false)}
          onUpdate={refetchProfile}
        />
      )}
    </div>
  );
};

export default Dashboard;
