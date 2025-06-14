
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const Demo = () => {
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
        <div className="max-w-4xl mx-auto">
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
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Video placeholder - replace with actual video */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto hover:bg-primary/90 transition-colors cursor-pointer">
                      <Play className="h-8 w-8 text-primary-foreground ml-1" />
                    </div>
                    <p className="text-lg font-semibold">Demo Video</p>
                    <p className="text-muted-foreground">Click to play</p>
                  </div>
                </div>
                {/* You can replace this with an actual video element */}
                {/* <video controls className="w-full h-full">
                  <source src="/demo-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video> */}
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
