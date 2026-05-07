import { themes, applyTheme, ThemeKey } from "../themes/themes";
import { useState } from "react";

export function ThemeSwitcher() {
  const [active, setActive] = useState<ThemeKey>(
    () => (localStorage.getItem("sonara-theme") as ThemeKey) ?? "default"
  );

  function handleSelect(key: ThemeKey) {
    applyTheme(key);
    setActive(key);
  }

  return (
    <div className="flex gap-1 p-1">
      {themes.map((t) => (
        <button
          key={t.key}
          title={t.label}
          onClick={() => handleSelect(t.key)}
          className={`
            w-7 h-7 rounded flex items-center justify-center text-sm
            transition-all duration-150
            ${active === t.key
              ? "ring-2 ring-brand scale-110"
              : "opacity-50 hover:opacity-100"}
          `}
          style={{ background: t.vars["--bg-surface"] }}
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: t.vars["--accent"] }}
          />
        </button>
      ))}
    </div>
  );
}