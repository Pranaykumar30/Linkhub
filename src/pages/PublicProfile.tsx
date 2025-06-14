import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLinks } from '@/hooks/useLinks';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Globe, User } from 'lucide-react';

interface PublicProfileData {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  custom_url: string | null;
}

interface PublicLink {
  id: string;
  title: string;
  url: string;
  description: string | null;
  icon_url: string | null;
  click_count: number;
}

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
}

const PublicProfile = () => {
  const { customUrl } = useParams();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData>({ subscribed: false, subscription_tier: null });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!customUrl) return;

      try {
        // First try to find by username (default behavior for linkhub.app/username)
        let profileData = null;
        
        const { data: usernameProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', customUrl)
          .single();

        if (usernameProfile) {
          profileData = usernameProfile;
        } else {
          // If not found by username, try by custom_url (for upgraded plans)
          const { data: customUrlProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('custom_url', customUrl)
            .single();
          
          if (customUrlProfile) {
            profileData = customUrlProfile;
          }
        }

        if (!profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Get subscription status
        const { data: subscriptionData } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_tier')
          .eq('user_id', profileData.id)
          .single();

        if (subscriptionData) {
          setSubscription(subscriptionData);
        }

        // Get active links for this user
        const { data: linksData, error: linksError } = await supabase
          .from('links')
          .select('id, title, url, description, icon_url, click_count')
          .eq('user_id', profileData.id)
          .eq('is_active', true)
          .order('position', { ascending: true });

        if (!linksError && linksData) {
          setLinks(linksData);
        }
      } catch (error) {
        console.error('Error fetching public profile:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [customUrl]);

  const handleLinkClick = async (link: PublicLink) => {
    // Record the click
    try {
      await supabase
        .from('link_clicks')
        .insert({
          link_id: link.id,
          user_agent: navigator.userAgent,
          referer: document.referrer,
        });

      // Increment click count
      await supabase
        .from('links')
        .update({ click_count: link.click_count + 1 })
        .eq('id', link.id);
    } catch (error) {
      console.error('Error recording click:', error);
    }

    // Navigate to the link
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getPlanBadge = () => {
    if (!subscription.subscribed) {
      return <Badge variant="outline" className="text-xs">Free Plan</Badge>;
    }
    return <Badge variant="default" className="text-xs">{subscription.subscription_tier} Plan</Badge>;
  };

  const getPublicUrl = () => {
    // Show the actual URL being used
    if (profile?.custom_url && subscription.subscribed && subscription.subscription_tier !== 'Free') {
      return `linkhub.app/${profile.custom_url}`;
    }
    return `linkhub.app/${profile?.username || 'user'}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-6 w-32 mx-auto" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground">
              The profile you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-xl">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold mb-2">
            {profile.full_name || 'No name set'}
          </h1>
          
          <p className="text-muted-foreground mb-3 text-sm">
            {getPublicUrl()}
          </p>
          
          <div className="mb-3">
            {getPlanBadge()}
          </div>
          
          {profile.bio && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {profile.bio}
            </p>
          )}
          
          {profile.website && (
            <a 
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Globe className="h-4 w-4" />
              Visit Website
            </a>
          )}
        </div>

        {/* Links */}
        <div className="space-y-3">
          {links.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No links available</p>
              </CardContent>
            </Card>
          ) : (
            links.map((link) => (
              <Card 
                key={link.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleLinkClick(link)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {link.icon_url ? (
                      <img 
                        src={link.icon_url} 
                        alt="" 
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{link.title}</h3>
                      {link.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {link.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {link.click_count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {link.click_count}
                        </Badge>
                      )}
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t">
          {!subscription.subscribed && (
            <p className="text-xs text-muted-foreground">
              Create your own link page with LinkHub
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
