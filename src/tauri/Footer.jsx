const Footer = ({ currentSong, currentTime, duration, currentIndex, totalSongs }) => {
  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  // Stream URL bo'lsa "YT", mahalliy fayl bo'lsa kengaytma
  const isStream = currentSong?.isStream || 
    currentSong?.path?.startsWith("http");
  
  const ext = isStream
    ? "YT"
    : currentSong?.path?.split(".").pop()?.toUpperCase() || null;

  return (
    <div
      className="w-full footer flex-shrink-0 select-none"
      style={{
        background: "var(--bg-surface-dark)",
        borderTop: "1px solid var(--border-color)",
      }}
    >
      {/* Progress line */}
      <div style={{ background: "var(--bg-surface)", height: 2 }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "var(--accent)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex items-center justify-between px-3" style={{ height: 28 }}>
        {/* Chap: trek nomi */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {currentSong ? (
            <>
              {ext && (
                <span
                  className="text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0"
                  style={{
                    background: isStream
                      ? "rgba(255,0,0,0.15)"       // YT uchun qizilroq
                      : "var(--bg-surface)",
                    color: isStream ? "#ff4444" : "var(--accent)",
                    border: `1px solid ${isStream ? "rgba(255,0,0,0.3)" : "var(--border-color)"}`,
                  }}
                >
                  {ext}
                </span>
              )}
              <span
                className="text-[11px] truncate"
                style={{ color: "var(--text-dim)" }}
              >
                {currentSong.title}
              </span>
            </>
          ) : (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Hech qanday trek tanlanmagan
            </span>
          )}
        </div>

        {/* O'ng: vaqt + trek hisobi */}
        <div
          className="flex items-center gap-3 flex-shrink-0 text-[10px]"
          style={{ color: "var(--text-muted)" }}
        >
          {currentSong && (
            <span style={{ color: "var(--text-dim)" }}>
              {formatTime(currentTime)}
              <span style={{ color: "var(--text-muted)" }}>
                {" "}/ {formatTime(duration)}
              </span>
            </span>
          )}
          {totalSongs > 0 && (
            <span>
              <span style={{ color: "var(--accent)" }}>{currentIndex + 1}</span>
              <span style={{ color: "var(--text-muted)" }}> / {totalSongs}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Footer;