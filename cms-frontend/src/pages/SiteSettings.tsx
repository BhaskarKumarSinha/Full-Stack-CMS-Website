import { useEffect, useState } from "react";
import api from "../api/api";
import ImagePicker from "../components/ImagePicker";

type NavItem = { label?: string; href?: string; children?: NavItem[] };
type LinkItem = string | { label?: string; href?: string };
type NavStyle = {
  backgroundColor?: string;
  textColor?: string;
  hoverBackground?: string;
  hoverTextColor?: string;
  hoverEffect?: "underline" | "background" | "underline-and-bg";
  underlineColor?: string;
  underlineThickness?: number; // px
  underlineTransitionMs?: number;
  underlineDelayMs?: number;
};
type NavConfig = {
  brandName?: string;
  logoUrl?: string;
  navItems?: NavItem[];
  navStyle?: NavStyle;
};
type FooterConfig = {
  companyName?: string;
  description?: string;
  footerLinks?: string[];
  footerSections?: {
    heading?: string;
    links?: { label?: string; href?: string }[];
  }[];
  footerStyle?: NavStyle; // reuse NavStyle shape for footer
};

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

export default function SiteSettings() {
  const [navConfig, setNavConfig] = useState<NavConfig>({
    brandName: "",
    logoUrl: "",
    navItems: [],
    navStyle: defaultNavStyle,
  });
  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    companyName: "",
    description: "",
    footerLinks: [],
    footerSections: [],
    footerStyle: {
      backgroundColor: "#111827",
      textColor: "#d1d5db",
      hoverBackground: "#111827",
      hoverTextColor: "#ffffff",
      hoverEffect: "background",
      underlineColor: "#2563eb",
      underlineThickness: 2,
      underlineTransitionMs: 220,
      underlineDelayMs: 50,
    },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState("Roboto");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getSiteConfig();
        if (res && res.data) {
          const incoming = res.data.navConfig || {
            brandName: "",
            navItems: [],
            logoUrl: "",
          };
          // ensure navStyle defaults are present (merge incoming.navStyle)
          const mergedNavConfig: NavConfig = {
            ...incoming,
            navStyle: { ...defaultNavStyle, ...(incoming.navStyle || {}) },
          };
          setNavConfig(mergedNavConfig);
          // merge footerStyle defaults
          const incomingFooter = res.data.footerConfig || {
            companyName: "",
            description: "",
            footerLinks: [],
          };
          const mergedFooter = {
            ...incomingFooter,
            footerStyle: {
              ...defaultNavStyle,
              ...(incomingFooter.footerStyle || {}),
            },
            footerSections: incomingFooter.footerSections || [],
          };
          // If older footerLinks exist but footerSections is empty, convert to a legal section
          if (
            (mergedFooter.footerSections || []).length === 0 &&
            (incomingFooter.footerLinks || []).length
          ) {
            mergedFooter.footerSections = [
              { heading: mergedFooter.companyName || "Company", links: [] },
              {
                heading: "Legal",
                links: (incomingFooter.footerLinks || []).map((l: string) => ({
                  label: l,
                  href: `/${String(l).toLowerCase().replace(/\s+/g, "-")}`,
                })),
              },
            ];
          }
          setFooterConfig(mergedFooter as FooterConfig);
          // Load font family
          setFontFamily(res.data.fontFamily || "Roboto");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load site config");
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
      // sanitize footerSections: remove empty-link entries and empty sections
      const sanitizedFooter = {
        ...footerConfig,
        footerSections: (footerConfig.footerSections || [])
          .map((sec) => ({
            ...sec,
            links: (sec.links || []).filter((l: LinkItem) => {
              const label = typeof l === "string" ? l : l.label || "";
              return String(label).trim().length > 0;
            }),
          }))
          .filter((sec) => {
            const headingOk = (sec.heading || "").toString().trim().length > 0;
            const hasLinks = Array.isArray(sec.links) && sec.links.length > 0;
            return headingOk || hasLinks;
          }),
      };

      const res = await api.updateSiteConfig({
        navConfig,
        footerConfig: sanitizedFooter,
        fontFamily,
      });
      console.debug(
        "SiteSettings: updateSiteConfig response:",
        res && res.data
      );
      setSuccess("Site settings saved");
      try {
        // Refresh published pages so the preview and live cache pick up changes immediately
        const refreshRes = await api.refreshPublishedPages();
        console.debug(
          "SiteSettings: refreshPublishedPages result:",
          refreshRes && refreshRes.data
        );
      } catch (e) {
        console.warn("SiteSettings: refreshPublishedPages failed", e);
      }
      try {
        // broadcast to other open editor windows in the same tab
        window.dispatchEvent(
          new CustomEvent("site-config-updated", { detail: res.data })
        );
      } catch {
        // ignore
      }
      try {
        // persist a copy in localStorage for other tabs to pick up
        localStorage.setItem("cms_site_config", JSON.stringify(res.data));
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save site settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading site settings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Site Settings</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="mb-6 bg-white p-6 rounded shadow">
        <h2 className="font-semibold mb-3">Font Settings</h2>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Site Font Family
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Rubik">Rubik</option>
            <option value="DM Sans">DM Sans</option>
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Select the font family to be used throughout the entire site
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-3">Navigation</h2>
          <div className="space-y-3">
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
              <label className="block text-sm font-semibold mb-1">
                Logo URL
              </label>
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
                                const newChildren = [
                                  ...(parent.children || []),
                                ];
                                newChildren[cidx] = {
                                  ...newChildren[cidx],
                                  label: e.target.value,
                                };
                                updated[index] = {
                                  ...parent,
                                  children: newChildren,
                                };
                                setNavConfig({
                                  ...navConfig,
                                  navItems: updated,
                                });
                              }}
                            />
                            <input
                              placeholder="/path or https://..."
                              className="w-56 px-2 py-1 border rounded"
                              value={child.href || ""}
                              onChange={(e) => {
                                const updated = [...(navConfig.navItems || [])];
                                const parent = updated[index];
                                const newChildren = [
                                  ...(parent.children || []),
                                ];
                                newChildren[cidx] = {
                                  ...newChildren[cidx],
                                  href: e.target.value,
                                };
                                updated[index] = {
                                  ...parent,
                                  children: newChildren,
                                };
                                setNavConfig({
                                  ...navConfig,
                                  navItems: updated,
                                });
                              }}
                            />
                            <button
                              type="button"
                              className="px-3 py-1 bg-red-500 text-white rounded"
                              onClick={() => {
                                const updated = [...(navConfig.navItems || [])];
                                const parent = updated[index];
                                const newChildren = (
                                  parent.children || []
                                ).filter((_, ci) => ci !== cidx);
                                updated[index] = {
                                  ...parent,
                                  children: newChildren,
                                };
                                setNavConfig({
                                  ...navConfig,
                                  navItems: updated,
                                });
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

                {/* Navigation Style Editor */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Navigation Style</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Background</label>
                      <input
                        type="color"
                        value={
                          navConfig.navStyle?.backgroundColor ||
                          defaultNavStyle.backgroundColor
                        }
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
                        value={
                          navConfig.navStyle?.textColor ||
                          defaultNavStyle.textColor
                        }
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
                      <label className="block text-sm mb-1">
                        Hover Background
                      </label>
                      <input
                        type="color"
                        value={
                          navConfig.navStyle?.hoverBackground ||
                          defaultNavStyle.hoverBackground
                        }
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
                      <label className="block text-sm mb-1">
                        Hover Text Color
                      </label>
                      <input
                        type="color"
                        value={
                          navConfig.navStyle?.hoverTextColor ||
                          defaultNavStyle.hoverTextColor
                        }
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
                        value={
                          navConfig.navStyle?.hoverEffect ||
                          defaultNavStyle.hoverEffect
                        }
                        onChange={(e) =>
                          setNavConfig({
                            ...navConfig,
                            navStyle: {
                              ...(navConfig.navStyle || {}),
                              hoverEffect: e.target
                                .value as NavStyle["hoverEffect"],
                            },
                          })
                        }
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="underline">Underline</option>
                        <option value="text-color">Text Color</option>
                        <option value="background">Background</option>
                        <option value="underline-and-bg">
                          Underline + Background
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm mb-1">
                        Underline Color
                      </label>
                      <input
                        type="color"
                        value={
                          navConfig.navStyle?.underlineColor ||
                          defaultNavStyle.underlineColor
                        }
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
                      <label className="block text-sm mb-1">
                        Underline Thickness (px)
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={
                          navConfig.navStyle?.underlineThickness ||
                          defaultNavStyle.underlineThickness
                        }
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
                      <label className="block text-sm mb-1">
                        Underline Duration (ms)
                      </label>
                      <input
                        type="number"
                        min={50}
                        value={
                          navConfig.navStyle?.underlineTransitionMs ||
                          defaultNavStyle.underlineTransitionMs
                        }
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
                      <label className="block text-sm mb-1">
                        Underline Delay (ms)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={
                          navConfig.navStyle?.underlineDelayMs ||
                          defaultNavStyle.underlineDelayMs
                        }
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
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-3">Footer</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Company Name
              </label>
              <input
                className="w-full px-3 py-2 border rounded"
                value={footerConfig.companyName || ""}
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    companyName: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded"
                value={footerConfig.description || ""}
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Footer Columns / Sections
              </label>
              <div className="space-y-3">
                {(footerConfig.footerSections || []).map((sec, idx) => (
                  <div key={idx} className="border rounded p-3">
                    <div className="flex gap-2 items-center">
                      <input
                        placeholder="Section heading (e.g. Legal)"
                        className="flex-1 px-2 py-1 border rounded"
                        value={sec.heading || ""}
                        onChange={(e) => {
                          const updated = [
                            ...(footerConfig.footerSections || []),
                          ];
                          updated[idx] = {
                            ...updated[idx],
                            heading: e.target.value,
                          };
                          setFooterConfig({
                            ...footerConfig,
                            footerSections: updated,
                          });
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 py-1 bg-red-500 text-white rounded"
                        onClick={() => {
                          const updated = (
                            footerConfig.footerSections || []
                          ).filter((_, i) => i !== idx);
                          setFooterConfig({
                            ...footerConfig,
                            footerSections: updated,
                          });
                        }}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2">
                      <label className="block text-sm mb-1">
                        Links (comma-separated, label or label|/path)
                      </label>
                      <input
                        className="w-full px-2 py-1 border rounded"
                        value={(sec.links || [])
                          .map((l: LinkItem) => {
                            if (!l) return "";
                            if (typeof l === "string") return l;
                            const label = l.label || "";
                            const href =
                              l.href ||
                              "/" +
                                String(label)
                                  .toLowerCase()
                                  .replace(/\s+/g, "-");
                            // Show as label|href when href is an explicit custom path
                            const defaultHref =
                              "/" +
                              String(label).toLowerCase().replace(/\s+/g, "-");
                            return href && href !== defaultHref
                              ? `${label}|${href}`
                              : label;
                          })
                          .join(", ")}
                        onChange={(e) => {
                          const values = e.target.value
                            .split(",")
                            .map((s) => s.trim());
                          const links = values.map((v) => {
                            if (v.includes("|")) {
                              const parts = v.split("|").map((p) => p.trim());
                              return { label: parts[0], href: parts[1] };
                            }
                            return {
                              label: v,
                              href: "/" + v.toLowerCase().replace(/\s+/g, "-"),
                            };
                          });
                          const updated = [
                            ...(footerConfig.footerSections || []),
                          ];
                          updated[idx] = { ...updated[idx], links };
                          setFooterConfig({
                            ...footerConfig,
                            footerSections: updated,
                          });
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-600 text-white rounded"
                    onClick={() =>
                      setFooterConfig({
                        ...footerConfig,
                        footerSections: [
                          ...(footerConfig.footerSections || []),
                          { heading: "New Column", links: [] },
                        ],
                      })
                    }
                  >
                    Add Column
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Style Editor */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Footer Style</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Background</label>
                  <input
                    type="color"
                    value={
                      footerConfig.footerStyle?.backgroundColor || "#111827"
                    }
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
                    value={
                      footerConfig.footerStyle?.hoverBackground || "#111827"
                    }
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
                    value={
                      footerConfig.footerStyle?.hoverTextColor || "#ffffff"
                    }
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
                    value={
                      footerConfig.footerStyle?.hoverEffect || "background"
                    }
                    onChange={(e) =>
                      setFooterConfig({
                        ...footerConfig,
                        footerStyle: {
                          ...(footerConfig.footerStyle || {}),
                          hoverEffect: e.target
                            .value as NavStyle["hoverEffect"],
                        },
                      })
                    }
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="text-color">Text Color</option>
                    <option value="underline">Underline</option>
                    <option value="background">Background</option>
                    <option value="underline-and-bg">
                      Underline + Background
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Underline Color</label>
                  <input
                    type="color"
                    value={
                      footerConfig.footerStyle?.underlineColor || "#2563eb"
                    }
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
                  <label className="block text-sm mb-1">
                    Underline Thickness (px)
                  </label>
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
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded font-semibold"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
