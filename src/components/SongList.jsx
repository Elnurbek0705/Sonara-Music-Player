import { X, Plus, Folder, FilePlus2, Search, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";
import PlaylistTabs from "./PlaylistTabs";

const AUDIO_EXT = ["mp3", "wav", "flac", "ogg", "m4a"];
const getTitleFromPath = (path) => path?.split(/[/\\]/).pop() || "Unknown";
const isYouTube = (song) =>
  song.isStream ||
  song.path?.startsWith("youtube://") ||
  song.path?.startsWith("http");

const getFileType = (song) => {
  if (isYouTube(song)) return "YouTube";
  return song.path?.split(".").pop()?.toUpperCase() || "Audio";
};

const getAudioFiles = async (dirPath) => {
  const entries = await readDir(dirPath);
  let files = [];
  for (const entry of entries) {
    const itemPath = `${dirPath}\\${entry.name}`;
    if (entry.isDirectory) {
      files = files.concat(await getAudioFiles(itemPath));
      continue;
    }
    const ext = entry.name.split(".").pop()?.toLowerCase();
    if (AUDIO_EXT.includes(ext)) files.push({ title: entry.name, path: itemPath });
  }
  return files;
};

export default function SongList({
  songs, currentIndex, onSongSelect, removeSong, clearPlaylist, addSongs,
  playingPlaylistId, playingTrackPath, activePlaylistId,
  playlists, selectPlaylist, addPlaylist, deletePlaylist,
}) {
  const [filterText, setFilterText] = useState("");
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAddingPlaylist && inputRef.current) inputRef.current.focus();
  }, [isAddingPlaylist]);

  const handleAddPlaylist = () => {
    if (newPlaylistName.trim()) {
      addPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
      setIsAddingPlaylist(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAddPlaylist();
    else if (e.key === "Escape") { setIsAddingPlaylist(false); setNewPlaylistName(""); }
  };

  const handleFiles = async () => {
    try {
      const selected = await open({
        multiple: true,
        directory: false,
        filters: [{ name: "Audio", extensions: AUDIO_EXT }],
      });
      if (!selected) return;
      const filePaths = Array.isArray(selected) ? selected : [selected];
      addSongs(filePaths.map((path) => ({ title: getTitleFromPath(path), path })));
    } catch (err) { console.error(err); }
  };

  const handleFolder = async () => {
    try {
      const folder = await open({ directory: true, multiple: false });
      if (!folder) return;
      addSongs(await getAudioFiles(folder));
    } catch (err) { console.error(err); }
  };

  const isPlayingFromThisPlaylist = playingPlaylistId === activePlaylistId;

  const filteredSongs = songs
    .map((s, i) => ({ ...s, _origIdx: i }))
    .filter((s) => !filterText.trim() || s.title.toLowerCase().includes(filterText.toLowerCase()));

  const tbBtn = "p-1.5 rounded transition-colors flex-shrink-0";
  const tbColor = "var(--text-dim)";
  const tbHover = (e) => (e.currentTarget.style.color = "var(--accent)");
  const tbLeave = (e) => (e.currentTarget.style.color = tbColor);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Playlist tabs row */}
      <div
        className="flex items-center px-1 py-1 gap-1 overflow-x-auto flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        <PlaylistTabs
          playlists={playlists}
          activePlaylistId={activePlaylistId}
          onSelectPlaylist={selectPlaylist}
          onDeletePlaylist={deletePlaylist}
        />

        {isAddingPlaylist ? (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded flex-shrink-0"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--accent)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onBlur={() => { if (newPlaylistName.trim()) handleAddPlaylist(); else setIsAddingPlaylist(false); }}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-xs outline-none w-20"
              style={{ color: "var(--text-main)" }}
              placeholder="Playlist..."
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>↵</span>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingPlaylist(true)}
            className="p-1 rounded flex-shrink-0 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            title="Yangi playlist"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Song list */}
      <ul className="flex-1 overflow-y-auto py-0.5">
        {filteredSongs.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-dim)" }}>
            {filterText ? "Hech narsa topilmadi" : "Playlist bo'sh"}
          </li>
        ) : (
          filteredSongs.map((song) => {
            const isPlayingNow = isPlayingFromThisPlaylist && song.path === playingTrackPath;
            const isSelected = !isPlayingNow && song._origIdx === currentIndex;
            return (
              <li
                key={song.path || song._origIdx}
                onClick={() => onSongSelect(song._origIdx)}
                className="flex items-center px-2 py-1 cursor-pointer rounded mx-1 mb-0.5 group"
                style={{
                  background: isPlayingNow
                    ? "var(--accent)"
                    : isSelected
                    ? "var(--bg-surface-dark)"
                    : "transparent",
                  color: isPlayingNow ? "var(--bg-primary)" : "var(--text-main)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!isPlayingNow)
                    e.currentTarget.style.background = "var(--bg-surface)";
                }}
                onMouseLeave={(e) => {
                  if (!isPlayingNow)
                    e.currentTarget.style.background = isSelected
                      ? "var(--bg-surface-dark)"
                      : "transparent";
                }}
              >
                <div className="flex-1 min-w-0">
                  {/* Line 1: index + title */}
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-[10px] tabular-nums flex-shrink-0"
                      style={{
                        color: isPlayingNow ? "rgba(0,0,0,0.5)" : "var(--text-muted)",
                        minWidth: 18,
                      }}
                    >
                      {song._origIdx + 1}.
                    </span>
                    <span className="text-sm truncate">{song.title}</span>
                  </div>
                  {/* Line 2: format info */}
                  <div
                    className="text-[10px] truncate"
                    style={{
                      color: isPlayingNow ? "rgba(0,0,0,0.45)" : "var(--text-muted)",
                      paddingLeft: 18,
                    }}
                  >
                    {getFileType(song)}
                    {!isYouTube(song) && song.path && (
                      <> :: {song.path.split(/[/\\]/).slice(-2, -1)[0] || ""}</>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeSong(song._origIdx); }}
                  className="p-1 rounded flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: isPlayingNow ? "rgba(0,0,0,0.5)" : "var(--text-muted)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = isPlayingNow ? "black" : "var(--accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = isPlayingNow ? "rgba(0,0,0,0.5)" : "var(--text-muted)")
                  }
                >
                  <X size={12} />
                </button>
              </li>
            );
          })
        )}
      </ul>

      {/* Bottom toolbar - AIMP style */}
      <div
        className="flex items-center gap-1 px-2 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border-color)", height: 32 }}
      >
        {/* Filter input */}
        <div
          className="flex items-center flex-1 gap-1 rounded px-2"
          style={{ background: "var(--bg-surface)", height: 22, minWidth: 0 }}
        >
          <Search size={11} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Qidirish..."
            className="flex-1 bg-transparent text-xs outline-none min-w-0"
            style={{ color: "var(--text-main)" }}
          />
          {filterText && (
            <button onClick={() => setFilterText("")} style={{ color: "var(--text-muted)" }}>
              <X size={10} />
            </button>
          )}
        </div>

        {/* Song count */}
        <span className="text-[10px] tabular-nums flex-shrink-0" style={{ color: "var(--text-muted)" }}>
          {songs.length}
        </span>

        {/* File operations */}
        <button
          className={tbBtn}
          style={{ color: tbColor }}
          onClick={handleFiles}
          title="Fayllar qo'shish"
          onMouseEnter={tbHover}
          onMouseLeave={tbLeave}
        >
          <FilePlus2 size={14} />
        </button>
        <button
          className={tbBtn}
          style={{ color: tbColor }}
          onClick={handleFolder}
          title="Papka qo'shish"
          onMouseEnter={tbHover}
          onMouseLeave={tbLeave}
        >
          <Folder size={14} />
        </button>
        <button
          className={tbBtn}
          style={{ color: tbColor }}
          onClick={clearPlaylist}
          title="Barchasini tozalash"
          onMouseEnter={tbHover}
          onMouseLeave={tbLeave}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
