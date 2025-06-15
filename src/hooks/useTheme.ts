
import { useState, useEffect } from 'react';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple';

interface ThemeConfig {
  name: string;
  value: Theme;
  description: string;
  premium: boolean;
}

export const themes: ThemeConfig[] = [
  { name: 'Light', value: 'light', description: 'Default light theme', premium: false },
  { name: 'Dark', value: 'dark', description: 'Default dark theme', premium: false },
  { name: 'Ocean Blue', value: 'blue', description: 'Premium blue theme', premium: true },
  { name: 'Forest Green', value: 'green', description: 'Premium green theme', premium: true },
  { name: 'Royal Purple', value: 'purple', description: 'Premium purple theme', premium: true },
];

export const useTheme = () => {
  const { limits } = useSubscriptionLimits();
  const [theme, setTheme] = useState<Theme>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from localStorage only once
  useEffect(() => {
    const savedTheme = localStorage.getItem('linkhub-theme') as Theme;
    if (savedTheme && themes.find(t => t.value === savedTheme)) {
      setTheme(savedTheme);
    }
    setIsInitialized(true);
  }, []);

  // Check if user can access premium themes
  const canAccessPremiumThemes = limits.subscribed && (
    limits.subscriptionTier === 'Premium' || 
    limits.subscriptionTier === 'Enterprise'
  );

  // Apply theme to document immediately on mount and theme changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'theme-blue', 'theme-green', 'theme-purple');
    
    // Apply current theme
    if (theme === 'light' || theme === 'dark') {
      root.classList.add(theme);
    } else {
      root.classList.add('dark', `theme-${theme}`);
    }
  }, [theme, isInitialized]);

  // Check theme access when subscription limits change, but only reset if necessary
  useEffect(() => {
    if (!isInitialized) return;
    
    const themeConfig = themes.find(t => t.value === theme);
    if (themeConfig?.premium && !canAccessPremiumThemes) {
      console.log('Theme access revoked, reverting to light theme');
      setTheme('light');
      localStorage.setItem('linkhub-theme', 'light');
    }
  }, [canAccessPremiumThemes, theme, isInitialized]);

  const changeTheme = (newTheme: Theme) => {
    const themeConfig = themes.find(t => t.value === newTheme);
    
    // Check if user can access this theme
    if (themeConfig?.premium && !canAccessPremiumThemes) {
      return false; // Theme change not allowed
    }
    
    console.log('Changing theme to:', newTheme);
    setTheme(newTheme);
    localStorage.setItem('linkhub-theme', newTheme);
    return true;
  };

  const getAvailableThemes = () => {
    return themes.filter(t => !t.premium || canAccessPremiumThemes);
  };

  return {
    theme,
    changeTheme,
    canAccessPremiumThemes,
    getAvailableThemes,
    themes: getAvailableThemes(),
  };
};
