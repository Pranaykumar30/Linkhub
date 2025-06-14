
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface LinkFormData {
  title: string;
  url: string;
  slug: string;
  description: string;
  icon_url: string;
  is_active: boolean;
  scheduled_at: string;
  is_scheduled: boolean;
}

interface LinkFormProps {
  formData: LinkFormData;
  onInputChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  title: string;
  updating: boolean;
  linkSchedulingEnabled: boolean;
}

const LinkForm: React.FC<LinkFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  title,
  updating,
  linkSchedulingEnabled,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
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
          onChange={(e) => onInputChange('url', e.target.value)}
          placeholder="https://example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Custom Slug (optional)</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => onInputChange('slug', e.target.value)}
          placeholder="my-link"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
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
          onChange={(e) => onInputChange('icon_url', e.target.value)}
          placeholder="https://example.com/icon.png"
        />
      </div>

      {linkSchedulingEnabled && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_scheduled"
              checked={formData.is_scheduled}
              onCheckedChange={(checked) => {
                onInputChange('is_scheduled', checked);
                if (checked) {
                  onInputChange('is_active', false);
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
                onChange={(e) => onInputChange('scheduled_at', e.target.value)}
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
            onCheckedChange={(checked) => onInputChange('is_active', checked)}
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
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default LinkForm;
