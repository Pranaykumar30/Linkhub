
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Filter } from 'lucide-react';

interface AdminActivity {
  id: string;
  admin_user_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
}

const AdminActivityLogs = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('all');

  const fetchActivityLogs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching activity logs:', error);
      } else {
        setActivities(data || []);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.admin_user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (activity.target_table && activity.target_table.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = actionFilter === 'all' || activity.action.toLowerCase().includes(actionFilter.toLowerCase());
    const matchesTable = tableFilter === 'all' || activity.target_table === tableFilter;
    
    return matchesSearch && matchesAction && matchesTable;
  });

  const getActionBadge = (action: string) => {
    if (action.toLowerCase().includes('create') || action.toLowerCase().includes('insert')) {
      return <Badge variant="default">Create</Badge>;
    }
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) {
      return <Badge variant="secondary">Update</Badge>;
    }
    if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('remove')) {
      return <Badge variant="destructive">Delete</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  const uniqueActions = [...new Set(activities.map(a => a.action))];
  const uniqueTables = [...new Set(activities.map(a => a.target_table).filter(Boolean))];

  useEffect(() => {
    fetchActivityLogs();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Admin Activity Logs
          </CardTitle>
          <CardDescription>
            Track all administrative actions and changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {uniqueTables.map(table => (
                  <SelectItem key={table} value={table!}>{table}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-mono text-sm">
                    {activity.admin_user_id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {getActionBadge(activity.action)}
                  </TableCell>
                  <TableCell>
                    {activity.target_table && (
                      <div>
                        <div className="font-medium">{activity.target_table}</div>
                        {activity.target_id && (
                          <div className="text-sm text-muted-foreground font-mono">
                            {activity.target_id.substring(0, 8)}...
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(activity.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      {activity.new_data && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Changes:</span>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(activity.new_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity logs found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityLogs;
