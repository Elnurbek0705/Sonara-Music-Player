import { readTextFile, writeTextFile, exists, BaseDirectory } from "@tauri-apps/plugin-fs";

const FILE_NAME = "playlist.json";
const STORAGE_DIRS = [
  BaseDirectory.AppLocalData,
  BaseDirectory.AppConfig,
  BaseDirectory.AppData,
];

const readFromDirectory = async (baseDir) => {
  const fileExists = await exists(FILE_NAME, { baseDir });
  if (!fileExists) return null;

  const data = await readTextFile(FILE_NAME, { baseDir });
  return JSON.parse(data);
};

const writeToDirectory = async (songs, baseDir) => {
  await writeTextFile(FILE_NAME, JSON.stringify(songs, null, 2), {
    baseDir,
  });
};

const findReadablePlaylist = async () => {
  for (const baseDir of STORAGE_DIRS) {
    try {
      const playlist = await readFromDirectory(baseDir);
      if (playlist && Array.isArray(playlist)) return playlist;
    } catch {
      // Ignore and continue to next safe directory
    }
  }
  return [];
};

// Load
export const loadPlaylist = async () => {
  try {
    return await findReadablePlaylist();
  } catch (err) {
    console.error("Load error:", err);
    return [];
  }
};

// Save
export const savePlaylist = async (songs) => {
  try {
    await writeToDirectory(songs, BaseDirectory.AppLocalData);
  } catch (err) {
    console.error("Save error:", err);
  }
};