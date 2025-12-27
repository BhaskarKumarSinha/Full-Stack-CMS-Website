import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import PageBuilder from "./PageBuilder";
import PageEditorWrapper from "./page-builder/PageEditorWrapper";

type EditorMode = "classic" | "professional" | "hybrid";

export default function HybridPageEditor() {
  const navigate = useNavigate();
  const [editorMode, setEditorMode] = useState<EditorMode>("hybrid");
  const [pageName, setPageName] = useState("");
  const [pagePath, setPagePath] = useState("");
  const [showSplitView, setShowSplitView] = useState(true);

  const handleSavePage = async (html: string) => {
    try {
      await api.createPage({
        title: pageName || "New Page",
        path: pagePath || "/new-page",
        content: html,
      });
      alert("Page saved successfully!");
      navigate("/admin/pages");
    } catch (error) {
      console.error("Failed to save page:", error);
      alert("Failed to save page");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Mode Selector */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Hybrid Page Editor
              </h1>
              <p className="text-sm text-gray-600">
                Use both editors together - Classic sections + Professional
                blocks
              </p>
            </div>

            <button
              onClick={() => navigate("/admin/pages")}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Pages
            </button>
          </div>

          {/* Page Info */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Name
              </label>
              <input
                type="text"
                value={pageName}
                onChange={(e) => setPageName(e.target.value)}
                placeholder="My Awesome Page"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Path
              </label>
              <input
                type="text"
                value={pagePath}
                onChange={(e) => setPagePath(e.target.value)}
                placeholder="/my-page"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSplitView}
                  onChange={(e) => setShowSplitView(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  Split View
                </span>
              </label>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 border-t border-gray-200 pt-4">
            <button
              onClick={() => setEditorMode("hybrid")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editorMode === "hybrid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🔄 Hybrid Mode (Both Together)
            </button>
            <button
              onClick={() => setEditorMode("classic")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editorMode === "classic"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🔨 Classic Only
            </button>
            <button
              onClick={() => setEditorMode("professional")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editorMode === "professional"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ✨ Professional Only
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="max-w-7xl mx-auto p-4">
        {editorMode === "hybrid" && showSplitView && (
          // Split View: Both Editors Side by Side
          <div className="grid grid-cols-2 gap-4 h-[calc(100vh-250px)]">
            {/* Classic Editor */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
              <div className="bg-blue-50 border-b border-gray-200 p-3">
                <h2 className="font-semibold text-gray-900 text-sm">
                  🔨 Classic Page Builder
                </h2>
                <p className="text-xs text-gray-600">
                  Predefined sections (Hero, Features, Carousel, etc.)
                </p>
              </div>
              <div className="flex-1 overflow-auto">
                <div className="p-4">
                  <PageBuilder />
                </div>
              </div>
            </div>

            {/* Professional Editor */}
            <div className="border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">
              <div className="bg-purple-50 border-b border-gray-200 p-3">
                <h2 className="font-semibold text-gray-900 text-sm">
                  ✨ Professional Editor
                </h2>
                <p className="text-xs text-gray-600">
                  Custom blocks, drag-and-drop, advanced styling
                </p>
              </div>
              <div className="flex-1 overflow-auto">
                <div className="p-4">
                  <PageEditorWrapper
                    onSavePage={handleSavePage}
                    isEmbedded={true}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {editorMode === "hybrid" && !showSplitView && (
          // Stacked View: Both Editors Stacked
          <div className="space-y-6">
            {/* Classic Editor Section */}
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  🔨 Step 1: Classic Page Builder
                </h2>
                <p className="text-gray-600 text-sm">
                  Create the main sections of your page using predefined
                  templates. Then enhance with professional blocks below.
                </p>
              </div>
              <div className="overflow-x-auto">
                <PageBuilder />
              </div>
            </div>

            {/* Professional Editor Section */}
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  ✨ Step 2: Professional Editor
                </h2>
                <p className="text-gray-600 text-sm">
                  Add custom blocks, fine-tune styling, and create unique
                  layouts. Combine both editors for maximum flexibility.
                </p>
              </div>
              <PageEditorWrapper
                onSavePage={handleSavePage}
                isEmbedded={true}
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
              <button
                onClick={() => handleSavePage("<div>Combined Page</div>")}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                💾 Save Complete Page
              </button>
            </div>
          </div>
        )}

        {editorMode === "classic" && (
          // Classic Only
          <div className="bg-white rounded-lg p-6">
            <PageBuilder />
          </div>
        )}

        {editorMode === "professional" && (
          // Professional Only
          <div className="bg-white rounded-lg p-6">
            <PageEditorWrapper onSavePage={handleSavePage} isEmbedded={true} />
          </div>
        )}
      </div>
    </div>
  );
}
