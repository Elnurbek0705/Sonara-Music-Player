import { useEffect, useCallback, useState } from "react";

const THEME_KEY = "appTheme";
const themes = ["dark", "light", "custom"];

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem(THEME_KEY) || "dark";
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark-theme", "light-theme", "custom-theme");
    document.documentElement.classList.add(`${theme}-theme`);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
