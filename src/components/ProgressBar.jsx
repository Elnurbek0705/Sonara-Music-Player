import { useState } from "react";

export default function ProgressBar({ currentTime, duration, onSeek }) {
  const [hovering, setHovering] = useState(false);
  const [hoverRatio, setHoverRatio] = useState(0);

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const formatTime = (s) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverRatio(Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1)));
  };

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek(Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1)) * duration);
  };

  return (
    <div className="w-full px-2 py-1 select-none">
      {/* Track */}
      <div
        className="relative h-1 rounded-full cursor-pointer group"
        style={{ background: "var(--bg-surface)" }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Hover ghost */}
        {hovering && (
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-none"
            style={{
              width: `${hoverRatio * 100}%`,
              background: "var(--accent-strong)",
              opacity: 0.35,
            }}
          />
        )}

        {/* Progress fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${progress}%`,
            background: "var(--accent)",
            transition: "width 0.1s linear",
          }}
        />

        {/* Thumb dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            left: `${progress}%`,
            width: hovering ? 12 : 0,
            height: hovering ? 12 : 0,
            background: "var(--accent)",
            boxShadow: hovering ? "0 0 0 3px var(--accent-strong)" : "none",
            transition: "width 0.15s, height 0.15s, box-shadow 0.15s",
          }}
        />

        {/* Hover time tooltip */}
        {hovering && duration > 0 && (
          <div
            className="absolute -top-7 text-xs px-1.5 py-0.5 rounded pointer-events-none"
            style={{
              left: `${hoverRatio * 100}%`,
              transform: "translateX(-50%)",
              background: "var(--bg-surface-dark)",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
              whiteSpace: "nowrap",
            }}
          >
            {formatTime(hoverRatio * duration)}
          </div>
        )}
      </div>
    </div>
  );
}