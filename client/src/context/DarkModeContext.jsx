import { createContext, useContext, useState, useLayoutEffect } from 'react';

const DarkModeContext = createContext();

// Apply dark class synchronously before paint to avoid flash
function applyDark(isDark) {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try { localStorage.setItem('afrotask-dark', String(isDark)); } catch {}
}

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('afrotask-dark');
      // Only return true if explicitly set to 'true'
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // useLayoutEffect runs synchronously after DOM mutations — no flicker
  useLayoutEffect(() => {
    applyDark(dark);
  }, [dark]);

  const toggle = () => {
    setDark(prev => {
      const next = !prev;
      applyDark(next);
      return next;
    });
  };

  return (
    <DarkModeContext.Provider value={{ dark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export const useDarkMode = () => useContext(DarkModeContext);
