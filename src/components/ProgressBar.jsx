export default function ProgressBar({ currentTime, duration, onSeek }) {
  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  const handleSeek = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const ratio = clickX / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div className="w-full p-2">
      <div
        className="h-2 rounded-full bg-surface cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
