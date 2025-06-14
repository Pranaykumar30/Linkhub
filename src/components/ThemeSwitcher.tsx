
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/useTheme';
import { Palette, Crown, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ThemeSwitcher = () => {
  const { theme, changeTheme, canAccessPremiumThemes, getAvailableThemes, themes } = useTheme();
  const { toast } = useToast();

  const handleThemeChange = (newTheme: string) => {
    const success = changeTheme(newTheme as any);
    if (!success) {
      toast({
        title: "Premium Feature",
        description: "This theme is only available for Premium subscribers.",
        variant: "destructive",
      });
    }
  };

  const currentThemeConfig = themes.find(t => t.value === theme);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize your LinkHub appearance. Premium themes available for Premium and Enterprise users.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Theme:</label>
          <div className="flex items-center gap-2">
            <span className="text-sm">{currentThemeConfig?.name}</span>
            {currentThemeConfig?.premium && (
              <Badge variant="default" className="text-xs">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Switch Theme:</label>
          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableThemes().map((themeOption) => (
                <SelectItem key={themeOption.value} value={themeOption.value}>
                  <div className="flex items-center gap-2">
                    <span>{themeOption.name}</span>
                    {themeOption.premium && (
                      <Crown className="h-3 w-3 text-amber-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!canAccessPremiumThemes && (
          <div className="p-3 rounded-md bg-muted border border-dashed">
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Premium Themes Locked</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upgrade to Premium or Enterprise to unlock Ocean Blue, Forest Green, and Royal Purple themes.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          {themes.map((themeOption) => (
            <Button
              key={themeOption.value}
              variant={theme === themeOption.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleThemeChange(themeOption.value)}
              disabled={themeOption.premium && !canAccessPremiumThemes}
              className="justify-start"
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getThemePreview(themeOption.value)}`} />
                <span className="text-xs">{themeOption.name}</span>
                {themeOption.premium && !canAccessPremiumThemes && (
                  <Lock className="h-3 w-3 ml-auto" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const getThemePreview = (theme: string) => {
  switch (theme) {
    case 'light': return 'bg-gray-100 border border-gray-300';
    case 'dark': return 'bg-gray-800';
    case 'blue': return 'bg-blue-500';
    case 'green': return 'bg-green-500';
    case 'purple': return 'bg-purple-500';
    default: return 'bg-gray-400';
  }
};

export default ThemeSwitcher;
