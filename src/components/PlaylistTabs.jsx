import { useState } from "react";
import { X } from "lucide-react";

export default function PlaylistTabs({
  playlists,
  activePlaylistId,
  onSelectPlaylist,
  onDeletePlaylist,
}) {
  const [hoveredTabId, setHoveredTabId] = useState(null);

  const handleDeletePlaylist = (e, playlistId) => {
    e.stopPropagation();
    onDeletePlaylist(playlistId);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto flex-shrink-0">
      {/* Playlists tabs */}
      {playlists.map((playlist) => (
        <div
          key={playlist.id}
          onMouseEnter={() => setHoveredTabId(playlist.id)}
          onMouseLeave={() => setHoveredTabId(null)}
          onClick={() => onSelectPlaylist(playlist.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded whitespace-nowrap text-sm cursor-pointer transition-all ${
            activePlaylistId === playlist.id
              ? "bg-brand text-black font-semibold"
              : "bg-secondary-bg text-text-dim hover:bg-surface"
          }`}
        >
          <span>{playlist.name}</span>

          {/* Delete button (only for non-default playlists) */}
          {playlist.id !== "default" && (
            <button
              onClick={(e) => handleDeletePlaylist(e, playlist.id)}
              className={`transition-opacity ${
                hoveredTabId === playlist.id
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
              title="O'chirish"
            >
              <X size={14} className="hover:text-brand" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
