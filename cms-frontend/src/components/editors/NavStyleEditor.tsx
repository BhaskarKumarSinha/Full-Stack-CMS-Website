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
type NavConfig = { navStyle?: NavStyle };

export default function NavStyleEditor({
  navConfig,
  setNavConfig,
}: {
  navConfig: NavConfig;
  setNavConfig: (next: NavConfig) => void;
}) {
  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium mb-2">Navigation Style</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Background</label>
          <input
            type="color"
            value={navConfig.navStyle?.backgroundColor || "#ffffff"}
            onChange={(e) =>
              setNavConfig({
                ...navConfig,
                navStyle: {
                  ...(navConfig.navStyle || {}),
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
            value={navConfig.navStyle?.textColor || "#0f172a"}
            onChange={(e) =>
              setNavConfig({
                ...navConfig,
                navStyle: {
                  ...(navConfig.navStyle || {}),
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
            value={navConfig.navStyle?.hoverBackground || "#f8fafc"}
            onChange={(e) =>
              setNavConfig({
                ...navConfig,
                navStyle: {
                  ...(navConfig.navStyle || {}),
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
            value={navConfig.navStyle?.hoverTextColor || "#0f172a"}
            onChange={(e) =>
              setNavConfig({
                ...navConfig,
                navStyle: {
                  ...(navConfig.navStyle || {}),
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
            value={navConfig.navStyle?.hoverEffect || "underline"}
            onChange={(e) =>
              setNavConfig({
                ...navConfig,
                navStyle: {
                  ...(navConfig.navStyle || {}),
                  hoverEffect: e.target.value as NavStyle["hoverEffect"],
                },
              })
            }
            className="w-full px-2 py-1 border rounded"
          >
            <option value="underline">Underline</option>
            <option value="text-color">Text Color</option>
            <option value="background">Background</option>
            <option value="underline-and-bg">Underline + Background</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Underline Color</label>
          <input
            type="color"
            value={navConfig.navStyle?.underlineColor || "#2563eb"}
            onChange={(e) =>
              setNavConfig({
                ...navConfig,
                navStyle: {
                  ...(navConfig.navStyle || {}),
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
            value={navConfig.navStyle?.underlineThickness || 2}
            onChange={(e) =>
              setNavConfig({
                ...navConfig,
                navStyle: {
                  ...(navConfig.navStyle || {}),
                  underlineThickness: Number(e.target.value),
                },
              })
            }
            className="w-full px-2 py-1 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Underline Duration (ms)</label>
          <input
            type="number"
            min={50}
            value={navConfig.navStyle?.underlineTransitionMs || 220}
            onChange={(e) =>
              setNavConfig({
                ...navConfig,
                navStyle: {
                  ...(navConfig.navStyle || {}),
                  underlineTransitionMs: Number(e.target.value),
                },
              })
            }
            className="w-full px-2 py-1 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Underline Delay (ms)</label>
          <input
            type="number"
            min={0}
            value={navConfig.navStyle?.underlineDelayMs || 50}
            onChange={(e) =>
              setNavConfig({
                ...navConfig,
                navStyle: {
                  ...(navConfig.navStyle || {}),
                  underlineDelayMs: Number(e.target.value),
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
