
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, User, Copy, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestUserResponse {
  message: string;
  email: string;
  password: string;
  userId: string;
  instructions?: string;
}

const TestUserCreator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testUser, setTestUser] = useState<TestUserResponse | null>(null);

  const createTestUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-test-user');

      if (error) {
        throw error;
      }

      if (data) {
        setTestUser(data);
        toast({
          title: "Success!",
          description: "Test user with Enterprise subscription created successfully.",
        });
      }
    } catch (error) {
      console.error('Error creating test user:', error);
      toast({
        title: "Error",
        description: "Failed to create test user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Credential copied to clipboard.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Test User Creator
        </CardTitle>
        <CardDescription>
          Create a test user with Enterprise subscription for testing all premium features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!testUser ? (
          <Button 
            onClick={createTestUser}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <User className="h-4 w-4 mr-2" />
            )}
            Create Test User with Enterprise Subscription
          </Button>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {testUser.message}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Email:</p>
                  <p className="text-sm text-muted-foreground">{testUser.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(testUser.email)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Password:</p>
                  <p className="text-sm text-muted-foreground">{testUser.password}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(testUser.password)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Subscription Details:</p>
                <ul className="text-sm text-green-700 mt-1 space-y-1">
                  <li>• Plan: Enterprise ($49.99/month)</li>
                  <li>• Status: Active</li>
                  <li>• Expires: 1 year from now</li>
                  <li>• All premium features enabled</li>
                </ul>
              </div>

              {testUser.instructions && (
                <Alert>
                  <AlertDescription>
                    {testUser.instructions}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              onClick={() => setTestUser(null)}
              variant="outline"
              className="w-full"
            >
              Create Another Test User
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestUserCreator;
