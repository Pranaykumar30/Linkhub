
import { useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const ExtendedProfileForm = () => {
  const { profile, updateProfile, updating } = useProfile();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    website: profile?.website || '',
    custom_url: profile?.custom_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate custom URL
    if (formData.custom_url && !/^[a-zA-Z0-9-_]+$/.test(formData.custom_url)) {
      toast({
        title: "Invalid custom URL",
        description: "Custom URL can only contain letters, numbers, hyphens, and underscores.",
        variant: "destructive",
      });
      return;
    }
    
    // Clean up website URL
    let website = formData.website.trim();
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      website = `https://${website}`;
    }

    const updates = {
      ...formData,
      website: website || null,
      full_name: formData.full_name.trim() || null,
      username: formData.username.trim() || null,
      bio: formData.bio.trim() || null,
      custom_url: formData.custom_url.trim() || null,
    };

    const { error } = await updateProfile(updates);
    if (!error) {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extended Profile Settings</CardTitle>
        <CardDescription>
          Customize your profile information and public page settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a bit about yourself"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://your-website.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_url">Custom URL</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-muted bg-muted text-muted-foreground text-sm">
                yourdomain.com/
              </span>
              <Input
                id="custom_url"
                name="custom_url"
                value={formData.custom_url}
                onChange={handleChange}
                placeholder="your-custom-url"
                className="rounded-l-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Choose a custom URL for your public profile. Only letters, numbers, hyphens, and underscores allowed.
            </p>
          </div>

          <Button type="submit" disabled={updating} className="w-full">
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExtendedProfileForm;
