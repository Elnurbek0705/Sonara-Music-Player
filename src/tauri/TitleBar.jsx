import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Moon, SunMedium, Droplet } from "lucide-react";

const appWindow = getCurrentWindow();

function TitleBar({ theme, toggleTheme }) {
  const [maximized, setMaximized] = useState(false);

  async function checkMaximized() {
    const state = await appWindow.isMaximized();
    setMaximized(state);
    if (state) {
      document.documentElement.classList.add("is-maximized");
    } else {
      document.documentElement.classList.remove("is-maximized");
    }
  }

  async function toggleMaximize() {
    await appWindow.toggleMaximize();
    checkMaximized();
  }

  // TitleBar.jsx ichida
  useEffect(() => {
    // Initial check
    appWindow.isMaximized().then(state => {
      setMaximized(state);
      if (state) {
        document.documentElement.classList.add("is-maximized");
      } else {
        document.documentElement.classList.remove("is-maximized");
      }
    });

    // Oyna o'lchami o'zgarganda avtomatik tekshirish
    const unlisten = appWindow.onResized(() => {
      checkMaximized();
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <div className="titlebar w-full flex justify-between position-relative z-10" data-tauri-drag-region>
      <div className="title">
        <button className="appLogo">Sonara</button>
      </div>

      <div className="window-controls flex items-center gap-2 text-[11px]">
        <button
          onClick={toggleTheme}
          title="Switch theme"
          className="px-2 rounded hover:text-brand"
        >
          {theme === "light" ? (
            <SunMedium size={14} />
          ) : theme === "custom" ? (
            <Droplet size={14} />
          ) : (
            <Moon size={14} />
          )}
        </button>

        <button onClick={() => appWindow.minimize()}>&#x2013;</button>

        <button onClick={toggleMaximize}>{maximized ? "❐" : "☐"}</button>

        <button onClick={() => appWindow.close()}>&#x2715;</button>
      </div>
    </div>
  );
}

export default TitleBar;
