import { useEffect, useState } from "react";
import api from "../api/api";

type FooterSection = {
  heading?: string;
  links?: { label?: string; href?: string }[];
};
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
type FooterConfig = {
  companyName?: string;
  description?: string;
  footerLinks?: string[];
  footerSections?: FooterSection[];
  footerStyle?: NavStyle;
};

export default function FooterSettings() {
  const defaultFooterStyle: NavStyle = {
    backgroundColor: "#111827",
    textColor: "#d1d5db",
    hoverBackground: "#111827",
    hoverTextColor: "#ffffff",
    hoverEffect: "background",
    underlineColor: "#2563eb",
    underlineThickness: 2,
    underlineTransitionMs: 220,
    underlineDelayMs: 50,
  };

  const [footerConfig, setFooterConfig] = useState<FooterConfig>({
    companyName: "",
    description: "",
    footerLinks: [],
    footerSections: [],
    footerStyle: defaultFooterStyle,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [footerSectionsText, setFooterSectionsText] = useState<
    Record<number | string, string>
  >({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.getSiteConfig();
        if (res && res.data && res.data.footerConfig) {
          const incoming = res.data.footerConfig;
          setFooterConfig({
            ...incoming,
            footerStyle: {
              ...defaultFooterStyle,
              ...(incoming.footerStyle || {}),
            },
            footerSections: incoming.footerSections || [],
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load footer settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const parseLinksFromText = (text?: string) => {
    if (!text) return [];
    return text
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((token) => {
        if (token.includes("|")) {
          const parts = token.split("|").map((p) => p.trim());
          return { label: parts[0] || "", href: parts[1] || "" };
        }
        return token;
      });
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // merge edited text fields into footerSections
      const mergedSections = (footerConfig.footerSections || []).map(
        (sec, idx) => {
          const raw = (footerSectionsText || {})[idx];
          const links =
            raw !== undefined ? parseLinksFromText(raw) : sec.links || [];
          return { ...sec, links };
        }
      );
      const sanitizedFooter = {
        ...footerConfig,
        footerSections: mergedSections,
      };
      const res = await api.updateSiteConfig({ footerConfig: sanitizedFooter });
      setSuccess("Footer saved");
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
      setError("Failed to save footer");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading footer settings...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Footer Settings</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Company Name
          </label>
          <input
            className="w-full px-3 py-2 border rounded"
            value={footerConfig.companyName || ""}
            onChange={(e) =>
              setFooterConfig({ ...footerConfig, companyName: e.target.value })
            }
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">
            Company Description
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            rows={3}
            value={footerConfig.description || ""}
            onChange={(e) =>
              setFooterConfig({ ...footerConfig, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Footer Columns / Sections
          </label>
          <div className="space-y-3">
            {((footerConfig.footerSections || []) as any[]).map((sec, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="flex gap-2 items-center">
                  <input
                    placeholder="Section heading (e.g. Legal)"
                    className="flex-1 px-2 py-1 border rounded"
                    value={sec.heading || ""}
                    onChange={(e) => {
                      const updated = [...(footerConfig.footerSections || [])];
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
                    value={
                      footerSectionsText[idx] ??
                      (sec.links || [])
                        .map((l: any) => {
                          if (!l) return "";
                          if (typeof l === "string") return l;
                          const label = l.label || "";
                          const href =
                            l.href ||
                            "/" +
                              String(label).toLowerCase().replace(/\s+/g, "-");
                          const defaultHref =
                            "/" +
                            String(label).toLowerCase().replace(/\s+/g, "-");
                          return href && href !== defaultHref
                            ? `${label}|${href}`
                            : label;
                        })
                        .join(", ")
                    }
                    onChange={(e) => {
                      const updatedText = { ...(footerSectionsText || {}) };
                      updatedText[idx] = e.target.value;
                      setFooterSectionsText(updatedText);
                    }}
                  />
                </div>
              </div>
            ))}
            <div>
              <button
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={() => {
                  const updatedSections = [
                    ...(footerConfig.footerSections || []),
                    { heading: "New Column", links: [] },
                  ];
                  setFooterConfig({
                    ...footerConfig,
                    footerSections: updatedSections,
                  });
                  const newIndex = updatedSections.length - 1;
                  setFooterSectionsText({
                    ...(footerSectionsText || {}),
                    [newIndex]: "",
                  });
                }}
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
                  (footerConfig as any).footerStyle?.backgroundColor ||
                  "#111827"
                }
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    footerStyle: {
                      ...(footerConfig as any).footerStyle,
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
                  (footerConfig as any).footerStyle?.textColor || "#d1d5db"
                }
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    footerStyle: {
                      ...(footerConfig as any).footerStyle,
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
                  (footerConfig as any).footerStyle?.hoverBackground ||
                  "#111827"
                }
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    footerStyle: {
                      ...(footerConfig as any).footerStyle,
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
                  (footerConfig as any).footerStyle?.hoverTextColor || "#ffffff"
                }
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    footerStyle: {
                      ...(footerConfig as any).footerStyle,
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
                  (footerConfig as any).footerStyle?.hoverEffect || "background"
                }
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    footerStyle: {
                      ...(footerConfig as any).footerStyle,
                      hoverEffect: e.target.value as any,
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
                value={
                  (footerConfig as any).footerStyle?.underlineColor || "#2563eb"
                }
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    footerStyle: {
                      ...(footerConfig as any).footerStyle,
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
                  (footerConfig as any).footerStyle?.underlineThickness || 2
                }
                onChange={(e) =>
                  setFooterConfig({
                    ...footerConfig,
                    footerStyle: {
                      ...(footerConfig as any).footerStyle,
                      underlineThickness: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            className={`px-4 py-2 rounded font-bold text-white ${
              saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Footer"}
          </button>
        </div>
      </div>
    </div>
  );
}
