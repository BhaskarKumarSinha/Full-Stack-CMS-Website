import { useEffect, useState, useRef } from "react";
import CarouselDisplay from "./CarouselDisplay";
import ImagePicker from "../ImagePicker";

type Variant = 1 | 2 | 3 | 4;

type BaseItem = { id: string };
type SimpleItem = BaseItem & { image: string; title?: string };
type ReviewItem = BaseItem & {
  backgroundImage: string;
  stars: number;
  text: string;
  author?: string;
};
type TypedImageItem = BaseItem & { image: string; type: string };
type BestItem = BaseItem & {
  image: string;
  title: string;
  description?: string;
};

type CarouselConfig = {
  id: string;
  name: string;
  variant: Variant;
  autoScroll?: boolean;
  items: Array<SimpleItem | ReviewItem | TypedImageItem | BestItem>;
};

const STORAGE_KEY = "cms_carousel_config";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

interface CarouselManagerProps {
  initialConfig?: Record<string, any>;
  onChange?: (config: CarouselConfig) => void;
}

export default function CarouselManager({
  initialConfig,
  onChange,
}: CarouselManagerProps) {
  const [config, setConfig] = useState<CarouselConfig>(() => {
    // If initial config is provided (from page editor), use it
    if (initialConfig && initialConfig.items) {
      const configWithIds = {
        ...initialConfig,
        variant: Number(initialConfig.variant) || 1,
        items: initialConfig.items.map((item) => ({
          ...item,
          id: item.id || uid(),
        })),
      };
      return configWithIds as CarouselConfig;
    }

    // Otherwise create default config
    return {
      id: uid(),
      name: "Main Carousel",
      variant: 1,
      autoScroll: true,
      items: [
        {
          id: uid(),
          image:
            "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=900&h=500&fit=crop",
        },
        {
          id: uid(),
          image:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=500&fit=crop",
        },
      ],
    };
  });
  const [addingItem, setAddingItem] = useState(false);
  const prevConfigRef = useRef<CarouselConfig | null>(null);
  const initialConfigRef = useRef<string | null>(null);

  // Sync config when initialConfig changes from parent
  useEffect(() => {
    if (initialConfig) {
      const newConfigJson = JSON.stringify({
        variant: initialConfig.variant,
        items: initialConfig.items,
        autoScroll: initialConfig.autoScroll,
      });

      // Only update if initialConfig actually changed (not from our own onChange)
      if (initialConfigRef.current !== newConfigJson) {
        initialConfigRef.current = newConfigJson;

        const configWithIds = {
          ...initialConfig,
          variant: Number(initialConfig.variant) || 1,
          items: (initialConfig.items || []).map((item: any) => ({
            ...item,
            id: item.id || uid(),
          })),
        };
        setConfig(configWithIds as CarouselConfig);
      }
    }
  }, [
    initialConfig?.variant,
    initialConfig?.items?.length,
    initialConfig?.autoScroll,
  ]);

  useEffect(() => {
    // Only load from localStorage if no initial config was provided
    if (!initialConfig) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CarouselConfig;
          // Ensure all items have unique IDs
          const configWithIds = {
            ...parsed,
            items: parsed.items.map((item) => ({
              ...item,
              id: item.id || uid(),
            })),
          };
          setConfig(configWithIds);
        } catch {}
      }
    }
  }, [initialConfig]);

  useEffect(() => {
    // autosave to localStorage for convenience
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    // Only call onChange if config actually changed (not just parent re-render)
    // Compare JSON to detect real changes
    const prevConfigJson = JSON.stringify(prevConfigRef.current);
    const currentConfigJson = JSON.stringify(config);

    if (prevConfigJson !== currentConfigJson) {
      onChange?.(config);
      prevConfigRef.current = config;
    }
  }, [config]);

  // Helper to get variant as number
  const getVariantNum = () => Number(config.variant) || 1;

  const addItem = () => {
    const v = getVariantNum();
    if (v === 4 && config.items.length >= 10) return;
    setAddingItem(true);

    const newItem: any = { id: uid() };
    if (v === 2) {
      Object.assign(newItem, {
        backgroundImage: "",
        stars: 5,
        text: "Great product!",
        author: "",
      });
    } else if (v === 3) {
      Object.assign(newItem, { image: "", type: "default" });
    } else if (v === 4) {
      Object.assign(newItem, { image: "", title: "", description: "" });
    } else {
      Object.assign(newItem, { image: "", title: "" });
    }

    setConfig({ ...config, items: [...config.items, newItem] });

    // Reset button state after a brief delay
    setTimeout(() => setAddingItem(false), 300);
  };

  const removeItem = (id: string) => {
    setConfig({ ...config, items: config.items.filter((i) => i.id !== id) });
  };

  const updateItem = (id: string, patch: Partial<any>) => {
    setConfig({
      ...config,
      items: config.items.map((it) =>
        it.id === id ? { ...it, ...patch } : it
      ),
    });
  };

  // Ensure variant is always a number for comparisons
  const variantNum = Number(config.variant) || 1;

  return (
    <div className="p-4 bg-white rounded shadow space-y-4 text-black">
      <h2 className="text-lg font-bold text-black">Carousel Manager</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-black">Name</label>
          <input
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="w-full px-3 py-2 border rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-black">
            Variant
          </label>
          <select
            value={config.variant}
            onChange={(e) => {
              const newVariant = Number(e.target.value) as Variant;
              // Convert existing items to new variant format
              const convertedItems = config.items.map((item: any) => {
                const base = { id: item.id };
                if (newVariant === 1) {
                  return {
                    ...base,
                    image: item.image || item.backgroundImage || "",
                    title: item.title || "",
                  };
                } else if (newVariant === 2) {
                  return {
                    ...base,
                    backgroundImage: item.backgroundImage || item.image || "",
                    stars: item.stars || 5,
                    text: item.text || "Great product!",
                    author: item.author || "",
                  };
                } else if (newVariant === 3) {
                  return {
                    ...base,
                    image: item.image || item.backgroundImage || "",
                    type: item.type || "default",
                  };
                } else if (newVariant === 4) {
                  return {
                    ...base,
                    image: item.image || item.backgroundImage || "",
                    title: item.title || "",
                    description: item.description || "",
                  };
                }
                return item;
              });
              setConfig({
                ...config,
                variant: newVariant,
                items: convertedItems,
              });
            }}
            className="w-full px-3 py-2 border rounded text-black"
          >
            <option value={1}>Variant 1 — Simple Image Carousel</option>
            <option value={2}>
              Variant 2 — Review Carousel (bg image + stars)
            </option>
            <option value={3}>
              Variant 3 — Typed Image Carousel (menu + auto-scroll)
            </option>
            <option value={4}>
              Variant 4 — Advanced Carousel (up to 10 items)
            </option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-black">
          <input
            type="checkbox"
            checked={!!config.autoScroll}
            onChange={(e) =>
              setConfig({ ...config, autoScroll: e.target.checked })
            }
          />
          <span className="text-sm text-black">Auto-scroll</span>
        </label>
        <button
          type="button"
          onClick={addItem}
          disabled={addingItem}
          className={`px-3 py-2 rounded text-white transition-all ${
            addingItem
              ? "bg-gray-400 cursor-not-allowed opacity-75"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          {addingItem ? "Adding..." : "Add Item"}
        </button>
        {variantNum === 4 && (
          <span className="text-sm text-gray-600">Limit: 10 items</span>
        )}
      </div>

      <div className="space-y-2">
        {config.items.map((it: any) => (
          <div
            key={it.id}
            className="p-3 border rounded flex gap-3 items-start"
          >
            <div className="flex-1">
              {variantNum === 2 && (
                <>
                  <ImagePicker
                    label="Background Image URL"
                    value={it.backgroundImage || it.image || ""}
                    onChange={(url: string) =>
                      updateItem(it.id, { backgroundImage: url })
                    }
                    placeholder="https://..."
                  />
                  <label className="block text-sm font-semibold text-black">
                    Stars (1-5)
                  </label>
                  <input
                    type="number"
                    value={it.stars || 5}
                    min={1}
                    max={5}
                    onChange={(e) =>
                      updateItem(it.id, { stars: Number(e.target.value) })
                    }
                    className="w-24 px-2 py-1 border rounded mb-2 text-black"
                  />
                  <label className="block text-sm font-semibold text-black">
                    Review Text
                  </label>
                  <input
                    type="text"
                    value={it.text || it.title || ""}
                    onChange={(e) =>
                      updateItem(it.id, { text: e.target.value })
                    }
                    placeholder="Great product!"
                    className="w-full px-2 py-1 border rounded mb-2 text-black"
                  />
                  <label className="block text-sm font-semibold text-black">
                    Author
                  </label>
                  <input
                    type="text"
                    value={it.author || ""}
                    onChange={(e) =>
                      updateItem(it.id, { author: e.target.value })
                    }
                    placeholder="John Doe"
                    className="w-full px-2 py-1 border rounded mb-2 text-black"
                  />
                </>
              )}

              {variantNum === 3 && (
                <>
                  <ImagePicker
                    label="Image URL"
                    value={it.image || it.backgroundImage || ""}
                    onChange={(url: string) =>
                      updateItem(it.id, { image: url })
                    }
                    placeholder="https://..."
                  />
                  <label className="block text-sm font-semibold text-black">
                    Type / Category
                  </label>
                  <input
                    type="text"
                    value={it.type || ""}
                    onChange={(e) =>
                      updateItem(it.id, { type: e.target.value })
                    }
                    placeholder="e.g., nature, tech, design"
                    className="w-full px-2 py-1 border rounded mb-2 text-black"
                  />
                </>
              )}

              {variantNum === 4 && (
                <>
                  <ImagePicker
                    label="Image URL"
                    value={it.image || it.backgroundImage || ""}
                    onChange={(url: string) =>
                      updateItem(it.id, { image: url })
                    }
                    placeholder="https://..."
                  />
                  <label className="block text-sm font-semibold text-black">
                    Title
                  </label>
                  <input
                    type="text"
                    value={it.title || ""}
                    onChange={(e) =>
                      updateItem(it.id, { title: e.target.value })
                    }
                    placeholder="Item title"
                    className="w-full px-2 py-1 border rounded mb-2 text-black"
                  />
                  <label className="block text-sm font-semibold text-black">
                    Description
                  </label>
                  <input
                    type="text"
                    value={it.description || ""}
                    onChange={(e) =>
                      updateItem(it.id, { description: e.target.value })
                    }
                    placeholder="Item description"
                    className="w-full px-2 py-1 border rounded mb-2 text-black"
                  />
                </>
              )}

              {variantNum === 1 && (
                <>
                  <ImagePicker
                    label="Image URL"
                    value={it.image || it.backgroundImage || ""}
                    onChange={(url: string) =>
                      updateItem(it.id, { image: url })
                    }
                    placeholder="https://..."
                  />
                  <label className="block text-sm font-semibold text-black">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={it.title || ""}
                    onChange={(e) =>
                      updateItem(it.id, { title: e.target.value })
                    }
                    placeholder="Slide title"
                    className="w-full px-2 py-1 border rounded mb-2 text-black"
                  />
                </>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => removeItem(it.id)}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-black">Preview</h3>
        <CarouselDisplay config={config} />
      </div>
    </div>
  );
}
