import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { loadPlaylists, savePlaylists } from "../utils/playlistStorage";
import { convertFileSrc } from "@tauri-apps/api/core";

const normalizeAudioPath = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return convertFileSrc(path);
};

const getTitleFromPath = (path) => path?.split(/[\\/]/).pop() || "Unknown";

const uniqueSongs = (songs) => {
  const seen = new Set();
  return songs
    .filter((song) => song?.path)
    .map((song) => ({
      title: song.title || getTitleFromPath(song.path),
      path: song.path,
    }))
    .filter((song) => {
      if (seen.has(song.path)) return false;
      seen.add(song.path);
      return true;
    });
};

const generatePlaylistId = () =>
  `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function usePlayer() {
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylistId, setActivePlaylistId] = useState("default");

  const [playingPlaylistId, setPlayingPlaylistId] = useState("default");
  const [playingTrackPath, setPlayingTrackPath] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const isLoadedRef = useRef(false);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId),
    [playlists, activePlaylistId],
  );
  const songs = useMemo(() => activePlaylist?.songs || [], [activePlaylist]);

  const playingPlaylist = useMemo(
    () => playlists.find((p) => p.id === playingPlaylistId),
    [playlists, playingPlaylistId],
  );
  const playingPlaylistSongs = useMemo(() => playingPlaylist?.songs || [], [playingPlaylist]);

  const currentSongIndex = playingTrackPath
    ? playingPlaylistSongs.findIndex((s) => s.path === playingTrackPath)
    : -1;
  const currentSong =
    playingTrackPath && currentSongIndex >= 0 ? playingPlaylistSongs[currentSongIndex] : null;
  const currentSrc = currentSong ? normalizeAudioPath(currentSong.path) : "";

  useEffect(() => {
    if (!isLoadedRef.current) {
      isLoadedRef.current = true;
      loadPlaylists()
        .then((stored) => {
          const cleaned = stored.map((p) => ({
            ...p,
            songs: uniqueSongs(p.songs),
          }));
          setPlaylists(cleaned);
          setActivePlaylistId("default");
        })
        .catch(() => {
          setPlaylists([{ id: "default", name: "Default", songs: [] }]);
        });
    }
  }, []);
  useEffect(() => {
    if (playlists.length > 0) {
      savePlaylists(playlists);
    }
  }, [playlists]);

  useEffect(() => {
    if (playingPlaylistId && playingTrackPath) {
      localStorage.setItem(
        "playbackState",
        JSON.stringify({ playingPlaylistId, playingTrackPath, activePlaylistId }),
      );
    }
  }, [playingPlaylistId, playingTrackPath, activePlaylistId]);

  // ─── Playback controls ───────────────────────────────────────────

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentSrc) return;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio play failed:", error);
    }
  }, [currentSrc]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
    setCurrentTime(audio.currentTime);
  }, []);

  const selectSong = useCallback(
    (index) => {
      if (index < 0 || index >= songs.length) return;
      const song = songs[index];
      setPlayingPlaylistId(activePlaylistId);
      setPlayingTrackPath(song.path);
      setIsPlaying(true);
      setCurrentIndex(index);
    },
    [songs, activePlaylistId],
  );

  // ─── Playlist boshqaruv ──────────────────────────────────────────

  const addPlaylist = useCallback((name) => {
    if (!name || typeof name !== "string" || name.trim().length === 0) return;
    setPlaylists((prev) => [...prev, { id: generatePlaylistId(), name: name.trim(), songs: [] }]);
  }, []);

  const deletePlaylist = useCallback(
    (playlistId) => {
      if (playlistId === "default") return;
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      if (activePlaylistId === playlistId) setActivePlaylistId("default");
      if (playingPlaylistId === playlistId) {
        pause();
        setPlayingPlaylistId("default");
        setPlayingTrackPath(null);
      }
    },
    [activePlaylistId, playingPlaylistId, pause],
  );

  const selectPlaylist = useCallback(
    (playlistId) => {
      if (playlists.some((p) => p.id === playlistId)) {
        setActivePlaylistId(playlistId);
      }
    },
    [playlists],
  );

  const addSongs = useCallback(
    (items) => {
      if (!Array.isArray(items) || items.length === 0 || !activePlaylistId) return;
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id !== activePlaylistId) return p;

          const added = items
            .map((s) => ({
              title: s.title || getTitleFromPath(s.path),
              path: s.path,
              isStream: s.isStream || false,
              videoId: s.videoId || null,
              thumbnail: s.thumbnail || null,
            }))
            .filter((s) => {
              if (!s.path) return false;
              return !p.songs.some((existing) =>
                s.videoId ? existing.videoId === s.videoId : existing.path === s.path,
              );
            });

          if (added.length === 0) return p;

          if (p.songs.length === 0 && !playingTrackPath) {
            setPlayingPlaylistId(activePlaylistId);
            setPlayingTrackPath(added[0].path);
            setIsPlaying(true);
          }

          return { ...p, songs: [...p.songs, ...added] };
        }),
      );
    },
    [activePlaylistId, playingTrackPath],
  );

  const removeSong = useCallback(
    (index) => {
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id !== activePlaylistId) return p;
          if (index < 0 || index >= p.songs.length) return p;
          const removedPath = p.songs[index].path;
          const next = p.songs.filter((_, i) => i !== index);
          if (playingPlaylistId === activePlaylistId && removedPath === playingTrackPath) {
            if (next.length === 0) {
              pause();
              setPlayingTrackPath(null);
            } else {
              setPlayingTrackPath(next[Math.min(index, next.length - 1)].path);
            }
          }
          setCurrentIndex((old) => {
            if (next.length === 0) return 0;
            if (index < old) return old - 1;
            if (index === old) return Math.min(old, next.length - 1);
            return old;
          });
          return { ...p, songs: next };
        }),
      );
    },
    [activePlaylistId, playingPlaylistId, playingTrackPath, pause],
  );

  const clearPlaylist = useCallback(() => {
    setPlaylists((prev) => prev.map((p) => (p.id !== activePlaylistId ? p : { ...p, songs: [] })));
    if (playingPlaylistId === activePlaylistId) {
      pause();
      setPlayingTrackPath(null);
    }
    setCurrentIndex(0);
    setCurrentTime(0);
    setDuration(0);
  }, [activePlaylistId, playingPlaylistId, pause]);


  const nextTrack = useCallback(() => {
    if (!playingPlaylist || playingPlaylistSongs.length === 0) return;
    const currentIdx = playingPlaylistSongs.findIndex((s) => s.path === playingTrackPath);
    let nextIdx;
    if (isShuffle) {
      do {
        nextIdx = Math.floor(Math.random() * playingPlaylistSongs.length);
      } while (nextIdx === currentIdx && playingPlaylistSongs.length > 1);
    } else {
      nextIdx = (currentIdx + 1) % playingPlaylistSongs.length;
    }
    setPlayingTrackPath(playingPlaylistSongs[nextIdx].path);
    setCurrentIndex(nextIdx); 
    setIsPlaying(true);
  }, [playingPlaylist, playingPlaylistSongs, playingTrackPath, isShuffle]);

  const previousTrack = useCallback(() => {
    if (!playingPlaylist || playingPlaylistSongs.length === 0) return;
    const currentIdx = playingPlaylistSongs.findIndex((s) => s.path === playingTrackPath);
    let prevIdx;
    if (isShuffle) {
      do {
        prevIdx = Math.floor(Math.random() * playingPlaylistSongs.length);
      } while (prevIdx === currentIdx && playingPlaylistSongs.length > 1);
    } else {
      prevIdx = (currentIdx - 1 + playingPlaylistSongs.length) % playingPlaylistSongs.length;
    }
    setPlayingTrackPath(playingPlaylistSongs[prevIdx].path);
    setCurrentIndex(prevIdx);
    setIsPlaying(true);
  }, [playingPlaylist, playingPlaylistSongs, playingTrackPath, isShuffle]);

  const handleAudioError = useCallback(() => {
    if (!currentSong) return;
    console.warn("Invalid audio path, removing:", currentSong.path);
    removeSong(currentSongIndex);
    setIsPlaying(false);
  }, [currentSong, currentSongIndex, removeSong]);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
        return;
      }
      nextTrack();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleAudioError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleAudioError);
    };
  }, [isRepeat, nextTrack, handleAudioError]);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSrc) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }

    audio.src = currentSrc;
    audio.load();

    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentSrc]);


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]); // ← currentSrc YO'Q

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (!currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: "Sonara Music",
      album: "",
    });

    navigator.mediaSession.setActionHandler("play", () => {
      play();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      pause();
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      previousTrack();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      nextTrack();
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      stop();
    });
  }, [currentSong, play, pause, previousTrack, nextTrack, stop]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  // ─── Return ──────────────────────────────────────────────────────

  return {
    audioRef,
    currentIndex,
    currentSong,
    currentTime,
    duration,
    isPlaying,
    isRepeat,
    isShuffle,
    songs,
    playlists,
    activePlaylistId,
    playingPlaylistId,
    playingTrackPath,
    play,
    pause,
    stop,
    seek,
    selectSong,
    nextTrack,
    previousTrack,
    addPlaylist,
    deletePlaylist,
    selectPlaylist,
    addSongs,
    removeSong,
    clearPlaylist,
    setIsRepeat,
    setIsShuffle,
    togglePlay: () => {
      if (isPlaying) pause();
      else play();
    },

    playStreamDirectly: (song) => {
      setPlayingPlaylistId(activePlaylistId);
      setPlayingTrackPath(song.path);
      setIsPlaying(true);

      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id !== activePlaylistId) return p;

          const exists = p.songs.some(
            (s) =>
              song.videoId
                ? s.videoId === song.videoId 
                : s.path === song.path, 
          );

          if (exists) {
            return {
              ...p,
              songs: p.songs.map((s) =>
                s.videoId === song.videoId
                  ? { ...s, path: song.path } 
                  : s,
              ),
            };
          }

          return { ...p, songs: [...p.songs, song] };
        }),
      );
    },
    playFromBeginning: () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      setCurrentTime(0);
      play();
    },
  };
}
