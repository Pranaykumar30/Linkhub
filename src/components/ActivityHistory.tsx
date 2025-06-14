
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, ExternalLink, Edit, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ActivityItem {
  id: string;
  type: 'link_created' | 'link_updated' | 'link_deleted' | 'link_clicked' | 'profile_updated' | 'link_toggled';
  description: string;
  timestamp: string;
  metadata?: any;
}

const ActivityHistory = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivityHistory();
    }
  }, [user]);

  const fetchActivityHistory = async () => {
    if (!user) return;

    try {
      // Since we don't have an activity log table, we'll generate some mock activity
      // based on the user's actual data
      const { data: links } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: clicks } = await supabase
        .from('link_clicks')
        .select('*, links!inner(title, user_id)')
        .eq('links.user_id', user.id)
        .order('clicked_at', { ascending: false })
        .limit(10);

      const mockActivities: ActivityItem[] = [];

      // Add link creation activities
      links?.forEach(link => {
        mockActivities.push({
          id: `create_${link.id}`,
          type: 'link_created',
          description: `Created link "${link.title}"`,
          timestamp: link.created_at,
          metadata: { linkId: link.id, linkTitle: link.title }
        });

        if (link.updated_at !== link.created_at) {
          mockActivities.push({
            id: `update_${link.id}`,
            type: 'link_updated',
            description: `Updated link "${link.title}"`,
            timestamp: link.updated_at,
            metadata: { linkId: link.id, linkTitle: link.title }
          });
        }
      });

      // Add profile update activity
      if (profile?.updated_at !== profile?.created_at) {
        mockActivities.push({
          id: `profile_update`,
          type: 'profile_updated',
          description: 'Updated profile information',
          timestamp: profile.updated_at,
        });
      }

      // Add click activities
      clicks?.forEach(click => {
        mockActivities.push({
          id: `click_${click.id}`,
          type: 'link_clicked',
          description: `Someone clicked your link`,
          timestamp: click.clicked_at,
          metadata: { linkTitle: click.links?.title }
        });
      });

      // Sort by timestamp
      mockActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(mockActivities.slice(0, 20)); // Show last 20 activities
    } catch (error) {
      console.error('Error fetching activity history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'link_created':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'link_updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'link_deleted':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'link_clicked':
        return <ExternalLink className="h-4 w-4 text-purple-500" />;
      case 'profile_updated':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'link_toggled':
        return <Eye className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'link_created':
        return <Badge variant="secondary" className="text-green-700 bg-green-100">Created</Badge>;
      case 'link_updated':
        return <Badge variant="secondary" className="text-blue-700 bg-blue-100">Updated</Badge>;
      case 'link_deleted':
        return <Badge variant="secondary" className="text-red-700 bg-red-100">Deleted</Badge>;
      case 'link_clicked':
        return <Badge variant="secondary" className="text-purple-700 bg-purple-100">Clicked</Badge>;
      case 'profile_updated':
        return <Badge variant="secondary" className="text-blue-700 bg-blue-100">Profile</Badge>;
      case 'link_toggled':
        return <Badge variant="secondary" className="text-orange-700 bg-orange-100">Toggled</Badge>;
      default:
        return <Badge variant="secondary">Activity</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity History
          </CardTitle>
          <CardDescription>Track your recent account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity History
        </CardTitle>
        <CardDescription>
          Track your recent account activity and link interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground">
              Start creating links to see your activity here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {getActivityBadge(activity.type)}
                </div>
              </div>
            ))}
            
            {activities.length >= 20 && (
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing last 20 activities
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;
