import { useMemo } from "react";
import SongList from "./SongList";
import Controls from "./Controls";
import ProgressBar from "./ProgressBar";
import TitleBar from "../tauri/TitleBar";
import Footer from "../tauri/Footer";

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
  theme,
  toggleTheme,
}) {
  const title = useMemo(
    () => currentSong?.title || "Hech qanday trek tanlanmagan",
    [currentSong]
  );

  return (
    <div className="flex flex-col h-screen w-full text-text-main window overflow-hidden ">
      <TitleBar theme={theme} toggleTheme={toggleTheme} />

      <audio ref={audioRef} hidden />

      <div className="flex flex-col flex-1 w-full p-1 min-h-0 overflow-hidden">
        <h2 className="text-md mb-2 p-2 font-semibold text-brand bg-secondary-bg text-ellipsis whitespace-nowrap overflow-hidden flex-shrink-0">
          {title}
        </h2>

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
          />

          <ProgressBar currentTime={currentTime} duration={duration} onSeek={seek} />

          <div className="w-full flex justify-between text-[10px] mt-1 px-2 text-gray-400 mb-2">
            <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")}</span>
            <span>{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}</span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
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
        </div>
      </div>

      <Footer />
    </div>
  );
}
