import { useState } from "react";
import "./ProfessionalPageEditor.css";

export type BlockType =
  | "hero"
  | "text"
  | "image"
  | "button"
  | "grid"
  | "card"
  | "section"
  | "heading"
  | "paragraph"
  | "divider"
  | "video"
  | "form"
  | "cta";

export interface PageBlock {
  id: string;
  type: BlockType;
  content: string;
  styles: {
    padding: string;
    margin: string;
    backgroundColor: string;
    textColor: string;
    fontSize: string;
    fontWeight: string;
    textAlign: "left" | "center" | "right" | "justify";
    borderRadius: string;
    borderWidth: string;
    borderColor: string;
    borderStyle: string;
    boxShadow: string;
    minHeight: string;
    maxWidth: string;
    display: string;
    flexDirection?: string;
    gap?: string;
    gridColumns?: string;
  };
  attributes?: {
    href?: string;
    target?: string;
    src?: string;
    alt?: string;
  };
  children?: PageBlock[];
}

interface ProfessionalPageEditorProps {
  blocks: PageBlock[];
  onBlocksChange: (blocks: PageBlock[]) => void;
  onPreview: (blocks: PageBlock[]) => void;
}

function generateId() {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ProfessionalPageEditor({
  blocks,
  onBlocksChange,
  onPreview,
}: ProfessionalPageEditorProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  const addBlock = (type: BlockType) => {
    const defaultContent: Record<BlockType, string> = {
      hero: "Hero Title",
      text: "Click to edit text",
      image: "",
      button: "Click Me",
      grid: "Grid Layout",
      card: "Card Title",
      section: "New Section",
      heading: "Heading Text",
      paragraph: "Paragraph text goes here",
      divider: "",
      video: "",
      form: "Form",
      cta: "Call To Action",
    };

    const defaultStyles = {
      padding: "20px",
      margin: "10px 0",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      fontSize: "16px",
      fontWeight: "400",
      textAlign: "left" as const,
      borderRadius: "8px",
      borderWidth: "0px",
      borderColor: "#cccccc",
      borderStyle: "solid",
      boxShadow: "none",
      minHeight: type === "hero" ? "400px" : "auto",
      maxWidth: "100%",
      display: type === "grid" ? "grid" : "block",
      gridColumns: type === "grid" ? "3" : undefined,
    };

    const newBlock: PageBlock = {
      id: generateId(),
      type,
      content: defaultContent[type],
      styles: defaultStyles,
      attributes: {},
      children: type === "grid" ? [] : undefined,
    };

    onBlocksChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<PageBlock>) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    onBlocksChange(updated);
  };

  const deleteBlock = (id: string) => {
    onBlocksChange(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === id);
    if (
      (direction === "up" && index > 0) ||
      (direction === "down" && index < blocks.length - 1)
    ) {
      const newBlocks = [...blocks];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[targetIndex]] = [
        newBlocks[targetIndex],
        newBlocks[index],
      ];
      onBlocksChange(newBlocks);
    }
  };

  const duplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find((b) => b.id === id);
    if (blockToDuplicate) {
      const newBlock = {
        ...blockToDuplicate,
        id: generateId(),
      };
      const index = blocks.findIndex((b) => b.id === id);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      onBlocksChange(newBlocks);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedBlock) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        updateBlock(selectedBlock.id, {
          attributes: { ...selectedBlock.attributes, src, alt: file.name },
          content: src,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
    { type: "hero", label: "Hero", icon: "🎨" },
    { type: "heading", label: "Heading", icon: "📝" },
    { type: "paragraph", label: "Paragraph", icon: "📄" },
    { type: "image", label: "Image", icon: "🖼️" },
    { type: "button", label: "Button", icon: "🔘" },
    { type: "divider", label: "Divider", icon: "➖" },
    { type: "card", label: "Card", icon: "📋" },
    { type: "grid", label: "Grid", icon: "📊" },
    { type: "cta", label: "CTA", icon: "💬" },
    { type: "video", label: "Video", icon: "🎬" },
  ];

  return (
    <div className="professional-editor">
      {/* Sidebar - Block Types */}
      <div className="editor-sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-title">Add Blocks</h3>
          <div className="blocks-grid">
            {BLOCK_TYPES.map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => addBlock(blockType.type)}
                className="block-button"
                title={blockType.label}
              >
                <span className="block-icon">{blockType.icon}</span>
                <span className="block-label">{blockType.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas-area">
          <h3 className="canvas-title">Page Content</h3>
          <div className="blocks-list">
            {blocks.length === 0 ? (
              <div className="empty-state">
                <p>No blocks added yet. Add one from the sidebar!</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`block-item ${
                    selectedBlockId === block.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedBlockId(block.id)}
                  draggable
                  onDragStart={() => setDraggedBlockId(block.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedBlockId && draggedBlockId !== block.id) {
                      const draggedIndex = blocks.findIndex(
                        (b) => b.id === draggedBlockId
                      );
                      const newBlocks = [...blocks];
                      [newBlocks[draggedIndex], newBlocks[index]] = [
                        newBlocks[index],
                        newBlocks[draggedIndex],
                      ];
                      onBlocksChange(newBlocks);
                    }
                    setDraggedBlockId(null);
                  }}
                >
                  <div className="block-item-header">
                    <span className="block-type-badge">{block.type}</span>
                    <span className="block-content-preview">
                      {block.content.substring(0, 30)}
                      {block.content.length > 30 ? "..." : ""}
                    </span>
                  </div>
                  <div className="block-item-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(block.id, "up");
                      }}
                      className="action-btn"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(block.id, "down");
                      }}
                      className="action-btn"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateBlock(block.id);
                      }}
                      className="action-btn"
                      title="Duplicate"
                    >
                      📋
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBlock(block.id);
                      }}
                      className="action-btn delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="editor-main">
        {selectedBlock ? (
          <>
            {/* Preview Area */}
            <div className="preview-area">
              <h3 className="preview-title">Live Preview</h3>
              <div className="preview-content">
                <BlockPreview block={selectedBlock} />
              </div>
            </div>

            {/* Properties Panel */}
            <div className="properties-panel">
              <div className="properties-section">
                <h4 className="properties-title">Content</h4>
                <div className="form-group">
                  <label>Text Content</label>
                  <textarea
                    value={selectedBlock.content}
                    onChange={(e) =>
                      updateBlock(selectedBlock.id, { content: e.target.value })
                    }
                    className="textarea-input"
                    rows={3}
                  />
                </div>

                {(selectedBlock.type === "image" ||
                  selectedBlock.type === "video") && (
                  <div className="form-group">
                    <label>Upload {selectedBlock.type}</label>
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      accept={
                        selectedBlock.type === "image" ? "image/*" : "video/*"
                      }
                      className="file-input"
                    />
                    {selectedBlock.attributes?.src && (
                      <div className="uploaded-preview">
                        {selectedBlock.type === "image" ? (
                          <img
                            src={selectedBlock.attributes.src}
                            alt="Preview"
                            style={{ maxWidth: "100%", borderRadius: "4px" }}
                          />
                        ) : (
                          <p>Video: {selectedBlock.attributes.src}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {selectedBlock.type === "button" && (
                  <div className="form-group">
                    <label>Button Link</label>
                    <input
                      type="text"
                      value={selectedBlock.attributes?.href || ""}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          attributes: {
                            ...selectedBlock.attributes,
                            href: e.target.value,
                          },
                        })
                      }
                      className="text-input"
                      placeholder="https://example.com"
                    />
                  </div>
                )}
              </div>

              <div className="properties-section">
                <h4 className="properties-title">Styling</h4>

                <div className="style-group">
                  <label>Background Color</label>
                  <div className="color-picker">
                    <input
                      type="color"
                      value={selectedBlock.styles.backgroundColor}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: {
                            ...selectedBlock.styles,
                            backgroundColor: e.target.value,
                          },
                        })
                      }
                      className="color-input"
                    />
                    <span className="color-value">
                      {selectedBlock.styles.backgroundColor}
                    </span>
                  </div>
                </div>

                <div className="style-group">
                  <label>Text Color</label>
                  <div className="color-picker">
                    <input
                      type="color"
                      value={selectedBlock.styles.textColor}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: {
                            ...selectedBlock.styles,
                            textColor: e.target.value,
                          },
                        })
                      }
                      className="color-input"
                    />
                    <span className="color-value">
                      {selectedBlock.styles.textColor}
                    </span>
                  </div>
                </div>

                <div className="style-row">
                  <div className="style-group">
                    <label>Font Size</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.fontSize}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: {
                            ...selectedBlock.styles,
                            fontSize: e.target.value,
                          },
                        })
                      }
                      className="text-input"
                      placeholder="16px"
                    />
                  </div>
                  <div className="style-group">
                    <label>Font Weight</label>
                    <select
                      value={selectedBlock.styles.fontWeight}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: {
                            ...selectedBlock.styles,
                            fontWeight: e.target.value,
                          },
                        })
                      }
                      className="select-input"
                    >
                      <option value="300">Light</option>
                      <option value="400">Normal</option>
                      <option value="600">Semi-bold</option>
                      <option value="700">Bold</option>
                      <option value="900">Extra Bold</option>
                    </select>
                  </div>
                </div>

                <div className="style-group">
                  <label>Text Align</label>
                  <div className="text-align-buttons">
                    {["left", "center", "right", "justify"].map((align) => (
                      <button
                        key={align}
                        onClick={() =>
                          updateBlock(selectedBlock.id, {
                            styles: {
                              ...selectedBlock.styles,
                              textAlign: align as
                                | "left"
                                | "center"
                                | "right"
                                | "justify",
                            },
                          })
                        }
                        className={`align-btn ${
                          selectedBlock.styles.textAlign === align
                            ? "active"
                            : ""
                        }`}
                        title={align}
                      >
                        {align === "left" && "⬅"}
                        {align === "center" && "⬇"}
                        {align === "right" && "➡"}
                        {align === "justify" && "⬌"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="style-row">
                  <div className="style-group">
                    <label>Padding</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.padding}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: {
                            ...selectedBlock.styles,
                            padding: e.target.value,
                          },
                        })
                      }
                      className="text-input"
                      placeholder="20px"
                    />
                  </div>
                  <div className="style-group">
                    <label>Margin</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.margin}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: {
                            ...selectedBlock.styles,
                            margin: e.target.value,
                          },
                        })
                      }
                      className="text-input"
                      placeholder="10px"
                    />
                  </div>
                </div>

                <div className="style-row">
                  <div className="style-group">
                    <label>Border Radius</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.borderRadius}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: {
                            ...selectedBlock.styles,
                            borderRadius: e.target.value,
                          },
                        })
                      }
                      className="text-input"
                      placeholder="8px"
                    />
                  </div>
                  <div className="style-group">
                    <label>Box Shadow</label>
                    <input
                      type="text"
                      value={selectedBlock.styles.boxShadow}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: {
                            ...selectedBlock.styles,
                            boxShadow: e.target.value,
                          },
                        })
                      }
                      className="text-input"
                      placeholder="0 2px 8px rgba(0,0,0,0.1)"
                    />
                  </div>
                </div>

                <div className="style-group">
                  <label>Min Height</label>
                  <input
                    type="text"
                    value={selectedBlock.styles.minHeight}
                    onChange={(e) =>
                      updateBlock(selectedBlock.id, {
                        styles: {
                          ...selectedBlock.styles,
                          minHeight: e.target.value,
                        },
                      })
                    }
                    className="text-input"
                    placeholder="auto"
                  />
                </div>

                {selectedBlock.type === "grid" && (
                  <div className="style-group">
                    <label>Grid Columns</label>
                    <input
                      type="number"
                      value={selectedBlock.styles.gridColumns || 3}
                      onChange={(e) =>
                        updateBlock(selectedBlock.id, {
                          styles: {
                            ...selectedBlock.styles,
                            gridColumns: e.target.value,
                          },
                        })
                      }
                      className="text-input"
                      min="1"
                      max="6"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-selection">
            <p>Select a block to edit its properties</p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="action-bar">
        <button onClick={() => onPreview(blocks)} className="btn btn-primary">
          👁️ Preview Page
        </button>
        <button onClick={() => setSelectedBlockId(null)} className="btn">
          Clear Selection
        </button>
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: PageBlock }) {
  const style: React.CSSProperties = {
    padding: block.styles.padding,
    margin: block.styles.margin,
    backgroundColor: block.styles.backgroundColor,
    color: block.styles.textColor,
    fontSize: block.styles.fontSize,
    fontWeight: parseInt(
      block.styles.fontWeight
    ) as unknown as React.CSSProperties["fontWeight"],
    textAlign: block.styles.textAlign,
    borderRadius: block.styles.borderRadius,
    boxShadow: block.styles.boxShadow,
    minHeight: block.styles.minHeight,
    maxWidth: block.styles.maxWidth,
    display: block.styles.display as React.CSSProperties["display"],
    gap: block.styles.gap,
    gridTemplateColumns: `repeat(${block.styles.gridColumns || 3}, 1fr)`,
    ...(block.styles.borderWidth !== "0px" && {
      border: `${block.styles.borderWidth} ${block.styles.borderStyle} ${block.styles.borderColor}`,
    }),
  };

  switch (block.type) {
    case "hero":
      return (
        <div style={{ ...style, minHeight: block.styles.minHeight || "400px" }}>
          <h1 style={{ margin: "0 0 1rem 0" }}>{block.content}</h1>
          <p>Featured section with maximum impact</p>
        </div>
      );
    case "heading":
      return <h2 style={style}>{block.content}</h2>;
    case "paragraph":
      return <p style={style}>{block.content}</p>;
    case "image":
      return (
        <div style={style}>
          {block.attributes?.src ? (
            <img
              src={block.attributes.src}
              alt={block.attributes.alt || "Image"}
              style={{ width: "100%", height: "auto", borderRadius: "4px" }}
            />
          ) : (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#999" }}
            >
              📷 Click to upload image
            </div>
          )}
        </div>
      );
    case "button":
      return (
        <button
          style={{
            ...style,
            cursor: "pointer",
            border: "none",
            padding: "12px 24px",
          }}
        >
          {block.content}
        </button>
      );
    case "divider":
      return <hr style={{ ...style, height: "2px" }} />;
    case "card":
      return (
        <div
          style={{
            ...style,
            border: "1px solid #e0e0e0",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h3>{block.content}</h3>
          <p>Card description goes here</p>
        </div>
      );
    case "grid":
      return (
        <div style={style}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                padding: "20px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                textAlign: "center",
              }}
            >
              Column {i}
            </div>
          ))}
        </div>
      );
    case "cta":
      return (
        <div style={{ ...style, textAlign: "center" }}>
          <h3>{block.content}</h3>
          <p>Call to action section</p>
          <button
            style={{
              padding: "12px 32px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Click Here
          </button>
        </div>
      );
    case "video":
      return (
        <div style={style}>
          {block.attributes?.src ? (
            <video
              src={block.attributes.src}
              controls
              style={{ width: "100%", borderRadius: "4px" }}
            />
          ) : (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#999" }}
            >
              🎬 Click to upload video
            </div>
          )}
        </div>
      );
    default:
      return <div style={style}>{block.content}</div>;
  }
}
