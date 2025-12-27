import { useState } from "react";
import TextImageBlockEditor, {
  type TextImageBlock,
} from "./TextImageBlockEditor";

export interface SectionWithBlocks {
  sectionId: string;
  sectionName: string;
  textImageBlocks: TextImageBlock[];
}

interface SectionBlockManagerProps {
  section: SectionWithBlocks;
  onUpdate: (section: SectionWithBlocks) => void;
  sectionContent: React.ReactNode; // The main section content
}

export default function SectionBlockManager({
  section,
  onUpdate,
  sectionContent,
}: SectionBlockManagerProps) {
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

  const addNewBlock = () => {
    const newBlock: TextImageBlock = {
      id: `block-${Date.now()}`,
      type: "text-image",
      layout: "text-left",
      text: {
        heading: "New Section",
        subheading: "Add your subheading",
        description: "Add your description text here",
        buttonText: "Learn More",
        buttonUrl: "#",
      },
      image: {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
        alt: "Section image",
      },
      styles: {
        backgroundColor: "#ffffff",
        textColor: "#1f2937",
        headingFontSize: "32px",
        padding: "60px 40px",
        borderRadius: "8px",
      },
    };

    onUpdate({
      ...section,
      textImageBlocks: [...section.textImageBlocks, newBlock],
    });
    setShowAddBlock(false);
    // Auto-expand the newly created block
    setExpandedBlockId(newBlock.id);
  };

  const updateBlock = (updatedBlock: TextImageBlock) => {
    onUpdate({
      ...section,
      textImageBlocks: section.textImageBlocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      ),
    });
  };

  const deleteBlock = (blockId: string) => {
    onUpdate({
      ...section,
      textImageBlocks: section.textImageBlocks.filter(
        (block) => block.id !== blockId
      ),
    });
  };

  return (
    <div className="space-y-4">
      {/* Main Section Content */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
        {sectionContent}
      </div>

      {/* Add Block Button */}
      {!showAddBlock && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddBlock(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            ➕ Add Text & Image Block
          </button>
        </div>
      )}

      {/* Add Block Form */}
      {showAddBlock && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Add New Block</h3>
            <button
              onClick={() => setShowAddBlock(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={addNewBlock}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Create Block
            </button>
            <button
              onClick={() => setShowAddBlock(false)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Blocks */}
      <div className="space-y-4">
        {section.textImageBlocks.map((block) => (
          <div key={block.id} className="border-l-4 border-blue-500 pl-4">
            <TextImageBlockEditor
              block={block}
              onChange={updateBlock}
              onDelete={() => deleteBlock(block.id)}
              initialExpanded={block.id === expandedBlockId}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
