'use client';
import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('si-dark-mode');
    if (stored !== null) {
      setDark(stored === 'true');
    }
    // Default: light mode (don't follow system preference)
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('si-dark-mode', String(dark));
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}
