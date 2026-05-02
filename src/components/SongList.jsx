// SongList.jsx
import { X, Trash2 } from "lucide-react";
import FileUploader from "./FileUploader";

export default function SongList({
  songs,
  currentIndex,
  onSongSelect,
  removeSong,
  addSongs,
}) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-2">
        <FileUploader addSongs={addSongs} />
      </div>

      <ul className="flex-1 overflow-y-auto mt-2 pr-1 custom-scrollbar">
        {songs.length === 0 ? (
          <li className="px-4 py-8 text-center text-gray-400">No songs in the playlist yet.</li>
        ) : (
          songs.map((song, index) => (
            <li
              key={song.path || index}
              className={`flex justify-between bg-[#252525] items-center px-4 py-3 cursor-pointer w-full mb-1 transition-colors ${
                index === currentIndex ? "bg-[#cd6d0c]" : "hover:bg-gray-700"
              }`}
              onClick={() => onSongSelect(index)}
            >
              <span className="truncate pr-4">
                {index + 1}. {song.title}
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeSong(index);
                }}
                className="p-1 rounded hover:bg-[#333]"
                aria-label="Remove song"
              >
                <X size={14} className="text-gray-300" />
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
