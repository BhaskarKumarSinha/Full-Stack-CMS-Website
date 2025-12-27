import { useEffect, useRef, useState } from "react";

type CarouselConfig = any;

function Stars({ count }: { count: number }) {
  return (
    <div className="text-yellow-400">
      {"★".repeat(Math.max(0, Math.min(5, Math.round(count))))}
    </div>
  );
}

export default function CarouselDisplay({
  config,
}: {
  config: CarouselConfig;
}) {
  const {
    variant: rawVariant,
    items = [],
    autoScroll,
  } = config || { variant: 1, items: [] };

  // Ensure variant is always a number
  const variant = Number(rawVariant) || 1;

  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Reset index if it's out of bounds
  useEffect(() => {
    if (items.length > 0 && index >= items.length) {
      setIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, index]);

  useEffect(() => {
    if (autoScroll && items.length > 0) {
      timerRef.current = window.setInterval(() => {
        if (variant === 4) {
          // For variant 4, move to next page (3 items at a time)
          const itemsPerPage = 3;
          const totalPages = Math.ceil(items.length / itemsPerPage);
          setIndex((i) => {
            const currentPage = Math.floor(i / itemsPerPage);
            const nextPage = (currentPage + 1) % totalPages;
            return nextPage * itemsPerPage;
          });
        } else {
          // For other variants, move to next item
          setIndex((i) => (i + 1) % items.length);
        }
      }, 3500);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
    return;
  }, [autoScroll, items.length, variant]);

  if (!items || items.length === 0)
    return <div className="p-6 text-center text-gray-500">No items</div>;

  if (variant === 2) {
    const it = items[index];
    if (!it)
      return (
        <div className="p-6 text-center text-gray-500">No item available</div>
      );
    const bgImage = it.backgroundImage || it.image || "";
    return (
      <div
        className="relative h-56 rounded overflow-hidden"
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : "none",
          backgroundColor: bgImage ? "transparent" : "#f3f4f6",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="relative z-10 p-4 text-black h-full flex flex-col justify-center items-center">
          <Stars count={it.stars || 5} />
          <p className="mt-3 text-lg font-semibold">
            {it.text || it.title || "No text"}
          </p>
          {it.author && (
            <div className="mt-2 text-sm font-medium">— {it.author}</div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 3) {
    const types = Array.from(
      new Set(items.map((it: any) => it.type || "default"))
    );
    const currentItem = items[index];
    if (!currentItem) {
      return (
        <div className="p-6 text-center text-gray-500">No item available</div>
      );
    }
    const imgSrc = currentItem.image || currentItem.backgroundImage || "";

    // Navigation functions
    const goToPrev = () =>
      setIndex((i) => (i - 1 + items.length) % items.length);
    const goToNext = () => setIndex((i) => (i + 1) % items.length);

    return (
      <div>
        <div className="relative h-56 rounded overflow-hidden mb-2">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt="slide"
              className="w-full h-56 object-cover rounded"
            />
          ) : (
            <div className="w-full h-56 bg-gray-200 rounded flex items-center justify-center text-gray-500">
              No image
            </div>
          )}
          {/* Navigation arrows */}
          {items.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                ‹
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                ›
              </button>
            </>
          )}
          {/* Auto-scroll indicator */}
          {autoScroll && (
            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Auto
            </div>
          )}
        </div>
        {/* Dot navigation */}
        {items.length > 1 && (
          <div className="flex justify-center gap-1 mb-2">
            {items.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? "bg-indigo-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
        {/* Category filter buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          {types.map((t) => (
            <button
              key={String(t)}
              onClick={() => {
                const i = items.findIndex(
                  (it: any) => (it.type || "default") === t
                );
                if (i >= 0) setIndex(i);
              }}
              className={`px-3 py-1 border rounded text-sm font-medium transition-colors ${
                (currentItem.type || "default") === t
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {String(t)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 4) {
    // Advanced carousel: show 3 items at a time with smooth sliding
    if (items.length === 0) {
      return <div className="p-6 text-center text-gray-500">No items</div>;
    }

    // Calculate pagination
    const itemsPerPage = 3;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const currentPage = Math.floor(index / itemsPerPage);

    const goToPrevPage = () => {
      const newPage = (currentPage - 1 + totalPages) % totalPages;
      setIndex(newPage * itemsPerPage);
    };

    const goToNextPage = () => {
      const newPage = (currentPage + 1) % totalPages;
      setIndex(newPage * itemsPerPage);
    };

    return (
      <div className="relative px-12">
        {/* Navigation arrows only */}
        {totalPages > 1 && (
          <>
            <button
              onClick={goToPrevPage}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full flex items-center justify-center transition-all z-10 shadow-lg hover:shadow-xl hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNextPage}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full flex items-center justify-center transition-all z-10 shadow-lg hover:shadow-xl hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Sliding container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentPage * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const pageItems = items.slice(
                pageIdx * itemsPerPage,
                (pageIdx + 1) * itemsPerPage
              );
              return (
                <div
                  key={pageIdx}
                  className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  {pageItems.map((it: any, idx: number) => {
                    const imgSrc = it.image || it.backgroundImage || "";
                    return (
                      <div
                        key={it.id || idx}
                        className="p-3 bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                      >
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={it.title || "item"}
                            className="w-full h-36 object-cover rounded-md mb-2"
                          />
                        ) : (
                          <div className="w-full h-36 bg-gray-200 rounded-md mb-2 flex items-center justify-center text-gray-500">
                            No image
                          </div>
                        )}
                        <h4 className="font-semibold text-black">
                          {it.title || "Untitled"}
                        </h4>
                        <p className="text-sm text-gray-700">
                          {it.description || ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto-scroll indicator only (no dots) */}
        {autoScroll && totalPages > 1 && (
          <div className="flex justify-center mt-3">
            <span className="bg-indigo-100 text-indigo-600 text-xs px-3 py-1 rounded-full font-medium">
              Auto-scroll enabled
            </span>
          </div>
        )}
      </div>
    );
  }

  // Default / variant 1: simple image carousel
  if (items.length === 0) {
    return <div className="p-6 text-center text-gray-500">No items</div>;
  }

  const currentItem = items[index];
  if (!currentItem) {
    return (
      <div className="p-6 text-center text-gray-500">No item available</div>
    );
  }

  const imgSrc = currentItem.image || currentItem.backgroundImage || "";

  return (
    <div className="relative">
      <div className="h-56 rounded overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={currentItem.title || "slide"}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-500">
            No image
          </div>
        )}
      </div>
      {items.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {items.map((it: any, i: number) => (
            <button
              key={it.id || i}
              onClick={() => setIndex(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === index ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
