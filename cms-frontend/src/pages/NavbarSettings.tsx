import { useEffect, useState } from "react";
import api from "../api/api";
import ImagePicker from "../components/ImagePicker";

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

export default function NavbarSettings() {
  const defaultNavStyle: NavStyle = {
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
    hoverBackground: "#f8fafc",
    hoverTextColor: "#0f172a",
    hoverEffect: "underline",
    underlineColor: "#2563eb",
    underlineThickness: 2,
    underlineTransitionMs: 220,
    underlineDelayMs: 50,
  };

  const [navConfig, setNavConfig] = useState<NavConfig>({
    brandName: "",
    logoUrl: "",
    navItems: [],
    navStyle: defaultNavStyle,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getSiteConfig();
        if (res && res.data && res.data.navConfig) {
          const incoming = res.data.navConfig;
          setNavConfig({
            ...incoming,
            navStyle: { ...defaultNavStyle, ...(incoming.navStyle || {}) },
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load navigation settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api.updateSiteConfig({ navConfig });
      setSuccess("Navigation saved");
      try {
        (window as any).dispatchEvent(
          new CustomEvent("site-config-updated", { detail: res.data })
        );
      } catch (e) {}
      try {
        localStorage.setItem("cms_site_config", JSON.stringify(res.data));
      } catch (e) {}
    } catch (err) {
      console.error(err);
      setError("Failed to save navigation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading navigation settings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Navigation Settings</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Brand</label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={navConfig.brandName || ""}
            onChange={(e) =>
              setNavConfig({ ...navConfig, brandName: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Logo URL</label>
          <ImagePicker
            label="Logo URL"
            value={navConfig.logoUrl || ""}
            onChange={(url: string) =>
              setNavConfig({ ...navConfig, logoUrl: url })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
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
                    placeholder="Href"
                    className="w-40 px-2 py-1 border rounded"
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
                </div>
                <div className="mt-2 flex gap-2">
                  <button
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
                            updated[index] = {
                              ...parent,
                              children: newChildren,
                            };
                            setNavConfig({ ...navConfig, navItems: updated });
                          }}
                        />
                        <input
                          placeholder="Href"
                          className="w-40 px-2 py-1 border rounded"
                          value={child.href || ""}
                          onChange={(e) => {
                            const updated = [...(navConfig.navItems || [])];
                            const parent = updated[index];
                            const newChildren = [...(parent.children || [])];
                            newChildren[cidx] = {
                              ...newChildren[cidx],
                              href: e.target.value,
                            };
                            updated[index] = {
                              ...parent,
                              children: newChildren,
                            };
                            setNavConfig({ ...navConfig, navItems: updated });
                          }}
                        />
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded"
                          onClick={() => {
                            const updated = [...(navConfig.navItems || [])];
                            const parent = updated[index];
                            const newChildren = (parent.children || []).filter(
                              (_, ci) => ci !== cidx
                            );
                            updated[index] = {
                              ...parent,
                              children: newChildren,
                            };
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
            <div>
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={() =>
                  setNavConfig({
                    ...navConfig,
                    navItems: [
                      ...(navConfig.navItems || []),
                      { label: "New", href: "/" },
                    ],
                  })
                }
              >
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Style Editor */}
        <div className="pt-4 border-t">
          <h3 className="font-medium mb-2">Navigation Style</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Background</label>
              <input
                type="color"
                value={
                  (navConfig as any).navStyle?.backgroundColor ||
                  defaultNavStyle.backgroundColor
                }
                onChange={(e) =>
                  setNavConfig({
                    ...navConfig,
                    navStyle: {
                      ...(navConfig as any).navStyle,
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
                value={
                  (navConfig as any).navStyle?.textColor ||
                  defaultNavStyle.textColor
                }
                onChange={(e) =>
                  setNavConfig({
                    ...navConfig,
                    navStyle: {
                      ...(navConfig as any).navStyle,
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
                value={
                  (navConfig as any).navStyle?.hoverBackground ||
                  defaultNavStyle.hoverBackground
                }
                onChange={(e) =>
                  setNavConfig({
                    ...navConfig,
                    navStyle: {
                      ...(navConfig as any).navStyle,
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
                value={
                  (navConfig as any).navStyle?.hoverTextColor ||
                  defaultNavStyle.hoverTextColor
                }
                onChange={(e) =>
                  setNavConfig({
                    ...navConfig,
                    navStyle: {
                      ...(navConfig as any).navStyle,
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
                value={
                  (navConfig as any).navStyle?.hoverEffect ||
                  defaultNavStyle.hoverEffect
                }
                onChange={(e) =>
                  setNavConfig({
                    ...navConfig,
                    navStyle: {
                      ...(navConfig as any).navStyle,
                      hoverEffect: e.target.value as any,
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
                value={
                  (navConfig as any).navStyle?.underlineColor ||
                  defaultNavStyle.underlineColor
                }
                onChange={(e) =>
                  setNavConfig({
                    ...navConfig,
                    navStyle: {
                      ...(navConfig as any).navStyle,
                      underlineColor: e.target.value,
                    },
                  })
                }
                className="w-16 h-9 p-0 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Underline Thickness (px)
              </label>
              <input
                type="number"
                min={1}
                value={
                  (navConfig as any).navStyle?.underlineThickness ||
                  defaultNavStyle.underlineThickness
                }
                onChange={(e) =>
                  setNavConfig({
                    ...navConfig,
                    navStyle: {
                      ...(navConfig as any).navStyle,
                      underlineThickness: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Underline Duration (ms)
              </label>
              <input
                type="number"
                min={50}
                value={
                  (navConfig as any).navStyle?.underlineTransitionMs ||
                  defaultNavStyle.underlineTransitionMs
                }
                onChange={(e) =>
                  setNavConfig({
                    ...navConfig,
                    navStyle: {
                      ...(navConfig as any).navStyle,
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
                value={
                  (navConfig as any).navStyle?.underlineDelayMs ||
                  defaultNavStyle.underlineDelayMs
                }
                onChange={(e) =>
                  setNavConfig({
                    ...navConfig,
                    navStyle: {
                      ...(navConfig as any).navStyle,
                      underlineDelayMs: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            className={`px-4 py-2 rounded font-bold text-white ${
              saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Navigation"}
          </button>
        </div>
      </div>
    </div>
  );
}
