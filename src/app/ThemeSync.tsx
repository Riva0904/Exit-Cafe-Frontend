import { useEffect } from 'react';
import { useAppSelector } from './hooks';

export function ThemeSync() {
  const theme = useAppSelector((s) => s.ui.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
}
