import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { loadPlaylists, savePlaylists } from "../utils/playlistStorage";
import { convertFileSrc } from "@tauri-apps/api/core";

const normalizeAudioPath = (path) => {
  if (!path) return "";
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

const generatePlaylistId = () => `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function usePlayer() {
  // UI STATE - which playlist is the user viewing?
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylistId, setActivePlaylistId] = useState("default");

  // PLAYBACK STATE - which song is actually playing and from which playlist?
  const [playingPlaylistId, setPlayingPlaylistId] = useState("default");
  const [playingTrackPath, setPlayingTrackPath] = useState(null);

  // Playback controls state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  const isLoadedRef = useRef(false);

  // DERIVED: Songs to DISPLAY (from active playlist)
  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId),
    [playlists, activePlaylistId]
  );
  const songs = useMemo(
    () => activePlaylist?.songs || [],
    [activePlaylist]
  );

  // DERIVED: Current song being PLAYED (from playing playlist, identified by path)
  const playingPlaylist = useMemo(
    () => playlists.find((p) => p.id === playingPlaylistId),
    [playlists, playingPlaylistId]
  );
  const playingPlaylistSongs = useMemo(
    () => playingPlaylist?.songs || [],
    [playingPlaylist]
  );
  const currentSongIndex = playingTrackPath 
    ? playingPlaylistSongs.findIndex((s) => s.path === playingTrackPath)
    : -1;
  const currentSong = playingTrackPath && currentSongIndex >= 0 
    ? playingPlaylistSongs[currentSongIndex] 
    : null;
  const currentSrc = currentSong ? normalizeAudioPath(currentSong.path) : "";

  // Playlists yuklash va saqlash

  useEffect(() => {
    if (!isLoadedRef.current) {
      isLoadedRef.current = true;
      loadPlaylists().then(stored => {
        const cleanedPlaylists = stored.map((p) => ({
          ...p,
          songs: uniqueSongs(p.songs),
        }));
        setPlaylists(cleanedPlaylists);
        setActivePlaylistId("default");
      }).catch(error => {
        console.error("Failed to load playlists:", error);
        setPlaylists([{ id: "default", name: "Default", songs: [] }]);
      });
    }
  }, []);

  // Playlists o'zgarganda saqlash
  useEffect(() => {
    if (playlists.length > 0) {
      savePlaylists(playlists);
    }
  }, [playlists]);

  // Playback state o'zgarganda saqlash
  useEffect(() => {
    if (playingPlaylistId && playingTrackPath) {
      // Save playback state to localStorage for resume on restart
      localStorage.setItem(
        "playbackState",
        JSON.stringify({
          playingPlaylistId,
          playingTrackPath,
          activePlaylistId,
        })
      );
    }
  }, [playingPlaylistId, playingTrackPath, activePlaylistId]);

  // Playback control funksiyalari
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

  // MUHIM: selectSong bu UI view uchun (qaysi playlistda sangi tanlash)
  // Ammo ijro qilish uchun playingPlaylistId va playingTrackPath ni yangilash kerak
  const selectSong = useCallback(
    (index) => {
      if (index < 0 || index >= songs.length) return;
      const song = songs[index];
      
      // Set playback state to play from this song in the active playlist
      setPlayingPlaylistId(activePlaylistId);
      setPlayingTrackPath(song.path);
      setIsPlaying(true);
      setCurrentIndex(index);
    },
    [songs, activePlaylistId],
  );

  // Playlist boshqarish funksiyalari
  const addPlaylist = useCallback((name) => {
    if (!name || typeof name !== "string" || name.trim().length === 0) return;
    
    setPlaylists((prev) => [
      ...prev,
      {
        id: generatePlaylistId(),
        name: name.trim(),
        songs: [],
      },
    ]);
  }, []);

  const deletePlaylist = useCallback((playlistId) => {
    // Default playlistni o'chira olmaymiz
    if (playlistId === "default") return;

    setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));

    // Agar o'chirilgan playlist aktiv bo'lgan bo'lsa, Defaultga o'tish
    if (activePlaylistId === playlistId) {
      setActivePlaylistId("default");
    }

    // Agar o'chirilgan playlist ijro etilayotgan musiqa manbalik bo'lsa, to'xtat
    if (playingPlaylistId === playlistId) {
      pause();
      setPlayingPlaylistId("default");
      setPlayingTrackPath(null);
    }
  }, [activePlaylistId, playingPlaylistId, pause]);

  // MUHIM: selectPlaylist faqat UI VIEW ni o'zgartiradi, ijroni o'zgarttirmaydi!
  const selectPlaylist = useCallback((playlistId) => {
    if (playlists.some((p) => p.id === playlistId)) {
      setActivePlaylistId(playlistId);
      // NOT changing playingPlaylistId or playingTrackPath - playback continues!
    }
  }, [playlists]);

  // Aktiv playlistga qo'shiqlar qo'shish
  const addSongs = useCallback(
    (items) => {
      if (!Array.isArray(items) || items.length === 0 || !activePlaylistId) return;

      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id !== activePlaylistId) return p;

          const existing = new Set(p.songs.map((song) => song.path));
          const added = items
            .map((song) => ({
              title: song.title || getTitleFromPath(song.path),
              path: song.path,
            }))
            .filter((song) => song.path && !existing.has(song.path));

          if (added.length === 0) return p;

          // Agar birinchi qo'shiq bo'lsa va hech qanday musiqa ijro etilmayotgan bo'lsa
          if (p.songs.length === 0 && !playingTrackPath) {
            const firstSong = added[0];
            setPlayingPlaylistId(activePlaylistId);
            setPlayingTrackPath(firstSong.path);
            setIsPlaying(true);
          }

          return {
            ...p,
            songs: [...p.songs, ...added],
          };
        })
      );
    },
    [activePlaylistId, playingTrackPath]
  );

  // Aktiv playlistdan qo'shiq o'chirish
  const removeSong = useCallback(
    (index) => {
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id !== activePlaylistId) return p;

          if (index < 0 || index >= p.songs.length) return p;

          const removedSongPath = p.songs[index].path;
          const next = p.songs.filter((_, idx) => idx !== index);

          // Agar o'chirilgan qo'shiq ayni ijro etilayotgan qo'shiq bo'lsa
          if (playingPlaylistId === activePlaylistId && removedSongPath === playingTrackPath) {
            if (next.length === 0) {
              // Ro'yxat bo'sh qoldi, ijroni to'xtat
              pause();
              setPlayingTrackPath(null);
            } else {
              // Keyingi qo'shiqni ijro et
              setPlayingTrackPath(next[Math.min(index, next.length - 1)].path);
            }
          }

          // Update currentIndex for UI display
          setCurrentIndex((oldIndex) => {
            if (next.length === 0) return 0;
            if (index < oldIndex) return oldIndex - 1;
            if (index === oldIndex) return Math.min(oldIndex, next.length - 1);
            return oldIndex;
          });

          return {
            ...p,
            songs: next,
          };
        })
      );
    },
    [activePlaylistId, playingPlaylistId, playingTrackPath, pause]
  );

  // Aktiv playlistni tozalash
  const clearPlaylist = useCallback(() => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id !== activePlaylistId) return p;
        return {
          ...p,
          songs: [],
        };
      })
    );
    
    // Agar ijro etilayotgan qo'shiq shu playlistdan bo'lsa, to'xtat
    if (playingPlaylistId === activePlaylistId) {
      pause();
      setPlayingTrackPath(null);
    }

    setCurrentIndex(0);
    setCurrentTime(0);
    setDuration(0);
  }, [activePlaylistId, playingPlaylistId, pause]);

  // MUHIM: nextTrack ijro etilayotgan playlist ichidan keyingi qo'shiqni qidiradi!
  const nextTrack = useCallback(() => {
    if (!playingPlaylist || playingPlaylistSongs.length === 0) return;

    // Hozirgi qo'shiq indeksini topish
    const currentIdx = playingPlaylistSongs.findIndex(
      (s) => s.path === playingTrackPath
    );
    
    let nextIdx;
    if (isShuffle) {
      do {
        nextIdx = Math.floor(Math.random() * playingPlaylistSongs.length);
      } while (nextIdx === currentIdx && playingPlaylistSongs.length > 1);
    } else {
      nextIdx = (currentIdx + 1) % playingPlaylistSongs.length;
    }

    setPlayingTrackPath(playingPlaylistSongs[nextIdx].path);
    setIsPlaying(true);
  }, [playingPlaylist, playingPlaylistSongs, playingTrackPath, isShuffle]);

  const previousTrack = useCallback(() => {
    if (!playingPlaylist || playingPlaylistSongs.length === 0) return;

    // Hozirgi qo'shiq indeksini topish
    const currentIdx = playingPlaylistSongs.findIndex(
      (s) => s.path === playingTrackPath
    );
    
    let prevIdx;
    if (isShuffle) {
      do {
        prevIdx = Math.floor(Math.random() * playingPlaylistSongs.length);
      } while (prevIdx === currentIdx && playingPlaylistSongs.length > 1);
    } else {
      prevIdx = (currentIdx - 1 + playingPlaylistSongs.length) % playingPlaylistSongs.length;
    }

    setPlayingTrackPath(playingPlaylistSongs[prevIdx].path);
    setIsPlaying(true);
  }, [playingPlaylist, playingPlaylistSongs, playingTrackPath, isShuffle]);

  const handleAudioError = useCallback(() => {
    if (!currentSong) return;
    console.warn("Invalid audio path, removing track:", currentSong.path);
    removeSong(currentSongIndex);
    setIsPlaying(false);
  }, [currentSong, currentSongIndex, removeSong]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

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

  // Song o'zgarganda audio src ni yangilash
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
  }, [currentSrc, isPlaying]);

  // Play/Pause holatiga javob berish
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  return {
    // Audio ref
    audioRef,

    // Playback state
    currentIndex, // UI view index (which song is highlighted in current tab)
    currentSong, // actual playing song
    currentTime,
    duration,
    isPlaying,
    isRepeat,
    isShuffle,

    // UI state
    songs, // songs from active playlist (for display)
    playlists,
    activePlaylistId,
    playingPlaylistId,
    playingTrackPath,

    // Playback controls
    play,
    pause,
    stop,
    seek,
    selectSong,
    nextTrack,
    previousTrack,

    // Playlist management
    addPlaylist,
    deletePlaylist,
    selectPlaylist,

    // Song management (aktiv playlistga)
    addSongs,
    removeSong,
    clearPlaylist,

    // Toggle controls
    setIsRepeat,
    setIsShuffle,
    togglePlay: () => {
      if (isPlaying) pause();
      else play();
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
