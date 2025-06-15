
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, User, Plus, ArrowRight, Globe } from 'lucide-react';
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
      
      // Record click analytics with more details
      const { error: analyticsError } = await supabase
        .from('link_clicks')
        .insert({
          link_id: link.id,
          user_agent: navigator.userAgent,
          referer: document.referrer,
          clicked_at: new Date().toISOString(),
          country: null, // Will be populated by server if available
        });

      if (analyticsError) {
        console.error('Error recording click analytics:', analyticsError);
      } else {
        console.log('Click analytics recorded successfully');
      }

      // Update click count with explicit timestamp
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
        console.log('Click count updated successfully');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-white/20"></div>
            ))}
          </div>
        </div>

        {/* Navbar */}
        <nav className="relative z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-white text-xl font-semibold">LinkHub</span>
              </div>
              
              <div className="flex items-center space-x-6">
                <Skeleton className="h-10 w-32 bg-white/10" />
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
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
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-white/20"></div>
            ))}
          </div>
        </div>

        {/* Navbar */}
        <nav className="relative z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-white text-xl font-semibold">LinkHub</span>
              </div>
              
              <div className="flex items-center space-x-6">
                <Link to="/">
                  <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-6">
                    Open Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-center py-16">
            <CardContent>
              <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <User className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-white">
                Profile Not Found
              </h1>
              <p className="text-white/80 text-lg mb-8">
                The profile you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/">
                <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-8">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your LinkHub
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 relative overflow-hidden">
      {/* Grid Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 144 }).map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute top-40 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

      {/* Navbar - Inspired by the uploaded image */}
      <nav className="relative z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-white text-xl font-semibold">LinkHub</span>
            </div>
            
            {/* Right Section */}
            <div className="flex items-center space-x-6">
              {isOwnProfile ? (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8 border-2 border-white/30">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-white/20 text-white text-sm">
                      {getInitials(user?.user_metadata?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white font-medium">
                    {user?.user_metadata?.full_name || 'User'}
                  </span>
                  <Link to="/dashboard">
                    <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-6">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8 border-2 border-white/30">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-white/20 text-white text-sm">
                      {getInitials(user.user_metadata?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white font-medium">
                    {user.user_metadata?.full_name || 'User'}
                  </span>
                  <Link to="/dashboard">
                    <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-6">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/">
                  <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-6">
                    Open Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Profile Header */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <Avatar className="h-32 w-32 shadow-2xl border-4 border-white/30 mx-auto">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-3xl bg-white/20 text-white border-4 border-white/30">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-white">
            {profile.full_name || 'Welcome'}
          </h1>
          
          {profile.bio && (
            <p className="text-white/90 text-xl mb-6 max-w-2xl mx-auto">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links Section */}
        <div className="space-y-4">
          {links.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-center py-16">
              <CardContent>
                <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-white/80" />
                </div>
                <p className="text-white/80 text-lg mb-6">No links available yet</p>
                {!user && (
                  <Link to="/">
                    <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-8">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your LinkHub
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            links.map((link, index) => (
              <Card 
                key={link.id} 
                className="group cursor-pointer bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                onClick={() => handleLinkClick(link)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {link.icon_url ? (
                        <div className="h-14 w-14 rounded-xl overflow-hidden shadow-lg border-2 border-white/30">
                          <img 
                            src={link.icon_url} 
                            alt="" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/30">
                          <ExternalLink className="h-7 w-7 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-white truncate mb-1 group-hover:text-blue-100 transition-colors">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="text-white/70 truncate text-sm mb-2">
                          {link.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">
                          {link.click_count} clicks
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                        <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-0.5 transition-transform" />
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
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
              <CardContent className="py-12">
                <h3 className="text-3xl font-bold text-white mb-4">
                  Make sure you never start from scratch
                </h3>
                <p className="text-white/80 mb-8 max-w-md mx-auto text-lg">
                  Join thousands of creators sharing their links in one beautiful place.
                </p>
                <Link to="/">
                  <Button className="bg-white text-blue-600 hover:bg-white/90 rounded-full px-8 py-3 text-lg font-semibold">
                    Open Account
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 py-8">
          <div className="inline-flex items-center gap-2 text-white/60 text-sm bg-white/5 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
            <span>Powered by</span>
            <LinkHubLogo className="text-white/80" showText={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
