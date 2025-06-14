import { useState, useCallback } from 'react';
import { useLinks } from '@/hooks/useLinks';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, ExternalLink, Edit, Trash2, BarChart3, Crown, Lock, Calendar, Clock } from 'lucide-react';
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

const LinkManager = () => {
  const { links, loading, updating, createLink, updateLink, deleteLink } = useLinks();
  const { limits, canCreateLink, getRemainingLinks } = useSubscriptionLimits();
  const [isCreating, setIsCreating] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    slug: '',
    description: '',
    icon_url: '',
    is_active: true,
    scheduled_at: '',
    is_scheduled: false,
  });

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      url: '',
      slug: '',
      description: '',
      icon_url: '',
      is_active: true,
      scheduled_at: '',
      is_scheduled: false,
    });
    setEditingLink(null);
  }, []);

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateLink(links.length)) {
      return;
    }
    
    const linkData = {
      ...formData,
      scheduled_at: formData.is_scheduled && formData.scheduled_at ? formData.scheduled_at : undefined,
      is_active: formData.is_scheduled ? false : formData.is_active, // If scheduled, start inactive
    };
    
    const { error } = await createLink(linkData);
    if (!error) {
      setIsCreating(false);
      resetForm();
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    
    const updates = {
      ...formData,
      scheduled_at: formData.is_scheduled && formData.scheduled_at ? formData.scheduled_at : null,
    };
    
    const { error } = await updateLink(editingLink.id, updates);
    if (!error) {
      setEditingLink(null);
      resetForm();
    }
  };

  const handleEdit = useCallback((link: any) => {
    setEditingLink(link);
    setFormData({
      title: link.title || '',
      url: link.url || '',
      slug: link.slug || '',
      description: link.description || '',
      icon_url: link.icon_url || '',
      is_active: link.is_active,
      scheduled_at: link.scheduled_at ? new Date(link.scheduled_at).toISOString().slice(0, 16) : '',
      is_scheduled: Boolean(link.is_scheduled),
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      await deleteLink(id);
    }
  };

  const canAddNewLink = canCreateLink(links.length);
  const remainingLinks = getRemainingLinks(links.length);

  const LinkForm = ({ onSubmit, title }: { onSubmit: (e: React.FormEvent) => void; title: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="My awesome link"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder="https://example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Custom Slug (optional)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => handleInputChange('slug', e.target.value)}
          placeholder="my-link"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="A brief description of your link"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon_url">Icon URL (optional)</Label>
        <Input
          id="icon_url"
          type="url"
          value={formData.icon_url}
          onChange={(e) => handleInputChange('icon_url', e.target.value)}
          placeholder="https://example.com/icon.png"
        />
      </div>

      {limits.linkSchedulingEnabled && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_scheduled"
              checked={formData.is_scheduled}
              onCheckedChange={(checked) => {
                handleInputChange('is_scheduled', checked);
                if (checked) {
                  handleInputChange('is_active', false);
                }
              }}
            />
            <Label htmlFor="is_scheduled" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule this link
            </Label>
          </div>
          
          {formData.is_scheduled && (
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Publish Date & Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required={formData.is_scheduled}
              />
              <p className="text-xs text-muted-foreground">
                The link will be automatically published at the specified time.
              </p>
            </div>
          )}
        </div>
      )}

      {!formData.is_scheduled && (
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={updating} className="flex-1">
          {updating ? 'Saving...' : title}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setIsCreating(false);
            setEditingLink(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link Management</CardTitle>
          <CardDescription>Manage your links and track their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
          <CardTitle>Link Management</CardTitle>
          <CardDescription>Manage your links and track their performance</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          {/* Link limit indicator */}
          <div className="text-right">
            <div className="text-sm font-medium">
              {links.length} / {limits.linkLimit === -1 ? '∞' : limits.linkLimit} links
            </div>
            {remainingLinks !== -1 && (
              <div className="text-xs text-muted-foreground">
                {remainingLinks} remaining
              </div>
            )}
          </div>
          
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button disabled={!canAddNewLink}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
                {!canAddNewLink && <Lock className="h-4 w-4 ml-2" />}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Link</DialogTitle>
                <DialogDescription>Add a new link to your profile</DialogDescription>
              </DialogHeader>
              <LinkForm onSubmit={handleCreate} title="Create Link" />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {/* Link limit warning */}
        {!canAddNewLink && (
          <Alert className="mb-4">
            <Crown className="h-4 w-4" />
            <AlertDescription>
              You've reached your link limit of {limits.linkLimit} links. 
              {limits.subscriptionTier ? ' Upgrade your plan to add more links.' : ' Upgrade to a paid plan to add more links.'}
            </AlertDescription>
          </Alert>
        )}

        {links.length === 0 ? (
          <div className="text-center py-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <ExternalLink className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">No links yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first link to share with others.
                </p>
                <Button onClick={() => setIsCreating(true)} disabled={!canAddNewLink}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Link
                  {!canAddNewLink && <Lock className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {link.url.length > 30 ? `${link.url.substring(0, 30)}...` : link.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant={link.is_active ? "default" : "secondary"}>
                        {link.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {link.is_scheduled && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Scheduled
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      {link.click_count}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(link)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>Update your link information</DialogDescription>
          </DialogHeader>
          <LinkForm onSubmit={handleUpdate} title="Update Link" />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default LinkManager;
