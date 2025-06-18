import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeSettings, ThemeMode, ColorScheme, InterfaceSettings } from '../types';

const defaultColorSchemes: ColorScheme[] = [
  {
    name: 'Default',
    primary: '#0ea5e9',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1e293b',
  },
  {
    name: 'Ocean',
    primary: '#0891b2',
    secondary: '#475569',
    accent: '#06b6d4',
    background: '#f8fafc',
    text: '#0f172a',
  },
  {
    name: 'Forest',
    primary: '#059669',
    secondary: '#4b5563',
    accent: '#10b981',
    background: '#f0fdf4',
    text: '#064e3b',
  },
];

const defaultSettings: ThemeSettings = {
  mode: 'system',
  colorScheme: defaultColorSchemes[0],
  interface: {
    fontSize: 'medium',
    spacing: 'comfortable',
    borderRadius: 'medium',
    animations: true,
    reducedMotion: false,
  },
};

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  colorSchemes: ColorScheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('themeSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('themeSettings', JSON.stringify(settings));
    
    // Применяем настройки темы
    document.documentElement.classList.remove('light', 'dark');
    if (settings.mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(systemDark ? 'dark' : 'light');
    } else {
      document.documentElement.classList.add(settings.mode);
    }

    // Применяем настройки интерфейса
    document.documentElement.style.setProperty('--font-size', getFontSize(settings.interface.fontSize));
    document.documentElement.style.setProperty('--spacing', getSpacing(settings.interface.spacing));
    document.documentElement.style.setProperty('--border-radius', getBorderRadius(settings.interface.borderRadius));
    
    if (settings.interface.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, colorSchemes: defaultColorSchemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Вспомогательные функции
const getFontSize = (size: InterfaceSettings['fontSize']) => {
  switch (size) {
    case 'small': return '14px';
    case 'large': return '18px';
    default: return '16px';
  }
};

const getSpacing = (spacing: InterfaceSettings['spacing']) => {
  switch (spacing) {
    case 'compact': return '0.75rem';
    case 'spacious': return '1.5rem';
    default: return '1rem';
  }
};

const getBorderRadius = (radius: InterfaceSettings['borderRadius']) => {
  switch (radius) {
    case 'none': return '0';
    case 'small': return '0.25rem';
    case 'large': return '1rem';
    default: return '0.5rem';
  }
}; 