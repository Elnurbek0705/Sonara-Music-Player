import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Search, Play, Plus, Loader, Clock, X } from "lucide-react";

const formatDuration = (seconds) => {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function YoutubeSearch({ onPlayUrl, onAddToPlaylist }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null); // audio URL yuklanayotgan trek
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await invoke("search_youtube", { query: query.trim() });
      setResults(data);
    } catch (err) {
      setError("Qidiruv amalga oshmadi: " + err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePlay(result) {
    setLoadingId(result.id);
    try {
      const info = await invoke("get_audio_url", { videoId: result.id });
      onPlayUrl({
        title: info.title,
        path: info.url,         // URL mahalliy path o'rnida
        thumbnail: info.thumbnail,
        duration: info.duration,
        isStream: true,
        videoId: result.id,
      });
    } catch (err) {
      setError("Audio URL olishda xatolik: " + err);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleAdd(result) {
    setLoadingId(result.id + "_add");
    try {
      const info = await invoke("get_audio_url", { videoId: result.id });
      onAddToPlaylist({
        title: info.title,
        path: info.url,
        thumbnail: info.thumbnail,
        duration: info.duration,
        isStream: true,
        videoId: result.id,
      });
    } catch (err) {
      setError("Qo'shishda xatolik: " + err);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ color: "var(--text-main)" }}>

      {/* Qidiruv input */}
      <form onSubmit={handleSearch} className="flex gap-2 p-2">
        <div
          className="flex items-center flex-1 gap-2 px-3 py-1.5 rounded"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
          }}
        >
          <Search size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Musiqani qidiring..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "var(--text-main)" }}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setError(null); }}
              style={{ color: "var(--text-muted)" }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 rounded text-sm font-medium transition-opacity"
          style={{
            background: "var(--accent)",
            color: "var(--bg-primary)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? <Loader size={14} className="animate-spin" /> : "Qidir"}
        </button>
      </form>

      {/* Xato */}
      {error && (
        <div
          className="mx-2 mb-2 px-3 py-2 rounded text-xs"
          style={{
            background: "rgba(255,80,80,0.1)",
            border: "1px solid rgba(255,80,80,0.3)",
            color: "#ff6060",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8 gap-2"
          style={{ color: "var(--text-muted)" }}>
          <Loader size={16} className="animate-spin" />
          <span className="text-sm">Qidirilmoqda...</span>
        </div>
      )}

      {/* Natijalar */}
      <ul className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-1">
        {results.map((result) => {
          const isLoadingThis =
            loadingId === result.id || loadingId === result.id + "_add";

          return (
            <li
              key={result.id}
              className="flex items-center gap-2 px-3 py-2 rounded group transition-colors"
              style={{ background: "var(--bg-surface)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-surface-dark)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--bg-surface)")
              }
            >
              {/* Thumbnail */}
              {result.thumbnail ? (
                <img
                  src={result.thumbnail}
                  alt=""
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div
                  className="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center"
                  style={{ background: "var(--bg-primary)" }}
                >
                  <Play size={14} style={{ color: "var(--text-muted)" }} />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate font-medium"
                  style={{ color: "var(--text-main)" }}>
                  {result.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] truncate"
                    style={{ color: "var(--text-muted)" }}>
                    {result.channel}
                  </span>
                  {result.duration > 0 && (
                    <span
                      className="text-[10px] flex items-center gap-0.5 flex-shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <Clock size={9} />
                      {formatDuration(result.duration)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tugmalar */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isLoadingThis ? (
                  <Loader size={14} className="animate-spin"
                    style={{ color: "var(--accent)" }} />
                ) : (
                  <>
                    {/* Ijro et */}
                    <button
                      onClick={() => handlePlay(result)}
                      title="Ijro etish"
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                      style={{
                        background: "var(--accent)",
                        color: "var(--bg-primary)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      <Play size={12} fill="currentColor" />
                    </button>

                    {/* Playlist ga qo'shish */}
                    <button
                      onClick={() => handleAdd(result)}
                      title="Playlist ga qo'shish"
                      className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                      style={{ color: "var(--text-dim)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--accent)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-dim)")
                      }
                    >
                      <Plus size={14} />
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}

        {/* Bo'sh holat */}
        {!loading && results.length === 0 && query && (
          <li className="text-center py-8 text-sm"
            style={{ color: "var(--text-muted)" }}>
            Hech narsa topilmadi
          </li>
        )}

        {!loading && results.length === 0 && !query && (
          <li className="text-center py-8 text-sm"
            style={{ color: "var(--text-muted)" }}>
            Musiqa nomini kiriting
          </li>
        )}
      </ul>
    </div>
  );
}