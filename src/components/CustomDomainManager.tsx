
import { useState } from 'react';
import { useCustomDomains } from '@/hooks/useCustomDomains';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, Plus, Trash2, Check, AlertCircle, Star, Crown } from 'lucide-react';
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

const CustomDomainManager = () => {
  const { domains, loading, updating, addDomain, removeDomain, setPrimaryDomain } = useCustomDomains();
  const { limits } = useSubscriptionLimits();
  const [isAdding, setIsAdding] = useState(false);
  const [domainInput, setDomainInput] = useState('');

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;

    const { error } = await addDomain(domainInput.trim());
    if (!error) {
      setIsAdding(false);
      setDomainInput('');
    }
  };

  const handleRemoveDomain = async (id: string) => {
    if (confirm('Are you sure you want to remove this domain?')) {
      await removeDomain(id);
    }
  };

  const canAddDomain = () => {
    if (!limits.customDomainEnabled) return false;
    if (limits.multipleDomainsEnabled) return true;
    return domains.length === 0;
  };

  if (!limits.customDomainEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domains
          </CardTitle>
          <CardDescription>
            Connect your own domain to your LinkHub profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              Custom domains are available for Premium and Enterprise subscribers.
              Upgrade your plan to connect your own domain.
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
            <Globe className="h-5 w-5" />
            Custom Domains
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Custom Domains
          </CardTitle>
          <CardDescription>
            Connect your own domain to your LinkHub profile
          </CardDescription>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button disabled={!canAddDomain()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>
                Enter your domain name (e.g., mydomain.com or links.mydomain.com)
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDomain} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="mydomain.com"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={updating} className="flex-1">
                  {updating ? 'Adding...' : 'Add Domain'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsAdding(false);
                    setDomainInput('');
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
        {!limits.multipleDomainsEnabled && domains.length > 0 && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You can add multiple domains with an Enterprise subscription.
            </AlertDescription>
          </Alert>
        )}

        {domains.length === 0 ? (
          <div className="text-center py-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Globe className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No custom domains</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your own domain to create a professional branded experience.
                </p>
                <Button onClick={() => setIsAdding(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Domain
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">{domain.domain}</TableCell>
                  <TableCell>
                    <Badge variant={domain.is_verified ? "default" : "secondary"}>
                      {domain.is_verified ? (
                        <><Check className="h-3 w-3 mr-1" />Verified</>
                      ) : (
                        <><AlertCircle className="h-3 w-3 mr-1" />Pending</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {domain.is_primary ? (
                      <Badge variant="default">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPrimaryDomain(domain.id)}
                        disabled={updating}
                      >
                        Set Primary
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveDomain(domain.id)}
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

        {domains.some(d => !d.is_verified) && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Domain Verification Required:</strong> To verify your domain, add a CNAME record 
              pointing to linkhub.app in your DNS settings. This may take up to 48 hours to propagate.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomDomainManager;
