import { useState } from "react";

export default function ProgressBar({ currentTime, duration, onSeek }) {
  const [hovering, setHovering] = useState(false);
  const [hoverRatio, setHoverRatio] = useState(0);

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const fmt = (s) => {
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
    <div className="flex items-center gap-2 px-3 pb-2 select-none">
      {/* Current time */}
      <span
        className="text-[10px] tabular-nums flex-shrink-0"
        style={{ color: "var(--text-muted)", minWidth: 30 }}
      >
        {fmt(currentTime)}
      </span>

      {/* Track bar */}
      <div
        className="flex-1 relative cursor-pointer"
        style={{ height: 16, display: "flex", alignItems: "center" }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div
          className="w-full relative rounded-full"
          style={{
            height: hovering ? 4 : 2,
            background: "var(--bg-surface)",
            transition: "height 0.15s",
          }}
        >
          {/* Hover ghost */}
          {hovering && (
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${hoverRatio * 100}%`, background: "var(--accent-strong)", opacity: 0.35 }}
            />
          )}

          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${progress}%`, background: "var(--accent)", transition: "width 0.1s linear" }}
          />

          {/* Thumb */}
          {hovering && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full pointer-events-none"
              style={{ left: `${progress}%`, width: 10, height: 10, background: "var(--accent)" }}
            />
          )}
        </div>

        {/* Hover tooltip */}
        {hovering && duration > 0 && (
          <div
            className="absolute -top-6 text-[10px] px-1.5 py-0.5 rounded pointer-events-none"
            style={{
              left: `${hoverRatio * 100}%`,
              transform: "translateX(-50%)",
              background: "var(--bg-surface-dark)",
              color: "var(--text-main)",
              border: "1px solid var(--border-color)",
              whiteSpace: "nowrap",
            }}
          >
            {fmt(hoverRatio * duration)}
          </div>
        )}
      </div>

      {/* Total duration */}
      <span
        className="text-[10px] tabular-nums flex-shrink-0"
        style={{ color: "var(--text-muted)", minWidth: 30, textAlign: "right" }}
      >
        {fmt(duration)}
      </span>
    </div>
  );
}
