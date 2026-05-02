import { readTextFile, writeTextFile, exists, BaseDirectory } from "@tauri-apps/plugin-fs";

const FILE_NAME = "playlists.json";
const STORAGE_DIRS = [
  BaseDirectory.AppLocalData,
  BaseDirectory.AppConfig,
  BaseDirectory.AppData,
];

// Default playlist tuzilmasi
const createDefaultPlaylist = () => ({
  id: "default",
  name: "Default",
  songs: [],
});

const readFromDirectory = async (baseDir) => {
  const fileExists = await exists(FILE_NAME, { baseDir });
  if (!fileExists) return null;

  const data = await readTextFile(FILE_NAME, { baseDir });
  return JSON.parse(data);
};

const writeToDirectory = async (playlists, baseDir) => {
  await writeTextFile(FILE_NAME, JSON.stringify(playlists, null, 2), {
    baseDir,
  });
};

const findReadablePlaylists = async () => {
  for (const baseDir of STORAGE_DIRS) {
    try {
      const playlists = await readFromDirectory(baseDir);
      if (playlists && Array.isArray(playlists) && playlists.length > 0) {
        return playlists;
      }
    } catch {
      // Ignore and continue to next safe directory
    }
  }
  return [createDefaultPlaylist()];
};

// Load playlists, garantiya bilan "Default" playlist mavjud
export const loadPlaylists = async () => {
  try {
    const playlists = await findReadablePlaylists();
    // "Default" playlist mavjud emasligini tekshirish
    const hasDefault = playlists.some((p) => p.id === "default");
    if (!hasDefault) {
      playlists.unshift(createDefaultPlaylist());
    }
    return playlists;
  } catch (err) {
    console.error("Load error:", err);
    return [createDefaultPlaylist()];
  }
};

// Save all playlists
export const savePlaylists = async (playlists) => {
  try {
    // "Default" playlist mavjud emasligini tekshirish
    const hasDefault = playlists.some((p) => p.id === "default");
    if (!hasDefault) {
      playlists.unshift(createDefaultPlaylist());
    }
    await writeToDirectory(playlists, BaseDirectory.AppLocalData);
  } catch (err) {
    console.error("Save error:", err);
  }
};

// Backward compatibility: konvertir eski playlist formatidan yangi formatga
export const migrateOldPlaylist = async () => {
  const STORAGE_DIRS_OLD = [
    BaseDirectory.AppLocalData,
    BaseDirectory.AppConfig,
    BaseDirectory.AppData,
  ];

  for (const baseDir of STORAGE_DIRS_OLD) {
    try {
      const fileExists = await exists("playlist.json", { baseDir });
      if (fileExists) {
        const data = await readTextFile("playlist.json", { baseDir });
        const oldSongs = JSON.parse(data);
        if (Array.isArray(oldSongs)) {
          const newPlaylists = [
            {
              id: "default",
              name: "Default",
              songs: oldSongs,
            },
          ];
          await writeToDirectory(newPlaylists, baseDir);
          return newPlaylists;
        }
      }
    } catch {
      // Continue to next directory
    }
  }
  return null;
};