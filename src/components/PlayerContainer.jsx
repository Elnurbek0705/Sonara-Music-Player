import { useMemo, useState } from "react";
import SongList from "./SongList";
import Controls from "./Controls";
import ProgressBar from "./ProgressBar";
import TitleBar from "../tauri/TitleBar";
import Footer from "../tauri/Footer";
import YoutubeSearch from "./YoutubeSearch";
import { Search } from "lucide-react";

export default function PlayerContainer({
  audioRef,
  songs,
  currentIndex,
  currentSong,
  currentTime,
  duration,
  isPlaying,
  isRepeat,
  isShuffle,
  addSongs,
  removeSong,
  clearPlaylist,
  selectSong,
  togglePlay,
  playFromBeginning,
  nextTrack,
  previousTrack,
  stop,
  seek,
  setIsRepeat,
  setIsShuffle,
  playingPlaylistId,
  playingTrackPath,
  activePlaylistId,
  playlists,
  selectPlaylist,
  addPlaylist,
  deletePlaylist,
  volume,
  setVolume,
  theme,
  toggleTheme,
  playStreamDirectly,
}) {
  const [activeTab, setActiveTab] = useState("playlist");

  const title = useMemo(() => currentSong?.title || "Hech qanday trek tanlanmagan", [currentSong]);

  function handlePlayUrl(song) {
    playStreamDirectly(song);
  }

  function handleAddToPlaylist(song) {
    addSongs([song]);
  }

  return (
    <div className="flex flex-col h-screen w-full text-text-main window overflow-hidden">
      <TitleBar theme={theme} toggleTheme={toggleTheme} />

      <audio ref={audioRef} hidden />

      <div className="flex flex-col flex-1 w-full p-1 min-h-0 overflow-hidden">
        {/* Trek nomi */}
        <h2
          className="text-sm px-3 py-1.5 font-semibold truncate flex-shrink-0"
          style={{
            background: "var(--bg-surface-dark)",
            color: "var(--accent)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          {title}
        </h2>

        {/* Controls + Progress */}
        <div className="flex-shrink-0">
          <Controls
            togglePlay={togglePlay}
            playFromBeginning={playFromBeginning}
            isPlaying={isPlaying}
            nextSong={nextTrack}
            prevSong={previousTrack}
            stopSong={stop}
            isRepeat={isRepeat}
            setIsRepeat={setIsRepeat}
            isShuffle={isShuffle}
            setIsShuffle={setIsShuffle}
            volume={volume}
            setVolume={setVolume}
          />
          <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />
        </div>
        {/* Asosiy tab qatori: Playlist | Internet */}
        <div
          className="flex px-2 pt-2 pb-1 flex-shrink-0 gap-1"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <button
            onClick={() => setActiveTab("playlist")}
            className="flex-1 py-1 text-xs rounded transition-colors"
            style={{
              background: activeTab === "playlist" ? "var(--accent)" : "var(--bg-surface)",
              color: activeTab === "playlist" ? "var(--bg-primary)" : "var(--text-dim)",
              fontWeight: activeTab === "playlist" ? 600 : 400,
            }}
          >
            Playlist
          </button>
          <button
            onClick={() => setActiveTab("search")}
            className="flex-1 py-1 text-xs rounded transition-colors flex items-center justify-center gap-1"
            style={{
              background: activeTab === "search" ? "var(--accent)" : "var(--bg-surface)",
              color: activeTab === "search" ? "var(--bg-primary)" : "var(--text-dim)",
              fontWeight: activeTab === "search" ? 600 : 400,
            }}
          >
            <Search style={{ width: 12, height: 12 }} /> Internet
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {activeTab === "playlist" ? (
            // SongList ichida o'zi playlist tablarni ko'rsatadi
            <SongList
              songs={songs}
              currentIndex={currentIndex}
              onSongSelect={selectSong}
              removeSong={removeSong}
              clearPlaylist={clearPlaylist}
              addSongs={addSongs}
              playingPlaylistId={playingPlaylistId}
              playingTrackPath={playingTrackPath}
              activePlaylistId={activePlaylistId}
              playlists={playlists}
              selectPlaylist={selectPlaylist}
              addPlaylist={addPlaylist}
              deletePlaylist={deletePlaylist}
            />
          ) : (
            <YoutubeSearch onPlayUrl={handlePlayUrl} onAddToPlaylist={handleAddToPlaylist} />
          )}
        </div>
      </div>

      <Footer
        currentSong={currentSong}
        currentTime={currentTime}
        duration={duration}
        currentIndex={currentIndex}
        totalSongs={songs.length}
      />
    </div>
  );
}
