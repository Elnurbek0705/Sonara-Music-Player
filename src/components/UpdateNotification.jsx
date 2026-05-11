import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { relaunch } from "@tauri-apps/plugin-process";
import { Download, X, RefreshCw } from "lucide-react";

export default function UpdateNotification() {
  const [update, setUpdate] = useState(null);   // { version, body }
  const [status, setStatus] = useState("idle"); // idle | installing | done
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // App ochilgandan 3 soniya keyin tekshiradi (UI yuklangandan keyin)
    const timer = setTimeout(async () => {
      try {
        const result = await invoke("check_update");
        if (result.available) setUpdate(result);
      } catch {
        // Tarmoq yo'q yoki boshqa xato — jimgina o'tkazib yuboradi
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!update || dismissed) return null;

  const handleInstall = async () => {
    setStatus("installing");
    try {
      await invoke("install_update");
      setStatus("done");
    } catch (err) {
      console.error("Update xatoligi:", err);
      setStatus("idle");
    }
  };

  const handleRelaunch = async () => {
    await relaunch();
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg max-w-xs w-full"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--accent)",
        color: "var(--text-main)",
      }}
    >
      {/* Yopish tugmasi */}
      {status === "idle" && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={13} />
        </button>
      )}

      <div
        className="mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ background: "var(--accent)" }}
      >
        <Download size={14} style={{ color: "var(--bg-primary)" }} />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        {status === "done" ? (
          <>
            <p className="text-xs font-semibold">Yangilanish tayyor!</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              O'rnatildi. Qayta ishga tushiring.
            </p>
            <button
              onClick={handleRelaunch}
              className="mt-2 flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              <RefreshCw size={11} />
              Qayta ishga tushirish
            </button>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold">
              Yangi versiya: {update.version}
            </p>
            {update.body && (
              <p
                className="text-[11px] mt-0.5 line-clamp-2"
                style={{ color: "var(--text-muted)" }}
              >
                {update.body}
              </p>
            )}
            <button
              onClick={handleInstall}
              disabled={status === "installing"}
              className="mt-2 flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded disabled:opacity-60"
              style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
            >
              {status === "installing" ? (
                <>
                  <RefreshCw size={11} className="animate-spin" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <Download size={11} />
                  Yangilash
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
