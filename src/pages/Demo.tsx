
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';

const Demo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const demoFeatures = [
    {
      timestamp: "0:00",
      title: "Account Creation",
      description: "Quick and easy signup process"
    },
    {
      timestamp: "0:30",
      title: "Dashboard Overview",
      description: "Managing your links and analytics"
    },
    {
      timestamp: "1:15",
      title: "Adding Links",
      description: "How to add and customize your links"
    },
    {
      timestamp: "2:00",
      title: "Theme Customization",
      description: "Personalizing your link page appearance"
    },
    {
      timestamp: "2:45",
      title: "Analytics Dashboard",
      description: "Tracking clicks and performance"
    },
    {
      timestamp: "3:30",
      title: "Public Profile",
      description: "How your audience sees your links"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">L</span>
            </div>
            <span className="text-xl font-bold">LinkHub</span>
          </div>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              See LinkHub in Action
            </h1>
            <p className="text-xl text-muted-foreground">
              Watch how easy it is to create and manage your link collection
            </p>
          </div>

          {/* Video Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Product Demo</CardTitle>
              <p className="text-center text-muted-foreground">
                A complete walkthrough of LinkHub's features and capabilities
              </p>
            </CardHeader>
            <CardContent>
              <div 
                ref={containerRef}
                className="aspect-video bg-muted rounded-lg relative overflow-hidden group"
              >
                {/* Demo Video */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&h=675"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                >
                  {/* Updated to use your actual video file name */}
                  <source src="public/demo-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={handlePlayPause}
                      className="bg-white/90 hover:bg-white text-black"
                    >
                      {isPlaying ? <Minimize className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={handleMute}
                      className="bg-white/90 hover:bg-white text-black"
                    >
                      {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                    </Button>
                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={handleFullscreen}
                      className="bg-white/90 hover:bg-white text-black"
                    >
                      <Maximize className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                {/* Play Button for Initial State */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      onClick={handlePlayPause}
                      className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                    >
                      <Play className="h-8 w-8 text-primary-foreground ml-1" />
                    </Button>
                  </div>
                )}

                {/* Video Unavailable Fallback - This will only show if video fails to load */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center" style={{ display: 'none' }}>
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Play className="h-8 w-8 text-primary ml-1" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Demo Video Coming Soon</p>
                    <p className="text-muted-foreground">
                      We're preparing an amazing demo video to showcase all of LinkHub's features
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Timeline */}
              <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {demoFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                      {feature.timestamp}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Highlight */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Easy Customization</h3>
                  <p className="text-muted-foreground text-sm">
                    Customize colors, add your bio, and make it uniquely yours
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Track Performance</h3>
                  <p className="text-muted-foreground text-sm">
                    See how many people click on your links with detailed analytics
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-muted-foreground text-sm">
                    Your links page loads instantly for the best user experience
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of creators who trust LinkHub for their link management
            </p>
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Create Your LinkHub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
