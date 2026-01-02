import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

type Page = {
  _id: string;
  id?: string;
  title: string;
  path: string;
  content: string;
  customCss?: string;
  customHtml?: string;
  customHtmlPosition?: string; // "start" | "end" | "after-nav" | "before-footer" | "after-selector"
  customHtmlSelector?: string; // CSS selector for "after-selector" position
  status?: string;
};

export default function PageCodeEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>(id || "");
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "preview">(
    "html"
  );

  // Custom code states
  const [customCss, setCustomCss] = useState("");
  const [customHtml, setCustomHtml] = useState("");
  const [customHtmlPosition, setCustomHtmlPosition] = useState("start");
  const [customHtmlSelector, setCustomHtmlSelector] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");

  // Helper to get page ID (handles both _id and id formats)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getPageId = (p: any): string => {
    if (!p) return "";
    // Handle string _id
    if (typeof p._id === "string") return p._id;
    // Handle ObjectId object with $oid
    if (p._id && typeof p._id === "object" && p._id.$oid) return p._id.$oid;
    // Handle ObjectId with toString
    if (p._id && typeof p._id.toString === "function") return p._id.toString();
    // Fallback to id field
    if (typeof p.id === "string") return p.id;
    return "";
  };

  // Load all pages for dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getPages();
        // API returns { items: [...], count: ... }
        const pageList = res.data?.items || res.data || [];
        setPages(pageList);
        if (!id && pageList.length > 0) {
          setSelectedPageId(getPageId(pageList[0]));
        }
      } catch (err) {
        console.error("Failed to load pages:", err);
        setError("Failed to load pages");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Load selected page
  useEffect(() => {
    if (!selectedPageId) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getPageById(selectedPageId);
        const pageData = res.data;
        setPage(pageData);
        setGeneratedHtml(pageData.content || "");
        setCustomCss(pageData.customCss || "");
        setCustomHtml(pageData.customHtml || "");
        setCustomHtmlPosition(pageData.customHtmlPosition || "start");
        setCustomHtmlSelector(pageData.customHtmlSelector || "");
      } catch (err) {
        console.error("Failed to load page:", err);
        setError("Failed to load page");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedPageId]);

  const handlePageChange = (pageId: string) => {
    setSelectedPageId(pageId);
    navigate(`/admin/page-code/${pageId}`, { replace: true });
  };

  const handleSave = async () => {
    if (!page) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.updatePage(getPageId(page), {
        customCss,
        customHtml,
        customHtmlPosition: customHtmlPosition as
          | "start"
          | "after-nav"
          | "before-footer"
          | "end"
          | "after-selector",
        customHtmlSelector,
      });
      setSuccess("Custom code saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to save:", err);
      setError("Failed to save custom code");
    } finally {
      setSaving(false);
    }
  };

  // Build preview HTML with injection position
  const buildPreviewHtml = () => {
    let content = generatedHtml;

    if (customHtml) {
      switch (customHtmlPosition) {
        case "end":
          // Inject before </body> or at end
          if (/<\/body>/i.test(content)) {
            content = content.replace(/<\/body>/i, customHtml + "\n</body>");
          } else {
            content = content + "\n" + customHtml;
          }
          break;
        case "after-nav":
          // Inject after </nav>
          if (/<\/nav>/i.test(content)) {
            content = content.replace(/<\/nav>/i, "</nav>\n" + customHtml);
          } else {
            content = customHtml + "\n" + content;
          }
          break;
        case "before-footer":
          // Inject before <footer>
          if (/<footer/i.test(content)) {
            content = content.replace(/<footer/i, customHtml + "\n<footer");
          } else {
            content = content + "\n" + customHtml;
          }
          break;
        case "after-selector":
          // This would require DOM manipulation in preview
          // For now, just append to body
          if (customHtmlSelector && /<\/body>/i.test(content)) {
            content = content.replace(/<\/body>/i, customHtml + "\n</body>");
          } else {
            content = customHtml + "\n" + content;
          }
          break;
        default: // "start"
          // Inject after <body>
          if (/<body[^>]*>/i.test(content)) {
            content = content.replace(/(<body[^>]*>)/i, "$1\n" + customHtml);
          } else {
            content = customHtml + "\n" + content;
          }
          break;
      }
    }

    return content;
  };

  const previewHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    /* Custom CSS */
    ${customCss}
  </style>
</head>
<body>
  ${buildPreviewHtml()}
