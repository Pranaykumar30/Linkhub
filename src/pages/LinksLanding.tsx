import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useLinks } from '@/hooks/useLinks';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Settings, Plus, BarChart3, Home, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuthButton from '@/components/AuthButton';

const LinksLanding = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { links, loading: linksLoading, recordClick } = useLinks();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex justify-center p-6">
            <AuthButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return user.email?.[0]?.toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLinkClick = (link: any) => {
    recordClick(link.id);
    window.open(link.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/links" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">L</span>
              </div>
              <h1 className="text-xl font-semibold">LinkHub</h1>
            </Link>
            
            <div className="flex items-center gap-4">
              {profileLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {profile?.full_name || 'User'}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="text-sm">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              {/* Admin Button - only show if user is admin and not loading */}
              {!adminLoading && isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {profileLoading ? (
                <Skeleton className="h-20 w-20 rounded-full" />
              ) : (
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-lg">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            
            {profileLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-40 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-2">
                  {profile?.full_name || 'Welcome'}
                </h1>
                {profile?.bio && (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}
              </>
            )}
          </div>

          {/* Links Grid */}
          {linksLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : links.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <ExternalLink className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No links yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first link to share with others.
                    </p>
                    <Link to="/dashboard">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Link
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {links
                .filter(link => link.is_active)
                .map((link) => (
                  <Card 
                    key={link.id} 
                    className="transition-all duration-200 hover:shadow-md cursor-pointer group"
                    onClick={() => handleLinkClick(link)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {link.icon_url ? (
                            <img 
                              src={link.icon_url} 
                              alt={link.title}
                              className="w-8 h-8 rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <ExternalLink className={`h-6 w-6 text-muted-foreground ${link.icon_url ? 'hidden' : ''}`} />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {link.title}
                          </h3>
                          {link.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {link.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <BarChart3 className="h-4 w-4" />
                          <span>{link.click_count}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Footer */}
          {!linksLoading && links.length > 0 && (
            <div className="text-center mt-8">
              <Link to="/dashboard">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Links
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinksLanding;
