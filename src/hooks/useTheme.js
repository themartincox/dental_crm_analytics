import { useEffect, useState } from "react";

export default function useTheme(defaultTheme = 'light') {
  const [theme, setTheme] = useState(
    (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) ||
    (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : defaultTheme)
  );
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.theme = theme;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);
  return { theme, setTheme };
}