</body>
</html>
  `.trim();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Page Code Editor</h1>
        <p className="text-gray-600">
          View generated HTML/CSS and add custom code to your pages
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Page Selector */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <label className="block text-sm font-medium mb-2">Select Page</label>
        <select
          value={selectedPageId}
          onChange={(e) => handlePageChange(e.target.value)}
          className="w-full md:w-1/2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a page --</option>
          {pages.map((p) => (
            <option key={getPageId(p)} value={getPageId(p)}>
              {p.title || "Untitled"} ({p.path}){" "}
              {p.status === "published" ? "✓" : ""}
            </option>
          ))}
        </select>
      </div>

      {page && (
        <>
          {/* Tabs */}
          <div className="mb-4 border-b">
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab("html")}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === "html"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Generated HTML
              </button>
              <button
                onClick={() => setActiveTab("css")}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === "css"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Custom CSS
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`pb-2 px-1 font-medium transition-colors ${
                  activeTab === "preview"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Preview
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow">
            {/* Generated HTML Tab */}
            {activeTab === "html" && (
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">
                    Generated HTML (Read-only)
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    This is the HTML generated by the page builder. You can copy
                    it or use it as reference.
                  </p>
                  <div className="relative">
                    <textarea
                      value={generatedHtml}
                      readOnly
                      className="w-full h-96 font-mono text-sm p-4 bg-gray-900 text-green-400 rounded-lg border"
                      placeholder="No content generated yet..."
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedHtml);
                        setSuccess("HTML copied to clipboard!");
                        setTimeout(() => setSuccess(null), 2000);
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Custom HTML</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Add custom HTML that will be injected into the page. This
                    can include scripts, additional elements, or custom
                    components.
                  </p>

                  {/* Position selector */}
                  <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Injection Position
                      </label>
                      <select
                        value={customHtmlPosition}
                        onChange={(e) => setCustomHtmlPosition(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="start">
                          After &lt;body&gt; (Start of page)
                        </option>
                        <option value="after-nav">After Navigation</option>
                        <option value="before-footer">Before Footer</option>
                        <option value="end">
                          Before &lt;/body&gt; (End of page)
                        </option>
                        <option value="after-selector">
                          After CSS Selector
                        </option>
                      </select>
                    </div>

                    {customHtmlPosition === "after-selector" && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          CSS Selector
                        </label>
                        <input
                          type="text"
                          value={customHtmlSelector}
                          onChange={(e) =>
                            setCustomHtmlSelector(e.target.value)
                          }
                          placeholder=".hero-section, #main-content, etc."
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Enter a CSS selector. HTML will be injected after the
                          first matching element.
                        </p>
                      </div>
                    )}
                  </div>

                  <textarea
                    value={customHtml}
                    onChange={(e) => setCustomHtml(e.target.value)}
                    className="w-full h-48 font-mono text-sm p-4 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-blue-500"
                    placeholder="<!-- Add your custom HTML here -->
<div class='custom-banner'>
  <p>Custom content...</p>
</div>"
                  />
                </div>
              </div>
            )}

            {/* Custom CSS Tab */}
            {activeTab === "css" && (
              <div className="p-4">
                <h3 className="font-semibold mb-2">Custom CSS</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Add custom CSS styles for this page. These styles will be
                  applied after the default styles.
                </p>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  className="w-full h-96 font-mono text-sm p-4 bg-gray-900 text-yellow-300 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  placeholder="/* Add your custom CSS here */

.custom-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
  text-align: center;
}

/* Override default styles */
.hero-section {
  min-height: 80vh;
}

/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}"
                />
                <div className="mt-3 text-sm text-gray-500">
                  <strong>Tips:</strong>
                  <ul className="list-disc ml-5 mt-1">
                    <li>
                      Use specific class names to avoid conflicts with existing
                      styles
                    </li>
                    <li>
                      Use <code>!important</code> sparingly to override default
                      styles
                    </li>
                    <li>
                      CSS variables from the theme can be used for consistency
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === "preview" && (
              <div className="p-4">
                <h3 className="font-semibold mb-2">Live Preview</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Preview how your page will look with custom HTML and CSS
                  applied.
                </p>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-[600px]"
                    title="Page Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-medium text-white ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saving..." : "Save Custom Code"}
            </button>
            <button
              onClick={() =>
                navigate(`/admin/pages/builder/${getPageId(page)}`)
              }
              className="px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Open in Page Builder
            </button>
          </div>
        </>
      )}

      {!page && !loading && (
        <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
          <p>
            Select a page from the dropdown above to view and edit its code.
          </p>
        </div>
      )}
    </div>
  );
}
