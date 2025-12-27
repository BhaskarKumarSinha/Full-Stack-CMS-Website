import React, { useState } from "react";

export interface SectionInstance {
  id: string; // Unique instance ID (e.g., "features-1", "carousel-2")
  type: string; // Type of section (e.g., "features", "carousel")
  name: string; // Display name
  order: number; // Position in page
  enabled: boolean;
}

interface SectionManagerProps {
  sections: SectionInstance[];
  onSectionsChange: (sections: SectionInstance[]) => void;
  onAddSection: (type: string) => void;
  onRemoveSection: (id: string) => void;
  onEditSection: (id: string) => void;
  onManageBlocks?: () => void;
  onManageBlogs?: () => void;
}

export const SectionManager: React.FC<SectionManagerProps> = ({
  sections,
  onSectionsChange,
  onAddSection,
  onRemoveSection,
  onEditSection,
  onManageBlocks,
  onManageBlogs,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Remove button should only show for dynamically added feature/carousel sections (ids with dash)
  const isRemovable = (section: SectionInstance) => {
    const type = section.type || section.id.split("-")[0];
    return (
      ["features", "carousel", "blocks", "blog"].includes(type) &&
      section.id.includes("-")
    );
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = sections.findIndex((s) => s.id === draggedId);
    const targetIndex = sections.findIndex((s) => s.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedSection);

    // Update order values
    newSections.forEach((s, idx) => {
      s.order = idx;
    });

    onSectionsChange(newSections);
    setDraggedId(null);
  };

  const moveUp = (id: string) => {
    const index = sections.findIndex((s) => s.id === id);
    if (index <= 0) return;

    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [
      newSections[index],
      newSections[index - 1],
    ];

    newSections.forEach((s, idx) => {
      s.order = idx;
    });

    onSectionsChange(newSections);
  };

  const moveDown = (id: string) => {
    const index = sections.findIndex((s) => s.id === id);
    if (index >= sections.length - 1) return;

    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [
      newSections[index + 1],
      newSections[index],
    ];

    newSections.forEach((s, idx) => {
      s.order = idx;
    });

    onSectionsChange(newSections);
  };

  const toggleSection = (id: string) => {
    const newSections = sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    onSectionsChange(newSections);
  };

  const addableTypes = ["features", "carousel"];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-800">Page Sections</h3>
        <div className="flex gap-2 flex-wrap justify-end">
          {addableTypes.map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => onAddSection(type)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              + {type === "features" ? "Features" : "Carousel"}
            </button>
          ))}
          {onManageBlocks && (
            <button
              type="button"
              onClick={onManageBlocks}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              Manage Content Blocks
            </button>
          )}
          {onManageBlogs && (
            <button
              type="button"
              onClick={onManageBlogs}
              className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              Manage Blog Posts
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600 italic mb-2">
          💡 Tip: Drag sections to reorder them on your page
        </p>
        {sections.map((section) => {
          const canRemove = isRemovable(section);
          return (
            <div
              key={section.id}
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                handleDragStart(e, section.id);
              }}
              onDragOver={(e) => {
                e.stopPropagation();
                handleDragOver(e);
              }}
              onDrop={(e) => {
                e.stopPropagation();
                handleDrop(e, section.id);
              }}
              className={`flex items-center gap-3 p-3 rounded border-2 transition-all ${
                draggedId === section.id
                  ? "opacity-40 bg-blue-100 border-blue-400 scale-105"
                  : "bg-white border-gray-300 hover:border-blue-400 hover:shadow-md"
              } cursor-grab active:cursor-grabbing`}
              style={{ userSelect: "none" }}
            >
              {/* Drag handle - always visible */}
              <span
                className="text-gray-500 text-xl font-bold select-none pointer-events-none"
                style={{ cursor: "grab" }}
              >
                ⋮⋮
              </span>

              {/* Checkbox */}
              <input
                type="checkbox"
                checked={section.enabled}
                onChange={() => toggleSection(section.id)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-5 h-5 cursor-pointer accent-blue-600"
              />

              {/* Section info */}
              <div className="flex-1">
                <div className="text-sm font-semibold text-black">
                  {section.name}
                </div>
                <div className="text-xs text-gray-500">{section.type}</div>
              </div>

              {/* Action buttons */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSection(section.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 font-medium shadow-sm"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveUp(section.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={section.order === 0}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  moveDown(section.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                disabled={section.order === sections.length - 1}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
              >
                ↓
              </button>

              {canRemove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSection(section.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 font-medium shadow-sm"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionManager;
