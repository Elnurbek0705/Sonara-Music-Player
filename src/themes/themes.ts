export type ThemeKey = "default" | "fire" | "rose" | "cyber" | "forest" | "slate" | "light";

export interface Theme {
  key: ThemeKey;
  label: string;
  icon: string; // emoji yoki belgi
  vars: Record<string, string>;
}

export const themes: Theme[] = [
  {
    key: "default",
    label: "Default",
    icon: "◐",
    vars: {
      "--bg-primary":      "#141414",
      "--bg-secondary":    "#1e1e1e",
      "--bg-surface":      "#2a2a2a",
      "--bg-surface-dark": "#111111",
      "--accent":          "#c8893a",
      "--accent-strong":   "#a06428",
      "--border-color":    "#3d2e1a",
      "--text-main":       "#e8e8e8",
      "--text-dim":        "#888888",
      "--text-muted":      "#555555",
    },
  },
  {
    key: "fire",
    label: "Fire",
    icon: "🔥",
    vars: {
      "--bg-primary":      "#03071E",
      "--bg-secondary":    "#1a0a06",
      "--bg-surface":      "#2c1008",
      "--bg-surface-dark": "#0d0403",
      "--accent":          "#F48C06",
      "--accent-strong":   "#DC2F02",
      "--border-color":    "#6A040F",
      "--text-main":       "#fff3e0",
      "--text-dim":        "#b07040",
      "--text-muted":      "#7a4020",
    },
  },
  {
    key: "rose",
    label: "Rose",
    icon: "🌹",
    vars: {
      "--bg-primary":      "#1a0610",
      "--bg-secondary":    "#2a0e1c",
      "--bg-surface":      "#3d1428",
      "--bg-surface-dark": "#110409",
      "--accent":          "#FF4D6D",
      "--accent-strong":   "#C9184A",
      "--border-color":    "#800F2F",
      "--text-main":       "#fff0f5",
      "--text-dim":        "#cc6688",
      "--text-muted":      "#884455",
    },
  },
  {
    key: "cyber",
    label: "Cyber",
    icon: "⚡",
    vars: {
      "--bg-primary":      "#0a0a14",
      "--bg-secondary":    "#12121f",
      "--bg-surface":      "#1a1a2e",
      "--bg-surface-dark": "#060610",
      "--accent":          "#64DFDF",
      "--accent-strong":   "#48BFE3",
      "--border-color":    "#5E60CE",
      "--text-main":       "#e8f4ff",
      "--text-dim":        "#5390D9",
      "--text-muted":      "#3a4a80",
    },
  },
  {
    key: "forest",
    label: "Forest",
    icon: "🌿",
    vars: {
      "--bg-primary":      "#081C15",
      "--bg-secondary":    "#1B4332",
      "--bg-surface":      "#2D6A4F",
      "--bg-surface-dark": "#040e0a",
      "--accent":          "#74C69D",
      "--accent-strong":   "#52B788",
      "--border-color":    "#40916C",
      "--text-main":       "#D8F3DC",
      "--text-dim":        "#52B788",
      "--text-muted":      "#2D6A4F",
    },
  },
  {
    key: "slate",
    label: "Slate",
    icon: "🩶",
    vars: {
      "--bg-primary":      "#212529",
      "--bg-secondary":    "#343A40",
      "--bg-surface":      "#495057",
      "--bg-surface-dark": "#1a1e22",
      "--accent":          "#ADB5BD",
      "--accent-strong":   "#6C757D",
      "--border-color":    "#495057",
      "--text-main":       "#F8F9FA",
      "--text-dim":        "#CED4DA",
      "--text-muted":      "#6C757D",
    },
  },
  {
    key: "light",
    label: "Light",
    icon: "☀",
    vars: {
      "--bg-primary":      "#f0ede8",
      "--bg-secondary":    "#e8e4de",
      "--bg-surface":      "#d8d3cb",
      "--bg-surface-dark": "#f7f4f0",
      "--accent":          "#b07030",
      "--accent-strong":   "#8b5520",
      "--border-color":    "#c8bfb0",
      "--text-main":       "#1a1814",
      "--text-dim":        "#504840",
      "--text-muted":      "#9a9088",
    },
  },
];

export function applyTheme(key: ThemeKey): void {
  const theme = themes.find((t) => t.key === key);
  if (!theme) return;
  const root = document.documentElement;
  for (const [prop, val] of Object.entries(theme.vars)) {
    root.style.setProperty(prop, val);
  }
  localStorage.setItem("sonara-theme", key);
}

export function getSavedTheme(): ThemeKey {
  return (localStorage.getItem("sonara-theme") as ThemeKey) ?? "default";
}