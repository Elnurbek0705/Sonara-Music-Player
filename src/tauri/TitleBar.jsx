import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

function TitleBar() {
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
    checkMaximized();

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

      <div className="window-controls flex gap-2 text-[11px]">
        <button onClick={() => appWindow.minimize()}>&#x2013;</button>

        <button onClick={toggleMaximize}>{maximized ? "❐" : "☐"}</button>

        <button onClick={() => appWindow.close()}>&#x2715;</button>
      </div>
    </div>
  );
}

export default TitleBar;
