import { useNavigate } from "react-router-dom";

export default function NewPageChooser() {
  const navigate = useNavigate();

  const handleClassicBuilder = () => {
    navigate("/admin/pages/builder");
  };

  const handleProfessionalEditor = () => {
    navigate("/admin/pages/pro-editor");
  };

  const handleHybridEditor = () => {
    navigate("/admin/pages/hybrid");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Create a New Page
          </h1>
          <p className="text-lg text-gray-600">
            Choose your page builder experience
          </p>
        </div>

        {/* Two Option Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Hybrid Mode - FEATURED */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-green-500 md:col-span-1">
            <div className="h-48 bg-green-600 flex items-center justify-center">
              <div className="text-6xl">🔄</div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Hybrid Mode
                </h2>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded">
                  RECOMMENDED
                </span>
              </div>

              <p className="text-gray-600 mb-6">
                Use both builders together! Combine classic sections with
                professional blocks. Get the best of both worlds - structure and
                flexibility.
              </p>

              <ul className="space-y-2 mb-8 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Classic sections + Professional blocks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Split view or stacked view</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Maximum flexibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Easy to use & powerful</span>
                </li>
              </ul>

              <button
                onClick={handleHybridEditor}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Use Hybrid Mode →
              </button>
            </div>
          </div>

          {/* Classic Page Builder */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-blue-600 flex items-center justify-center">
              <div className="text-6xl">🔨</div>
            </div>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Classic Page Builder
              </h2>

              <p className="text-gray-600 mb-6">
                Use pre-built sections to create pages quickly. Perfect for
                standard pages with hero, features, testimonials, and more.
              </p>

              <ul className="space-y-2 mb-8 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Pre-designed sections</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Hero, Features, Testimonials, Carousel</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Easy configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Navigation & Footer customization</span>
                </li>
              </ul>

              <button
                onClick={handleClassicBuilder}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Use Classic Builder →
              </button>
            </div>
          </div>

          {/* Professional Editor */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-purple-500">
            <div className="h-48 bg-purple-600 flex items-center justify-center">
              <div className="text-6xl">✨</div>
            </div>

            <div className="p-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  Professional Editor
                </h2>
                <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded">
                  NEW
                </span>
              </div>

              <p className="text-gray-600 mb-6">
                Build custom pages from scratch with drag-and-drop blocks,
                advanced styling controls, and real-time preview. Industry-grade
                page builder.
              </p>

              <ul className="space-y-2 mb-8 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Drag-and-drop blocks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>10+ block types (Hero, Grid, Cards, CTA, etc.)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Advanced CSS styling controls</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Real-time live preview</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-600 font-bold">✓</span>
                  <span>Color pickers & typography controls</span>
                </li>
              </ul>

              <button
                onClick={handleProfessionalEditor}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Use Professional Editor →
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">
            <span className="font-semibold">💡 Tip:</span> Hybrid Mode is
            recommended if you want maximum flexibility! Use classic sections
            for structure, then add professional blocks for unique
            customization. You can switch modes anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
