
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, User, Sparkles } from 'lucide-react';
import LinkHubLogo from '@/components/LinkHubLogo';

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Navigation */}
        <nav className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <LinkHubLogo />
          </div>
        </nav>

        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Loading Profile Header */}
            <div className="text-center mb-12">
              <Skeleton className="h-40 w-40 rounded-full mx-auto mb-6" />
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
            </div>

            {/* Loading Links */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Navigation */}
        <nav className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <LinkHubLogo />
          </div>
        </nav>

        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/70 backdrop-blur-lg">
              <CardContent className="text-center py-16">
                <div className="h-20 w-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-8">
                  <User className="h-10 w-10 text-slate-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Profile Not Found
                </h1>
                <p className="text-slate-600 text-lg">
                  The profile you're looking for doesn't exist or has been removed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <LinkHubLogo />
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header with Floating Card Design */}
          <div className="relative mb-16">
            {/* Background decorative elements */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br from-pink-200/30 to-orange-200/30 rounded-full blur-2xl"></div>
            
            <Card className="relative shadow-2xl border-0 bg-white/70 backdrop-blur-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <CardContent className="text-center py-12 px-8">
                <div className="relative inline-block mb-6">
                  <Avatar className="h-40 w-40 shadow-xl ring-4 ring-white/50">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Floating sparkle */}
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {profile.full_name || 'Welcome'}
                </h1>
                
                {/* Subtle tagline */}
                <div className="flex items-center justify-center gap-2 text-slate-500">
                  <div className="h-1 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">My Links</span>
                  <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Links with Modern Card Design */}
          <div className="space-y-6">
            {links.length === 0 ? (
              <Card className="shadow-xl border-0 bg-white/70 backdrop-blur-lg">
                <CardContent className="text-center py-16">
                  <div className="h-16 w-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ExternalLink className="h-8 w-8 text-slate-500" />
                  </div>
                  <p className="text-slate-600 text-lg">No links available yet</p>
                </CardContent>
              </Card>
            ) : (
              links.map((link, index) => (
                <Card 
                  key={link.id} 
                  className="group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] border-0 bg-white/70 backdrop-blur-lg overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleLinkClick(link)}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-6">
                      {/* Icon with gradient background */}
                      <div className="relative">
                        {link.icon_url ? (
                          <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-white/50">
                            <img 
                              src={link.icon_url} 
                              alt="" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/50">
                            <ExternalLink className="h-8 w-8 text-white" />
                          </div>
                        )}
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-slate-800 truncate mb-1 group-hover:text-indigo-600 transition-colors duration-300">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-slate-600 truncate text-sm">
                            {link.description}
                          </p>
                        )}
                        {/* Click count badge */}
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                            {link.click_count} {link.click_count === 1 ? 'click' : 'clicks'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Arrow with animation */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center group-hover:from-indigo-100 group-hover:to-purple-100 transition-all duration-300">
                          <ExternalLink className="h-5 w-5 text-slate-600 group-hover:text-indigo-600 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Footer with subtle branding */}
          <div className="text-center mt-16 py-8">
            <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
              <span>Powered by</span>
              <LinkHubLogo className="text-slate-600" showText={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
