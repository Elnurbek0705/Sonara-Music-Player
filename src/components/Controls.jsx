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
  const buttonStyle = "p-2 transition-all duration-300 group rounded-full active:scale-90";
  const iconStyle = "text-text-main fill-text-main group-hover:text-brand group-hover:fill-brand transition-colors duration-300";
  
  // Rejimlar uchun maxsus uslub (active holati uchun)
  const activeIconStyle = (active) => 
    active 
      ? "text-brand fill-brand" 
      : "text-text-dim group-hover:text-text-main transition-colors duration-300";

  return (
    <div className="flex items-center gap-3 mb-4 w-full justify-center">
      {/* Shuffle */}
      <button 
        onClick={() => setIsShuffle(!isShuffle)} 
        className={buttonStyle} 
        title="Shuffle"
      >
        <Shuffle size={18} className={activeIconStyle(isShuffle)} />
      </button>

      {/* Previous */}
      <button onClick={prevSong} className={buttonStyle} aria-label="Previous">
        <SkipBack size={21} className={iconStyle} />
      </button>

      {/* Stop */}
      <button onClick={stopSong} className={buttonStyle} aria-label="Stop">
        <Square size={21} className={iconStyle} />
      </button>

      {/* Play from beginning */}
      <button
        onClick={playFromBeginning}
        className="p-2 transition-all duration-300 group rounded-full border-2 border-text-main hover:border-brand active:scale-95 mx-2"
        aria-label="Play from beginning"
      >
        <Play size={26} className={iconStyle} />
      </button>

      {/* Toggle Play/Pause */}
      <button  
        onClick={togglePlay}
        className={buttonStyle}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause size={24} className={iconStyle} />
        ) : (
          <Play size={24} className={iconStyle} />
        )}
      </button>

      {/* Next */}
      <button onClick={nextSong} className={buttonStyle} aria-label="Next">
        <SkipForward size={21} className={iconStyle} />
      </button>

      {/* Repeat */}
      <button 
        onClick={() => setIsRepeat(!isRepeat)} 
        className={buttonStyle} 
        title="Repeat"
      >
        <Repeat size={18} className={activeIconStyle(isRepeat)} />
      </button>
    </div>
  );
}