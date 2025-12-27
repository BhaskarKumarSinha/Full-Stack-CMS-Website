import { useState, useEffect } from "react";
import api from "../api/api";

interface UploadedVideo {
  id?: string;
  _id?: string;
  filename?: string;
  fileName?: string;
  url: string;
  size: number;
  mimeType?: string;
}

interface VideoPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function VideoPicker({
  value,
  onChange,
  label = "Video URL",
  placeholder = "https://example.com/video.mp4 or YouTube/Vimeo URL",
}: VideoPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await api.listMedia();
      const mediaList = response.data.media || [];
      // Filter only video files
      const videoList = mediaList.filter(
        (item: UploadedVideo) =>
          item.mimeType?.startsWith("video/") ||
          item.fileName?.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) ||
          item.filename?.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)
      );
      setVideos(videoList);
    } catch (err) {
      console.error("Failed to load videos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPicker && videos.length === 0) {
      fetchVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPicker]);

  const getVideoName = (vid: UploadedVideo): string =>
    vid.filename || vid.fileName || "Unknown";

  const filteredVideos = videos.filter((vid) =>
    getVideoName(vid).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (url: string) => {
    onChange(url);
    setShowPicker(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-black mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border rounded text-black"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 whitespace-nowrap"
        >
          🎬 Browse
        </button>
      </div>

      {/* Video preview - only show for direct video URLs, not YouTube/Vimeo */}
      {value &&
        !value.includes("youtube") &&
        !value.includes("vimeo") &&
        !value.includes("youtu.be") && (
          <div className="mt-2">
            <video
              src={value}
              className="w-48 h-32 object-cover border rounded"
              controls
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = "none";
              }}
            />
          </div>
        )}

      {/* Modal picker */}
      {showPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-bold text-black">
                Select Video from Library
              </h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center text-gray-500">
                  Loading videos...
                </div>
              ) : filteredVideos.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="mb-4">No videos found in your media library.</p>
                  <p className="text-sm">
                    <a
                      href="/admin/media"
                      target="_blank"
                      className="text-red-600 underline"
                    >
                      Upload videos
                    </a>{" "}
                    to get started, or paste a YouTube/Vimeo URL directly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {filteredVideos.map((video) => {
                    const vidId = video.id || video._id || "";
                    const vidName = getVideoName(video);
                    return (
                      <div
                        key={vidId}
                        onClick={() => handleSelect(video.url)}
                        className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition hover:scale-105"
                      >
                        <div className="aspect-video bg-gray-900 overflow-hidden relative">
                          <video
                            src={video.url}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                            onMouseEnter={(e) =>
                              (e.target as HTMLVideoElement).play()
                            }
                            onMouseLeave={(e) => {
                              const vid = e.target as HTMLVideoElement;
                              vid.pause();
                              vid.currentTime = 0;
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                              <span className="text-2xl">▶</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {vidName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(video.size)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  💡 Tip: You can also paste YouTube or Vimeo URLs directly
                </p>
                <a
                  href="/admin/media"
                  target="_blank"
                  className="text-red-600 hover:underline text-sm"
                >
                  Open Media Manager to upload videos
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
