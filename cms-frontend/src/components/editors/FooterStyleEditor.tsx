type NavStyle = {
  backgroundColor?: string;
  textColor?: string;
  hoverBackground?: string;
  hoverTextColor?: string;
  hoverEffect?: "underline" | "background" | "underline-and-bg" | "text-color";
  underlineColor?: string;
  underlineThickness?: number;
  underlineTransitionMs?: number;
  underlineDelayMs?: number;
};
type FooterConfig = { footerStyle?: NavStyle };

export default function FooterStyleEditor({
  footerConfig,
  setFooterConfig,
}: {
  footerConfig: FooterConfig;
  setFooterConfig: (next: FooterConfig) => void;
}) {
  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium mb-2">Footer Style</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Background</label>
          <input
            type="color"
            value={footerConfig.footerStyle?.backgroundColor || "#111827"}
            onChange={(e) =>
              setFooterConfig({
                ...footerConfig,
                footerStyle: {
                  ...(footerConfig.footerStyle || {}),
                  backgroundColor: e.target.value,
                },
              })
            }
            className="w-16 h-9 p-0 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Text Color</label>
          <input
            type="color"
            value={footerConfig.footerStyle?.textColor || "#d1d5db"}
            onChange={(e) =>
              setFooterConfig({
                ...footerConfig,
                footerStyle: {
                  ...(footerConfig.footerStyle || {}),
                  textColor: e.target.value,
                },
              })
            }
            className="w-16 h-9 p-0 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Hover Background</label>
          <input
            type="color"
            value={footerConfig.footerStyle?.hoverBackground || "#111827"}
            onChange={(e) =>
              setFooterConfig({
                ...footerConfig,
                footerStyle: {
                  ...(footerConfig.footerStyle || {}),
                  hoverBackground: e.target.value,
                },
              })
            }
            className="w-16 h-9 p-0 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Hover Text Color</label>
          <input
            type="color"
            value={footerConfig.footerStyle?.hoverTextColor || "#ffffff"}
            onChange={(e) =>
              setFooterConfig({
                ...footerConfig,
                footerStyle: {
                  ...(footerConfig.footerStyle || {}),
                  hoverTextColor: e.target.value,
                },
              })
            }
            className="w-16 h-9 p-0 border rounded"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm mb-1">Hover Effect</label>
          <select
            value={footerConfig.footerStyle?.hoverEffect || "background"}
            onChange={(e) =>
              setFooterConfig({
                ...footerConfig,
                footerStyle: {
                  ...(footerConfig.footerStyle || {}),
                  hoverEffect: e.target.value as NavStyle["hoverEffect"],
                },
              })
            }
            className="w-full px-2 py-1 border rounded"
          >
            <option value="text-color">Text Color</option>
            <option value="underline">Underline</option>
            <option value="background">Background</option>
            <option value="underline-and-bg">Underline + Background</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Underline Color</label>
          <input
            type="color"
            value={footerConfig.footerStyle?.underlineColor || "#2563eb"}
            onChange={(e) =>
              setFooterConfig({
                ...footerConfig,
                footerStyle: {
                  ...(footerConfig.footerStyle || {}),
                  underlineColor: e.target.value,
                },
              })
            }
            className="w-16 h-9 p-0 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Underline Thickness (px)</label>
          <input
            type="number"
            min={1}
            value={footerConfig.footerStyle?.underlineThickness || 2}
            onChange={(e) =>
              setFooterConfig({
                ...footerConfig,
                footerStyle: {
                  ...(footerConfig.footerStyle || {}),
                  underlineThickness: Number(e.target.value),
                },
              })
            }
            className="w-full px-2 py-1 border rounded"
          />
        </div>
      </div>
    </div>
  );
}
