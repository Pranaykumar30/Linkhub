
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingUp, Users, Globe, Crown } from 'lucide-react';
import AdvancedAnalytics from './AdvancedAnalytics';

const Analytics = () => {
  const { limits, loading: limitsLoading } = useSubscriptionLimits();
  const { analytics, loading } = useAnalytics();

  // Show advanced analytics for Premium/Enterprise users
  if (!limitsLoading && limits.advancedAnalyticsEnabled) {
    return <AdvancedAnalytics />;
  }

  if (loading || limitsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Basic Analytics
          </h2>
          <p className="text-muted-foreground">
            Overview of your link performance
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Crown className="h-3 w-3" />
          Free Plan
        </Badge>
      </div>

      {/* Basic Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalLinks}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeLinks} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks}</div>
            <p className="text-xs text-muted-foreground">
              All time clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Links</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeLinks}</div>
            <p className="text-xs text-muted-foreground">
              Currently visible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Clicks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalLinks > 0 ? Math.round(analytics.totalClicks / analytics.totalLinks) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per link
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Links */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Links</CardTitle>
          <CardDescription>Your most clicked links</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topPerformingLinks.length > 0 ? (
            <div className="space-y-3">
              {analytics.topPerformingLinks.slice(0, 5).map((link, index) => (
                <div key={link.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{link.title}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">{link.click_count} clicks</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No data available yet. Add some links to start tracking!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Unlock Advanced Analytics
          </CardTitle>
          <CardDescription>
            Get detailed insights, geographic data, trend analysis, and export capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Click trends & patterns</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span>Geographic insights</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span>Advanced charts & graphs</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Detailed performance metrics</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Available with Premium and Enterprise plans starting at $19.99/month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
