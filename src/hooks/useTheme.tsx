import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const loadTheme = () => {
      try {
        const saved = window.localStorage.getItem('app_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.theme) setThemeState(parsed.theme as Theme);
        }
      } catch {
        // ignore
      }
    };
    
    loadTheme();
    window.addEventListener('app_settings_changed', loadTheme);
    return () => window.removeEventListener('app_settings_changed', loadTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    try {
      const saved = window.localStorage.getItem('app_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed.theme = newTheme;
      window.localStorage.setItem('app_settings', JSON.stringify(parsed));
      window.dispatchEvent(new Event('app_settings_changed'));
      setThemeState(newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
