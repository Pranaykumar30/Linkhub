
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, LogIn, Edit, Settings } from 'lucide-react';

const ActivityHistory = () => {
  // Mock activity data - in a real app, this would come from an API
  const activities = [
    {
      id: 1,
      type: 'login',
      description: 'Signed in to your account',
      timestamp: '2 minutes ago',
      icon: LogIn,
      status: 'success'
    },
    {
      id: 2,
      type: 'profile_update',
      description: 'Updated profile information',
      timestamp: '1 hour ago',
      icon: Edit,
      status: 'info'
    },
    {
      id: 3,
      type: 'settings_change',
      description: 'Changed notification preferences',
      timestamp: '3 hours ago',
      icon: Settings,
      status: 'info'
    },
    {
      id: 4,
      type: 'login',
      description: 'Signed in from new device',
      timestamp: '1 day ago',
      icon: LogIn,
      status: 'warning'
    },
    {
      id: 5,
      type: 'profile_update',
      description: 'Updated bio and website',
      timestamp: '2 days ago',
      icon: Edit,
      status: 'info'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity History
        </CardTitle>
        <CardDescription>
          Recent account activity and changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                <div className="p-2 rounded-full bg-muted">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <Badge variant="secondary" className={getStatusColor(activity.status)}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;
