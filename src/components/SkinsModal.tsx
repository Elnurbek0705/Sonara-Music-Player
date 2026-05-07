import { useEffect, useRef } from "react";
import { themes, applyTheme, getSavedTheme, ThemeKey } from "../themes/themes";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SkinsModal({ open, onClose }: Props) {
  const [active, setActive] = useState<ThemeKey>(getSavedTheme);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSelect(key: ThemeKey) {
    applyTheme(key);
    setActive(key);
  }

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  const current = themes.find((t) => t.key === active)!;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="flex flex-col rounded-lg overflow-hidden"
        style={{
          width: 560,
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background: "var(--bg-surface-dark)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="font-bold text-base tracking-wide"
              style={{ color: "var(--accent)" }}
            >
              SONARA
            </span>
            <span
              className="text-sm"
              style={{ color: "var(--text-dim)" }}
            >
              — Skins
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-dim)")
            }
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex" style={{ minHeight: 320 }}>
          {/* Skin list */}
          <div
            className="flex flex-col py-2"
            style={{
              width: 200,
              borderRight: "1px solid var(--border-color)",
              background: "var(--bg-surface-dark)",
            }}
          >
            {themes.map((t) => (
              <button
                key={t.key}
                onClick={() => handleSelect(t.key)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors"
                style={{
                  background:
                    active === t.key ? "var(--accent)" : "transparent",
                  color:
                    active === t.key
                      ? "var(--bg-primary)"
                      : "var(--text-main)",
                  fontWeight: active === t.key ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (active !== t.key)
                    e.currentTarget.style.background = "var(--bg-surface)";
                }}
                onMouseLeave={(e) => {
                  if (active !== t.key)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {/* Color dot */}
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: t.vars["--accent"] }}
                />
                {t.label}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div className="flex-1 p-5 flex flex-col gap-4">
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>
              Preview
            </p>

            {/* Mini player preview */}
            <div
              className="rounded-md overflow-hidden"
              style={{
                background: current.vars["--bg-secondary"],
                border: `1px solid ${current.vars["--border-color"]}`,
              }}
            >
              {/* Titlebar */}
              <div
                className="flex items-center justify-between px-3 py-1"
                style={{
                  background: current.vars["--bg-surface-dark"],
                  borderBottom: `1px solid ${current.vars["--border-color"]}`,
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "FleurDeLeah-Regular, serif",
                    fontSize: 18,
                    color: current.vars["--accent"],
                  }}
                >
                  Sonara
                </span>
                <div className="flex gap-1">
                  {["—", "□", "✕"].map((c) => (
                    <span
                      key={c}
                      className="text-xs w-5 h-5 flex items-center justify-center rounded"
                      style={{ color: current.vars["--text-dim"] }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Track info */}
              <div className="px-3 pt-2 pb-1">
                <p
                  className="text-xs truncate"
                  style={{ color: current.vars["--text-main"] }}
                >
                  A.V.G, Goro — Она близко (Official video).mp3
                </p>
              </div>

              {/* Progress bar */}
              <div className="px-3 pb-2">
                <div
                  className="h-1 rounded-full"
                  style={{ background: current.vars["--bg-surface"] }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "35%",
                      background: current.vars["--accent"],
                    }}
                  />
                </div>
                <div
                  className="flex justify-between text-xs mt-1"
                  style={{ color: current.vars["--text-dim"] }}
                >
                  <span>0:48</span>
                  <span>2:24</span>
                </div>
              </div>

              {/* Playlist items */}
              {[
                { n: "1. A.V.G — Я плачу", active: false },
                { n: "2. A.V.G, Goro — Она близко", active: true },
                { n: "3. Elnur Valeh — Qargis", active: false },
              ].map((item) => (
                <div
                  key={item.n}
                  className="px-3 py-1 text-xs truncate"
                  style={{
                    background: item.active
                      ? current.vars["--bg-surface"]
                      : "transparent",
                    color: item.active
                      ? current.vars["--accent"]
                      : current.vars["--text-dim"],
                    fontWeight: item.active ? 600 : 400,
                  }}
                >
                  {item.n}
                </div>
              ))}
              <div className="pb-2" />
            </div>

            {/* Theme info */}
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-main)" }}
              >
                {current.label}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                Sonara Theme v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}