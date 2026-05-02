import { useEffect, useRef, useState } from "react";
import { Plus, Folder, FileMusic } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { readDir } from "@tauri-apps/plugin-fs";

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
    if (AUDIO_EXT.includes(ext)) {
      files.push({ title: entry.name, path: itemPath });
    }
  }

  return files;
};

export default function FileUploader({ addSongs }) {
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Agar menu ochiq bo'lsa va click menuRef ichida bo'lmasa yopamiz
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };

    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

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
    } catch (error) {
      console.error("File selection failed:", error);
    } finally {
      setOpenMenu(false);
    }
  };

  const handleFolder = async () => {
    try {
      const folder = await open({
        directory: true,
        multiple: false,
      });

      if (!folder) return;
      const audioFiles = await getAudioFiles(folder);
      addSongs(audioFiles);
    } catch (error) {
      console.error("Folder selection failed:", error);
    } finally {
      setOpenMenu(false);
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}> {/* Ref shu yerga beriladi */}
      <button
        onClick={() => setOpenMenu((open) => !open)}
        className="p-2 rounded hover:bg-[#333]"
      >
        <Plus />
      </button>

      {openMenu && (
        <div className="absolute left-0 mt-1 w-44 bg-[#262626] border-2 border-[#cd6d0c] rounded shadow-lg z-50">
          <button
            onClick={handleFiles}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#333] text-white text-sm"
          >
            <FileMusic size={16} />
            Add Files
          </button>

          <button
            onClick={handleFolder}
            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#333] text-white text-sm"
          >
            <Folder size={16} />
            Add Folder
          </button>
        </div>
      )}
    </div>
  );
}
