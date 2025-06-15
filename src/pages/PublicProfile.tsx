
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
  avatar_url: string | null;
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
          .select('id, full_name, username, avatar_url, custom_url')
          .eq('custom_url', customUrl)
          .single();

        if (customUrlProfile) {
          profileData = customUrlProfile;
        } else {
          // If not found by custom_url, try by username
          const { data: usernameProfile } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url, custom_url')
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
      
      // Record click analytics with proper error handling
      const { error: analyticsError } = await supabase
        .from('link_clicks')
        .insert({
          link_id: link.id,
          user_agent: navigator.userAgent,
          referer: document.referrer || null,
          clicked_at: new Date().toISOString(),
        });

      if (analyticsError) {
        console.error('Error recording click analytics:', analyticsError);
      } else {
        console.log('Click analytics recorded successfully');
      }

      // Update click count in links table
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Glass morphism navbar */}
        <nav className="relative z-50 p-6">
          <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-8 py-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-gray-700 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LinkHub</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-32 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-8 w-48 mx-auto mb-4 bg-white/20 rounded-full" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl bg-white/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Glass morphism navbar */}
        <nav className="relative z-50 p-6">
          <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-8 py-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-gray-700 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LinkHub</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-full px-8 py-3 shadow-lg backdrop-blur-sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
          <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl text-center py-16 rounded-3xl">
            <CardContent>
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-4 text-gray-800">
                Profile Not Found
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                The profile you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-full px-8 py-3 shadow-lg">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Glass morphism navbar */}
      <nav className="relative z-50 p-6">
        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl px-8 py-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-gray-700 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">LinkHub</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isOwnProfile ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <Avatar className="h-8 w-8 border-2 border-white/50 shadow-lg">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                        {getInitials(user?.user_metadata?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700 font-semibold">
                      {user?.user_metadata?.full_name || 'User'}
                    </span>
                  </div>
                  <Link to="/dashboard">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-full px-8 py-3 shadow-lg backdrop-blur-sm">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                    <Avatar className="h-8 w-8 border-2 border-white/50 shadow-lg">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm">
                        {getInitials(user.user_metadata?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700 font-semibold">
                      {user.user_metadata?.full_name || 'User'}
                    </span>
                  </div>
                  <Link to="/dashboard">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-full px-8 py-3 shadow-lg backdrop-blur-sm">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-full px-8 py-3 shadow-lg backdrop-blur-sm">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
        {/* Profile Header - Only Name and Avatar */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <Avatar className="h-24 w-24 shadow-2xl border-4 border-white/50 mx-auto">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white border-4 border-white/50">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-4 border-white shadow-lg"></div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {profile.full_name || 'Welcome'}
          </h1>
        </div>

        {/* Links Section */}
        <div className="space-y-6">
          {links.length === 0 ? (
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl text-center py-16 rounded-3xl">
              <CardContent>
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <p className="text-gray-600 text-xl mb-6">No links available yet</p>
                {!user && (
                  <Link to="/">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-full px-8 py-3 shadow-lg">
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
                className="group cursor-pointer bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] rounded-3xl hover:bg-white/30"
                onClick={() => handleLinkClick(link)}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {link.icon_url ? (
                        <div className="h-16 w-16 rounded-3xl overflow-hidden shadow-xl border-4 border-white/50">
                          <img 
                            src={link.icon_url} 
                            alt="" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl border-4 border-white/50">
                          <ExternalLink className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-gray-800 truncate mb-2 group-hover:text-blue-600 transition-colors">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="text-gray-600 truncate text-base">
                          {link.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl">
                        <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-1 transition-transform" />
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
          <div className="mt-20 text-center">
            <Card className="bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl rounded-3xl">
              <CardContent className="py-16">
                <h3 className="text-3xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Your Own LinkHub
                </h3>
                <p className="text-gray-600 mb-10 max-w-md mx-auto text-xl">
                  Join thousands of creators sharing their links in one beautiful place.
                </p>
                <Link to="/">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-full px-10 py-4 text-xl font-semibold shadow-xl">
                    Get Started
                    <ArrowRight className="h-6 w-6 ml-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-20 py-8">
          <div className="inline-flex items-center gap-3 text-gray-500 text-base bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full border border-white/30 shadow-lg">
            <span>Powered by</span>
            <LinkHubLogo className="text-gray-600" showText={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
