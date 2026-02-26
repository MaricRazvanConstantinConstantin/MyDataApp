import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {ThemeContext} from './hooks';
import {getString, setString} from '../utils/storage';

type ThemeName = 'one' | 'two';

export type ThemeContextValue = {
  theme: ThemeName;
  toggle: () => void;
  setTheme: (t: ThemeName) => void;
};

const STORAGE_KEY = 'app-theme';

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const raw = getString(STORAGE_KEY, 'one');
    if (raw === 'one' || raw === 'two') return raw;
    return 'one';
  });

  useEffect(() => {
    setString(STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback((t: ThemeName) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((s) => (s === 'one' ? 'two' : 'one')),
    [],
  );

  const value = useMemo(
    () => ({theme, toggle, setTheme}),
    [theme, toggle, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
