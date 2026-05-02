import { useState, useRef, useEffect, useCallback } from "react";
import { loadPlaylist, savePlaylist } from "../utils/playlistStorage";
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

export default function usePlayer() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);

  const currentSong = songs[currentIndex] || null;
  const currentSrc = currentSong ? normalizeAudioPath(currentSong.path) : "";

  const loadSavedPlaylist = useCallback(async () => {
    try {
      const stored = await loadPlaylist();
      setSongs(uniqueSongs(stored));
      setCurrentIndex(0);
    } catch (error) {
      console.error("Failed to load playlist:", error);
    }
  }, []);

  useEffect(() => {
    loadSavedPlaylist();
  }, [loadSavedPlaylist]);

  useEffect(() => {
    savePlaylist(songs);
  }, [songs]);

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
      setCurrentIndex(index);
      setIsPlaying(true);
    },
    [songs.length],
  );

  const addSongs = useCallback((items) => {
    if (!Array.isArray(items) || items.length === 0) return;

    setSongs((prev) => {
      const existing = new Set(prev.map((song) => song.path));
      const added = items
        .map((song) => ({ title: song.title || getTitleFromPath(song.path), path: song.path }))
        .filter((song) => song.path && !existing.has(song.path));

      if (added.length === 0) return prev;
      if (prev.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(true);
      }
      return [...prev, ...added];
    });
  }, []);

  const removeSong = useCallback((index) => {
    setSongs((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const next = prev.filter((_, idx) => idx !== index);

      setCurrentIndex((oldIndex) => {
        if (next.length === 0) return 0;
        if (index < oldIndex) return oldIndex - 1;
        if (index === oldIndex) return Math.min(oldIndex, next.length - 1);
        return oldIndex;
      });

      return next;
    });
  }, []);

  const clearPlaylist = useCallback(() => {
    setSongs([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  //   const nextTrack = useCallback(() => {
  //     setSongs((prevSongs) => {
  //       if (prevSongs.length === 0) return prevSongs;
  //       setCurrentIndex((current) => {
  //         if (isShuffle && prevSongs.length > 1) {
  //           let nextIndex;
  //           do {
  //             nextIndex = Math.floor(Math.random() * prevSongs.length);
  //           } while (nextIndex === current);
  //           return nextIndex;
  //         }
  //         return (current + 1) % prevSongs.length;
  //       });
  //       return prevSongs;
  //     });
  //     setIsPlaying(true);
  //   }, [isShuffle]);

  const nextTrack = useCallback(() => {
    // songs massivining uzunligini to'g'ridan-to'g'ri ishlata olmaymiz,
    // chunki u dependency bo'lib qoladi. Funksional yangilashdan foydalanamiz:
    setCurrentIndex((current) => {
      if (songs.length <= 1) return current;

      if (isShuffle) {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === current);
        return nextIndex;
      }
      return (current + 1) % songs.length;
    });
    setIsPlaying(true);
  }, [isShuffle, songs.length]); // Faqat ushbu qiymatlar o'zgarganda yangilanadi

  const previousTrack = useCallback(() => {
    setSongs((prevSongs) => {
      if (prevSongs.length === 0) return prevSongs;
      setCurrentIndex((current) => (current - 1 + prevSongs.length) % prevSongs.length);
      return prevSongs;
    });
    setIsPlaying(true);
  }, []);

  const handleAudioError = useCallback(() => {
    if (!currentSong) return;
    console.warn("Invalid audio path, removing track:", currentSong.path);
    setSongs((prevSongs) => prevSongs.filter((_, index) => index !== currentIndex));
    setIsPlaying(false);
  }, [currentIndex, currentSong]);

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

  //   useEffect(() => {
  //     const audio = audioRef.current;
  //     if (!audio) return;

  //     if (!currentSrc) {
  //       audio.pause();
  //       audio.removeAttribute("src");
  //       setDuration(0);
  //       setCurrentTime(0);
  //       return;
  //     }

  //     audio.src = currentSrc;
  //     audio.load();

  //     if (isPlaying) {
  //       audio
  //         .play()
  //         .then(() => setIsPlaying(true))
  //         .catch(() => setIsPlaying(false));
  //     }
  //   }, [currentSrc, isPlaying]);

  // 1. Faqat qo'shiq o'zgarganda (index yoki ro'yxat o'zgarsa) ishlaydi
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentSrc) {
      audio.pause();
      audio.removeAttribute("src");
      setDuration(0);
      setCurrentTime(0);
      return;
    }

    // Qo'shiq o'zgarganda src ni yangilaymiz va yuklaymiz
    audio.src = currentSrc;
    audio.load();

    // Agar play holatida bo'lsak, yangi qo'shiqni boshlaymiz
    if (isPlaying) {
      audio.play().catch(console.error);
    }
  }, [currentSrc]); // Faqat currentSrc o'zgarganda ishlaydi

  // 2. Faqat Play/Pause holati o'zgarganda ishlaydi
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;

    if (isPlaying) {
      // audio.load() chaqirilmaydi, shuning uchun to'xtagan joyidan davom etadi
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]); // Faqat isPlaying o'zgarganda ishlaydi

  return {
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
    play,
    pause,
    stop,
    seek,
    nextTrack,
    previousTrack,
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
