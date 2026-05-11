import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, Square, Repeat, Shuffle } from "lucide-react";

export default function Controls({
  togglePlay, isPlaying, nextSong, prevSong, stopSong, playFromBeginning,
  isRepeat, setIsRepeat, isShuffle, setIsShuffle, volume, setVolume,
}) {
  const barRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const getVol = useCallback((clientY) => {
    const rect = barRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => setVolume(getVol(e.clientY));
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, getVol, setVolume]);

  const btn = "p-1.5 rounded group transition-all duration-150 active:scale-90 select-none";
  const ic = "text-text-dim fill-text-dim group-hover:text-brand group-hover:fill-brand transition-colors";
  const mode = (on) =>
    on ? "text-brand fill-brand" : "text-text-muted fill-text-muted group-hover:text-text-dim transition-colors";

  const pct = Math.round(volume * 100);

  return (
    <div className="flex items-center w-full px-2 py-1.5">
      {/* Playback controls */}
      <div className="flex items-center gap-1 flex-1 justify-center">
        <button onClick={() => setIsShuffle(!isShuffle)} className={btn} title="Shuffle">
          <Shuffle size={15} className={mode(isShuffle)} />
        </button>
        <button onClick={prevSong} className={btn} aria-label="Previous">
          <SkipBack size={19} className={ic} />
        </button>
        <button onClick={stopSong} className={btn} aria-label="Stop">
          <Square size={19} className={ic} />
        </button>
        <button
          onClick={playFromBeginning}
          className="flex items-center justify-center rounded-full border-2 transition-all duration-150 active:scale-95 mx-0.5"
          style={{ borderColor: "var(--accent)", color: "var(--accent)", width: 34, height: 34 }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent)";
            e.currentTarget.style.color = "var(--bg-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--accent)";
          }}
          aria-label="Play from beginning"
        >
          <Play size={20} style={{ fill: "currentColor" }} />
        </button>
        <button onClick={togglePlay} className={btn} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? <Pause size={20} className={ic} /> : <Play size={20} className={ic} />}
        </button>
        <button onClick={nextSong} className={btn} aria-label="Next">
          <SkipForward size={19} className={ic} />
        </button>
        <button onClick={() => setIsRepeat(!isRepeat)} className={btn} title="Repeat">
          <Repeat size={15} className={mode(isRepeat)} />
        </button>
      </div>

      {/* Vertical volume bar */}
      <div
        className="flex flex-col items-center gap-1 flex-shrink-0 select-none"
        title={`Volume: ${pct}%`}
      >
        <span
          className="text-[9px] tabular-nums text-center block"
          style={{ color: "var(--text-muted)", width: 24 }}
        >
          {pct}
        </span>
        <div
          ref={barRef}
          onMouseDown={(e) => { setDragging(true); setVolume(getVol(e.clientY)); }}
          onClick={(e) => { if (!dragging) setVolume(getVol(e.clientY)); }}
          onWheel={(e) => {
            e.preventDefault();
            setVolume(Math.max(0, Math.min(1, volume - e.deltaY * 0.001)));
          }}
          style={{
            width: 8,
            height: 64,
            background: "var(--bg-surface)",
            borderRadius: 4,
            cursor: "ns-resize",
            position: "relative",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: `${volume * 100}%`,
              background: "var(--accent)",
              borderRadius: "0 0 3px 3px",
              transition: dragging ? "none" : "height 0.08s",
            }}
          />
        </div>
      </div>
    </div>
  );
}
