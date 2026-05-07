import { X, Plus, Folder, FileMusic } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";
import PlaylistTabs from "./PlaylistTabs";

const AUDIO_EXT = ["mp3", "wav", "flac", "ogg", "m4a"];
const getTitleFromPath = (path) => path?.split(/[/\\]/).pop() || "Unknown";

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
  songs, currentIndex, onSongSelect, removeSong, addSongs,
  playingPlaylistId, playingTrackPath, activePlaylistId,
  playlists, selectPlaylist, addPlaylist, deletePlaylist,
}) {
  const [openMenu, setOpenMenu] = useState(false);
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    if (openMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

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
      const selected = await open({ multiple: true, directory: false, filters: [{ name: "Audio", extensions: AUDIO_EXT }] });
      if (!selected) return;
      const filePaths = Array.isArray(selected) ? selected : [selected];
      addSongs(filePaths.map((path) => ({ title: getTitleFromPath(path), path })));
    } catch (err) { console.error(err); }
    finally { setOpenMenu(false); }
  };

  const handleFolder = async () => {
    try {
      const folder = await open({ directory: true, multiple: false });
      if (!folder) return;
      addSongs(await getAudioFiles(folder));
    } catch (err) { console.error(err); }
    finally { setOpenMenu(false); }
  };

  const isPlayingFromThisPlaylist = playingPlaylistId === activePlaylistId;
  const playingIndexInThisPlaylist = isPlayingFromThisPlaylist
    ? songs.findIndex((s) => s.path === playingTrackPath) : -1;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-1 py-1 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-color)" }}
      >
        {/* Chap: PlaylistTabs */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
          <PlaylistTabs
            playlists={playlists}
            activePlaylistId={activePlaylistId}
            onSelectPlaylist={selectPlaylist}
            onDeletePlaylist={deletePlaylist}
          />

          {/* Yangi playlist input */}
          {isAddingPlaylist && (
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
                className="bg-transparent text-xs outline-none w-24"
                style={{ color: "var(--text-main)" }}
                placeholder="Playlist nomi..."
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>↵</span>
            </div>
          )}
        </div>

        {/* O'ng: Plus button */}
        <div className="relative flex-shrink-0 ml-1" ref={menuRef}>
          <button
            onClick={() => setOpenMenu((v) => !v)}
            className="flex items-center justify-center w-6 h-6 rounded transition-colors"
            style={{ color: "var(--text-dim)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--bg-surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "transparent"; }}
            title="Qo'shish"
          >
            <Plus size={15} />
          </button>

          {openMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-44 rounded shadow-lg z-50 overflow-hidden"
              style={{ background: "var(--bg-surface-dark)", border: "1px solid var(--border-color)" }}
            >
              {[
                { label: "Yangi playlist", icon: <Plus size={14} />, action: () => { setIsAddingPlaylist(true); setOpenMenu(false); } },
                { label: "Fayllar qo'shish", icon: <FileMusic size={14} />, action: handleFiles },
                { label: "Papka qo'shish", icon: <Folder size={14} />, action: handleFolder },
              ].map(({ label, icon, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors"
                  style={{ color: "var(--text-main)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "var(--accent)" }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Qo'shiqlar ro'yxati */}
      <ul className="flex-1 overflow-y-auto mt-1 pr-1">
        {songs.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--text-dim)" }}>
            Playlist bo'sh
          </li>
        ) : (
          songs.map((song, index) => {
            const isPlayingNow = isPlayingFromThisPlaylist && index === playingIndexInThisPlaylist;
            const isHighlighted = index === currentIndex;
            return (
              <li
                key={song.path || index}
                onClick={() => onSongSelect(index)}
                className="flex justify-between items-center px-3 py-2.5 cursor-pointer w-full mb-0.5 transition-colors rounded"
                style={{
                  background: isPlayingNow ? "var(--accent)" : isHighlighted ? "var(--accent-strong)" : "var(--bg-surface)",
                  color: isPlayingNow ? "var(--bg-primary)" : "var(--text-main)",
                }}
                onMouseEnter={(e) => { if (!isPlayingNow && !isHighlighted) e.currentTarget.style.background = "var(--bg-surface-dark)"; }}
                onMouseLeave={(e) => { if (!isPlayingNow && !isHighlighted) e.currentTarget.style.background = "var(--bg-surface)"; }}
              >
                <span className="truncate pr-3 text-sm">{index + 1}. {song.title}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeSong(index); }}
                  className="p-1 rounded flex-shrink-0"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <X size={13} />
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}