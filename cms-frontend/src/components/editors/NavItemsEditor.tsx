import ImagePicker from "../../components/ImagePicker";

type NavItem = { label?: string; href?: string; children?: NavItem[] };
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
type NavConfig = {
  brandName?: string;
  logoUrl?: string;
  navItems?: NavItem[];
  navStyle?: NavStyle;
};

export default function NavItemsEditor({
  navConfig,
  setNavConfig,
}: {
  navConfig: NavConfig;
  setNavConfig: (next: NavConfig) => void;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-black mb-2">
          Brand
        </label>
        <input
          value={navConfig.brandName || ""}
          onChange={(e) =>
            setNavConfig({ ...navConfig, brandName: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <ImagePicker
          label="Logo URL (optional)"
          value={navConfig.logoUrl || ""}
          onChange={(url: string) =>
            setNavConfig({ ...navConfig, logoUrl: url })
          }
          placeholder="https://..."
        />
        <p className="text-xs text-gray-500 mt-1">
          If provided, the logo appears before the company name.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-black mb-2">
          Navigation Items
        </label>
        <div className="space-y-2">
          {(navConfig.navItems || []).map((item, index) => (
            <div key={index} className="border rounded p-3">
              <div className="flex gap-2">
                <input
                  placeholder="Label"
                  className="flex-1 px-2 py-1 border rounded"
                  value={item.label}
                  onChange={(e) => {
                    const updated = [...(navConfig.navItems || [])];
                    updated[index] = {
                      ...updated[index],
                      label: e.target.value,
                    };
                    setNavConfig({ ...navConfig, navItems: updated });
                  }}
                />
                <input
                  placeholder="/path or https://..."
                  className="w-56 px-2 py-1 border rounded"
                  value={item.href || ""}
                  onChange={(e) => {
                    const updated = [...(navConfig.navItems || [])];
                    updated[index] = {
                      ...updated[index],
                      href: e.target.value,
                    };
                    setNavConfig({ ...navConfig, navItems: updated });
                  }}
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-green-500 text-white rounded"
                  onClick={() => {
                    const updated = [...(navConfig.navItems || [])];
                    const current = updated[index] || {
                      label: "",
                      href: "",
                      children: [],
                    };
                    updated[index] = {
                      ...current,
                      children: [
                        ...(current.children || []),
                        { label: "", href: "" },
                      ],
                    };
                    setNavConfig({ ...navConfig, navItems: updated });
                  }}
                >
                  Add child
                </button>
                <button
                  type="button"
                  className="px-3 py-1 bg-red-500 text-white rounded"
                  onClick={() => {
                    const updated = (navConfig.navItems || []).filter(
                      (_, i) => i !== index
                    );
                    setNavConfig({ ...navConfig, navItems: updated });
                  }}
                >
                  Remove
                </button>
              </div>

              {item.children && item.children.length > 0 && (
                <div className="mt-2 pl-4 space-y-2">
                  {item.children.map((child, cidx) => (
                    <div key={cidx} className="flex gap-2 items-center">
                      <input
                        placeholder="Label"
                        className="flex-1 px-2 py-1 border rounded"
                        value={child.label}
                        onChange={(e) => {
                          const updated = [...(navConfig.navItems || [])];
                          const parent = updated[index];
                          const newChildren = [...(parent.children || [])];
                          newChildren[cidx] = {
                            ...newChildren[cidx],
                            label: e.target.value,
                          };
                          updated[index] = { ...parent, children: newChildren };
                          setNavConfig({ ...navConfig, navItems: updated });
                        }}
                      />
                      <input
                        placeholder="/path or https://..."
                        className="w-56 px-2 py-1 border rounded"
                        value={child.href || ""}
                        onChange={(e) => {
                          const updated = [...(navConfig.navItems || [])];
                          const parent = updated[index];
                          const newChildren = [...(parent.children || [])];
                          newChildren[cidx] = {
                            ...newChildren[cidx],
                            href: e.target.value,
                          };
                          updated[index] = { ...parent, children: newChildren };
                          setNavConfig({ ...navConfig, navItems: updated });
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 bg-red-500 text-white rounded"
                        onClick={() => {
                          const updated = [...(navConfig.navItems || [])];
                          const parent = updated[index];
                          const newChildren = (parent.children || []).filter(
                            (_, ci) => ci !== cidx
                          );
                          updated[index] = { ...parent, children: newChildren };
                          setNavConfig({ ...navConfig, navItems: updated });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2">
            <button
              type="button"
              className="px-3 py-2 bg-blue-600 text-white rounded"
              onClick={() =>
                setNavConfig({
                  ...navConfig,
                  navItems: [
                    ...(navConfig.navItems || []),
                    { label: "New Item", href: "/" },
                  ],
                })
              }
            >
              Add top-level item
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
