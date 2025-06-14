
import { useState } from 'react';
import { useLinks } from '@/hooks/useLinks';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  GripVertical,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LinkFormData {
  title: string;
  url: string;
  description: string;
  icon_url: string;
}

const LinkManager = () => {
  const { links, loading, createLink, updateLink, deleteLink } = useLinks();
  const { subscription, limits } = useSubscription();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [formData, setFormData] = useState<LinkFormData>({
    title: '',
    url: '',
    description: '',
    icon_url: '',
  });

  const canAddMoreLinks = limits.maxLinks === -1 || links.length < limits.maxLinks;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAddMoreLinks && !editingLink) {
      toast({
        title: "Link limit reached",
        description: `Your ${subscription.subscription_tier || 'Free'} plan allows up to ${limits.maxLinks} links. Upgrade to add more.`,
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(formData.url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingLink) {
        await updateLink(editingLink.id, formData);
        toast({
          title: "Link updated",
          description: "Your link has been successfully updated.",
        });
      } else {
        await createLink(formData);
        toast({
          title: "Link created",
          description: "Your new link has been successfully created.",
        });
      }
      
      setFormData({ title: '', url: '', description: '', icon_url: '' });
      setEditingLink(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving link:', error);
      toast({
        title: "Error",
        description: "Failed to save link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (link: any) => {
    setEditingLink(link);
    setFormData({
      title: link.title || '',
      url: link.url || '',
      description: link.description || '',
      icon_url: link.icon_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await deleteLink(linkId);
        toast({
          title: "Link deleted",
          description: "Your link has been successfully deleted.",
        });
      } catch (error) {
        console.error('Error deleting link:', error);
        toast({
          title: "Error",
          description: "Failed to delete link. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleActive = async (link: any) => {
    try {
      await updateLink(link.id, { is_active: !link.is_active });
      toast({
        title: link.is_active ? "Link hidden" : "Link shown",
        description: `Your link is now ${link.is_active ? 'hidden from' : 'visible on'} your public profile.`,
      });
    } catch (error) {
      console.error('Error toggling link:', error);
      toast({
        title: "Error",
        description: "Failed to update link visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingLink(null);
    setFormData({ title: '', url: '', description: '', icon_url: '' });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading links...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Links</h2>
          <p className="text-muted-foreground">
            {limits.maxLinks === -1 
              ? `${links.length} links (unlimited)`
              : `${links.length} of ${limits.maxLinks} links used`
            }
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={openCreateDialog}
              disabled={!canAddMoreLinks}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLink ? 'Edit Link' : 'Create New Link'}
              </DialogTitle>
              <DialogDescription>
                {editingLink 
                  ? 'Update your link details below.'
                  : 'Add a new link to your profile.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter link title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon_url">Icon URL</Label>
                <Input
                  id="icon_url"
                  type="url"
                  value={formData.icon_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon_url: e.target.value }))}
                  placeholder="https://example.com/icon.png"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingLink ? 'Update Link' : 'Create Link'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Links List */}
      {links.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ExternalLink className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No links yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first link to get started.
            </p>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="cursor-move">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  {link.icon_url ? (
                    <img 
                      src={link.icon_url} 
                      alt="" 
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{link.title}</h3>
                      {!link.is_active && (
                        <Badge variant="secondary" className="text-xs">Hidden</Badge>
                      )}
                      {link.click_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {link.click_count} clicks
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {link.url}
                    </p>
                    {link.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {link.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(link)}
                      className="gap-1"
                    >
                      {link.is_active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(link)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(link.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade prompt for free users */}
      {!canAddMoreLinks && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Link Limit Reached
              </h3>
              <p className="text-yellow-700 text-sm mb-3">
                You've reached the {limits.maxLinks} link limit for your {subscription.subscription_tier || 'Free'} plan.
              </p>
              <Button variant="outline" size="sm">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinkManager;
