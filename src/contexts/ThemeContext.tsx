import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Theme {
  id: string;
  name: string;
  accent: string;
  isDark: boolean;
}

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: {
    id: 'n_nubs-dark',
    name: 'n_nubs Dark',
    accent: '#9945FF',
    isDark: true
  },
  setTheme: () => {}
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('n_nubs_theme');
    return savedTheme ? JSON.parse(savedTheme) : {
      id: 'n_nubs-dark',
      name: 'n_nubs Dark',
      accent: '#9945FF',
      isDark: true
    };
  });

  const setTheme = useCallback((theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('n_nubs_theme', JSON.stringify(theme));

    // Apply theme to document
    const root = document.documentElement;
    root.classList.toggle('dark', theme.isDark);

    // Remove any existing theme
    root.removeAttribute('data-theme');

    // Apply specific theme attributes
    if (theme.id === 'neon-future') {
      root.setAttribute('data-theme', 'neon-future');
    } else if (theme.id === 'arctic-dawn') {
      root.setAttribute('data-theme', 'arctic-dawn');
    } else if (theme.id === 'sunset-vibes') {
      root.setAttribute('data-theme', 'sunset-vibes');
    } else if (theme.id === 'matrix') {
      root.setAttribute('data-theme', 'matrix');
    } else if (theme.id === 'galaxy') {
      root.setAttribute('data-theme', 'galaxy');
    }

    // Set CSS variables for the theme
    root.style.setProperty('--theme-primary', theme.accent);

    // Dispatch theme change event
    window.dispatchEvent(new Event('themeChange'));
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    setTheme(currentTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 