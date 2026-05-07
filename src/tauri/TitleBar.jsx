import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { SkinsModal } from "../components/SkinsModal";
import { GripVertical } from "lucide-react";

const appWindow = getCurrentWindow();

function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const [skinsOpen, setSkinsOpen] = useState(false);

  async function checkMaximized() {
    const state = await appWindow.isMaximized();
    setMaximized(state);
    document.documentElement.classList.toggle("is-maximized", state);
  }

  async function toggleMaximize() {
    await appWindow.toggleMaximize();
    checkMaximized();
  }

  useEffect(() => {
    appWindow.isMaximized().then((state) => {
      setMaximized(state);
      document.documentElement.classList.toggle("is-maximized", state);
    });
    const unlisten = appWindow.onResized(checkMaximized);
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const winBtn = {
    background: "none",
    border: "none",
    cursor: "pointer",
    width: 32,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-dim)",
    fontSize: 13,
    borderRadius: 4,
    transition: "color 0.15s, background 0.15s",
  };

  return (
    <>
      <SkinsModal open={skinsOpen} onClose={() => setSkinsOpen(false)} />

      <div
        className="titlebar w-full flex justify-between items-center relative z-10"
        style={{
          background: "var(--bg-surface-dark)",
          borderBottom: "1px solid var(--border-color)",
        }}
        data-tauri-drag-region
      >
        {/* Logo */}
        <button
          className="appLogo"
          onClick={() => setSkinsOpen(true)}
          title="Open Skins"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "var(--text-dim)",
          }}
        >
          Sonara
          <GripVertical size={16} style={{ marginLeft: 4, color: "var(--text-dim)" }} />
        </button>

        {/* Window controls */}
        <div className="window-controls flex items-center">
          {[
            { label: "–", action: () => appWindow.minimize(), title: "Minimize" },
            { label: maximized ? "❐" : "☐", action: toggleMaximize, title: "Maximize" },
            { label: "✕", action: () => appWindow.close(), title: "Close", danger: true },
          ].map(({ label, action, title, danger }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              style={winBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = danger ? "#ff5f57" : "var(--accent)";
                e.currentTarget.style.background = danger
                  ? "rgba(255,95,87,0.12)"
                  : "var(--bg-surface)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-dim)";
                e.currentTarget.style.background = "none";
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default TitleBar;
