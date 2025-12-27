type LinkItem = string | { label?: string; href?: string };
type FooterSection = { heading?: string; links?: LinkItem[] };
type FooterConfig = {
  companyName?: string;
  description?: string;
  footerSections?: FooterSection[];
};

export default function FooterSectionsEditor({
  footerConfig,
  setFooterConfig,
  footerSectionsText,
  setFooterSectionsText,
  editingFooter,
}: {
  footerConfig: FooterConfig;
  setFooterConfig: (next: FooterConfig) => void;
  footerSectionsText: Record<number | string, string> | undefined;
  setFooterSectionsText: (t: Record<number | string, string>) => void;
  editingFooter?: boolean;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-semibold text-black mb-2">
          Company Name
        </label>
        <input
          value={footerConfig.companyName || ""}
          onChange={(e) =>
            setFooterConfig({ ...footerConfig, companyName: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-black mb-2">
          Company Description
        </label>
        <textarea
          value={footerConfig.description || ""}
          onChange={(e) =>
            setFooterConfig({ ...footerConfig, description: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded text-black focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-black mb-2">
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
                    const updated = [...(footerConfig.footerSections || [])];
                    updated[idx] = { ...updated[idx], heading: e.target.value };
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
                    const updated = (footerConfig.footerSections || []).filter(
                      (_, i) => i !== idx
                    );
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
                    editingFooter
                      ? footerSectionsText?.[idx] ??
                        (sec.links || [])
                          .map((l) =>
                            typeof l === "string" ? l : l.label || ""
                          )
                          .join(", ")
                      : (sec.links || [])
                          .map((l) =>
                            typeof l === "string" ? l : l.label || ""
                          )
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
              type="button"
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
    </>
  );
}
