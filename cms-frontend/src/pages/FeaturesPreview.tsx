import FeaturesRenderer from "./page-builder/FeaturesRenderer";
import type { FeaturesContent } from "./page-builder/FeaturesEditor";

interface FeaturePreviewProps {
  content: FeaturesContent;
}

export default function FeaturesPreview({ content }: FeaturePreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6 border-2 border-blue-200">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>👁️ Live Preview</span>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            Real-time
          </span>
        </h3>
      </div>

      <div className="bg-linear-to-b from-gray-50 to-gray-100 rounded-lg p-4 overflow-auto max-h-96">
        <FeaturesRenderer content={content} />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
        <p>
          📌 This is a live preview of your features section. Changes appear
          instantly.
        </p>
      </div>
    </div>
  );
}
