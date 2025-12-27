import { useState, useEffect } from "react";
import api from "../api/api";

interface UploadedImage {
  id?: string;
  _id?: string;
  filename?: string;
  fileName?: string;
  url: string;
  size: number;
}

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImagePicker({
  value,
  onChange,
  label = "Image URL",
  placeholder = "https://example.com/image.jpg",
}: ImagePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await api.listMedia();
      const mediaList = response.data.media || [];
      setImages(mediaList);
    } catch (err) {
      console.error("Failed to load images", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPicker && images.length === 0) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPicker]);

  const getImageName = (img: UploadedImage): string =>
    img.filename || img.fileName || "Unknown";

  const filteredImages = images.filter((img) =>
    getImageName(img).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (url: string) => {
    onChange(url);
    setShowPicker(false);
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 whitespace-nowrap"
        >
          📁 Browse
        </button>
      </div>

      {/* Image preview */}
      {value && (
        <div className="mt-2">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-32 object-cover border rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
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
                Select Image from Library
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
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center text-gray-500">
                  Loading images...
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No images found.{" "}
                  <a
                    href="/admin/media"
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Upload images
                  </a>{" "}
                  to get started.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredImages.map((image) => {
                    const imgId = image.id || image._id || "";
                    const imgName = getImageName(image);
                    return (
                      <div
                        key={imgId}
                        onClick={() => handleSelect(image.url)}
                        className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition hover:scale-105"
                      >
                        <div className="aspect-square bg-gray-200 overflow-hidden">
                          <img
                            src={image.url}
                            alt={imgName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-xs font-semibold text-gray-700 truncate">
                            {imgName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-gray-50 text-center">
              <a
                href="/admin/media"
                target="_blank"
                className="text-blue-600 hover:underline text-sm"
              >
                Open Image Manager to upload new images
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
