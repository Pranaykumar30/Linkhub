
import { useState } from 'react';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Crown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const ApiKeyManager = () => {
  const { apiKeys, loading, updating, createApiKey, deleteApiKey, toggleApiKey } = useApiKeys();
  const { limits } = useSubscriptionLimits();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    const { data, error } = await createApiKey(keyName.trim());
    if (!error && data) {
      setIsCreating(false);
      setKeyName('');
      setNewApiKey(data.api_key);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      await deleteApiKey(id);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard.",
    });
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskApiKey = (key: string) => {
    return `${key.substring(0, 6)}${'*'.repeat(20)}${key.substring(key.length - 4)}`;
  };

  if (!limits.apiAccessEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Access
          </CardTitle>
          <CardDescription>
            Manage API keys for programmatic access to your LinkHub data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              API access is available for Enterprise subscribers only.
              Upgrade your plan to create and manage API keys.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {newApiKey && (
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            <strong>Your new API key:</strong> Make sure to copy it now as you won't be able to see it again.
            <div className="mt-2 p-2 bg-muted rounded font-mono text-sm flex items-center justify-between">
              <span>{newApiKey}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(newApiKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setNewApiKey(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Create and manage API keys for programmatic access
            </CardDescription>
          </div>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>
                  Give your API key a descriptive name to help you identify its purpose.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="My API Key"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={updating} className="flex-1">
                    {updating ? 'Creating...' : 'Create Key'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreating(false);
                      setKeyName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Key className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No API keys</h3>
                  <p className="text-muted-foreground mb-4">
                    Create an API key to access your LinkHub data programmatically.
                  </p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First API Key
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.key_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm">
                          {visibleKeys.has(key.id) ? key.api_key : maskApiKey(key.api_key)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.api_key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={key.is_active}
                          onCheckedChange={(checked) => toggleApiKey(key.id, checked)}
                          disabled={updating}
                        />
                        <Badge variant={key.is_active ? "default" : "secondary"}>
                          {key.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.last_used_at ? (
                        new Date(key.last_used_at).toLocaleDateString()
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteKey(key.id)}
                        disabled={updating}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyManager;
