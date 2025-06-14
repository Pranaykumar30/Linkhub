
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, Shield, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: {
      profileUpdates: true,
      securityAlerts: true,
      newsletter: false,
      marketing: false,
    },
    push: {
      mentions: true,
      messages: true,
      followers: false,
      updates: true,
    },
    inApp: {
      all: true,
      important: true,
      social: false,
    }
  });

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const updateEmailNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      email: { ...prev.email, [key]: value }
    }));
  };

  const updatePushNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      push: { ...prev.push, [key]: value }
    }));
  };

  const updateInAppNotification = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: value }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <h4 className="font-medium">Email Notifications</h4>
          </div>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Profile Updates</Label>
                <p className="text-xs text-muted-foreground">
                  When someone views or interacts with your profile
                </p>
              </div>
              <Switch 
                checked={notifications.email.profileUpdates}
                onCheckedChange={(value) => updateEmailNotification('profileUpdates', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Security Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Important security updates and login alerts
                </p>
              </div>
              <Switch 
                checked={notifications.email.securityAlerts}
                onCheckedChange={(value) => updateEmailNotification('securityAlerts', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Newsletter</Label>
                <p className="text-xs text-muted-foreground">
                  Weekly updates and feature announcements
                </p>
              </div>
              <Switch 
                checked={notifications.email.newsletter}
                onCheckedChange={(value) => updateEmailNotification('newsletter', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Marketing</Label>
                <p className="text-xs text-muted-foreground">
                  Promotional offers and product updates
                </p>
              </div>
              <Switch 
                checked={notifications.email.marketing}
                onCheckedChange={(value) => updateEmailNotification('marketing', value)}
              />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <h4 className="font-medium">Push Notifications</h4>
          </div>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Mentions</Label>
                <p className="text-xs text-muted-foreground">
                  When someone mentions you in a comment
                </p>
              </div>
              <Switch 
                checked={notifications.push.mentions}
                onCheckedChange={(value) => updatePushNotification('mentions', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Direct Messages</Label>
                <p className="text-xs text-muted-foreground">
                  New direct messages and replies
                </p>
              </div>
              <Switch 
                checked={notifications.push.messages}
                onCheckedChange={(value) => updatePushNotification('messages', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">New Followers</Label>
                <p className="text-xs text-muted-foreground">
                  When someone starts following you
                </p>
              </div>
              <Switch 
                checked={notifications.push.followers}
                onCheckedChange={(value) => updatePushNotification('followers', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">App Updates</Label>
                <p className="text-xs text-muted-foreground">
                  New features and important updates
                </p>
              </div>
              <Switch 
                checked={notifications.push.updates}
                onCheckedChange={(value) => updatePushNotification('updates', value)}
              />
            </div>
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h4 className="font-medium">In-App Notifications</h4>
          </div>
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">All Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Show all in-app notifications
                </p>
              </div>
              <Switch 
                checked={notifications.inApp.all}
                onCheckedChange={(value) => updateInAppNotification('all', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Important Only</Label>
                <p className="text-xs text-muted-foreground">
                  Only show important notifications
                </p>
              </div>
              <Switch 
                checked={notifications.inApp.important}
                onCheckedChange={(value) => updateInAppNotification('important', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Social Activity</Label>
                <p className="text-xs text-muted-foreground">
                  Likes, comments, and social interactions
                </p>
              </div>
              <Switch 
                checked={notifications.inApp.social}
                onCheckedChange={(value) => updateInAppNotification('social', value)}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Notification Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
