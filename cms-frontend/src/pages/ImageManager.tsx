import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../api/api";

interface UploadedMedia {
  id?: string;
  _id?: string;
  filename?: string;
  fileName?: string;
  url: string;
  uploadedAt?: string;
  createdAt?: string;
  size: number;
  mimeType?: string;
}

type MediaFilter = "all" | "images" | "videos";

export default function ImageManager() {
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<MediaFilter>("all");

  // Fetch media on component mount
  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.listMedia();
      const mediaList = response.data.media || [];
      setMedia(mediaList);
    } catch (err) {
      setError("Failed to load media");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const files = input?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.uploadMedia(formData);

      // Add new media to the list
      const newMedia = response.data.media || [];
      setMedia((prev) => [...newMedia, ...prev]);

      // Reset input (capture before await to avoid null currentTarget)
      if (input) input.value = "";
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to upload file");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      await api.deleteMedia(mediaId);
      setMedia((prev) =>
        prev.filter((item) => (item.id || item._id) !== mediaId)
      );
    } catch (err) {
      setError("Failed to delete file");
      console.error(err);
    }
  };

  const copyToClipboard = (url: string, mediaId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(mediaId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMediaId = useCallback(
    (item: UploadedMedia): string => item.id || item._id || "",
    []
  );

  const getMediaName = useCallback(
    (item: UploadedMedia): string =>
      item.filename || item.fileName || "Unknown",
    []
  );

  const isVideo = useCallback((item: UploadedMedia): boolean => {
    if (item.mimeType?.startsWith("video/")) return true;
    const name = item.filename || item.fileName || "";
    return /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(name);
  }, []);

  const isImage = useCallback((item: UploadedMedia): boolean => {
    if (item.mimeType?.startsWith("image/")) return true;
    const name = item.filename || item.fileName || "";
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name);
  }, []);

  const filteredMedia = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return media.filter((item) => {
      const matchesSearch = getMediaName(item).toLowerCase().includes(q);
      if (!matchesSearch) return false;

      if (filter === "images") return isImage(item);
      if (filter === "videos") return isVideo(item);
      return true;
    });
  }, [media, searchQuery, filter, getMediaName, isImage, isVideo]);

  const imageCount = useMemo(
    () => media.filter(isImage).length,
    [media, isImage]
  );
  const videoCount = useMemo(
    () => media.filter(isVideo).length,
    [media, isVideo]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-black">Media Manager</h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload and manage images and videos for your pages
        </p>
      </header>

      {/* Upload Section */}
      <div className="mb-6 p-6 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
        <label className="block mb-2 text-sm font-semibold text-black">
          Upload Media
        </label>
        <div className="relative">
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="block text-center cursor-pointer py-4 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-semibold transition"
          >
            {uploading ? "Uploading..." : "Choose Files or Drag & Drop"}
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Images: JPG, PNG, GIF, WebP • Videos: MP4, WebM, OGG, MOV • Max file
          size: 50MB
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({media.length})
        </button>
        <button
          onClick={() => setFilter("images")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "images"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Images ({imageCount})
        </button>
        <button
          onClick={() => setFilter("videos")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === "videos"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Videos ({videoCount})
        </button>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Media Grid */}
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">
          {filteredMedia.length}{" "}
          {filter === "all" ? "File" : filter === "images" ? "Image" : "Video"}
          {filteredMedia.length !== 1 ? "s" : ""}
        </h2>

        {loading ? (
          <div className="text-center text-gray-500">Loading media...</div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No {filter === "all" ? "files" : filter} found. Upload some to get
            started!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMedia.map((item) => {
              const itemId = getMediaId(item);
              const itemName = getMediaName(item);
              const itemIsVideo = isVideo(item);
              return (
                <div
                  key={itemId}
                  className="border rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition"
                >
                  {/* Media Thumbnail */}
                  <div className="aspect-square bg-gray-200 overflow-hidden relative">
                    {itemIsVideo ? (
                      <>
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                            e.currentTarget.currentTime = 0;
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                          VIDEO
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt={itemName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23999'%3EBroken%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    )}
                  </div>

                  {/* Media Info */}
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-700 truncate mb-1">
                      {itemName}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {item.size >= 1024 * 1024
                        ? `${(item.size / (1024 * 1024)).toFixed(1)} MB`
                        : `${(item.size / 1024).toFixed(1)} KB`}
                    </p>

                    {/* Copy URL Button */}
                    <button
                      onClick={() => copyToClipboard(item.url, itemId)}
                      className={`w-full py-2 px-3 text-xs font-semibold rounded mb-2 transition ${
                        copiedId === itemId
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {copiedId === itemId ? "✓ Copied!" : "Copy URL"}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteMedia(itemId)}
                      className="w-full py-2 px-3 text-xs font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
