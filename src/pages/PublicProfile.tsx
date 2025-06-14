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
    // Record the click in the background without updating UI
    try {
      // Get current click count from database
      const { data: currentLink } = await supabase
        .from('links')
        .select('click_count')
        .eq('id', link.id)
        .single();

      const newClickCount = (currentLink?.click_count || 0) + 1;

      // Update click count in database
      await supabase
        .from('links')
        .update({ click_count: newClickCount })
        .eq('id', link.id);

      // Record click analytics
      await supabase
        .from('link_clicks')
        .insert({
          link_id: link.id,
          user_agent: navigator.userAgent,
          referer: document.referrer,
        });

      console.log('Click recorded successfully');
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
      <div className="min-h-screen relative overflow-hidden">
        {/* Stunning Background Art */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-cyan-600/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400/25 to-orange-600/25 rounded-full blur-lg animate-pulse delay-500"></div>
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <LinkHubLogo className="text-white" />
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Loading Profile Header */}
            <div className="text-center mb-12">
              <Skeleton className="h-40 w-40 rounded-full mx-auto mb-6 bg-white/10" />
              <Skeleton className="h-8 w-64 mx-auto mb-4 bg-white/10" />
            </div>

            {/* Loading Links */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Stunning Background Art */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-cyan-600/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400/25 to-orange-600/25 rounded-full blur-lg animate-pulse delay-500"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4">
            <LinkHubLogo className="text-white" />
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className="text-center py-16">
                <div className="h-20 w-20 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                  <User className="h-10 w-10 text-white/80" />
                </div>
                <h1 className="text-3xl font-bold mb-4 text-white">
                  Profile Not Found
                </h1>
                <p className="text-white/70 text-lg">
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Stunning Background Art */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-cyan-600/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400/25 to-orange-600/25 rounded-full blur-lg animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-green-400/15 to-teal-600/15 rounded-full blur-xl animate-pulse delay-700"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Light rays effect */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent transform rotate-12"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent transform -rotate-12"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <LinkHubLogo className="text-white" />
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header with Glass Morphism Design */}
          <div className="relative mb-16">
            <Card className="relative shadow-2xl border-0 bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
              {/* Animated top border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-pulse"></div>
              
              <CardContent className="text-center py-12 px-8">
                <div className="relative inline-block mb-6">
                  <Avatar className="h-40 w-40 shadow-2xl ring-4 ring-white/30">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Floating sparkle with enhanced glow */}
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-400/50">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
                  {profile.full_name || 'Welcome'}
                </h1>
                
                {/* Enhanced tagline */}
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <div className="h-1 w-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">My Links</span>
                  <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Links with Glass Morphism Design */}
          <div className="space-y-6">
            {links.length === 0 ? (
              <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                <CardContent className="text-center py-16">
                  <div className="h-16 w-16 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ExternalLink className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-white/70 text-lg">No links available yet</p>
                </CardContent>
              </Card>
            ) : (
              links.map((link, index) => (
                <Card 
                  key={link.id} 
                  className="group cursor-pointer shadow-2xl hover:shadow-pink-500/20 transition-all duration-500 hover:scale-[1.02] border-0 bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden animate-fade-in hover:bg-white/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleLinkClick(link)}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-6">
                      {/* Icon with enhanced styling */}
                      <div className="relative">
                        {link.icon_url ? (
                          <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/30">
                            <img 
                              src={link.icon_url} 
                              alt="" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/30">
                            <ExternalLink className="h-8 w-8 text-white" />
                          </div>
                        )}
                        {/* Enhanced hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-600/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-white truncate mb-1 group-hover:text-pink-300 transition-colors duration-300 drop-shadow">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-white/70 truncate text-sm">
                            {link.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Enhanced arrow with animation */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 border border-white/20">
                          <ExternalLink className="h-5 w-5 text-white/80 group-hover:text-white transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Enhanced Footer */}
          <div className="text-center mt-16 py-8">
            <div className="inline-flex items-center gap-2 text-white/60 text-sm backdrop-blur-sm bg-black/20 px-4 py-2 rounded-full border border-white/10">
              <span>Powered by</span>
              <LinkHubLogo className="text-white/80" showText={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
