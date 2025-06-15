
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, User, Sparkles, ArrowRight, Plus } from 'lucide-react';
import LinkHubLogo from '@/components/LinkHubLogo';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
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
    try {
      console.log('Recording click for link:', link.id);
      
      // Record click analytics
      const { error: analyticsError } = await supabase
        .from('link_clicks')
        .insert({
          link_id: link.id,
          user_agent: navigator.userAgent,
          referer: document.referrer,
        });

      if (analyticsError) {
        console.error('Error recording click analytics:', analyticsError);
      }

      // Update click count
      const { error: updateError } = await supabase
        .from('links')
        .update({ 
          click_count: link.click_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', link.id);

      if (updateError) {
        console.error('Error updating click count:', updateError);
      } else {
        // Update local state optimistically
        setLinks(prev => prev.map(l => 
          l.id === link.id 
            ? { ...l, click_count: l.click_count + 1 }
            : l
        ));
      }
    } catch (error) {
      console.error('Error in handleLinkClick:', error);
    }

    // Navigate to the link
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isOwnProfile = user?.id === profile?.id;

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Liquid Glass Navigation */}
        <nav className="relative z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <LinkHubLogo className="text-white" />
            <Skeleton className="h-10 w-32 bg-white/10" />
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-6 bg-white/10" />
              <Skeleton className="h-8 w-64 mx-auto mb-4 bg-white/10" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Liquid Glass Navigation */}
        <nav className="relative z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <LinkHubLogo className="text-white" />
            <Link to="/">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Join LinkHub
              </Button>
            </Link>
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
                <p className="text-white/70 text-lg mb-8">
                  The profile you're looking for doesn't exist or has been removed.
                </p>
                <Link to="/">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your Own LinkHub
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        
        {/* Floating orbs with animation */}
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/6 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }}></div>
        
        {/* Light rays */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-white/5 to-transparent transform rotate-12"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-white/3 to-transparent transform -rotate-12"></div>
      </div>

      {/* Liquid Glass Navigation */}
      <nav className="relative z-50 border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <LinkHubLogo className="text-white" />
          
          <div className="flex items-center gap-4">
            {isOwnProfile ? (
              <Link to="/dashboard">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Go to Dashboard
                </Button>
              </Link>
            ) : user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                    {getInitials(user.user_metadata?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white/90 text-sm font-medium">
                  {user.user_metadata?.full_name || 'User'}
                </span>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your LinkHub
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="relative mb-16">
            <Card className="relative shadow-2xl border-0 bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              
              <CardContent className="text-center py-12 px-8">
                <div className="relative inline-block mb-6">
                  <Avatar className="h-32 w-32 shadow-2xl ring-4 ring-white/30">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold mb-4 text-white">
                  {profile.full_name || 'Welcome'}
                </h1>
                
                {profile.bio && (
                  <p className="text-white/80 text-lg mb-6 max-w-md mx-auto">
                    {profile.bio}
                  </p>
                )}
                
                <div className="flex items-center justify-center gap-2 text-white/70">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/30"></div>
                  <span className="text-sm font-medium px-4">My Links</span>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/30"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Links Section */}
          <div className="space-y-6">
            {links.length === 0 ? (
              <Card className="shadow-xl border-0 bg-white/10 backdrop-blur-xl border border-white/20">
                <CardContent className="text-center py-16">
                  <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ExternalLink className="h-8 w-8 text-white/60" />
                  </div>
                  <p className="text-white/70 text-lg mb-6">No links available yet</p>
                  {!user && (
                    <Link to="/">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your Own LinkHub
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              links.map((link, index) => (
                <Card 
                  key={link.id} 
                  className="group cursor-pointer shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] border-0 bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden hover:bg-white/15"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleLinkClick(link)}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {link.icon_url ? (
                          <div className="h-14 w-14 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/20">
                            <img 
                              src={link.icon_url} 
                              alt="" 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                            <ExternalLink className="h-7 w-7 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-white truncate mb-1 group-hover:text-blue-300 transition-colors">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-white/60 truncate text-sm">
                            {link.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-white/40">
                            {link.click_count} clicks
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                          <ArrowRight className="h-5 w-5 text-white/70 group-hover:text-white transform group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Call to Action for Non-Users */}
          {!user && links.length > 0 && (
            <div className="mt-16 text-center">
              <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-white/20">
                <CardContent className="py-12">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Create Your Own LinkHub
                  </h3>
                  <p className="text-white/80 mb-8 max-w-md mx-auto">
                    Join thousands of creators sharing their links in one beautiful place.
                  </p>
                  <Link to="/">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <Plus className="h-5 w-5 mr-2" />
                      Get Started Free
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-16 py-8">
            <div className="inline-flex items-center gap-2 text-white/50 text-sm bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
              <span>Powered by</span>
              <LinkHubLogo className="text-white/70" showText={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
