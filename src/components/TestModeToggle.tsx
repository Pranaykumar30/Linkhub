
import { useState } from 'react';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TestTube, Crown, Zap, Star, Sparkles } from 'lucide-react';

const TestModeToggle = () => {
  const { limits, setTestMode } = useSubscriptionLimits();
  const [selectedPlan, setSelectedPlan] = useState<string>('free');

  const plans = [
    { value: 'free', label: 'Free Plan', icon: Sparkles, description: '5 links, basic features' },
    { value: 'Basic', label: 'Basic Plan', icon: Zap, description: '25 links, custom URLs' },
    { value: 'Premium', label: 'Premium Plan', icon: Crown, description: '100 links, advanced analytics' },
    { value: 'Enterprise', label: 'Enterprise Plan', icon: Star, description: 'Unlimited links, all features' },
  ];

  const handlePlanChange = (value: string) => {
    setSelectedPlan(value);
    // Convert 'free' back to null for the setTestMode function
    setTestMode(value === 'free' ? null : value);
  };

  const getCurrentPlanInfo = () => {
    // Convert null subscription tier to 'free' for display
    const currentTier = limits.subscriptionTier || 'free';
    return plans.find(plan => plan.value === currentTier) || plans[0];
  };

  const currentPlan = getCurrentPlanInfo();
  const CurrentIcon = currentPlan.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test Mode - Subscription Plans
        </CardTitle>
        <CardDescription>
          Switch between different subscription plans to test features and limitations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CurrentIcon className="h-4 w-4" />
          <AlertDescription>
            Currently testing: <strong>{currentPlan.label}</strong> - {currentPlan.description}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label className="text-sm font-medium">Switch Test Plan:</label>
          <Select value={selectedPlan} onValueChange={handlePlanChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a plan to test" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <SelectItem key={plan.value} value={plan.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{plan.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Link Limit:</span>
            <Badge variant="secondary" className="ml-2">
              {limits.linkLimit === -1 ? 'Unlimited' : limits.linkLimit}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Custom URLs:</span>
            <Badge variant={limits.customDomainEnabled ? "default" : "secondary"} className="ml-2">
              {limits.customDomainEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Analytics:</span>
            <Badge variant={limits.advancedAnalyticsEnabled ? "default" : "secondary"} className="ml-2">
              {limits.advancedAnalyticsEnabled ? 'Advanced' : 'Basic'}
            </Badge>
          </div>
          <div>
            <span className="font-medium">API Access:</span>
            <Badge variant={limits.apiAccessEnabled ? "default" : "secondary"} className="ml-2">
              {limits.apiAccessEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> This test mode only affects the current session. Refresh the page to return to your actual subscription plan.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestModeToggle;
