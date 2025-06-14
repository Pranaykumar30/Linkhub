
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, User } from 'lucide-react';

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

const PublicProfile = () => {
  const { customUrl } = useParams();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [links, setLinks] = useState<PublicLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!customUrl) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        let profileData = null;
        
        // First try to find by custom_url (for paid users)
        const { data: customUrlProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('custom_url', customUrl)
          .single();

        if (customUrlProfile) {
          profileData = customUrlProfile;
        } else {
          // If not found by custom_url, try by username
          const { data: usernameProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', customUrl)
            .single();
          
          if (usernameProfile) {
            profileData = usernameProfile;
          }
        }

        if (!profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile(profileData);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            <Skeleton className="h-8 w-48 mx-auto" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm shadow-lg">
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 text-slate-400 mx-auto mb-6" />
            <h1 className="text-2xl font-semibold mb-3 text-slate-800">Profile Not Found</h1>
            <p className="text-slate-600">
              The profile you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-sm">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar className="h-32 w-32 mx-auto mb-6 shadow-lg ring-4 ring-white">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {profile.full_name || 'Welcome'}
          </h1>
        </div>

        {/* Links */}
        <div className="space-y-4">
          {links.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <p className="text-slate-600">No links available</p>
              </CardContent>
            </Card>
          ) : (
            links.map((link) => (
              <Card 
                key={link.id} 
                className="cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-105 shadow-lg border-0 bg-white"
                onClick={() => handleLinkClick(link)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {link.icon_url ? (
                      <img 
                        src={link.icon_url} 
                        alt="" 
                        className="h-12 w-12 rounded-lg object-cover shadow-sm"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                        <ExternalLink className="h-6 w-6 text-white" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-slate-800 truncate">{link.title}</h3>
                      {link.description && (
                        <p className="text-sm text-slate-600 truncate mt-1">
                          {link.description}
                        </p>
                      )}
                    </div>
                    
                    <ExternalLink className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
