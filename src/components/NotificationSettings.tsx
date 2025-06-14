
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Smartphone, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  weekly_reports: boolean;
  link_alerts: boolean;
  security_alerts: boolean;
}

const NotificationSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: false,
    marketing_emails: false,
    weekly_reports: true,
    link_alerts: true,
    security_alerts: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      // Since we don't have a notification_preferences table yet,
      // we'll use localStorage as a fallback for now
      const stored = localStorage.getItem(`notifications_${user.id}`);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Store in localStorage for now
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(preferences));
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const notificationTypes = [
    {
      key: 'email_notifications' as keyof NotificationPreferences,
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
    },
    {
      key: 'push_notifications' as keyof NotificationPreferences,
      title: 'Push Notifications',
      description: 'Receive browser push notifications',
      icon: Smartphone,
    },
    {
      key: 'weekly_reports' as keyof NotificationPreferences,
      title: 'Weekly Reports',
      description: 'Get weekly analytics reports',
      icon: TrendingUp,
    },
    {
      key: 'link_alerts' as keyof NotificationPreferences,
      title: 'Link Activity Alerts',
      description: 'Get notified when your links receive significant traffic',
      icon: Bell,
    },
    {
      key: 'security_alerts' as keyof NotificationPreferences,
      title: 'Security Alerts',
      description: 'Important security and account notifications',
      icon: Bell,
    },
    {
      key: 'marketing_emails' as keyof NotificationPreferences,
      title: 'Marketing Emails',
      description: 'Product updates, tips, and promotional content',
      icon: Mail,
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Loading your preferences...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.key} className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label htmlFor={type.key} className="text-sm font-medium">
                      {type.title}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={type.key}
                  checked={preferences[type.key]}
                  onCheckedChange={(checked) => updatePreference(type.key, checked)}
                />
              </div>
            );
          })}

          <div className="pt-4">
            <Button onClick={updatePreferences} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Frequency</CardTitle>
          <CardDescription>
            Control how often you receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can adjust individual notification types above. Security alerts will always be sent immediately for account safety.
            </p>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Current email: {user?.email}</Label>
              <p className="text-xs text-muted-foreground">
                To change your email address, visit Account Settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
