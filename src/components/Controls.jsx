import { Pause, Play, SkipBack, SkipForward, Square, Repeat, Shuffle } from "lucide-react";

export default function Controls({
  togglePlay,
  isPlaying,
  nextSong,
  prevSong,
  stopSong,
  playFromBeginning,
  isRepeat,
  setIsRepeat,
  isShuffle,
  setIsShuffle
}) {
  const btn = "p-2 transition-all duration-200 group rounded-full active:scale-90";

  const icon = [
    "text-text-dim fill-text-dim",
    "group-hover:text-brand group-hover:fill-brand",
    "transition-colors duration-200",
  ].join(" ");

  const modeIcon = (active) =>
    active
      ? "text-brand fill-brand"
      : ["text-text-muted fill-text-muted", "group-hover:text-text-dim", "transition-colors duration-200"].join(" ");

  return (
    <div className="flex items-center gap-3 mb-4 w-full justify-center">

      <button onClick={() => setIsShuffle(!isShuffle)} className={btn} title="Shuffle">
        <Shuffle size={18} className={modeIcon(isShuffle)} />
      </button>

      <button onClick={prevSong} className={btn} aria-label="Previous">
        <SkipBack size={21} className={icon} />
      </button>

      <button onClick={stopSong} className={btn} aria-label="Stop">
        <Square size={21} className={icon} />
      </button>

      {/* Play from beginning — asosiy doira tugma */}
      <button
        onClick={playFromBeginning}
        className="p-2 mx-2 rounded-full border-2 transition-all duration-200 active:scale-95 group"
        style={{
          borderColor: "var(--accent)",
          color: "var(--accent)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--accent)";
          e.currentTarget.style.color = "var(--bg-primary)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--accent)";
        }}
        aria-label="Play from beginning"
      >
        <Play size={26} style={{ fill: "currentColor" }} />
      </button>

      <button onClick={togglePlay} className={btn} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying
          ? <Pause size={24} className={icon} />
          : <Play  size={24} className={icon} />}
      </button>

      <button onClick={nextSong} className={btn} aria-label="Next">
        <SkipForward size={21} className={icon} />
      </button>

      <button onClick={() => setIsRepeat(!isRepeat)} className={btn} title="Repeat">
        <Repeat size={18} className={modeIcon(isRepeat)} />
      </button>

    </div>
  );
}