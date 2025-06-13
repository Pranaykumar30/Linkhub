
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, BarChart3, Palette, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold">LinkHub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            One Link,
            <span className="text-primary"> Infinite Possibilities</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create a stunning, personalized page to showcase all your links, social profiles, and content in one place. Perfect for creators, businesses, and professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Building Your Hub
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful features to help you create the perfect link hub for your audience
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Easy to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Intuitive drag-and-drop interface to organize your links exactly how you want them.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Palette className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Customizable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Choose from beautiful themes and customize colors, fonts, and layouts to match your brand.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track clicks, views, and engagement with detailed analytics and insights.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Fast & Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Lightning-fast loading times and 99.9% uptime to ensure your links are always accessible.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground">Start free, upgrade when you need more features</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">$0</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Up to 5 links</li>
                <li>• Basic themes</li>
                <li>• LinkHub subdomain</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For creators and professionals</CardDescription>
              <div className="text-3xl font-bold">$9<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Unlimited links</li>
                <li>• Custom domain</li>
                <li>• Advanced themes</li>
                <li>• Analytics dashboard</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business</CardTitle>
              <CardDescription>For teams and businesses</CardDescription>
              <div className="text-3xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Everything in Pro</li>
                <li>• Team collaboration</li>
                <li>• Priority support</li>
                <li>• White-label options</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary rounded-2xl p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creators who trust LinkHub to showcase their content
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary">
              Create Your Hub Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="font-semibold">LinkHub</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 LinkHub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
